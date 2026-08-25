<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { storeToRefs } from 'pinia'
import { colorForRow } from '@/utils/chartColors'
import { setupLinkedShiftZoom } from '@/utils/chartInteraction'
import { useNpwStore } from '@/stores/npw'

const props = defineProps({ rows: { type: Array, required: true }, maintenance: { type: Array, default: () => [] }, tunes: { type: Array, default: () => [] }, specs: { type: Object, required: true } })
const colorDimensions = ['eqpid', 'chid', 'ppid']
const chartEl = ref(null)
let chart
let cleanupZoom
const store = useNpwStore()
const { selectedWafer, selectedGroup, selectedGroupOrder } = storeToRefs(store)
const sortMode = ref('time')
const compositeKey = (row) => `${row.eqpid}|${row.chid}|${row.side}|${row.ppid}`
const options = computed(() => [...new Map(props.rows.map((row) => [compositeKey(row), { key: compositeKey(row), label: `${row.eqpid} / ${row.chid}-S${row.side} / ${row.ppid}`, row }])).values()].sort((a, b) => a.label.localeCompare(b.label)))
const visible = reactive([])

function toggle(value) { const index = visible.indexOf(value); if (index >= 0) visible.splice(index, 1); else visible.push(value) }
function isVisible(value) { return visible.includes(value) }
function itemColor(row) { return colorForRow(row, colorDimensions) }
function rowColor(row) { return colorForRow(row, colorDimensions) }
function isSelected(row) { return selectedWafer.value === store.waferKey(row) }

function tooltip(params) {
  const data = params.data.meta
  if (data.kind === 'maintenance') {
    return `<b>${data.code}</b><br>${data.eqpid}-${data.chid}<br><br>작업 시작: ${data.work_start_time.replace('T', ' ')}<br>작업 종료: ${data.work_end_time.replace('T', ' ')}<br>Title: ${data.title}`
  }
  if (data.kind === 'tune') {
    const factors = Object.entries(data.factors).map(([name, values]) => `${name}: ${values[0]} → ${values[1]} (${values[1] - values[0]})`).join('<br>')
    return `<b>Group ${data.group_order}</b><br>Work Order: ${data.work_order}<br>${data.tunedAt.replace('T', ' ')}<br>${data.eqpid}-${data.chid} · ${data.ppid}<br><br>${factors}<br><br>NPW: ${data.npwBefore} → <b>${data.npwAfter}</b><br>작업자: ${data.worker}`
  }
  return `<b>${data.time.replace('T', ' ')}</b><br>${data.eqpid}-${data.chid}<br>PPID: ${data.ppid}<br>FOUP ID: ${data.foupid}<br>Slot ID: ${data.slotid}<br>${data.point}: <b>${params.value[1].toFixed(1)}</b>`
}

function axisKey(row) { return [row.time, row.eqpid, row.chid, row.ppid, row.side].join('|') }
function axisLabel(value) {
  const time = value.split('|')[0]
  return `${time.slice(5, 10)}\n${time.slice(11, 16)}`
}
function sortRows(rows) {
  const fields = sortMode.value === 'eqpid' ? ['eqpid', 'chid', 'ppid', 'time'] : sortMode.value === 'ppid' ? ['ppid', 'eqpid', 'chid', 'time'] : ['time', 'eqpid', 'chid', 'ppid']
  return [...rows].sort((a, b) => fields.reduce((result, field) => result || String(a[field]).localeCompare(String(b[field])), 0) || String(a.side).localeCompare(String(b.side)))
}

