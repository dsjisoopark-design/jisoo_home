<script setup>
import { storeToRefs } from 'pinia'
import NpwFilter from '@/components/NpwFilter.vue'
import BeforeAfterAnalysis from '@/components/improvement/BeforeAfterAnalysis.vue'
import WorkGroupSelector from '@/components/improvement/WorkGroupSelector.vue'
import { useNpwStore } from '@/stores/npw'

const store = useNpwStore()
const { filterVersion, tuneHistoryRows, activeGroupRows } = storeToRefs(store)
</script>

<template>
  <div class="content">
    <section class="page-heading">
      <div>
        <span>AUTO TUNE ANALYSIS</span>
        <h1>Before / After 개선 효과</h1>
        <p>Auto Tune 예측/추천값 vs 실제값 비교</p>
      </div>
      <small>Expected/Recommended 샘플 데이터</small>
    </section>
    <NpwFilter />
    <WorkGroupSelector :key="filterVersion" :rows="tuneHistoryRows" />
    <BeforeAfterAnalysis :group-rows="activeGroupRows" />
  </div>
</template>

<style scoped>
.content {
  display: grid;
  gap: 18px;
  max-width: 1500px;
  margin: 0 auto;
  padding: 28px 30px 44px;
}
.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.page-heading span {
  color: #1673bf;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
}
.page-heading h1 {
  margin: 5px 0 0;
  color: #182b3d;
  font-size: 31px;
  letter-spacing: -0.03em;
}
.page-heading p {
  margin: 4px 0 0;
  color: #65798b;
  font-size: 13px;
}
.page-heading small {
  color: #718497;
  font-size: 10px;
}
@media (max-width: 700px) {
  .content {
    padding: 20px 13px 30px;
  }
  .page-heading h1 {
    font-size: 25px;
  }
  .page-heading small {
    display: none;
  }
}
</style>
