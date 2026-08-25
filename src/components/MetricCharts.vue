<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import * as echarts from 'echarts'
import { colorForRow } from '@/utils/chartColors'
import { setupLinkedShiftZoom } from '@/utils/chartInteraction'
import { useNpwStore } from '@/stores/npw'

const props = defineProps({ rows: { type: Array, required: true }, maintenance: { type: Array, default: () => [] }, tunes: { type: Array, default: () => [] }, specs: { type: Object, required: true }, colorDimensions: { type: Array, default: () => ['eqpid'] } })
const avgEl = ref(null)
const rangeEl = ref(null)
const stressEl = ref(null)
const charts = []
const cleanups = []
const store = useNpwStore()
const { selectedWafer, selectedGroup, selectedGroupOrder } = storeToRefs(store)
const config = [['avg', 'AVG', avgEl], ['range', 'RANGE', rangeEl], ['stress', 'STRESS', stressEl]]

function tooltip(params) {
  const row = params.data.meta
  if (row.kind === 'maintenance') return `<b>${row.code}</b><br>${row.eqpid}-${row.chid}<br><br>작업 시작: ${row.work_start_time.replace('T', ' ')}<br>작업 종료: ${row.work_end_time.replace('T', ' ')}<br>Title: ${row.title}`
  if (row.kind === 'tune') return `<b>Group ${row.group_order}</b><br>Work Order: ${row.work_order}<br>${row.tunedAt.replace('T', ' ')}<br>${row.eqpid}-${row.chid} · ${row.ppid}<br>NPW: ${row.npwBefore} → ${row.npwAfter}`
  return `<b>${row.time.replace('T', ' ')}</b><br>${row.eqpid}-${row.chid}<br>${row.ppid}<br>${row.foupid} / Slot ${row.slotid}<br><b>${params.value[1]}</b>`
}

function render() {
  config.forEach(([key, title, element], index) => {
    if (!element.value) return
    charts[index] ||= echarts.init(element.value)
    const spec = props.specs[key]
    const data = props.rows.map((row) => {
      const selected = selectedWafer.value === store.waferKey(row)
      const sameGroup = !selectedGroup.value || row.group === selectedGroup.value
      const sameStage = sameGroup && (!selectedGroupOrder.value || row.group_order === selectedGroupOrder.value)
      return {
        value: [row.time, row[key]], meta: row, symbolSize: selected || sameStage ? 11 : 7,
        itemStyle: { color: colorForRow(row, props.colorDimensions), opacity: selectedWafer.value ? (selected ? 1 : .12) : (sameGroup ? .86 : .13), borderColor: sameStage ? '#5b21b6' : '#fff', borderWidth: sameStage ? 2 : 1 },
      }
    })
    charts[index].setOption({
      grid: { left: 48, right: 15, top: 42, bottom: 38 },
      toolbox: { show: false, feature: { dataZoom: { yAxisIndex: 'none' } } },
      dataZoom: [{ type: 'inside', xAxisIndex: 0, filterMode: 'none', zoomOnMouseWheel: false, moveOnMouseMove: false }],
      title: { text: title, subtext: 'MEASUREMENT DISTRIBUTION', left: 14, top: 7, itemGap: 2, textStyle: { color: '#243b50', fontSize: 13, fontWeight: 700 }, subtextStyle: { color: '#718599', fontSize: 8, fontWeight: 700 } },
      tooltip: { trigger: 'item', triggerOn: 'mousemove', alwaysShowContent: false, hideDelay: 0, enterable: false, formatter: tooltip, backgroundColor: 'rgba(255,255,255,.98)', borderColor: '#c8d4e0', padding: 10, extraCssText: 'box-shadow:0 10px 25px rgba(39,57,77,.15);', textStyle: { color: '#1f3145', fontSize: 11 } },
      axisPointer: { show: true, type: 'cross', snap: true, lineStyle: { color: '#8ba0b5', type: 'dashed' }, crossStyle: { color: '#8ba0b5' }, label: { color: '#fff', backgroundColor: '#526b84', fontSize: 9 } },
      xAxis: { type: 'time', axisLabel: { color: '#596c80', fontSize: 10, formatter: '{MM}-{dd}', margin: 11 }, axisLine: { lineStyle: { color: '#aebdcb' } }, splitLine: { show: true, lineStyle: { color: '#edf1f5' } } },
      yAxis: { type: 'value', scale: true, axisLabel: { color: '#596c80', fontSize: 10 }, axisLine: { show: true, lineStyle: { color: '#aebdcb' } }, splitLine: { lineStyle: { color: '#dce4eb', type: 'dashed' } } },
      series: [{
        type: 'scatter', symbol: 'circle', symbolSize: 6, data,
        markArea: { silent: true, itemStyle: { color: 'rgba(73,209,154,.045)' }, data: [[{ yAxis: spec.min }, { yAxis: spec.max }]] },
        markLine: { silent: false, symbol: 'none', data: [
          { yAxis: spec.min, lineStyle: { color: '#49d19a', type: 'dashed' }, label: { formatter: `${spec.min}`, color: '#5fd4a4', fontSize: 7 } },
          { yAxis: spec.max, lineStyle: { color: '#49d19a', type: 'dashed' }, label: { formatter: `${spec.max}`, color: '#5fd4a4', fontSize: 7 } },
        ] },
      }],
    }, true)
  })
}

function resize() { charts.forEach((chart) => chart?.resize()) }
onMounted(async () => {
  await nextTick()
  render()
  window.addEventListener('resize', resize)
  charts.forEach((chart) => {
    cleanups.push(setupLinkedShiftZoom(chart))
    chart.on('click', (params) => { if (params.data?.meta?.time) store.selectWafer(params.data.meta) })
  })
})
watch(() => [props.rows, props.specs, props.colorDimensions, selectedWafer.value, selectedGroup.value, selectedGroupOrder.value], () => nextTick(render), { deep: true })
onBeforeUnmount(() => { cleanups.forEach((cleanup) => cleanup()); window.removeEventListener('resize', resize); charts.forEach((chart) => chart?.dispose()) })
</script>

<template><section class="metric-grid"><div ref="avgEl" class="panel metric"></div><div ref="rangeEl" class="panel metric"></div><div ref="stressEl" class="panel metric"></div></section></template>
<style scoped>.metric-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.metric{height:290px;overflow:hidden;background:#fff}@media(max-width:900px){.metric-grid{grid-template-columns:1fr}.metric{height:300px}}</style>
