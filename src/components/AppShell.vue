<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import SpecSettings from '@/components/SpecSettings.vue'
import { useNpwStore } from '@/stores/npw'

const store = useNpwStore()
const { specs } = storeToRefs(store)
const specOpen = ref(false)
const route = useRoute()
function saveSpecs(next) {
  store.updateSpecs(next)
  specOpen.value = false
}
</script>

<template>
  <RouterView v-if="route.meta.fullPage" />
  <div v-else class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="mark"><span></span><span></span><span></span></div>
        <div><strong>NPW Tracker</strong><small>CVD NPW Dashboard</small></div>
      </div>
      <nav>
        <span class="nav-title">분석</span>
        <RouterLink to="/wafer-map" active-class="active"><b>◎</b><em>Wafer Map</em></RouterLink>
        <RouterLink to="/improvement-analysis" active-class="active"
          ><b>↔</b><em>Before / After 개선효과</em></RouterLink
        >
        <a><b>○</b><em>설비 현황</em></a>
        <a><b>△</b><em>상관 분석</em></a>
        <span class="nav-title section">시스템</span>
        <a @click="specOpen = true"><b>⚙</b><em>Spec 설정</em></a>
      </nav>
      <div class="online">
        <i></i>
        <div><b>시스템 정상</b><small>모든 서비스가 정상 운영 중</small></div>
      </div>
    </aside>
    <main>
      <header class="topbar">
        <div class="breadcrumb">제조 분석 <span>/</span> NPW 분석</div>
        <button class="spec-button" @click="specOpen = true">Spec 설정</button>
        <div class="avatar">PJ</div>
        <div class="user"><b>박지수</b><small>공정 데이터 엔지니어</small></div>
      </header>
      <RouterView v-slot="{ Component }">
        <Transition name="page-shift" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <SpecSettings :open="specOpen" :specs="specs" @close="specOpen = false" @save="saveSpecs" />
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  background: var(--bg);
}
.sidebar {
  position: fixed;
  z-index: 10;
  inset: 0 auto 0 0;
  display: flex;
  flex-direction: column;
  width: 220px;
  padding: 22px 15px 16px;
  background: #fff;
  border-right: 1px solid var(--border);
  box-shadow: 2px 0 12px rgba(39, 57, 77, 0.04);
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 28px;
}
.mark {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  width: 28px;
  height: 28px;
  padding: 5px;
  background: linear-gradient(145deg, #49a7ef, #5368d9);
  border-radius: 7px;
}
.mark span {
  flex: 1;
  background: #def2ff;
  border-radius: 1px;
}
.mark span:nth-child(1) {
  height: 45%;
}
.mark span:nth-child(2) {
  height: 100%;
}
.mark span:nth-child(3) {
  height: 70%;
}
.brand strong {
  display: block;
  color: #172a3d;
  font-size: 14px;
  letter-spacing: 0.14em;
}
.brand small {
  display: block;
  color: #748698;
  font-size: 9px;
}
nav {
  display: grid;
  gap: 5px;
}
.nav-title {
  padding: 0 11px 6px;
  color: #8696a5;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
}
.nav-title.section {
  margin-top: 20px;
}
nav a {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  color: #526679;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 12px;
  text-decoration: none;
  cursor: pointer;
}
nav a b {
  width: 17px;
  color: #8ca0b2;
  text-align: center;
}
nav a em {
  font-style: normal;
}
nav a.active {
  color: #1269b3;
  background: #eaf4fc;
  border-color: #cfe4f4;
}
nav a.active b {
  color: #1877c9;
}
.online {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: auto;
  padding: 11px;
  background: #f2faf6;
  border: 1px solid #d4ebdf;
  border-radius: 8px;
}
.online i {
  width: 7px;
  height: 7px;
  background: #49d19a;
  border-radius: 50%;
}
.online b,
.online small {
  display: block;
}
.online b {
  color: #277052;
  font-size: 10px;
}
.online small {
  color: #6f8d7e;
  font-size: 9px;
}
main {
  min-width: 0;
  margin-left: 220px;
}
.topbar {
  display: flex;
  align-items: center;
  height: 58px;
  padding: 0 28px;
  color: #657789;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid #dce4eb;
  box-shadow: 0 2px 8px rgba(39, 57, 77, 0.04);
  font-size: 11px;
}
.breadcrumb span {
  padding: 0 7px;
  color: #a1afbb;
}
.spec-button {
  margin-left: auto;
  padding: 7px 11px;
  color: #3d607f;
  background: #fff;
  border: 1px solid #cbd7e2;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
}
.avatar {
  display: grid;
  width: 31px;
  height: 31px;
  margin-left: 14px;
  place-items: center;
  color: #fff;
  background: #2d7fbe;
  border-radius: 50%;
  font-size: 9px;
}
.user {
  margin-left: 8px;
}
.user b,
.user small {
  display: block;
}
.user b {
  color: #263c50;
  font-size: 11px;
}
.user small {
  color: #718395;
  font-size: 9px;
}
@media (max-width: 900px) {
  .sidebar {
    width: 68px;
    padding-inline: 9px;
  }
  .brand > div:last-child,
  .nav-title,
  nav a em,
  .online div {
    display: none;
  }
  .brand {
    padding-inline: 10px;
  }
  nav a {
    justify-content: center;
  }
  .online {
    justify-content: center;
  }
  main {
    margin-left: 68px;
  }
}
@media (max-width: 620px) {
  .sidebar {
    display: none;
  }
  main {
    margin-left: 0;
  }
  .topbar {
    padding: 0 14px;
  }
  .user {
    display: none;
  }
}
.page-shift-enter-active,
.page-shift-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.page-shift-enter-from {
  opacity: 0;
  transform: translateY(7px);
}
.page-shift-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
