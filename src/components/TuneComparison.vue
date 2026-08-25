<script setup>
defineProps({ comparison: Object })
const format = (value) => Number(value || 0).toLocaleString('ko-KR', { maximumFractionDigits: 1 })
const signed = (value) => `${value > 0 ? '+' : ''}${format(value)}`
const tunes = (comparison) => comparison?.stages?.filter((stage) => /^\d+$/.test(stage.order)) || []
const deltaClass = (value) => value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'
const factors = (comparison) => comparison?.factors?.filter((item) => item.name !== 'Pressure') || []
</script>

<template>
  <section class="panel comparison">
    <header class="comparison-head">
      <div><span>TUNE EFFECTIVENESS</span><h2>Before / After 개선효과</h2><p v-if="comparison">{{ comparison.workOrder }} · {{ comparison.title }}</p></div>
      <div v-if="comparison" class="improvement"><small>AVG IMPROVEMENT</small><strong :class="deltaClass(comparison.delta)">{{ signed(comparison.delta) }}</strong></div>
    </header>

    <template v-if="comparison">
      <div class="flow-viewport">
        <div class="flow">
          <article class="endpoint before"><small>BEFORE · START</small><div class="side-grid"><div><span>SIDE 1</span><strong>{{ format(comparison.beforeSide1) }}</strong></div><div><span>SIDE 2</span><strong>{{ format(comparison.beforeSide2) }}</strong></div></div><b>SH DIST</b></article>
          <div class="arrow" aria-hidden="true"><span></span><i></i></div>
          <template v-for="stage in tunes(comparison)" :key="stage.order">
            <article class="tune-card"><span class="order">{{ stage.order }}</span><b>Tune {{ stage.order }}</b><strong>{{ format(stage.avg) }}</strong><small>AVG</small><em :class="deltaClass(stage.avg-comparison.before)">{{ signed(stage.avg-comparison.before) }}</em></article>
            <div class="arrow" aria-hidden="true"><span></span><i></i></div>
          </template>
          <article class="endpoint after"><small>AFTER · END</small><div class="side-grid"><div><span>SIDE 1</span><strong>{{ format(comparison.afterSide1) }}</strong></div><div><span>SIDE 2</span><strong>{{ format(comparison.afterSide2) }}</strong></div></div><b>SH DIST</b></article>
        </div>
      </div>

      <div class="flow-summary"><span><b>{{ comparison.tuneCount }}</b>회 Tune · START 대비 최종 변화</span><div><p v-for="metric in comparison.metrics" :key="metric.name"><b>{{ metric.name }}</b><strong :class="deltaClass(metric.after-metric.before)">({{ signed(metric.after-metric.before) }})</strong></p></div></div>

      <div class="cards">
        <article v-for="metric in comparison.metrics" :key="metric.name"><header><strong>{{ metric.name }}</strong><b :class="deltaClass(metric.after-metric.before)">{{ signed(metric.after-metric.before) }}</b></header><div class="values"><span>{{ format(metric.before) }}</span><i></i><span>{{ format(metric.after) }}</span></div><footer><small>BEFORE</small><small>AFTER</small></footer></article>
        <article v-for="factor in factors(comparison)" :key="factor.name"><header><strong>{{ factor.name }}</strong><b :class="deltaClass(factor.delta)">{{ signed(factor.delta) }}</b></header><div class="values"><span>{{ format(factor.before) }}</span><i></i><span>{{ format(factor.after) }}</span></div><footer><small>BEFORE</small><small>AFTER</small></footer></article>
      </div>
    </template>
    <div v-else class="empty">선택 조건에 해당하는 Tune 비교 데이터가 없습니다.</div>
  </section>
</template>

