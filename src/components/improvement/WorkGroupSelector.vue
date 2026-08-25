<script setup>
import { computed } from 'vue'
import { useNpwStore } from '@/stores/npw'

const props = defineProps({ rows: { type: Array, default: () => [] } })
const store = useNpwStore()
const groups = computed(() => {
  const map = new Map()
  props.rows.forEach((row) => {
    if (!map.has(row.group)) map.set(row.group, [])
    map.get(row.group).push(row)
  })
  return [...map.entries()].map(([group, rows]) => ({
    group,
    row: rows[0],
    count: new Set(rows.map((item) => item.group_order)).size,
  }))
})
const active = computed(() => store.activeGroupRows[0]?.group)
function select(item) {
  store.selectTuneStage(item.row)
}
</script>

<template>
  <section class="panel group-browser">
    <header>
      <div>
        <span>WORK GROUPS</span>
        <h2>조회 설비 작업 그룹</h2>
      </div>
      <small>{{ groups.length }}개 Group · 그룹을 선택하면 회차별 분석이 갱신됩니다.</small>
    </header>
    <div v-if="groups.length" class="group-list">
      <button
        v-for="item in groups"
        :key="item.group"
        :class="{ active: item.group === active }"
        @click="select(item)"
      >
        <i></i
        ><span
          ><b>{{ item.row.eqpid }} · {{ item.row.title }}</b
          ><small>{{ item.row.workOrder || item.group }} · {{ item.count }}단계</small></span
        >
      </button>
    </div>
    <p v-else class="empty">조회 조건에 해당하는 작업 그룹이 없습니다.</p>
  </section>
</template>

<style scoped>
.group-browser {
  padding: 18px 20px;
  overflow: hidden;
}
.group-browser header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.group-browser header span {
  color: #7357c8;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
}
.group-browser h2 {
  margin: 4px 0 0;
  color: #1d3347;
  font-size: 18px;
}
.group-browser header > small {
  color: #718497;
  font-size: 10px;
}
.group-list {
  display: flex;
  gap: 8px;
  margin-top: 13px;
  padding-bottom: 4px;
  overflow-x: auto;
}
.group-list button {
  display: flex;
  flex: 0 0 205px;
  align-items: center;
  gap: 9px;
  padding: 10px;
  color: #607487;
  background: #f8fafc;
  border: 1px solid #dce4eb;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
}
.group-list button > i {
  width: 9px;
  height: 9px;
  background: #a9b6c2;
  border-radius: 50%;
}
.group-list button span,
.group-list button b,
.group-list button small {
  display: block;
  min-width: 0;
}
.group-list button b {
  overflow: hidden;
  color: #324a5f;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.group-list button small {
  margin-top: 2px;
  color: #8191a0;
  font-size: 8px;
}
.group-list button.active {
  background: #f1edfc;
  border-color: #a993e8;
  box-shadow: 0 3px 10px rgba(90, 64, 160, 0.12);
}
.group-list button.active > i {
  background: #7c3aed;
}
.group-list button.active b {
  color: #5b34aa;
}
.empty {
  margin: 14px 0 0;
  color: #718497;
  font-size: 10px;
}
@media (max-width: 700px) {
  .group-browser header {
    align-items: flex-start;
    gap: 10px;
    flex-direction: column;
  }
}
</style>
