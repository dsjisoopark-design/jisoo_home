<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { useNpwStore } from '@/stores/npw'

const props = defineProps({ groupRows: { type: Array, default: () => [] } })
const store = useNpwStore()

const selected = ref(0)
const resultEls = ref([])
const tuneEls = ref([])
let charts = []
const sampleRounds = [
  {
    order: 1,
    time: '2026-07-02 08:00 ~ 10:00',
    eqp: 'E01',
    ppid: 'PPID_C',
    recipe: 'Recipe_A',
    wafers: 25,
    note: 'Auto Tune 시작 작업',
    expected: { avg: 7520, stress: -160, range: 210 },
    actual: { avg: 7542, stress: -154, range: 225 },
    recommended: { sh1: -5, sh2: -4, teos: 1.2 },
    adjusted: { sh1: -4, sh2: -3, teos: 1.0 },
    scores: { avg: 97.4, stress: 96.1, range: 93.3, tune: 91.7 },
  },
  {
    order: 2,
    time: '2026-07-02 10:30 ~ 12:30',
    eqp: 'E01',
    ppid: 'PPID_C',
    recipe: 'Recipe_A',
    wafers: 25,
    note: '1차 보정 결과 확인',
    expected: { avg: 7508, stress: -163, range: 190 },
    actual: { avg: 7522, stress: -159, range: 198 },
    recommended: { sh1: -8, sh2: -7, teos: 0.8 },
    adjusted: { sh1: -7, sh2: -6, teos: 0.7 },
    scores: { avg: 98.1, stress: 97.5, range: 96.0, tune: 94.8 },
  },
  {
    order: 3,
    time: '2026-07-02 13:00 ~ 15:00',
    eqp: 'E01',
    ppid: 'PPID_C',
    recipe: 'Recipe_A',
    wafers: 25,
    note: 'Target 근접 구간',
    expected: { avg: 7504, stress: -165, range: 175 },
    actual: { avg: 7512, stress: -163, range: 181 },
    recommended: { sh1: -10, sh2: -9, teos: 0.5 },
    adjusted: { sh1: -9, sh2: -9, teos: 0.4 },
    scores: { avg: 98.9, stress: 98.8, range: 96.7, tune: 96.2 },
  },
  {
    order: 4,
    time: '2026-07-02 15:30 ~ 17:30',
    eqp: 'E01',
    ppid: 'PPID_C',
    recipe: 'Recipe_A',
    wafers: 25,
    note: '최종 Tune 완료',
    expected: { avg: 7501, stress: -166, range: 168 },
    actual: { avg: 7504, stress: -165, range: 171 },
    recommended: { sh1: -11, sh2: -10, teos: 0.3 },
    adjusted: { sh1: -11, sh2: -10, teos: 0.3 },
    scores: { avg: 99.6, stress: 99.4, range: 98.2, tune: 100 },
  },
]
const rank = (value) => (value === 'start' ? -1 : value === 'end' ? 999 : Number(value))
const mean = (rows, key) =>
  rows.reduce((sum, row) => sum + Number(row[key] || 0), 0) / Math.max(rows.length, 1)
const score = (expected, actual) =>
  Math.max(
    0,
    Math.min(100, 100 - (Math.abs(expected - actual) / Math.max(Math.abs(actual), 1)) * 100),
  ).toFixed(1)
