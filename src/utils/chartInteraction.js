import * as echarts from 'echarts'

export function setupLinkedShiftZoom(chart) {
  chart.group = 'npw-linked-charts'
  echarts.connect('npw-linked-charts')
  const activate = (active) => {
    chart.dispatchAction({ type: 'takeGlobalCursor', key: 'dataZoomSelect', dataZoomSelectActive: active })
    chart.getZr().setCursorStyle(active ? 'crosshair' : 'default')
  }
  const keydown = (event) => { if (event.key === 'Shift') activate(true) }
  const keyup = (event) => { if (event.key === 'Shift') activate(false) }
  const reset = () => chart.dispatchAction({ type: 'dataZoom', start: 0, end: 100 })
  window.addEventListener('keydown', keydown)
  window.addEventListener('keyup', keyup)
  chart.getZr().on('dblclick', reset)
  return () => {
    window.removeEventListener('keydown', keydown)
    window.removeEventListener('keyup', keyup)
    chart.getZr().off('dblclick', reset)
  }
}
