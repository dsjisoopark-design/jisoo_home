export const WAFER_POINTS = [
  {x:0,y:0},
  {x:72,y:108},
  {x:116,y:62},
  {x:137,y:0},
  {x:112,y:-65},
  {x:67,y:-112},
  {x:0,y:-137},
  {x:-68,y:-112},
  {x:-112,y:-64},
  {x:-137,y:0},
  {x:-110,y:66},
  {x:-65,y:112},
  {x:0,y:137},
]
export function interpolateWafer(values, resolution=35, preserveGrid=false) {
  const grid=[]
  for(let yi=0;yi<resolution;yi++) for(let xi=0;xi<resolution;xi++){
    const x=-150+xi*300/(resolution-1), y=-150+yi*300/(resolution-1)
    if(x*x+y*y>22500) {
      if (preserveGrid) grid.push([x, y, '-'])
      continue
    }
    let total=0, weight=0
    WAFER_POINTS.forEach((point,index)=>{const d=Math.max(16,(x-point.x)**2+(y-point.y)**2);const w=1/Math.pow(d,1.35);total+=Number(values[index]||0)*w;weight+=w})
    grid.push([x,y,total/Math.max(weight,1e-9)])
  }
  return grid
}
