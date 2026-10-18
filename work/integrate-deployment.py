from pathlib import Path
p=Path('work/r3f-build/src/venue.js');s=p.read_text(encoding='utf8');s="import {setupDeployment} from './deployment';\n"+s
extra=r'''
const deployment=setupDeployment({scene,camera,canvas,ground,resources,panel:panels.deploy,filesPanel:panels.files,getItems:()=>items,setItems:v=>{items=v},getSelected:()=>selected,setSelected:i=>{selected=i},getPlacing:()=>placing,cancelInteraction:()=>{placing=false;drag=null},getRebuild:()=>rebuild,setRebuild:fn=>{rebuild=fn},setExport:fn=>{$('#save').onclick=fn},setImport:fn=>{$('#file').onchange=async e=>{const file=e.target.files?.[0];if(file)await fn(file);e.target.value=''}},focus:(u,v)=>smoothView(angle,.7,130,(u-.5)*600,(v-.5)*450),download});
$('#hint').textContent='Drag a resource to move · Drag empty ground to orbit · Right-drag to pan';
'''
s=s.replace('return {scene,renderer,camera,canvas,update:animate',extra+'\nreturn {deployment,scene,renderer,camera,canvas,update:animate')
p.write_text(s,encoding='utf8')
p=Path('work/r3f-build/src/deployment.ts');s=p.read_text(encoding='utf8');s=s.replace('editEnabled=true,visible=true;','editEnabled=true,visible=true;let zoneGesture:{x:number;y:number}|null=null;')
s=s.replace("api.canvas.onpointerdown=e=>{if(!draft", "api.canvas.onpointerdown=e=>{if(draft)zoneGesture={x:e.offsetX,y:e.offsetY};if(!draft")
s=s.replace("if(draft){const p=groundAt(e);up?.call(api.canvas,e);if(p){", "if(draft){const isClick=zoneGesture&&Math.hypot(e.offsetX-zoneGesture.x,e.offsetY-zoneGesture.y)<5;zoneGesture=null;const p=groundAt(e);up?.call(api.canvas,e);if(p&&isClick){")
# Let a new placement action cancel a zone sketch rather than competing with it.
s=s.replace("rebuildLayer();refresh();return{getPlan", "const placeButton=document.querySelector<HTMLButtonElement>('#place')!;const oldPlace=placeButton.onclick;placeButton.onclick=e=>{if(draft){draft=null;finish.disabled=true;cancel.hidden=true;rebuildLayer()}oldPlace?.call(placeButton,e)};rebuildLayer();refresh();return{getPlan")
p.write_text(s,encoding='utf8')
