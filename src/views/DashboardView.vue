<script setup>
import { storeToRefs } from 'pinia'
import KpiCard from '@/components/KpiCard.vue'
import MetricCharts from '@/components/MetricCharts.vue'
import NpwFilter from '@/components/NpwFilter.vue'
import NpwTable from '@/components/NpwTable.vue'
import TrendChart from '@/components/TrendChart.vue'
import { useNpwStore } from '@/stores/npw'

const store = useNpwStore()
const { filteredRows, filteredMaintenance, filteredTunes, kpis, specs, lastUpdated, filterVersion } = storeToRefs(store)
const colorDimensions = ['eqpid', 'chid', 'ppid']
const updated = () => new Intl.DateTimeFormat('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(lastUpdated.value)
</script>

<template>
  <div class="content">
    <section class="page-heading"><div><span>공정 제어</span><h1>NPW 데이터 모니터링</h1><p>설비 작업과 Tune 이후 NPW 변화를 한눈에 분석합니다.</p></div><div class="updated"><small>최종 갱신 {{ updated() }}</small><button @click="store.refresh">새로고침</button></div></section>
    <NpwFilter />
    <div :key="filterVersion" class="filter-results">
      <section class="kpis" aria-label="주요 지표"><KpiCard label="월 평균 작업 횟수" :value="kpis.monthlyWorks" unit="회" helper="선택 기간 월 환산" tone="blue"/><KpiCard label="MTTP" :value="kpis.mttp" unit="분" helper="평균 작업 완료 시간" tone="orange"/><KpiCard label="작업 후 평균 Tune 횟수" :value="kpis.avgTunes" unit="회" helper="선택 설비 작업 기준" tone="violet"/></section>
      <TrendChart :rows="filteredRows" :maintenance="filteredMaintenance" :tunes="filteredTunes" :specs="specs" />
      <MetricCharts :rows="filteredRows" :specs="specs" :color-dimensions="colorDimensions" />
      <NpwTable :rows="filteredRows" :work-title="store.workTitle" :in-spec="store.inSpec" />
    </div>
  </div>
</template>

<style scoped>
.content{display:grid;gap:16px;max-width:1500px;margin:0 auto;padding:28px 30px 44px}.page-heading{display:flex;justify-content:space-between;align-items:flex-end}.page-heading span{color:#1673bf;font-size:10px;font-weight:800;letter-spacing:.16em}.page-heading h1{margin:5px 0 0;color:#182b3d;font-size:31px;letter-spacing:-.03em}.page-heading p{margin:4px 0 0;color:#65798b;font-size:13px}.updated{display:flex;align-items:center;gap:9px}.updated small{color:#6b7f91;font-size:10px}.updated button{padding:7px 9px;color:#4f6578;background:#fff;border:1px solid #c7d3de;border-radius:6px;font-size:10px;cursor:pointer}.kpis{display:grid;grid-template-columns:repeat(3,minmax(210px,1fr));gap:16px}@media(max-width:620px){.content{padding:20px 13px 30px}.page-heading{align-items:flex-start}.updated small{display:none}.page-heading h1{font-size:25px}.kpis{grid-template-columns:repeat(3,minmax(210px,1fr));overflow-x:auto}}
.filter-results{display:grid;gap:16px;animation:filterApply .42s ease-out}@keyframes filterApply{from{opacity:.35;transform:translateY(8px)}to{opacity:1;transform:none}}
</style>