<style scoped>
.comparison{padding:22px 24px;overflow:hidden}.comparison-head{display:flex;justify-content:space-between;gap:20px}.comparison-head>div:first-child>span{color:#7357c8;font-size:9px;font-weight:800;letter-spacing:.14em}.comparison-head h2{margin:4px 0 0;color:#1d3347;font-size:19px}.comparison-head p{margin:4px 0 0;color:#697d90;font-size:11px}.improvement{text-align:right}.improvement small{display:block;color:#718497;font-size:8px;font-weight:800}.improvement strong{font-size:28px}.flow-viewport{width:100%;margin-top:22px;padding:4px 2px 10px;overflow-x:auto}.flow{display:flex;width:max-content;min-width:100%;align-items:center;justify-content:center}.endpoint{display:flex;flex:0 0 190px;min-height:145px;padding:16px 13px;flex-direction:column;text-align:center;background:#fff;border:2px solid #d9e1e8;border-radius:14px;box-shadow:0 6px 16px rgba(39,57,77,.08)}.before{background:#fff8f8;border-color:#efb9bd}.after{background:#f5fcf8;border-color:#9bd5bd}.endpoint>small{color:#718497;font-size:9px;font-weight:900}.endpoint>b{align-self:center;margin-top:auto;padding:4px 10px;color:#52677a;background:#edf2f6;border-radius:10px;font-size:8px}.side-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}.side-grid>div{padding:8px 5px;background:rgba(255,255,255,.86);border:1px solid #e1e7ed;border-radius:8px}.side-grid span{display:block;color:#718497;font-size:8px;font-weight:800}.side-grid strong{display:block;color:#20374b;font-size:21px}.arrow{display:flex;flex:0 0 48px;align-items:center}.arrow span{flex:1;height:4px;background:#9a86f5;border-radius:4px}.arrow i{width:0;height:0;border-top:8px solid transparent;border-bottom:8px solid transparent;border-left:12px solid #7c3aed}.tune-card{display:grid;flex:0 0 112px;min-height:132px;padding:12px 10px;justify-items:center;align-content:start;background:#f6f2ff;border:1px solid #d9cdf3;border-radius:12px;box-shadow:0 4px 12px rgba(85,62,145,.08)}.order{display:grid;width:34px;height:34px;place-items:center;color:#fff;background:#7c3aed;border-radius:50%;font-size:11px;font-weight:900}.tune-card>b{margin-top:5px;color:#573b9c;font-size:10px}.tune-card>strong{margin-top:4px;color:#243a4e;font-size:15px}.tune-card>small{color:#8292a1;font-size:8px}.tune-card>em{margin-top:4px;font-size:8px;font-style:normal;font-weight:900}.flow-summary{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;color:#65798b;background:#f7f9fb;border:1px solid #e0e7ed;border-radius:8px;font-size:10px}.flow-summary>span>b{color:#6d3fc0;font-size:14px}.flow-summary>div{display:flex;gap:17px}.flow-summary p{display:flex;gap:4px;margin:0}.flow-summary p>b{color:#344b60;font-size:11px}.flow-summary p>strong{font-size:14px}.positive{color:#d1434c!important}.negative{color:#2468b4!important}.neutral{color:#6f8192!important}.cards{display:grid;grid-template-columns:repeat(5,minmax(180px,1fr));gap:14px;margin-top:16px;padding-top:16px;overflow-x:auto;border-top:1px solid #e2e8ed}.cards article{min-height:116px;padding:15px 17px;background:#f8fafc;border:1px solid #d7e0e8;border-radius:9px}.cards header{display:flex;justify-content:space-between}.cards header>strong{color:#263d52;font-size:12px;font-weight:900}.cards header>b{font-size:13px}.values{display:grid;grid-template-columns:1fr 28px 1fr;align-items:center;margin-top:13px}.values span{color:#20374b;font-size:20px;font-weight:800}.values span:last-child{text-align:right}.values i{position:relative;height:2px;background:#a99ad5}.values i::after{content:"";position:absolute;right:-1px;top:-4px;width:0;height:0;border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:7px solid #7c3aed}.cards footer{display:flex;justify-content:space-between;margin-top:4px}.cards footer small{color:#718497;font-size:8px;font-weight:800}.empty{padding:45px;color:#718497;text-align:center}@media(max-width:850px){.flow{justify-content:flex-start}.flow-summary{align-items:flex-start;gap:8px;flex-direction:column}.flow-summary>div{flex-wrap:wrap;gap:8px 14px}}@media(max-width:560px){.arrow{flex-basis:36px}}
</style>
<style scoped>
.arrow{display:flex;flex:0 0 54px;align-items:center}.arrow span{flex:1;height:5px;background:linear-gradient(90deg,#cbbbea,#8d72d7);border-radius:5px;box-shadow:0 2px 5px rgba(91,66,151,.18)}.arrow i{position:relative;display:block;width:27px;height:27px;margin-left:-2px;background:linear-gradient(145deg,#9a86f5,#6d3fc0);border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(83,57,145,.28)}.arrow i::after{content:"";position:absolute;top:6px;left:6px;width:7px;height:7px;border-top:3px solid #fff;border-right:3px solid #fff;transform:rotate(45deg)}
</style>
