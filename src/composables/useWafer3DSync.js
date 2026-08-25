import { ref } from 'vue'
export function useWafer3DSync(){
  const sync=ref(true); const view=ref({alpha:38,beta:45,distance:190})
  const update=(next)=>{if(sync.value)view.value={...next}}
  const reset=()=>{view.value={alpha:38,beta:45,distance:190}}
  const top=()=>{view.value={alpha:90,beta:0,distance:190}}
  return{sync,view,update,reset,top}
}
