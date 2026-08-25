<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import 'echarts-gl'
import { interpolateWafer, WAFER_POINTS } from '@/composables/useWaferInterpolation'
import { WAFER_COLORS } from '@/composables/useWaferColorScale'
const props = defineProps({ row: Object, min: Number, max: Number, view: Object })
const emit = defineEmits(['view-change'])
const el = ref()
let chart, observer
function draw() {
  if (!el.value) return
  chart ||= echarts.init(el.value)
  const raw = props.row?.points?.map((p) => p.value) || []
  const data = interpolateWafer(raw, 41, true)
  const lift = Math.max((props.max - props.min) * 0.03, 1)
  const zMin = Math.floor(props.min / 100) * 100
  const zMax = Math.ceil((props.max + lift) / 100) * 100
  const points = WAFER_POINTS.map((p, i) => ({
    name: `S${i + 1}`,
    value: [p.x, p.y, Number(raw[i] || 0) + lift, Number(raw[i] || 0)],
  }))
  const axis = {
    nameTextStyle: { fontSize: 9, fontWeight: 'bold', color: '#17233a' },
    axisLabel: { fontSize: 8, fontWeight: 'bold', color: '#26344d' },
    axisLine: { lineStyle: { color: '#64748b', width: 1.2 } },
    splitLine: { lineStyle: { color: '#d8e0ea' } },
  }
  chart.setOption(
    {
      animation: false,
      tooltip: {
        formatter: (p) =>
          p.seriesType === 'scatter3D'
            ? `<b>${p.name}</b><br>X ${p.value[0]} mm / Y ${p.value[1]} mm<br>Thickness ${Number(p.value[3]).toFixed(1)} Å`
            : Number.isFinite(Number(p.value?.[2]))
              ? `X ${Number(p.value[0]).toFixed(0)} mm<br>Y ${Number(p.value[1]).toFixed(0)} mm<br><b>${Number(p.value[2]).toFixed(1)} Å</b>`
              : '',
      },
      visualMap: {
        show: false,
        seriesIndex: 0,
        min: props.min,
        max: props.max,
        inRange: { color: WAFER_COLORS },
      },
      xAxis3D: {
        ...axis,
        name: 'X (mm)',
        min: -150,
        max: 150,
        axisLabel: {
          ...axis.axisLabel,
          formatter: (value) =>
            Number(value) === 0 ? '{notch|Notch}\n{zero|0}' : Number(value).toLocaleString(),
          rich: {
            notch: { color: '#e53935', fontSize: 10, fontWeight: 'bold', lineHeight: 13 },
            zero: { color: '#26344d', fontSize: 8, fontWeight: 'bold', lineHeight: 10 },
          },
        },
      },
      yAxis3D: { ...axis, name: 'Y (mm)', min: -170, max: 150 },
      zAxis3D: {
        ...axis,
        name: 'Z (Å)',
        min: zMin,
        max: zMax,
        interval: 100,
        axisLabel: {
          ...axis.axisLabel,
          showMinLabel: false,
          showMaxLabel: false,
          formatter: (value) =>
            Number(value) % 100 === 0 ? Number(value).toLocaleString() : '',
        },
      },
      grid3D: {
        boxWidth: 100,
        boxDepth: 100,
        boxHeight: 46,
        environment: '#fff',
        axisPointer: { show: false },
        light: { main: { intensity: 1, shadow: false }, ambient: { intensity: 0.65 } },
        viewControl: {
          projection: 'perspective',
          autoRotate: false,
          alpha: props.view.alpha,
          beta: props.view.beta,
          distance: props.view.distance,
          panSensitivity: 1,
          rotateSensitivity: 1,
          zoomSensitivity: 1,
        },
      },
      series: [
        {
          type: 'surface',
          data,
          shading: 'lambert',
          connectNulls: false,
          wireframe: { show: true, lineStyle: { color: '#ffffff1f', width: 0.25 } },
          itemStyle: { opacity: 1 },
        },
        {
          type: 'scatter3D',
          name: 'Measurement Points',
          data: points,
          zlevel: 10,
          blendMode: 'source-over',
          symbolSize: 7,
          itemStyle: { color: '#ffffff', borderColor: '#1d2942', borderWidth: 0.3, opacity: 1 },
          label: {
            show: true,
            formatter: '{b}',
            distance: 2,
            textStyle: { fontSize: 9, color: '#17233b', fontWeight: 'normal' },
          },
        },
      ],
    },
    true,
  )
}
function report() {
  const v = chart?.getOption()?.grid3D?.[0]?.viewControl
  if (v) emit('view-change', { alpha: v.alpha, beta: v.beta, distance: v.distance })
}
watch(
  () => [props.row, props.min, props.max, props.view],
  () => nextTick(draw),
  { deep: true },
)
onMounted(() => {
  draw()
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(el.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  chart?.dispose()
})
</script>
<template><div ref="el" class="surface" @mouseup="report"></div></template>
<style scoped>
.surface {
  width: 100%;
  height: 285px;
}
</style>