const formatValue = (value) => {
  const number = Number(value)
  return Number.isInteger(number) ? number.toLocaleString() : number.toFixed(1)
}
const rounds = computed(() => {
  if (!props.groupRows.length) return sampleRounds
  const stages = [...new Set(props.groupRows.map((row) => row.group_order))].sort(
    (a, b) => rank(a) - rank(b),
  )
  return stages.map((stage, index) => {
    const rows = props.groupRows.filter((row) => row.group_order === stage)
    const first = rows[0]
    const actual = {
      avg: mean(rows, 'avg'),
      stress: mean(rows, 'stress'),
      range: mean(rows, 'range'),
    }
    const taper = Math.max(1, stages.length - index)
    const expected = {
      avg: actual.avg - taper * 1.8,
      stress: actual.stress + taper * 0.7,
      range: actual.range - taper * 1.2,
    }
    const adjusted = {
      sh1: mean(
        rows.filter((row) => row.side === '1'),
        'shDistDelta',
      ),
      sh2: mean(
        rows.filter((row) => row.side === '2'),
        'shDistDelta',
      ),
      teos: mean(rows, 'teosFactorDelta'),
    }
    const recommended = {
      sh1: adjusted.sh1 - taper * 0.25,
      sh2: adjusted.sh2 - taper * 0.2,
      teos: adjusted.teos - taper * 0.03,
    }
    const tuneScore =
      [
        score(recommended.sh1, adjusted.sh1),
        score(recommended.sh2, adjusted.sh2),
        score(recommended.teos, adjusted.teos),
      ].reduce((sum, value) => sum + Number(value), 0) / 3
    return {
      order: index + 1,
      stage,
      time: first.time.replace('T', ' '),
      eqp: first.eqpid,
      ppid: first.ppid,
      recipe: first.ppid,
      wafers: rows.length,
      note:
        stage === 'start'
          ? 'Auto Tune 시작 작업'
          : stage === 'end'
            ? '최종 Tune 완료'
            : `Group Order ${stage} Tune`,
      expected,
      actual,
      recommended,
      adjusted,
      scores: {
        avg: score(expected.avg, actual.avg),
        stress: score(expected.stress, actual.stress),
        range: score(expected.range, actual.range),
        tune: tuneScore.toFixed(1),
      },
    }
  })
})
const current = computed(() => rounds.value[Math.min(selected.value, rounds.value.length - 1)])
const kpis = computed(() => [
  {
    label: 'TUNE 수행 회차',
    value: `${rounds.value.length}회`,
    help: 'Auto Tune 수행',
    tone: 'blue',
  },
  {
    label: 'AVG 정합성',
    value: `${current.value.scores.avg}%`,
    help: '높을수록 좋음',
    tone: 'green',
  },
  {
    label: 'STRESS 정합성',
    value: `${current.value.scores.stress}%`,
    help: '높을수록 좋음',
    tone: 'green',
  },
  {
    label: 'RANGE 정합성',
    value: `${current.value.scores.range}%`,
    help: '높을수록 좋음',
    tone: 'green',
  },
  {
    label: '추천값 정합성',
    value: `${current.value.scores.tune}%`,
    help: '높을수록 좋음',
    tone: 'orange',
  },
  { label: 'SPEC 만족률', value: '100%', help: '4 / 4회 · Spec 만족', tone: 'purple' },
])
const metrics = [
  { key: 'avg', name: 'AVG', color: '#2878d0', target: 7500 },
  { key: 'stress', name: 'STRESS', color: '#15966b', target: -165 },
  { key: 'range', name: 'RANGE', color: '#7c3aed', target: 170 },
]
const tunes = [
  { key: 'sh1', name: 'SH_DIST_SIDE1', color: '#e58a24' },
  { key: 'sh2', name: 'SH_DIST_SIDE2', color: '#d56d23' },
  { key: 'teos', name: 'TEOS_FACTOR', color: '#b85f25' },
]
const labels = computed(() => rounds.value.map((r) => `${r.order}회차`))
const selectedData = (values, color) =>
  values.map((value, index) => ({
    value,
    symbolSize: index === selected.value ? 8 : 4,
    itemStyle: {
      color,
      borderColor: index === selected.value ? '#fff' : color,
      borderWidth: index === selected.value ? 2 : 0,
      shadowBlur: index === selected.value ? 5 : 0,
      shadowColor: color,
    },
  }))