function render() {
  if (!chartEl.value) return
  chart ||= echarts.init(chartEl.value)
  const selectedRows = sortRows(props.rows.filter((row) => visible.includes(compositeKey(row))))
  const categories = selectedRows.map(axisKey)
  const maintenanceLines = props.maintenance.map((item) => {
    const candidates = selectedRows.filter((row) => row.eqpid === item.eqpid && row.chid === item.chid)
    const nearest = candidates.sort((a, b) => Math.abs(new Date(a.time) - new Date(item.work_date)) - Math.abs(new Date(b.time) - new Date(item.work_date)))[0]
    return nearest ? { xAxis: axisKey(nearest), meta: { ...item, kind: 'maintenance' }, lineStyle: { color: '#f2b400', type: 'solid', width: 2 }, label: { formatter: item.code, position: 'insideEndTop', color: '#8b6500', fontSize: 11, fontWeight: 800, padding: [2, 3] }, tooltip: { show: true, formatter: (params) => tooltip(params) } } : null
  }).filter(Boolean)
  const tuneEvents = props.tunes.filter((item) => item.group_order !== 'start').map((item) => {
    const candidates = selectedRows.filter((row) => row.eqpid === item.eqpid && new Date(row.time) >= new Date(item.tunedAt))
    const nearest = candidates.sort((a, b) => new Date(a.time) - new Date(b.time))[0]
    return nearest ? { axis: axisKey(nearest), item } : null
  }).filter(Boolean)
  const series = ['1', '2'].flatMap((side) => Array.from({ length: 13 }, (_, pointIndex) => ({
    name: `Side ${side} · S${pointIndex + 1}`,
    type: 'scatter',
    symbol: 'circle',
    symbolSize: 6,
    data: selectedRows.filter((row) => row.side === side).map((row) => { const sameGroup = !selectedGroup.value || row.group === selectedGroup.value; const sameStage = sameGroup && (!selectedGroupOrder.value || row.group_order === selectedGroupOrder.value); return { value: [axisKey(row), row.points[pointIndex].value], meta: { ...row, points: undefined, point: row.points[pointIndex].key }, symbolSize: sameStage || isSelected(row) ? 11 : 7, itemStyle: { color: rowColor(row), opacity: selectedWafer.value ? (isSelected(row) ? 1 : .12) : (sameGroup ? .88 : .13), borderColor: sameStage ? '#5b21b6' : '#ffffff', borderWidth: sameStage ? 2 : 1 } } }),
    itemStyle: { opacity: .76 },
    emphasis: { scale: 1.7, itemStyle: { opacity: 1 } },
    label: { show: false },
    markArea: pointIndex === 0 && side === '1' ? { silent: true, label: { show: false }, itemStyle: { color: 'rgba(73,209,154,.055)' }, data: [[{ yAxis: props.specs.point.min }, { yAxis: props.specs.point.max }]] } : undefined,
    markLine: pointIndex === 0 && side === '1' ? { silent: false, symbol: 'none', data: [
      { yAxis: props.specs.point.min, lineStyle: { color: '#49d19a', type: 'dashed' }, label: { formatter: `LSL ${props.specs.point.min}`, color: '#62d9a9' } },
      { yAxis: props.specs.point.max, lineStyle: { color: '#49d19a', type: 'dashed' }, label: { formatter: `USL ${props.specs.point.max}`, color: '#62d9a9' } },
      ...maintenanceLines,
      ...tuneEvents.map((event) => ({ xAxis: event.axis, meta: { ...event.item, kind: 'tune' }, lineStyle: { color: '#7c3aed', type: 'dashed', width: 2 }, label: { formatter: event.item.group_order, position: 'insideEndBottom', color: '#6d28d9', fontSize: 11, fontWeight: 800, padding: [2, 3] }, tooltip: { show: true, formatter: (params) => tooltip(params) } })),
    ] } : undefined,
  })))
  chart.setOption({
    animationDuration: 350,
    toolbox: { show: false, feature: { dataZoom: { yAxisIndex: 'none' } } },
    dataZoom: [{ type: 'inside', xAxisIndex: 0, filterMode: 'none', zoomOnMouseWheel: false, moveOnMouseMove: false }],
    grid: { left: 68, right: 30, top: 42, bottom: 54 },
    legend: { show: false },
    tooltip: { trigger: 'item', triggerOn: 'mousemove', alwaysShowContent: false, hideDelay: 0, enterable: false, formatter: tooltip, backgroundColor: 'rgba(255,255,255,.98)', borderColor: '#c8d4e0', borderWidth: 1, padding: 12, extraCssText: 'box-shadow:0 12px 30px rgba(39,57,77,.16);', textStyle: { color: '#1f3145', fontSize: 12 } },
    axisPointer: { show: true, type: 'cross', snap: true, lineStyle: { color: '#8ba0b5', type: 'dashed', width: 1 }, crossStyle: { color: '#8ba0b5' }, label: { color: '#fff', backgroundColor: '#526b84', fontSize: 10 } },
    xAxis: { type: 'category', data: categories, axisLabel: { color: '#596c80', fontSize: 10, formatter: axisLabel, hideOverlap: true, margin: 13 }, axisLine: { lineStyle: { color: '#aebdcb', width: 1.2 } }, axisTick: { alignWithLabel: true, lineStyle: { color: '#aebdcb' } }, splitLine: { show: true, lineStyle: { color: '#edf1f5' } } },
    yAxis: { type: 'value', name: 'Point 두께', nameGap: 24, nameTextStyle: { color: '#51667a', fontSize: 11, fontWeight: 700 }, scale: true, axisLabel: { color: '#596c80', fontSize: 11 }, axisLine: { show: true, lineStyle: { color: '#aebdcb' } }, splitLine: { lineStyle: { color: '#dce4eb', type: 'dashed' } } },
    series,
  }, true)
}

