export function waferStats(row) {
  const values = row?.points?.map((point) => Number(point.value)).filter(Number.isFinite) || []
  const avg = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 0
  return { avg, min, max, range: max - min, stress: Number(row?.stress || 0) }
}

