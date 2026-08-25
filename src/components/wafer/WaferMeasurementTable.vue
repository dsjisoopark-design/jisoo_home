<script setup>
import { nextTick, ref, watch } from 'vue'
import { waferStats } from '@/composables/useWaferStatistics'
import { useNpwStore } from '@/stores/npw'
const props = defineProps({ rows: Array, selectedKey: String })
defineEmits(['select'])
const store = useNpwStore()
const root = ref()
const fmt = (v) => Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 1 })
const pairKey = (r) => `${r.time}|${r.eqpid}|${r.chid}|${r.ppid}|${r.foupid}`
const specOut = (key, value) =>
  Number(value) < Number(store.specs[key].min) || Number(value) > Number(store.specs[key].max)
watch(
  () => props.selectedKey,
  () =>
    nextTick(() =>
      root.value
        ?.querySelector('tr.selected')
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
    ),
)
</script>
<template>
  <section ref="root">
    <h2>MEASUREMENT POINTS (S1 ~ S13)</h2>
    <div>
      <table>
        <thead>
          <tr>
            <th>EQPID</th>
            <th>CHID</th>
            <th>SIDE</th>
            <th>PPID</th>
            <th>FOUPID</th>
            <th>SLOTID</th>
            <th v-for="n in 13" :key="n">S{{ n }}</th>
            <th>MIN</th>
            <th>MAX</th>
            <th>AVG</th>
            <th>RANGE</th>
            <th>STRESS</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in rows"
            :key="r.id"
            :class="{ selected: pairKey(r) === selectedKey }"
            @click="$emit('select', r)"
          >
            <td>{{ r.eqpid }}</td>
            <td>{{ r.chid }}</td>
            <td>
              <b>SIDE {{ r.side }}</b>
            </td>
            <td>{{ r.ppid }}</td>
            <td>{{ r.foupid }}</td>
            <td>{{ r.slotid }}</td>
            <td
              v-for="p in r.points"
              :key="p.key"
              :class="{ cool: p.value === waferStats(r).min, warm: p.value === waferStats(r).max }"
            >
              {{ fmt(p.value) }}
            </td>
            <td class="cool">{{ fmt(waferStats(r).min) }}</td>
            <td class="warm">{{ fmt(waferStats(r).max) }}</td>
            <td :class="{ 'spec-out': specOut('avg', waferStats(r).avg) }">
              <b>{{ fmt(waferStats(r).avg) }}</b>
            </td>
            <td :class="{ 'spec-out': specOut('range', waferStats(r).range) }">
              {{ fmt(waferStats(r).range) }}
            </td>
            <td :class="{ 'spec-out': specOut('stress', r.stress) }">{{ fmt(r.stress) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
<style scoped>
section {
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe5eb;
  border-radius: 12px;
  box-shadow: 0 5px 18px rgba(35, 55, 75, 0.07);
}
h2 {
  margin: 0;
  padding: 14px 16px;
  color: #1d3347;
  border-bottom: 1px solid #e1e7ee;
  font-size: 13px;
}
section > div {
  height: clamp(220px, 42vh, 430px);
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-gutter: stable;
}
section > div::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
section > div::-webkit-scrollbar-track {
  background: #f1f4f8;
}
section > div::-webkit-scrollbar-thumb {
  background: #b8c4d2;
  border: 2px solid #f1f4f8;
  border-radius: 6px;
}
section > div::-webkit-scrollbar-thumb:hover {
  background: #8fa0b4;
}
table {
  width: 100%;
  min-width: 0;
  border-collapse: collapse;
  table-layout: fixed;
}
th,
td {
  height: 38px;
  padding: 0 3px;
  overflow: hidden;
  border-right: 1px solid #e7ebf0;
  border-bottom: 1px solid #e7ebf0;
  font-size: 9px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
th {
  position: sticky;
  z-index: 2;
  top: 0;
  color: #506579;
  background: #f3f6f9;
  font-size: 9px;
}
th:nth-child(1),
td:nth-child(1) {
  width: 58px;
}
th:nth-child(2),
td:nth-child(2) {
  width: 44px;
}
th:nth-child(3),
td:nth-child(3) {
  width: 48px;
}
th:nth-child(4),
td:nth-child(4) {
  width: 88px;
}
th:nth-child(5),
td:nth-child(5) {
  width: 60px;
}
th:nth-child(6),
td:nth-child(6) {
  width: 54px;
}
th:nth-child(n + 7):nth-child(-n + 19),
td:nth-child(n + 7):nth-child(-n + 19) {
  width: 38px;
}
th:nth-child(n + 20),
td:nth-child(n + 20) {
  width: 50px;
}
tbody tr {
  cursor: pointer;
  transition: background 0.15s;
}
tbody tr:hover {
  background: #f5f8fc;
}
tbody tr.selected {
  background: #eee8ff;
  box-shadow: inset 4px 0 #7c3aed;
}
.cool {
  color: #075ce2;
  background: #eef5ff;
}
.warm {
  color: #dd2736;
  background: #fff1f2;
}
.spec-out {
  color: #d1434c !important;
  background: #fff1f2 !important;
  font-weight: 800;
}
</style>