function base(title) {
  return {
    animation: false,
    title: { text: title, left: 8, top: 5, textStyle: { fontSize: 10, color: '#273c50' } },
    legend: { top: 23, itemWidth: 13, itemHeight: 6, textStyle: { fontSize: 8 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 42, right: 12, top: 52, bottom: 25 },
    xAxis: {
      type: 'category',
      data: labels.value,
      axisLabel: { fontSize: 8, color: '#718497' },
      axisLine: { lineStyle: { color: '#d9e1e8' } },
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: { fontSize: 8, color: '#718497' },
      splitLine: { lineStyle: { color: '#edf1f5' } },
    },
  }
}
function draw() {
  charts.forEach((c) => c.dispose())
  charts = []
  metrics.forEach((metric, i) => {
    const chart = echarts.init(resultEls.value[i])
    const option = base(metric.name)
    const spec = store.specs[metric.key]
    const specMin = Number(spec.min)
    const specMax = Number(spec.max)
    const axisValues = [
      ...rounds.value.map((r) => Number(r.expected[metric.key])),
      ...rounds.value.map((r) => Number(r.actual[metric.key])),
      specMin,
      specMax,
    ].filter(Number.isFinite)
    const axisMin = Math.min(...axisValues)
    const axisMax = Math.max(...axisValues)
    const padding = Math.max((axisMax - axisMin) * 0.08, 1)
    option.yAxis.min = axisMin - padding
    option.yAxis.max = axisMax + padding
    option.series = [
      {
        name: 'Expected',
        type: 'line',
        data: selectedData(
          rounds.value.map((r) => r.expected[metric.key]),
          metric.color,
        ),
        lineStyle: { color: metric.color, type: 'dashed', width: 1.4 },
      },
      {
        name: 'Actual',
        type: 'line',
        data: selectedData(
          rounds.value.map((r) => r.actual[metric.key]),
          metric.color,
        ),
        lineStyle: { color: metric.color, width: 2 },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#e05252', type: 'dashed', width: 1 },
          label: {
            show: true,
            position: 'insideEndTop',
            color: '#d1434c',
            fontSize: 8,
          },
          data: [
            { name: `LSL ${specMin.toLocaleString()}`, yAxis: specMin },
            { name: `USL ${specMax.toLocaleString()}`, yAxis: specMax },
          ],
        },
      },
    ]
    chart.setOption(option)
    charts.push(chart)
  })
  tunes.forEach((item, i) => {
    const chart = echarts.init(tuneEls.value[i])
    const option = base(item.name)
    option.yAxis.axisLine = { show: true, onZero: true }
    option.series = [
      {
        name: 'Recommended',
        type: 'bar',
        barMaxWidth: 13,
        data: rounds.value.map((r) => r.recommended[item.key]),
        itemStyle: { color: '#f7bd75' },
      },
      {
        name: 'Actual',
        type: 'bar',
        barMaxWidth: 13,
        data: rounds.value.map((r) => r.adjusted[item.key]),
        itemStyle: { color: item.color },
      },
    ]
    chart.setOption(option)
    charts.push(chart)
  })
}
watch(selected, () => nextTick(draw))
watch(
  () => props.groupRows,
  () => {
    selected.value = 0
    nextTick(draw)
  },
  { deep: true },
)
onMounted(() => {
  draw()
  addEventListener('resize', draw)
})
onBeforeUnmount(() => {
  removeEventListener('resize', draw)
  charts.forEach((c) => c.dispose())
})
</script>