function resize() { chart?.resize() }
watch(options, (next) => { visible.splice(0, visible.length, ...next.map((item) => item.key)); nextTick(render) }, { immediate: true, deep: true })
watch(() => [props.maintenance, props.tunes, props.specs, visible, sortMode.value, selectedWafer.value, selectedGroup.value, selectedGroupOrder.value], () => nextTick(render), { deep: true })
onMounted(async () => {
  await nextTick(); render(); window.addEventListener('resize', resize)
  cleanupZoom = setupLinkedShiftZoom(chart)
  chart.on('click', (params) => { if (params.data?.meta?.time) store.selectWafer(params.data.meta) })
})
onBeforeUnmount(() => { cleanupZoom?.(); window.removeEventListener('resize', resize); chart?.dispose() })
</script>

<template>
  <section class="panel chart-panel">
    <div class="head">
      <div><span>POINT DISTRIBUTION</span><h2>설비별 NPW Trend</h2><p>설비 조합별 Point 분포와 작업·Tune 진행 시점을 비교합니다.</p></div>
      <label class="sort-control"><span>⇅</span><b>정렬</b><select v-model="sortMode"><option value="time">시간</option><option value="eqpid">EQPID</option><option value="ppid">PPID</option></select></label>
    </div>
    <div class="interaction-bar"><span><i class="maint-line"></i>Maintenance code</span><span><i class="tune-line"></i>Tune group_order</span><span><i class="spec-box"></i>Spec In</span><span><kbd>Shift</kbd> + Drag 확대</span><span>Double click 초기화</span><strong v-if="selectedWafer">선택 웨이퍼 · {{ selectedWafer.replace('|', ' / Slot ') }}</strong></div>
    <div class="plot-layout">
      <div ref="chartEl" class="chart"></div>
      <aside class="spotfire-legend">
        <p class="legend-guide">라벨을 클릭해 차트 표시 여부를 변경합니다.</p>
        <section class="side-filter-group">
          <div class="side-filter-list">
            <button v-for="item in options" :key="item.key" type="button" :class="{ active: isVisible(item.key) }" :style="{ '--item-color': itemColor(item.row) }" @click="toggle(item.key)">
              <i></i><span>{{ item.label }}</span>
            </button>
          </div>
        </section>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.chart-panel { min-height: 560px; overflow: hidden; }
