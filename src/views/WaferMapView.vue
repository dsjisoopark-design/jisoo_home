<script setup>
import WaferMapTab from '@/components/wafer/WaferMapTab.vue'
</script>

<template>
  <div class="page">
    <section class="page-heading">
      <div>
        <span>WAFER ANALYSIS</span>
        <h1>Wafer Map</h1>
        <p>Side 1 / Side 2의 Wafer 두께 분포와 측정 포인트를 확인합니다.</p>
      </div>
    </section>
    <WaferMapTab />
  </div>
</template>

<style scoped>
.page {
  display: grid;
  width: 100%;
  max-width: 1500px;
  min-width: 1120px;
  min-height: calc(100vh - 58px);
  gap: 18px;
  margin: 0 auto;
  padding: 28px 30px 44px;
  color: #111827;
  font-family: Inter, Arial, sans-serif;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.page-heading span {
  color: #7357c8;
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

@media (max-width: 900px) {
  .page {
    min-width: 0;
    padding: 20px 13px 30px;
  }

  .page-heading h1 {
    font-size: 25px;
  }
}
</style>
