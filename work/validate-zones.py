from pathlib import Path
p=Path('work/r3f-build/src/plan.ts');s=p.read_text(encoding='utf8')
insert="""
function validPolygon(points:Point[]):boolean{const cross=(a:Point,b:Point,c:Point)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-8)return false;for(let j=i+1;j<points.length;j++){if(j===i+1||i===0&&j===points.length-1)continue;const c=points[j],d=points[(j+1)%points.length];const intersects=cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0&&Math.max(Math.min(a[0],b[0]),Math.min(c[0],d[0]))<=Math.min(Math.max(a[0],b[0]),Math.max(c[0],d[0]))&&Math.max(Math.min(a[1],b[1]),Math.min(c[1],d[1]))<=Math.min(Math.max(a[1],b[1]),Math.max(c[1],d[1]));if(intersects)return false}}return true}
"""
s=s.replace('export function parsePlan',insert+'\nexport function parsePlan');s=s.replace("if(area<.000001)throw Error('Zone needs an area, not a straight line.');","if(area<.000001)throw Error('Zone needs an area, not a straight line.');if(!validPolygon(points))throw Error('Zone edges cross or repeat. Draw a simple boundary.');")
p.write_text(s,encoding='utf8')