.head { display: flex; justify-content: space-between; align-items: flex-start; padding: 22px 24px 0; }
.head > div:first-child > span { color: var(--blue); font-size: 8px; font-weight: 800; letter-spacing: .14em; }
.head h2 { margin-top: 5px; color: #e5eef7; font-size: 17px; }
.head p { margin-top: 4px; color: var(--muted); font-size: 10px; }
.sort-control { display: flex; align-items: center; gap: 7px; padding: 7px 9px; color: #52677a; background: #f7f9fb; border: 1px solid #d7e0e8; border-radius: 8px; font-size: 10px; }.sort-control > span { color: #1877c9; font-size: 15px; }.sort-control select { min-width: 82px; color: #263b4f; background: #fff; border: 1px solid #cbd7e2; border-radius: 6px; padding: 4px 7px; cursor: pointer; }
.interaction-bar { display: flex; align-items: center; gap: 14px; margin: 8px 24px 0; color: #60758a; font-size: 8px; }.interaction-bar span { display: flex; align-items: center; gap: 5px; }.interaction-bar i { display: inline-block; }.maint-line,.tune-line { width: 15px; height: 2px; background: #f2b400; }.tune-line { background: #7c3aed; }.spec-box { width: 9px; height: 7px; background: rgba(73,209,154,.22); border: 1px solid rgba(73,209,154,.5); }.interaction-bar kbd { padding: 2px 5px; color: #a9bac9; background: #172538; border: 1px solid #344b62; border-radius: 3px; font-family: inherit; font-size: 7px; }.interaction-bar strong { margin-left: auto; padding: 4px 8px; color: #e0d9ff; background: rgba(154,134,245,.12); border: 1px solid rgba(154,134,245,.3); border-radius: 10px; font-size: 8px; }
.plot-layout { display: grid; grid-template-columns: minmax(0,1fr) 235px; align-items: stretch; }.chart { width: 100%; height: 430px; }.spotfire-legend { max-height: 410px; margin: 16px 18px 20px 0; padding-left: 14px; overflow-y: auto; border-left: 1px solid #dbe3ea; }.legend-guide { position: sticky; z-index: 2; top: 0; margin: 0 0 9px; padding: 7px 8px; color: #607487; background: #eef4f8; border-radius: 6px; font-size: 9px; line-height: 1.35; }.side-filter-list { display: grid; gap: 5px; }.side-filter-list button { display: grid; grid-template-columns: 8px minmax(0,1fr); align-items: center; gap: 7px; width: 100%; min-height: 29px; padding: 5px 7px; color: #8090a0; background: #f7f9fb; border: 1px solid #e1e7ed; border-radius: 6px; font-size: 9px; text-align: left; cursor: pointer; opacity: .42; }.side-filter-list button i { width: 8px; height: 8px; background: #aab6c1; border-radius: 50%; }.side-filter-list button span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.side-filter-list button.active { color: #31475b; background: #fff; border-color: #cdd8e2; box-shadow: 0 2px 7px rgba(36,55,73,.07); opacity: 1; }.side-filter-list button.active i { background: var(--item-color); }
@media (max-width: 900px) { .plot-layout { grid-template-columns: 1fr; }.spotfire-legend { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 0 16px 18px; padding: 12px 0 0; border-top: 1px solid #dbe3ea; border-left: 0; }.spotfire-legend section + section { margin: 0; padding: 0 0 0 14px; border-top: 0; border-left: 1px solid #e3e9ee; } }
@media (max-width: 620px) { .head { flex-direction: column; gap: 10px; padding-inline: 16px; }.interaction-bar { margin-inline: 16px; flex-wrap: wrap; }.interaction-bar strong { width: 100%; margin-left: 0; }.chart { height: 440px; }.spotfire-legend { grid-template-columns: 1fr; }.spotfire-legend section + section { padding: 12px 0 0; border-top: 1px solid #e3e9ee; border-left: 0; } }
</style>
