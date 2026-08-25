<script setup>
defineProps({ label: String, value: [String, Number], unit: String, helper: String, tone: { type: String, default: 'blue' }, progress: Number })
</script>

<template>
  <article class="kpi-card" :class="`tone-${tone}`">
    <div class="kpi-top"><span>{{ label }}</span><i aria-hidden="true"></i></div>
    <div class="kpi-value">{{ value }}<small>{{ unit }}</small></div>
    <div v-if="progress !== undefined" class="progress"><span :style="{ width: `${Math.min(progress, 100)}%` }"></span></div>
    <p>{{ helper }}</p>
  </article>
</template>

<style scoped>
.kpi-card { min-width: 0; padding: 19px 20px 17px; background: linear-gradient(145deg, rgba(27,41,59,.96), rgba(19,30,45,.96)); border: 1px solid var(--border); border-radius: 13px; box-shadow: 0 10px 30px rgba(2,8,17,.2); }
.kpi-top { display: flex; align-items: center; justify-content: space-between; color: var(--muted); font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.kpi-top i { width: 8px; height: 8px; background: var(--tone); border-radius: 50%; box-shadow: 0 0 12px var(--tone); }
.kpi-value { margin-top: 12px; color: #f5f9ff; font-size: clamp(26px, 3vw, 34px); font-weight: 700; line-height: 1.05; letter-spacing: -.04em; }
.kpi-value small { margin-left: 5px; color: var(--muted); font-size: 12px; font-weight: 600; letter-spacing: 0; }
p { margin-top: 9px; color: #7f91a8; font-size: 11px; }
.progress { height: 4px; margin-top: 12px; overflow: hidden; background: #0d1724; border-radius: 8px; }
.progress span { display: block; height: 100%; background: var(--tone); border-radius: inherit; }
.tone-blue { --tone: #55a9f2; } .tone-violet { --tone: #9a86f5; } .tone-orange { --tone: #f0a654; } .tone-green { --tone: #49d19a; }
</style>
