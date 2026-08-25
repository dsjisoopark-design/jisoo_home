<script setup>
import { storeToRefs } from 'pinia'
import NpwFilter from '@/components/NpwFilter.vue'
import TuneHistory from '@/components/TuneHistory.vue'
import { useNpwStore } from '@/stores/npw'

const store = useNpwStore()
const { tuneHistoryRows, tuneComparison, specs, filterVersion } = storeToRefs(store)
</script>

<template>
  <div class="content tune-page">
    <section class="page-heading"><div><span>TUNE ANALYSIS</span><h1>설비 Tune History</h1><p>작업 그룹별 Tune 진행 단계와 Before·After 개선효과를 확인합니다.</p></div><RouterLink to="/" class="back">NPW Trend로 돌아가기</RouterLink></section>
    <NpwFilter />
    <div :key="filterVersion" class="filter-results"><TuneHistory :rows="tuneHistoryRows" :comparison="tuneComparison" :specs="specs" /></div>
  </div>
</template>

<style scoped>
.content{display:grid;gap:18px;max-width:1500px;margin:0 auto;padding:28px 30px 44px}.page-heading{display:flex;justify-content:space-between;align-items:flex-end}.page-heading span{color:#7357c8;font-size:10px;font-weight:800;letter-spacing:.16em}.page-heading h1{margin:5px 0 0;color:#182b3d;font-size:31px;letter-spacing:-.03em}.page-heading p{margin:4px 0 0;color:#65798b;font-size:13px}.back{padding:8px 12px;color:#176fb8;background:#fff;border:1px solid #c9d8e5;border-radius:7px;font-size:11px;font-weight:700;text-decoration:none}@media(max-width:620px){.content{padding:20px 13px 30px}.page-heading{align-items:flex-start;gap:12px}.page-heading h1{font-size:25px}.back{white-space:nowrap}}
</style>
<style scoped>.filter-results{animation:filterApply .42s ease-out}@keyframes filterApply{from{opacity:.35;transform:translateY(8px)}to{opacity:1;transform:none}}</style>
