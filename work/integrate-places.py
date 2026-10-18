from pathlib import Path
p=Path('work/places-release/src/facilityExplorer.ts');s=p.read_text(encoding='utf8')
s=s.replace("if(/toilet/.test(s))return'toilets';if(/langar/.test(s))", "if(/boundary|wall/.test(s))return'wall';if(/^gate/.test(s))return'gate';if(/toilet/.test(s))return'toilets';if(/langar/.test(s))")
s=s.replace("function build(p:Place){root.clear();", "function build(p:Place){root.traverse(o=>{if(o instanceof THREE.Sprite){o.material.map?.dispose();o.material.dispose()}});root.clear();")
s=s.replace("active=p;title.textContent=p.name;tagline.textContent=build(p).join(' · ');", "active=p;title.textContent=p.name;subtitle.textContent=/unclear|clipped/i.test(p.name)?'Source label is unclear · conceptual context only':'Conceptual detail view · dimensions and internal arrangements are illustrative';tagline.textContent=build(p).join(' · ');")
p.write_text(s,encoding='utf8')
p=Path('work/places-release/src/deployment.ts');s=p.read_text(encoding='utf8').replace('return{getPlan:plan,totals:', 'return{getPlan:plan,isDrawingZone:()=>draft!==null,totals:');p.write_text(s,encoding='utf8')
p=Path('work/places-release/src/venue.js');s=p.read_text(encoding='utf8');s="import {createFacilityExplorer} from './facilityExplorer';\n"+s
s=s.replace('let bigPandal;','let bigPandal;let facilityExplorer;')
s=s.replace('  if(bigPandal&&bigPandal.isInside()){\n    bigPandal.update();','  if(facilityExplorer&&facilityExplorer.isInside()){\n    facilityExplorer.update();\n  }else if(bigPandal&&bigPandal.isInside()){\n    bigPandal.update();')
s=s.replace('  if(!bigPandal||!bigPandal.isInside()){\n    if(globalThis.pdfFineLabels)', '  if((!bigPandal||!bigPandal.isInside())&&(!facilityExplorer||!facilityExplorer.isInside())){\n    if(globalThis.pdfFineLabels)')
s=s.replace('function smoothView(a,e,d,x=0,z=25){','let exteriorCameraTween=null;\nfunction smoothView(a,e,d,x=0,z=25){\n  exteriorCameraTween?.kill();')
s=s.replace('  gsap.to(state,{a,e,d,x,z,duration:1.5', '  exteriorCameraTween=gsap.to(state,{a,e,d,x,z,duration:1.5')
s=s.replace('setCameraState:st=>{angle=st.angle;', 'setCameraState:st=>{exteriorCameraTween?.kill();angle=st.angle;')
extra=r'''
facilityExplorer=createFacilityExplorer({scene,camera,canvas,renderer,resources,features:pdfFeatures,labels:[...allSignSprites,...fineLabels.children],sidebar:panels.view,getCamera:()=>({angle,elevation,distance,x:target.x,z:target.z}),setCamera:st=>{exteriorCameraTween?.kill();angle=st.angle;elevation=st.elevation;distance=st.distance;target.set(st.x,0,st.z)},cancelInteraction:()=>{exteriorCameraTween?.kill();tour=false;placing=false;drag=null},getPlacing:()=>placing||deployment.isDrawingZone(),hall:bigPandal,setExterior:visible=>globalThis.setVenueExteriorVisibility(visible)});
'''
s=s.replace('return {\n  bigPandal,deployment,scene',extra+'\nreturn {\n  facilityExplorer,bigPandal,deployment,scene')
p.write_text(s,encoding='utf8')
p=Path('work/places-release/src/main.tsx');s=p.read_text(encoding='utf8').replace("if(v.bigPandal?.isInside()||!placingRef.current)return;","if(v.bigPandal?.isInside()||v.facilityExplorer?.isInside()||!placingRef.current)return;");p.write_text(s,encoding='utf8')
