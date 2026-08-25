import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const POINT_KEYS = Array.from({ length: 13 }, (_, index) => `s${index + 1}`)

function parseCsv(text) {
  const [headerLine, ...lines] = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/)
  const headers = headerLine.split(',')
  return lines.map((line, index) => {
    const values = line.split(',')
    const raw = Object.fromEntries(headers.map((key, position) => [key, values[position]]))
    return {
      id: index + 1, time: raw.act_time.replace(' ', 'T'), eqpid: raw.eqpid, chid: raw.chid,
      side: raw.side, ppid: raw.ppid, foupid: raw.foupid, slotid: raw.slotid,
      title: raw.title || '-', workOrder: raw.work_order || '', group: raw.group || '', group_order: raw.group_order || '',
      shDistDelta: Number(raw.sh_dist_delta || 0), teosFactorDelta: Number(raw.Teos_factor_delta || 0), pressureDelta: Number(raw.pressure_delta || 0),
      avg: Number(raw.avg_thk), range: Number(raw.range_thk), stress: Number(raw.stress_thk),
      pmCount: Number(raw.pm_count || 0), shCount: Number(raw.sh_count || 0),
      points: POINT_KEYS.map((key, pointIndex) => ({ key: key.toUpperCase(), index: pointIndex + 1, value: Number(raw[key]) })),
    }
  })
}

const ROWS = []
const MAINTENANCE = [
  { work_order: 'WO-260702-01', work_date: '2026-07-02T08:30:00', work_start_time: '2026-07-02T08:30:00', work_end_time: '2026-07-02T10:05:00', eqpid: 'E01', chid: 'CH01', code: 'CBM', title: 'Chamber 상태 점검 및 부품 교체', duration: 95, tuneCount: 5 },
  { work_order: 'WO-260705-02', work_date: '2026-07-05T13:20:00', work_start_time: '2026-07-05T13:20:00', work_end_time: '2026-07-05T14:32:00', eqpid: 'E01', chid: 'CH01', code: 'PM', title: '정기 예방 보전', duration: 72, tuneCount: 3 },
  { work_order: 'WO-260709-03', work_date: '2026-07-09T09:10:00', work_start_time: '2026-07-09T09:10:00', work_end_time: '2026-07-09T10:08:00', eqpid: 'E01', chid: 'CH01', code: 'NSP', title: '가스 라인 이상 점검', duration: 58, tuneCount: 2 },
  { work_order: 'WO-260703-04', work_date: '2026-07-03T10:00:00', work_start_time: '2026-07-03T10:00:00', work_end_time: '2026-07-03T11:23:00', eqpid: 'E02', chid: 'CH03', code: 'PM', title: '정기 PM', duration: 83, tuneCount: 3 },
  { work_order: 'WO-260706-05', work_date: '2026-07-06T15:30:00', work_start_time: '2026-07-06T15:30:00', work_end_time: '2026-07-06T16:34:00', eqpid: 'E03', chid: 'CH04', code: 'CBM', title: '센서 교정', duration: 64, tuneCount: 2 },
]

