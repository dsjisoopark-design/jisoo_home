<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { useNpwStore } from '@/stores/npw'
const props = defineProps({ rows: Array, selectedKey: String })
const emit = defineEmits(['select'])
const store = useNpwStore()
const els = ref([])
let charts = []
const definitions = [
  { title: 'AVG Trend (Å)', key: 'avg', spec: 'avg' },
  { title: 'Range Trend (Å)', key: 'range', spec: 'range' },
  { title: 'Stress Trend (MPa)', key: 'stress', spec: 'stress' },
  { title: 'Wafer Count Trend', key: 'count' },
]
const rowKey = (r) => `${r.time}|${r.eqpid}|${r.chid}|${r.ppid}|${r.foupid}`
function point(row, value, color, opacity = 1) {
  const selected = row && rowKey(row) === props.selectedKey
  return {
    value,
    rowKey: row ? rowKey(row) : '',
    symbolSize: selected ? 8 : 4,
    itemStyle: {
      color,
      opacity: selected ? 1 : opacity,
      borderColor: selected ? '#fff' : color,
      borderWidth: selected ? 1.5 : 0,
      shadowBlur: selected ? 5 : 0,
      shadowColor: selected ? color : 'transparent',
    },
  }
}
function draw() {
  charts.forEach((c) => c.dispose())
  charts = els.value.map((el, index) => {
    const chart = echarts.init(el),
      def = definitions[index],
      dates = [...new Set(props.rows.map((r) => r.time))].sort()
    let series
    if (def.key === 'count') {
      const countSeries = [
        { name: 'pm_count', color: '#9c88d9', side: null, key: 'pmCount', dashed: true, opacity: 0.65 },
        { name: 'sh_count_side1', color: '#1264ef', side: '1', key: 'shCount' },
        { name: 'sh_count_side2', color: '#15945b', side: '2', key: 'shCount' },
      ]
      series = countSeries.map((config) => ({
        name: config.name,
        type: 'line',
        data: dates.map((time) => {
          const row = props.rows.find((item) => item.time === time && (!config.side || item.side === config.side))
          return row ? point(row, row[config.key], config.color, config.opacity) : null
        }),
        connectNulls: true,
        symbol: 'circle',
        lineStyle: {
          width: config.dashed ? 1.3 : 1.5,
          color: config.color,
          type: config.dashed ? 'dashed' : 'solid',
          opacity: config.opacity ?? 1,
        },
      }))
    } else {
      series = ['1', '2'].map((side, i) => {
        const color = i ? '#15945b' : '#1264ef'
        return {
          name: `Side ${side}`,
          type: 'line',
          data: dates.map((t) => {
            const row = props.rows.find((r) => r.time === t && r.side === side)
            return row ? point(row, row[def.key], color) : null
          }),
          connectNulls: true,
          symbol: 'circle',
          lineStyle: { width: 1.5, color },
          markLine: def.spec && i === 0
            ? {
                silent: true,
                symbol: 'none',
                label: {
                  show: true,
                  position: 'insideEndTop',
                  distance: 3,
                  color: '#d1434c',
                  fontSize: 8,
                  formatter: ({ name }) => name,
                },
                lineStyle: { color: '#f04444', type: 'dashed', width: 1 },
                data: [
                  {
                    name: `LSL ${Number(store.specs[def.spec].min).toLocaleString()}`,
                    yAxis: store.specs[def.spec].min,
                  },
                  {
                    name: `USL ${Number(store.specs[def.spec].max).toLocaleString()}`,
                    yAxis: store.specs[def.spec].max,
                  },
                ],
              }
            : undefined,
        }
      })
      if (def.key === 'avg') {
        series.push({
          name: 'Skew (S1 − S2)',
          type: 'line',
          yAxisIndex: 1,
          data: dates.map((time) => {
            const side1 = props.rows.find((row) => row.time === time && row.side === '1')
            const side2 = props.rows.find((row) => row.time === time && row.side === '2')
            return side1 && side2
              ? point(side1, Number((side1.avg - side2.avg).toFixed(2)), '#9c88d9', 0.65)
              : null
          }),
          connectNulls: true,
          symbol: 'diamond',
          symbolSize: 5,
          lineStyle: { width: 1.4, color: '#9c88d9', type: 'dashed', opacity: 0.65 },
          itemStyle: { color: '#9c88d9', opacity: 0.65 },
        })
      }
    }
    const spec = def.spec ? store.specs[def.spec] : null
    const axisValues = def.spec
      ? [
          ...props.rows.map((row) => Number(row[def.key])),
          Number(spec.min),
          Number(spec.max),
        ].filter(Number.isFinite)
      : []
    const axisLow = axisValues.length ? Math.min(...axisValues) : undefined
    const axisHigh = axisValues.length ? Math.max(...axisValues) : undefined
    const axisPadding = axisValues.length ? Math.max((axisHigh - axisLow) * 0.08, 1) : 0
    chart.setOption({
      animation: false,
      title: { text: def.title, left: 10, top: 8, textStyle: { fontSize: 11, color: '#17233a' } },
      legend: { type: 'scroll', top: 28, itemWidth: 12, itemHeight: 5, textStyle: { fontSize: 8 } },
      tooltip: { trigger: 'axis' },
      dataZoom: [{ type: 'inside', xAxisIndex: 0, filterMode: 'none' }],
      grid: { left: 43, right: def.key === 'avg' ? 42 : 13, top: 57, bottom: 28 },
      xAxis: {
        type: 'category',
        data: dates.map((t) => t.slice(5, 10)),
        axisLabel: { fontSize: 8, color: '#667489' },
        axisLine: { lineStyle: { color: '#d7e0e9' } },
      },
      yAxis: [
        {
          type: 'value',
          scale: true,
          min: def.spec ? axisLow - axisPadding : undefined,
          max: def.spec ? axisHigh + axisPadding : undefined,
          axisLabel: { fontSize: 8, color: '#667489' },
          splitLine: { lineStyle: { color: '#edf1f5' } },
        },
        ...(def.key === 'avg'
          ? [{
              type: 'value',
              name: 'Skew',
              nameTextStyle: { color: '#7c3aed', fontSize: 8 },
              axisLabel: { fontSize: 8, color: '#7c3aed' },
              axisLine: { show: true, lineStyle: { color: '#b8a5ea' } },
              splitLine: { show: false },
            }]
          : []),
      ],
      series,
    })
    chart.on('click', (params) => {
      let key = params.data?.rowKey
      if (!key && Number.isInteger(params.dataIndex)) {
        const time = dates[params.dataIndex],
          side = String(params.seriesName || '').match(/(?:Side |side)(\d)/)?.[1]
        const row = props.rows.find((r) => r.time === time && (!side || r.side === side))
        if (row) key = rowKey(row)
      }
      if (key) emit('select', key)
    })
    chart.getZr().on('click', (event) => {
      const pixel = [event.offsetX, event.offsetY]
      if (!chart.containPixel({ gridIndex: 0 }, pixel)) return
      const converted = chart.convertFromPixel({ gridIndex: 0 }, pixel)
      if (!Array.isArray(converted)) return
      const dataIndex = Math.max(0, Math.min(dates.length - 1, Math.round(Number(converted[0])))),
        time = dates[dataIndex],
        y = Number(converted[1])
      const candidates = def.key === 'count'
        ? [
            (() => { const row = props.rows.find((r) => r.time === time); return row ? { row, distance: Math.abs(row.pmCount - y) } : null })(),
            ...['1', '2'].map((side) => { const row = props.rows.find((r) => r.time === time && r.side === side); return row ? { row, distance: Math.abs(row.shCount - y) } : null }),
          ].filter(Boolean).sort((a, b) => a.distance - b.distance)
        : ['1', '2']
            .map((side) => {
              const rows = props.rows.filter((r) => r.time === time && r.side === side)
              if (!rows.length) return null
              return { row: rows[0], distance: Math.abs(Number(rows[0][def.key]) - y) }
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance)
      if (candidates[0]) emit('select', rowKey(candidates[0].row))
    })
    return chart
  })
}
watch(
  () => [props.rows, props.selectedKey],
  () => nextTick(draw),
  { deep: true },
)
onMounted(() => {
  draw()
  addEventListener('resize', draw)
})
onBeforeUnmount(() => {
  removeEventListener('resize', draw)
  charts.forEach((c) => c.dispose())
})
</script>
<template>
  <section>
    <div
      v-for="(_, i) in definitions"
      :key="i"
      :ref="
        (el) => {
          if (el) els[i] = el
        }
      "
    ></div>
  </section>
</template>
<style scoped>
section {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, 1fr);
}
section > div {
  height: 205px;
  background: #fff;
  border: 1px solid #dfe5eb;
  border-radius: 12px;
  box-shadow: 0 5px 18px rgba(35, 55, 75, 0.07);
}
@media (max-width: 1100px) {
  section {
    grid-template-columns: 1fr 1fr;
  }
  section > div {
    border-color: #dfe5eb;
  }
}
</style>
