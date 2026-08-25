export const CHART_PALETTE = ['#e6005c', '#79b51c', '#3f73d8', '#f28e2b', '#00a6a6', '#8b5cf6', '#d94f3d', '#00a85a', '#db3da4', '#5d8c13', '#2468b4', '#d66b00', '#008b9a', '#7340c4', '#b9362a', '#168a4f', '#c12683', '#648d12', '#2756a6', '#b95700']

function hash(value) {
  let result = 0
  for (let index = 0; index < value.length; index += 1) result = ((result << 5) - result + value.charCodeAt(index)) | 0
  return Math.abs(result)
}

export function colorForValue(group, value) { return CHART_PALETTE[hash(`${group}:${value}`) % CHART_PALETTE.length] }
export function colorForRow(row, dimensions) {
  const keys = dimensions.length ? dimensions : ['eqpid']
  return CHART_PALETTE[hash(keys.map((key) => `${key}:${row[key]}`).join('|')) % CHART_PALETTE.length]
}
