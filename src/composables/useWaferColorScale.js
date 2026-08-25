import { computed } from 'vue'
export const WAFER_COLORS = ['#5420b8','#2455e8','#16b9e8','#55d585','#d8eb2e','#ff9f12','#ef3c20','#b7091d']
export function useWaferColorScale(side) {
  const values = computed(() =>
    (side.value?.points?.map((point) => Number(point.value)) || []).filter(Number.isFinite),
  )
  const min = computed(() => values.value.length ? Math.min(...values.value) : 0)
  const max = computed(() => values.value.length ? Math.max(...values.value) : 1)
  return { min, max, colors: WAFER_COLORS }
}