const TUNES = [
  { id: 'start', work_order: 'WO-260702-01', group_order: 'start', tunedAt: '2026-07-02T08:30:00', eqpid: 'E01', chid: 'CH01', ppid: 'PPID_C', worker: '박지수', npwBefore: 100, npwAfter: 100, factors: { 'RF Power': [120, 120], Pressure: [45, 45], 'Gas Flow': [80, 80] } },
  { id: 1, work_order: 'WO-260702-01', group_order: '1', tunedAt: '2026-07-02T11:30:00', eqpid: 'E01', chid: 'CH01', ppid: 'PPID_C', worker: '박지수', npwBefore: 100, npwAfter: 91, factors: { 'RF Power': [120, 119], Pressure: [45, 44], 'Gas Flow': [80, 79] } },
  { id: 2, work_order: 'WO-260702-01', group_order: '2', tunedAt: '2026-07-03T15:20:00', eqpid: 'E01', chid: 'CH01', ppid: 'PPID_C', worker: '박지수', npwBefore: 91, npwAfter: 83, factors: { 'RF Power': [119, 118], Pressure: [44, 43], 'Gas Flow': [79, 78] } },
  { id: 3, work_order: 'WO-260702-01', group_order: '3', tunedAt: '2026-07-04T12:10:00', eqpid: 'E01', chid: 'CH01', ppid: 'PPID_C', worker: '박지수', npwBefore: 83, npwAfter: 74, factors: { 'RF Power': [118, 117], Pressure: [43, 42], 'Gas Flow': [78, 77] } },
  { id: 4, work_order: 'WO-260702-01', group_order: '4', tunedAt: '2026-07-05T16:10:00', eqpid: 'E01', chid: 'CH01', ppid: 'PPID_C', worker: '박지수', npwBefore: 74, npwAfter: 62, factors: { 'RF Power': [117, 116], Pressure: [42, 42], 'Gas Flow': [77, 77] } },
  { id: 5, work_order: 'WO-260702-01', group_order: '5', tunedAt: '2026-07-06T09:40:00', eqpid: 'E01', chid: 'CH01', ppid: 'PPID_C', worker: '박지수', npwBefore: 62, npwAfter: 54, factors: { 'RF Power': [116, 116], Pressure: [42, 42], 'Gas Flow': [77, 77] } },
  { id: 'end', work_order: 'WO-260702-01', group_order: 'end', tunedAt: '2026-07-07T10:40:00', eqpid: 'E01', chid: 'CH01', ppid: 'PPID_C', worker: '박지수', npwBefore: 54, npwAfter: 50, factors: { 'RF Power': [116, 116], Pressure: [42, 42], 'Gas Flow': [77, 77] } },
]

const unique = (key) => [...new Set(ROWS.map((row) => row[key]))].sort()

