<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useNpwStore } from '@/stores/npw'

const store = useNpwStore()
const panel = ref(null)
const form = reactive({ ...store.filters, eqpids: [...store.filters.eqpids], chids: [...store.filters.chids], ppids: [...store.filters.ppids] })
const groups = computed(() => [
  { key: 'eqpids', label: 'EQP ID', options: store.equipmentOptions, empty: 'Select Equipment' },
  { key: 'chids', label: 'Chamber ID', options: store.chamberOptions, empty: 'Select Chamber' },
  { key: 'ppids', label: 'PPID', options: store.ppidOptions, empty: 'Select PPID' },
])
watch(() => form.eqpids, () => { const available = store.chamberOptions; form.chids = form.chids.filter((item) => available.includes(item)); if (!form.chids.length) form.chids = [...available] }, { deep: true })
const allSelected = (group) => form[group.key].length === group.options.length
const toggleAll = (group) => { form[group.key] = allSelected(group) ? [] : [...group.options] }
function summary(group) { const selected = form[group.key]; if (allSelected(group)) return `All ${group.label === 'PPID' ? 'PPIDs' : group.label.split(' ')[0]}`; if (!selected.length) return group.empty; return selected.length <= 2 ? selected.join(', ') : `${selected.slice(0, 2).join(', ')} +${selected.length - 2}` }
function closeAll(except) { panel.value?.querySelectorAll('details[open]').forEach((item) => { if (item !== except) item.removeAttribute('open') }) }
function handleToggle(event) { if (event.target.open) closeAll(event.target) }
function handleOutside(event) { if (panel.value && !panel.value.contains(event.target)) closeAll() }
function reset() { Object.assign(form, { eqpids: ['E01'], chids: [...store.chamberOptions], ppids: [...store.ppidOptions], startDate: '2026-07-01', endDate: '2026-07-13' }); store.applyFilters(form); closeAll() }
function apply() { store.applyFilters(form); closeAll() }
onMounted(() => document.addEventListener('pointerdown', handleOutside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleOutside))
</script>

<template>
  <section ref="panel" class="filter-panel" aria-label="Data filters">
    <div v-for="group in groups" :key="group.key" class="field"><label>{{ group.label }} <span>{{ form[group.key].length }} selected</span></label><details @toggle="handleToggle"><summary>{{ summary(group) }}</summary><div class="options"><label class="select-all"><input type="checkbox" :checked="allSelected(group)" @change="toggleAll(group)"> Select All</label><label v-for="item in group.options" :key="item"><input v-model="form[group.key]" type="checkbox" :value="item"> {{ item }}</label></div></details></div>
    <div class="field date-field"><label>Date</label><div class="date-range"><label><input v-model="form.startDate" type="date"></label><i></i><label><input v-model="form.endDate" type="date"></label></div></div>
    <div class="actions"><button class="reset" type="button" @click="reset">필터초기화</button><button class="search" type="button" :disabled="!form.eqpids.length || !form.chids.length || !form.ppids.length" @click="apply">조회</button></div>
  </section>
</template>

<style scoped>
.filter-panel{display:grid;grid-template-columns:1fr 1fr 1fr 1.7fr auto;gap:14px;align-items:end;padding:20px;background:#fff;border:1px solid var(--border);border-radius:13px}.field{display:grid;gap:7px;min-width:0}.field>label{color:#52677a;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.field>label span{margin-left:5px;color:#1877c9;font-size:9px;text-transform:none}details{position:relative}summary{display:flex;align-items:center;height:42px;padding:0 34px 0 12px;overflow:hidden;color:#263b4f;background:#f8fafc;border:1px solid #cbd7e2;border-radius:9px;font-size:11px;cursor:pointer;white-space:nowrap;text-overflow:ellipsis}summary::after{content:'⌄';position:absolute;right:12px;color:#718497;font-size:15px}details[open] summary{border-color:#72a9d2;box-shadow:0 0 0 2px rgba(24,119,201,.1)}.options{position:absolute;z-index:40;top:47px;right:0;left:0;display:grid;max-height:166px;gap:8px;padding:10px 12px;overflow-y:auto;scrollbar-color:#a5b8c9 #edf2f6;scrollbar-width:thin;background:#fff;border:1px solid #bdcbd8;border-radius:9px;box-shadow:0 12px 30px rgba(39,57,77,.17)}.options label{color:#354b60;font-size:11px;cursor:pointer}.select-all{position:sticky;z-index:1;top:-10px;padding-block:3px 8px;background:#fff;border-bottom:1px solid #dbe3ea;font-weight:700}.date-range{display:grid;grid-template-columns:1fr 14px 1fr;align-items:center;height:42px;padding:0 10px;background:#f8fafc;border:1px solid #cbd7e2;border-radius:9px}.date-range label{display:grid;gap:1px}.date-range small{color:#728598;font-size:7px;font-weight:800}.date-range input{width:100%;min-width:0;padding:0;color:#263b4f;background:transparent;border:0;outline:0;font-size:9px;color-scheme:light}.date-range>i{width:7px;height:1px;background:#8294a5}.actions{display:flex;gap:8px}.actions button{height:42px;padding:0 15px;border-radius:9px;font-size:10px;font-weight:800;white-space:nowrap;cursor:pointer}.reset{color:#4f6578;background:#fff;border:1px solid #c7d3de}.search{color:#fff;background:linear-gradient(135deg,#268bd8,#126db7);border:1px solid #126db7}.search:disabled{opacity:.4;cursor:not-allowed}@media(max-width:1100px){.filter-panel{grid-template-columns:1fr 1fr 1fr}.date-field{grid-column:span 2}.actions{justify-content:flex-end}}@media(max-width:650px){.filter-panel{grid-template-columns:1fr 1fr}.date-field,.actions{grid-column:1/-1}.actions button{flex:1}}
</style>
<style scoped>
.field{gap:6px}.field>label{color:#34495d;font-size:11px;font-weight:700;letter-spacing:0;text-transform:none}.field>label span{float:right;color:#7b8d9e;font-size:9px;font-weight:500}.date-field>label{font-size:13px!important}.date-range input{font-size:11px}summary{height:40px;padding:0 34px 0 12px;color:#2f4356;background:#fff;border-color:#cbd5df;border-radius:6px;box-shadow:0 1px 2px rgba(29,48,65,.03)}summary::after{content:"";right:13px;width:7px;height:7px;border-right:2px solid #718497;border-bottom:2px solid #718497;transform:translateY(-2px) rotate(45deg)}details[open] summary::after{transform:translateY(2px) rotate(225deg)}.options{top:44px;max-height:172px;gap:0;padding:6px 0;border-color:#c5d0da;border-radius:6px;box-shadow:0 10px 24px rgba(39,57,77,.15)}.options label{display:flex;align-items:center;gap:7px;min-height:29px;padding:4px 11px;font-size:11px}.options label:hover{background:#f2f7fb}.options input{accent-color:#1877c9}.select-all{top:-6px;margin-bottom:3px;background:#f7fafc}
</style>
