<script setup>
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import TuneComparison from '@/components/TuneComparison.vue'
import { useNpwStore } from '@/stores/npw'

const props = defineProps({ rows: { type: Array, required: true }, comparison: Object, specs: { type: Object, required: true } })
const store = useNpwStore()
const { selectedGroup, selectedGroupOrder } = storeToRefs(store)
const rank = (value) => value === 'start' ? -1 : value === 'end' ? 999 : Number(value)
const sortedRows = computed(() => [...props.rows].sort((a, b) => a.time.localeCompare(b.time) || a.eqpid.localeCompare(b.eqpid) || a.chid.localeCompare(b.chid) || a.ppid.localeCompare(b.ppid) || a.side.localeCompare(b.side)))
const groups = computed(() => [...new Map(props.rows.map((row) => [row.group, { group: row.group, title: row.title, workOrder: row.workOrder, eqpid: row.eqpid, count: new Set(props.rows.filter((item) => item.group === row.group).map((item) => item.group_order)).size }])).values()])
const status = (metric, value) => store.inSpec(metric, value)
const select = (row) => store.selectTuneStage(row)
const stamp = (value) => value.replace('T', ' ')
watch(() => props.rows, (rows) => { if (rows.length && !rows.some((row) => row.group === selectedGroup.value)) store.selectTuneStage(rows[0]) }, { immediate: true, deep: true })
</script>

<template>
  <div class="tune-tab">
    <TuneComparison :comparison="comparison" />
    <section class="panel group-browser">
      <header><div><span>WORK GROUPS</span><h2>조회 설비 작업 그룹</h2></div><small>{{ groups.length }}개 작업</small></header>
      <div class="group-list"><button v-for="item in groups" :key="item.group" :class="{ active: item.group === selectedGroup }" @click="select(rows.find((row) => row.group === item.group))"><i></i><span><b>{{ item.eqpid }} · {{ item.title }}</b><small>{{ item.workOrder }} · {{ item.count }}단계</small></span></button></div>
    </section>
    <section class="panel history-table">
      <header><div><span>TUNE DATASET</span><h2>설비 Tune History</h2><p>행을 클릭하면 동일 Group 전체가 강조되고 선택한 단계까지의 개선효과가 계산됩니다.</p></div><b v-if="selectedGroupOrder">선택 단계 · {{ selectedGroupOrder }}</b></header>
      <div class="table-wrap"><table><thead><tr><th>측정 일시</th><th>작업명</th><th>Work Order</th><th>EQPID</th><th>CHID-SIDE</th><th>PPID</th><th>Group Order</th><th>AVG</th><th>Range</th><th>Stress</th><th>SH Δ</th><th>TEOS Δ</th><th>Pressure Δ</th></tr></thead><tbody>
        <tr v-for="row in sortedRows" :key="row.id" :class="{ 'group-active': row.group === selectedGroup, 'stage-active': row.group === selectedGroup && row.group_order === selectedGroupOrder }" @click="select(row)">
          <td>{{ stamp(row.time) }}</td><td>{{ row.title }}</td><td>{{ row.workOrder }}</td><td>{{ row.eqpid }}</td><td>{{ row.chid }}-S{{ row.side }}</td><td>{{ row.ppid }}</td><td><strong class="order">{{ row.group_order }}</strong></td>
          <td :class="status('avg',row.avg)?'spec-in':'spec-out'">{{ row.avg.toFixed(1) }}</td><td :class="status('range',row.range)?'spec-in':'spec-out'">{{ row.range.toFixed(1) }}</td><td :class="status('stress',row.stress)?'spec-in':'spec-out'">{{ row.stress.toFixed(1) }}</td><td>{{ row.shDistDelta }}</td><td>{{ row.teosFactorDelta }}</td><td>{{ row.pressureDelta }}</td>
        </tr><tr v-if="!sortedRows.length"><td colspan="13" class="empty">조회 조건에 해당하는 Tune 데이터가 없습니다.</td></tr>
      </tbody></table></div>
    </section>
  </div>
</template>

<style scoped>
.tune-tab{display:grid;gap:16px;min-width:0}.group-browser{padding:18px 20px;overflow:hidden}.group-browser header{display:flex;justify-content:space-between;align-items:flex-end}.group-browser header span,.history-table header span{color:#7357c8;font-size:9px;font-weight:800;letter-spacing:.14em}.group-browser h2,.history-table h2{margin:4px 0 0;color:#1d3347;font-size:18px}.group-browser header>small{color:#718497;font-size:10px}.group-list{display:flex;gap:8px;margin-top:13px;padding-bottom:4px;overflow-x:auto}.group-list button{display:flex;flex:0 0 205px;align-items:center;gap:9px;padding:10px;color:#607487;background:#f8fafc;border:1px solid #dce4eb;border-radius:8px;text-align:left;cursor:pointer}.group-list button>i{width:9px;height:9px;background:#a9b6c2;border-radius:50%}.group-list button span,.group-list button b,.group-list button small{display:block;min-width:0}.group-list button b{overflow:hidden;color:#324a5f;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.group-list button small{margin-top:2px;color:#8191a0;font-size:8px}.group-list button.active{background:#f1edfc;border-color:#a993e8;box-shadow:0 3px 10px rgba(90,64,160,.12)}.group-list button.active>i{background:#7c3aed}.group-list button.active b{color:#5b34aa}.history-table{min-width:0;overflow:hidden}.history-table header{display:flex;justify-content:space-between;align-items:flex-start;padding:20px 22px}.history-table p{margin:3px 0 0;color:#697d90;font-size:11px}.history-table header>b{padding:5px 10px;color:#6d28d9;background:#f1edfc;border-radius:12px;font-size:10px}.table-wrap{width:100%;max-height:520px;overflow:auto}table{width:100%;min-width:1180px;border-collapse:collapse}th{position:sticky;z-index:1;top:0;padding:11px 9px;color:#506579;background:#f3f6f9;border-block:1px solid #d9e1e8;font-size:9px;text-align:left}td{padding:10px 9px;color:#506376;border-bottom:1px solid #e4e9ee;font-size:10px;white-space:nowrap}tbody tr{cursor:pointer;transition:.15s}tbody tr:hover{background:#f5f8fb}.group-active{background:#fff9df}.stage-active{background:#eee8ff!important;box-shadow:inset 4px 0 #7c3aed}.order{display:inline-grid;min-width:31px;padding:3px 6px;place-items:center;color:#6d28d9;background:#f1edfc;border-radius:9px}.spec-in{color:#16815d!important;font-weight:800}.spec-out{color:#d1434c!important;font-weight:800}.empty{text-align:center;padding:35px}@media(max-width:700px){.history-table header{gap:12px}.history-table header>b{white-space:nowrap}.group-list button{flex-basis:180px}}
</style>