export const useNpwStore = defineStore('npw', () => {
  const allRows = ref(ROWS)
  const maintenance = ref(MAINTENANCE)
  const tunes = ref(TUNES)
  const filters = ref({ eqpids: ['E01'], chids: unique('chid'), ppids: unique('ppid'), startDate: '2026-07-01', endDate: '2026-07-13' })
  const specs = ref({ avg: { min: 7350, max: 7750 }, range: { min: 0, max: 900 }, point: { min: 7000, max: 7900 }, stress: { min: -190, max: -150 } })
  const labelFields = ref({ eqpid: false, side: true, ppid: false })
  const lastUpdated = ref(new Date())
  const selectedWafer = ref(null)
  const selectedGroup = ref(null)
  const selectedGroupOrder = ref(null)
  const filterVersion = ref(0)

  const equipmentOptions = computed(() => [...new Set(allRows.value.map((row) => row.eqpid))].sort())
  const chamberOptions = computed(() => [...new Set(allRows.value.filter((row) => filters.value.eqpids.includes(row.eqpid)).map((row) => row.chid))].sort())
  const ppidOptions = computed(() => [...new Set(allRows.value.map((row) => row.ppid))].sort())

  async function loadPublicData() {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}npw_dummy.csv`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`CSV load failed: ${response.status}`)
      const rows = parseCsv(await response.text())
      if (rows.length) {
        allRows.value = rows
        const selectedEqpids = filters.value.eqpids.filter((value) => rows.some((row) => row.eqpid === value))
        filters.value.eqpids = selectedEqpids.length ? selectedEqpids : [rows[0].eqpid]
        const availableChids = [...new Set(rows.filter((row) => filters.value.eqpids.includes(row.eqpid)).map((row) => row.chid))].sort()
        const availablePpids = [...new Set(rows.map((row) => row.ppid))].sort()
        filters.value.chids = filters.value.chids.filter((value) => availableChids.includes(value))
        filters.value.ppids = filters.value.ppids.filter((value) => availablePpids.includes(value))
        if (!filters.value.chids.length) filters.value.chids = availableChids
        if (!filters.value.ppids.length) filters.value.ppids = availablePpids
      }
    } catch (error) {
      console.warn('public/npw_dummy.csv를 불러오지 못해 기존 데이터를 사용합니다.', error)
    }
  }
  loadPublicData()

  const filteredRows = computed(() => {
    const start = new Date(`${filters.value.startDate}T00:00:00`).getTime()
    const end = new Date(`${filters.value.endDate}T23:59:59`).getTime()
    return allRows.value.filter((row) => filters.value.eqpids.includes(row.eqpid) &&
      filters.value.chids.includes(row.chid) && filters.value.ppids.includes(row.ppid) &&
      new Date(row.time).getTime() >= start && new Date(row.time).getTime() <= end)
  })

  const filteredMaintenance = computed(() => {
    const start = new Date(`${filters.value.startDate}T00:00:00`).getTime()
    const end = new Date(`${filters.value.endDate}T23:59:59`).getTime()
    return maintenance.value.filter((item) => filters.value.eqpids.includes(item.eqpid) &&
      filters.value.chids.includes(item.chid) &&
      new Date(item.work_date).getTime() >= start && new Date(item.work_date).getTime() <= end)
  })

  const orderRank = (value) => value === 'start' ? -1 : value === 'end' ? 999 : Number(value)
  const tuneHistoryRows = computed(() => [...filteredRows.value].sort((a, b) => a.group.localeCompare(b.group) || orderRank(a.group_order) - orderRank(b.group_order) || a.side.localeCompare(b.side)))
  const filteredTunes = computed(() => {
    const stages = new Map()
    tuneHistoryRows.value.forEach((row) => {
      const key = `${row.group}|${row.group_order}`
      if (!stages.has(key)) stages.set(key, [])
      stages.get(key).push(row)
    })
    return [...stages.values()].map((rows) => {
      const row = rows[0]
      const avg = rows.reduce((sum, item) => sum + item.avg, 0) / rows.length
      return { id: `${row.group}-${row.group_order}`, work_order: row.workOrder, group: row.group, group_order: row.group_order, tunedAt: row.time, eqpid: row.eqpid, chid: row.chid, ppid: row.ppid, title: row.title, worker: '박지수', npwBefore: avg, npwAfter: avg, factors: { 'SH Distance': [0, row.shDistDelta], 'TEOS Factor': [0, row.teosFactorDelta], Pressure: [0, row.pressureDelta] } }
    })
  })

  const activeGroupRows = computed(() => {
    const groups = [...new Set(tuneHistoryRows.value.map((row) => row.group))]
    const group = selectedGroup.value && groups.includes(selectedGroup.value) ? selectedGroup.value : groups[0]
    return tuneHistoryRows.value.filter((row) => row.group === group)
  })

  const tuneComparison = computed(() => {
    if (!activeGroupRows.value.length) return null
    const stages = [...new Set(activeGroupRows.value.map((row) => row.group_order))].sort((a, b) => orderRank(a) - orderRank(b))
    const targetOrder = stages.at(-1)
    const summarize = (order) => {
      const rows = activeGroupRows.value.filter((row) => row.group_order === order)
      const mean = (key) => rows.reduce((sum, row) => sum + row[key], 0) / Math.max(1, rows.length)
      return { avg: mean('avg'), range: mean('range'), stress: mean('stress'), shDistDelta: mean('shDistDelta'), teosFactorDelta: mean('teosFactorDelta'), pressureDelta: mean('pressureDelta') }
    }
    const before = summarize(stages[0]); const after = summarize(targetOrder)
    const sideValue = (order, side) => {
      const rows = activeGroupRows.value.filter((row) => row.group_order === order && row.side === side)
      return rows.reduce((sum, row) => sum + row.shDistDelta, 0) / Math.max(1, rows.length)
    }
    const stageSummaries = stages.map((order) => ({ order, ...summarize(order) }))
    return { group: activeGroupRows.value[0].group, title: activeGroupRows.value[0].title, workOrder: activeGroupRows.value[0].workOrder, targetOrder,
      before: before.avg, after: after.avg, delta: after.avg - before.avg, beforeSide1: sideValue(stages[0], '1'), beforeSide2: sideValue(stages[0], '2'), afterSide1: sideValue(targetOrder, '1'), afterSide2: sideValue(targetOrder, '2'), beforeStatus: inSpec('avg', before.avg) ? 'PASS' : 'FAIL', afterStatus: inSpec('avg', after.avg) ? 'PASS' : 'FAIL', tuneCount: stages.filter((item) => /^\d+$/.test(item) && orderRank(item) <= orderRank(targetOrder)).length,
      stages: stageSummaries,
      metrics: [{ name: 'AVG', before: before.avg, after: after.avg, key: 'avg' }, { name: 'Range', before: before.range, after: after.range, key: 'range' }, { name: 'Stress', before: before.stress, after: after.stress, key: 'stress' }],
      factors: [{ name: 'SH Distance', before: before.shDistDelta, after: after.shDistDelta, delta: after.shDistDelta - before.shDistDelta }, { name: 'TEOS Factor', before: before.teosFactorDelta, after: after.teosFactorDelta, delta: after.teosFactorDelta - before.teosFactorDelta }, { name: 'Pressure', before: before.pressureDelta, after: after.pressureDelta, delta: after.pressureDelta - before.pressureDelta }],
    }
  })

  const kpis = computed(() => {
    const works = filteredMaintenance.value
    const selectedMonths = Math.max(1, Math.ceil((new Date(filters.value.endDate) - new Date(filters.value.startDate)) / 2629800000))
    return {
      monthlyWorks: (works.length / selectedMonths).toFixed(1),
      mttp: works.length ? Math.round(works.reduce((sum, item) => sum + item.duration, 0) / works.length) : 0,
      avgTunes: works.length ? (works.reduce((sum, item) => sum + item.tuneCount, 0) / works.length).toFixed(1) : '0.0',
    }
  })

  function applyFilters(next) { filters.value = { ...next, eqpids: [...next.eqpids], chids: [...next.chids], ppids: [...next.ppids] }; filterVersion.value += 1 }
  function updateSpecs(next) { specs.value = JSON.parse(JSON.stringify(next)) }
  function refresh() { lastUpdated.value = new Date() }
  function workTitle(row) {
    if (row.title && row.title !== '-') return row.title
    const rowTime = new Date(row.time).getTime()
    return filteredMaintenance.value.filter((item) => item.eqpid === row.eqpid && item.chid === row.chid && new Date(item.work_date).getTime() <= rowTime).sort((a, b) => new Date(b.work_date) - new Date(a.work_date))[0]?.title || '-'
  }
  function inSpec(metric, value) { return value >= specs.value[metric].min && value <= specs.value[metric].max }
  function waferKey(row) { return `${row.foupid}|${row.slotid}` }
  function selectWafer(row) { const key = waferKey(row); selectedWafer.value = selectedWafer.value === key ? null : key }
  function selectTuneStage(row) { selectedGroup.value = row.group; selectedGroupOrder.value = row.group_order }

  return { allRows, maintenance, tunes, filters, specs, labelFields, filteredRows, filteredMaintenance, filteredTunes, tuneHistoryRows, activeGroupRows, tuneComparison, kpis, equipmentOptions, chamberOptions, ppidOptions, lastUpdated, selectedWafer, selectedGroup, selectedGroupOrder, filterVersion, applyFilters, updateSpecs, refresh, workTitle, inSpec, waferKey, selectWafer, selectTuneStage }
})
