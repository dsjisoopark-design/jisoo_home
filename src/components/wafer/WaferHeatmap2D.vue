<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { interpolateWafer, WAFER_POINTS } from '@/composables/useWaferInterpolation'
import { WAFER_COLORS } from '@/composables/useWaferColorScale'
const props = defineProps({ row: Object, min: Number, max: Number, side: String })
const canvas = ref()
const tip = ref(null)
let observer
const rgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]
function color(v) {
  const t = Math.max(0, Math.min(1, (v - props.min) / Math.max(1, props.max - props.min))),
    p = t * (WAFER_COLORS.length - 1),
    a = Math.floor(p),
    b = Math.min(a + 1, WAFER_COLORS.length - 1),
    f = p - a,
    A = rgb(WAFER_COLORS[a]),
    B = rgb(WAFER_COLORS[b])
  return `rgb(${A.map((n, i) => Math.round(n + (B[i] - n) * f)).join(',')})`
}
function draw() {
  const c = canvas.value
  if (!c) return
  const r = c.getBoundingClientRect(),
    d = devicePixelRatio || 1
  c.width = r.width * d
  c.height = r.height * d
  const x = c.getContext('2d')
  x.scale(d, d)
  x.clearRect(0, 0, r.width, r.height)
  const size = Math.min(r.width - 48, r.height - 30),
    rad = size / 2,
    cx = r.width / 2,
    cy = r.height / 2 + 5,
    off = document.createElement('canvas')
  off.width = 180
  off.height = 180
  const ox = off.getContext('2d'),
    img = ox.createImageData(180, 180),
    grid = interpolateWafer(props.row?.points?.map((p) => p.value) || [], 180)
  grid.forEach(([gx, gy, v]) => {
    const px = Math.round(((gx + 150) / 300) * 179),
      py = Math.round(((150 - gy) / 300) * 179),
      i = (py * 180 + px) * 4,
      C = color(v).match(/\d+/g).map(Number)
    img.data.set([...C, 255], i)
  })
  ox.putImageData(img, 0, 0)
  x.save()
  x.beginPath()
  x.arc(cx, cy, rad, 0, Math.PI * 2)
  x.clip()
  x.drawImage(off, cx - rad, cy - rad, size, size)
  x.restore()
  x.strokeStyle = '#26375c'
  x.lineWidth = 1.2
  x.beginPath()
  x.arc(cx, cy, rad, 0, Math.PI * 2)
  x.stroke()
  // Wafer notch: fixed at the 6 o'clock direction.
  x.save()
  x.fillStyle = '#ffffff'
  x.strokeStyle = '#26375c'
  x.lineWidth = 1.2
  x.beginPath()
  x.moveTo(cx - 7, cy + rad - 1)
  x.lineTo(cx, cy + rad - 8)
  x.lineTo(cx + 7, cy + rad - 1)
  x.closePath()
  x.fill()
  x.stroke()
  x.font = '700 7px Arial'
  x.textAlign = 'center'
  x.fillStyle = '#526178'
  x.fillText('NOTCH', cx, cy + rad + 8)
  x.restore()
  x.setLineDash([2, 3])
  x.strokeStyle = '#ffffff80'
  x.beginPath()
  x.moveTo(cx - rad, cy)
  x.lineTo(cx + rad, cy)
  x.moveTo(cx, cy - rad)
  x.lineTo(cx, cy + rad)
  x.stroke()
  x.setLineDash([])
  WAFER_POINTS.forEach((p, i) => {
    const px = cx + (p.x / 150) * rad,
      py = cy - (p.y / 150) * rad
    x.fillStyle = '#fff'
    x.strokeStyle = '#1d2942'
    x.beginPath()
    x.arc(px, py, 3.5, 0, Math.PI * 2)
    x.fill()
    x.stroke()
    x.font = '700 9px Arial'
    x.textAlign = 'center'
    x.fillStyle = '#17233b'
    x.fillText(`S${i + 1}`, px, py - 7)
  })
}
function move(e) {
  const r = canvas.value.getBoundingClientRect(),
    size = Math.min(r.width - 48, r.height - 30),
    rad = size / 2,
    cx = r.width / 2,
    cy = r.height / 2 + 5
  let hit = -1
  WAFER_POINTS.forEach((p, i) => {
    if (Math.hypot(e.offsetX - (cx + (p.x / 150) * rad), e.offsetY - (cy - (p.y / 150) * rad)) < 10)
      hit = i
  })
  if (hit < 0) {
    tip.value = null
    return
  }
  const p = WAFER_POINTS[hit],
    v = props.row.points[hit].value,
    avg = props.row.avg,
    delta = v - avg
  tip.value = {
    x: e.offsetX + 12,
    y: e.offsetY - 10,
    name: `${props.side} / S${hit + 1}`,
    v,
    p,
    delta,
    pct: (delta / avg) * 100,
  }
}
watch(
  () => [props.row, props.min, props.max],
  () => nextTick(draw),
  { deep: true },
)
onMounted(() => {
  observer = new ResizeObserver(draw)
  observer.observe(canvas.value)
  draw()
})
onBeforeUnmount(() => observer?.disconnect())
</script>
<template>
  <div class="wrap">
    <canvas ref="canvas" @mousemove="move" @mouseleave="tip = null"></canvas>
    <div v-if="tip" class="tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }">
      <b>{{ tip.name }}</b
      ><span
        >Thickness <strong>{{ tip.v.toLocaleString() }} Å</strong></span
      ><span
        >X / Y <strong>{{ tip.p.x }} / {{ tip.p.y }} mm</strong></span
      ><span
        >Delta
        <strong
          >{{ tip.delta > 0 ? '+' : '' }}{{ tip.delta.toFixed(0) }} Å ({{
            tip.pct.toFixed(2)
          }}%)</strong
        ></span
      ><small
        >{{ row.eqpid }} · {{ row.chid }} · {{ row.ppid }}<br />{{ row.foupid }} · Slot
        {{ row.slotid }}</small
      >
    </div>
  </div>
</template>
<style scoped>
.wrap {
  position: relative;
}
.wrap canvas {
  display: block;
  width: 100%;
  height: 285px;
}
.tip {
  position: absolute;
  z-index: 5;
  width: 190px;
  padding: 10px;
  color: #fff;
  background: #26364e;
  border-radius: 5px;
  box-shadow: 0 5px 18px #1118274d;
  pointer-events: none;
  font-size: 9px;
}
.tip b,
.tip span,
.tip small {
  display: block;
}
.tip b {
  margin-bottom: 7px;
  font-size: 11px;
}
.tip span {
  display: flex;
  justify-content: space-between;
  margin: 4px 0;
}
.tip small {
  margin-top: 7px;
  padding-top: 6px;
  color: #cad3df;
  border-top: 1px solid #ffffff26;
  line-height: 1.5;
}
</style>