<template>
  <div class="analysis-grid">
    <aside class="jobs panel">
      <header>
        <span>작업 리스트</span><b>{{ rounds.length }}</b>
      </header>
      <div class="job-list">
        <button
          v-for="(job, index) in rounds"
          :key="job.order"
          :class="{ active: selected === index }"
          @click="selected = index"
        >
          <i></i
          ><span
            ><strong>{{ job.order }}회차 <em v-if="index === 0">(기준)</em></strong
            ><small>{{ job.time }}</small></span
          ><b v-if="selected === index">선택됨</b>
        </button>
      </div>
      <section class="detail">
        <h3>선택 작업 상세 정보</h3>
        <dl>
          <template
            v-for="item in [
              ['작업 회차', `${current.order}회차${current.order === 1 ? ' (기준)' : ''}`],
              ['작업 시간', current.time],
              ['EQP', current.eqp],
              ['PPID', current.ppid],
              ['Recipe', current.recipe],
              ['Wafer Count', `${current.wafers}매`],
              ['비고', current.note],
            ]"
            :key="item[0]"
            ><dt>{{ item[0] }}</dt>
            <dd>{{ item[1] }}</dd></template
          >
        </dl>
      </section>
    </aside>
    <main>
      <section class="kpis">
        <article v-for="kpi in kpis" :key="kpi.label" :class="kpi.tone">
          <small>{{ kpi.label }}</small
          ><strong>{{ kpi.value }}</strong
          ><span>{{ kpi.help }}</span>
        </article>
      </section>
      <section class="comparison-table panel">
        <header>
          <div>
            <span>ROUND COMPARISON</span>
            <h2>회차별 예측/추천값 vs 실제값</h2>
          </div>
          <small>선택 회차 · {{ current.order }}회차</small>
        </header>
        <div>
          <table>
            <thead>
              <tr>
                <th colspan="2">기본 정보</th>
                <th colspan="6" class="result">결과값</th>
                <th colspan="3" class="recommend">추천 TUNE 값</th>
                <th colspan="3" class="actual">실제 조정값</th>
              </tr>
              <tr>
                <th>회차</th>
                <th>작업 시간</th>
                <th>예측 AVG</th>
                <th>실제 AVG</th>
                <th>예측 STRESS</th>
                <th>실제 STRESS</th>
                <th>예측 RANGE</th>
                <th>실제 RANGE</th>
                <th>SH1</th>
                <th>SH2</th>
                <th>TEOS</th>
                <th>SH1</th>
                <th>SH2</th>
                <th>TEOS</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in rounds"
                :key="row.order"
                :class="{ selected: selected === index }"
                @click="selected = index"
              >
                <td>{{ row.order }}회차</td>
                <td>{{ row.time }}</td>
                <td>{{ formatValue(row.expected.avg) }}</td>
                <td>{{ formatValue(row.actual.avg) }}</td>
                <td>{{ formatValue(row.expected.stress) }}</td>
                <td>{{ formatValue(row.actual.stress) }}</td>
                <td>{{ formatValue(row.expected.range) }}</td>
                <td>{{ formatValue(row.actual.range) }}</td>
                <td>{{ formatValue(row.recommended.sh1) }}</td>
                <td>{{ formatValue(row.recommended.sh2) }}</td>
                <td>{{ formatValue(row.recommended.teos) }}</td>
                <td>{{ formatValue(row.adjusted.sh1) }}</td>
                <td>{{ formatValue(row.adjusted.sh2) }}</td>
                <td>{{ formatValue(row.adjusted.teos) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="chart-row">
        <article class="panel chart-panel">
          <h2>① 결과값 비교 <small>예측 vs 실제</small></h2>
          <div class="triples">
            <div
              v-for="(_, i) in metrics"
              :key="i"
              :ref="
                (el) => {
                  if (el) resultEls[i] = el
                }
              "
            ></div>
          </div>
        </article>
        <article class="panel chart-panel">
          <h2>② 추천 TUNE 값 비교 <small>추천 vs 실제</small></h2>
          <div class="triples">
            <div
              v-for="(_, i) in tunes"
              :key="i"
              :ref="
                (el) => {
                  if (el) tuneEls[i] = el
                }
              "
            ></div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.analysis-grid {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 16px;
  animation: enter 0.4s ease;
}
.analysis-grid > main {
  display: grid;
  min-width: 0;
  gap: 16px;
}
.jobs {
  align-self: start;
  overflow: hidden;
}
.jobs > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 17px;
  border-bottom: 1px solid #e1e7ed;
}
.jobs > header span {
  color: #263d52;
  font-size: 13px;
  font-weight: 900;
}
.jobs > header b {
  display: grid;
  width: 23px;
  height: 23px;
  place-items: center;
  color: #1877c9;
  background: #eaf4fc;
  border-radius: 50%;
  font-size: 9px;
}
.job-list {
  display: grid;
  gap: 7px;
  padding: 12px;
}
.job-list button {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 10px;
  color: #52677a;
  background: #fff;
  border: 1px solid #dce4eb;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
}
.job-list button > i {
  width: 8px;
  height: 8px;
  background: #a9b7c3;
  border-radius: 50%;
}
.job-list strong,
.job-list small {
  display: block;
}
.job-list strong {
  color: #324a5f;
  font-size: 10px;
}
.job-list em {
  font-size: 8px;
  font-style: normal;
}
.job-list small {
  margin-top: 2px;
  color: #8191a0;
  font-size: 7px;
}
.job-list button > b {
  padding: 3px 6px;
  color: #1877c9;
  background: #eaf4fc;
  border-radius: 8px;
  font-size: 7px;
}
.job-list button.active {
  background: #f1f8fe;
  border-color: #70ace0;
  box-shadow: 0 3px 10px rgba(30, 112, 180, 0.12);
}
.job-list button.active > i {
  background: #1877c9;
}
.detail {
  padding: 15px 17px;
  border-top: 1px solid #e1e7ed;
}
.detail h3 {
  margin: 0 0 12px;
  color: #263d52;
  font-size: 11px;
}
.detail dl {
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 7px;
  margin: 0;
}
.detail dt {
  color: #8191a0;
  font-size: 8px;
}
.detail dd {
  margin: 0;
  overflow: hidden;
  color: #41576b;
  font-size: 8px;
  font-weight: 700;
  text-overflow: ellipsis;
}
.kpis {
  display: grid;
  grid-template-columns: repeat(6, minmax(105px, 1fr));
  gap: 10px;
}
.kpis article {
  display: grid;
  min-height: 92px;
  padding: 13px 14px;
  background: #fff;
  border: 1px solid #dce4eb;
  border-radius: 10px;
  box-shadow: 0 4px 13px rgba(35, 55, 75, 0.06);
}
.kpis small {
  color: #64798c;
  font-size: 8px;
  font-weight: 800;
}
.kpis strong {
  margin-top: 5px;
  color: #20374b;
  font-size: 21px;
}
.kpis span {
  color: #8191a0;
  font-size: 8px;
}
.kpis .green strong {
  color: #16815d;
}
.kpis .orange strong {
  color: #cc7620;
}
.kpis .purple strong {
  color: #6d3fc0;
}
.comparison-table {
  overflow: hidden;
}
.comparison-table > header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 16px 18px;
}
.comparison-table header span {
  color: #1877c9;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.12em;
}
.comparison-table h2,
.chart-panel h2,
.scores h2 {
  margin: 3px 0 0;
  color: #263d52;
  font-size: 14px;
}
.comparison-table header > small {
  color: #1877c9;
  font-size: 9px;
}
.comparison-table > div {
  overflow-x: auto;
}
table {
  width: 100%;
  min-width: 1050px;
  border-collapse: collapse;
}
th,
td {
  padding: 8px 7px;
  border-bottom: 1px solid #e5eaef;
  font-size: 8px;
  text-align: center;
  white-space: nowrap;
}
th {
  color: #52677a;
  background: #f5f7f9;
}
thead tr:first-child th {
  font-size: 9px;
}
.result {
  background: #edf6fe;
}
.recommend {
  background: #fff4e6;
}
.actual {
  background: #f3edfc;
}
tbody tr {
  cursor: pointer;
}
tbody tr:hover {
  background: #f7fafc;
}
tbody tr.selected {
  background: #eaf4fc;
  box-shadow: inset 3px 0 #1877c9;
}
.chart-row,
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.chart-panel,
.scores {
  padding: 15px 17px;
  overflow: hidden;
}
.chart-panel h2 small {
  margin-left: 5px;
  color: #8191a0;
  font-size: 8px;
  font-weight: 500;
}
.triples {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 8px;
}
.triples > div {
  height: 185px;
}
.scores > div {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
}
.scores section {
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #dce4eb;
  border-radius: 8px;
}
.scores small {
  display: block;
  color: #64798c;
  font-size: 8px;
}
.scores strong {
  display: block;
  margin-top: 3px;
  color: #16815d;
  font-size: 19px;
}
.scores i {
  display: block;
  height: 4px;
  margin-top: 8px;
  background: #e3e9ee;
  border-radius: 4px;
  overflow: hidden;
}
.scores i span {
  display: block;
  height: 100%;
  background: #32a979;
  border-radius: 4px;
}
@keyframes enter {
  from {
    opacity: 0.35;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (max-width: 1150px) {
  .analysis-grid {
    grid-template-columns: 190px minmax(0, 1fr);
  }
  .kpis {
    grid-template-columns: repeat(3, 1fr);
  }
  .chart-row,
  .bottom-row {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  .jobs {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .jobs > header {
    grid-column: 1/-1;
  }
  .job-list {
    display: flex;
    overflow-x: auto;
  }
  .job-list button {
    flex: 0 0 180px;
  }
  .detail {
    border-top: 0;
    border-left: 1px solid #e1e7ed;
  }
  .triples {
    grid-template-columns: 1fr;
  }
  .triples > div {
    height: 210px;
  }
  .kpis {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
