export function linearTrend(values) {
  if (!values.length) return []
  if (values.length === 1) return [values[0]]
  const n = values.length
  const sumX = (n * (n - 1)) / 2
  const sumY = values.reduce((sum, value) => sum + value, 0)
  const sumXY = values.reduce((sum, value, index) => sum + index * value, 0)
  const sumXX = values.reduce((sum, _, index) => sum + index * index, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  return values.map((_, index) => Number((intercept + slope * index).toFixed(2)))
}
