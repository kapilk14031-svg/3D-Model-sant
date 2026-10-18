from pathlib import Path
import re,shutil
p=Path('work/r3f-build/src/bigPandal.ts');s=p.read_text(encoding='utf8');shutil.copyfile(p,'work/bigPandal-before-integration.ts')
s=s.replace("export function createBigPandal({scene, camera, renderer, canvas, smoothView, getCameraState, setCameraState}){",'''interface CameraState {angle:number;elevation:number;distance:number;x:number;z:number}
interface HallAPI {scene:THREE.Scene;camera:THREE.PerspectiveCamera;renderer:THREE.WebGLRenderer;canvas:HTMLCanvasElement;smoothView:(a:number,e:number,d:number,x:number,z:number)=>void;getCameraState:()=>CameraState;setCameraState:(state:CameraState)=>void}
const globals=globalThis as typeof globalThis & {setVenueExteriorVisibility?:(visible:boolean)=>void;pandalSitePos?:{x:number;z:number}};
export function createBigPandal({scene, camera, renderer, canvas, smoothView, getCameraState, setCameraState}:HallAPI){''')
s=s.replace('function box(x,y,z,w,h,d,mat,parent=hallGroup)', 'function box(x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material,parent:THREE.Object3D=hallGroup)')
s=s.replace('function cyl(x,y,z,r,h,mat,parent=hallGroup,seg=12)', 'function cyl(x:number,y:number,z:number,r:number,h:number,mat:THREE.Material,parent:THREE.Object3D=hallGroup,seg=12)')
s=s.replace('function beam(p1,p2,r,mat,parent=hallGroup)', 'function beam(p1:THREE.Vector3,p2:THREE.Vector3,r:number,mat:THREE.Material,parent:THREE.Object3D=hallGroup)')
s=s.replace('function createDevotee(x, z, yaw)', 'function createDevotee(x:number, z:number, yaw:number)')
s=s.replace('function addSignboard(text, x, z)', 'function addSignboard(text:string, x:number, z:number)')
s=re.sub(r"\.getContext\('2d'\)(?![!])", ".getContext('2d')!",s)
s=s.replace('const cameraPresets = {','const cameraPresets:Record<string,CameraState> = {')
s=s.replace('globalThis.setVenueExteriorVisibility','globals.setVenueExteriorVisibility').replace('globalThis.pandalSitePos','globals.pandalSitePos')
# A canopy is an open surface, not an opaque solid across the hall floor.
a=s.index('  const roofShape =');b=s.index('  hallGroup.add(roofMesh);',a)
s=s[:a]+'''  const vertices:number[]=[],indices:number[]=[];
  for(let side=0;side<2;side++)for(let i=0;i<=48;i++){const a=i/48*Math.PI;vertices.push(-Math.cos(a)*hallWidth/2,Math.sin(a)*hallHeight+.2,side?zEnd:zStart)}
  for(let i=0;i<48;i++){const a=i,b=i+1,c=i+49,d=i+50;indices.push(a,c,b,b,c,d)}
  const roofGeo=new THREE.BufferGeometry();roofGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));roofGeo.setIndex(indices);roofGeo.computeVertexNormals();
  const roofMesh=new THREE.Mesh(roofGeo,mats.fabricRoof);roofMesh.name='Concept hall canopy';roofMesh.castShadow=roofMesh.receiveShadow=true;
''' +s[b:]
s=s.replace('  box(-hallWidth/2, 1.8,','  const leftWall=box(-hallWidth/2, 1.8,',1).replace('  box(hallWidth/2, 1.8,','  const rightWall=box(hallWidth/2, 1.8,',1)
s=s.replace('  box(0, hallHeight/2, zEnd,','  const entranceWall=box(0, hallHeight/2, zEnd,',1)
s=s.replace('    const dGroup = new THREE.Group();','    const dGroup = new THREE.Group();dGroup.name="Concept seated attendee";')
# Batch repeated seat/person geometry for a responsive hall viewport.
pos=s.index('  function createDevotee(')
s=s[:pos]+'''  const illustrativePeople=audienceGroup.children.filter(o=>o.name==='Concept seated attendee').length;
  const batches=new Map<string,{geometry:THREE.BufferGeometry;material:THREE.Material;matrices:THREE.Matrix4[]}>();
  hallGroup.updateMatrixWorld(true);
  audienceGroup.traverse(o=>{if(o instanceof THREE.Mesh&&!Array.isArray(o.material)){const geo=o.geometry;const key=geo.type+JSON.stringify((geo as THREE.BoxGeometry).parameters??{})+o.material.uuid;let b=batches.get(key);if(!b){b={geometry:geo,material:o.material,matrices:[]};batches.set(key,b)}b.matrices.push(o.matrixWorld.clone())}});
  audienceGroup.clear();for(const batch of batches.values()){const im=new THREE.InstancedMesh(batch.geometry,batch.material,batch.matrices.length);batch.matrices.forEach((m,i)=>im.setMatrixAt(i,m));im.instanceMatrix.needsUpdate=true;im.receiveShadow=true;im.name='Concept audience / seating';audienceGroup.add(im)}
''' +s[pos:]
# Concept caveat in the model itself, concise and visible.
s=s.replace('GRAND PANDAL · BIG AUDITORIUM HALL','PANDAL · HALL INTERIOR CONCEPT')
s=s.replace('Full Interior: Stage, Holy Dais, LED Video Walls & Audience Seating','Illustrative layout · stage, seating, aisles & exits · not surveyed or capacity-approved')
s=s.replace('const initCam = cameraPresets.overview;','const initCam = cameraPresets.aisle;')
s=s.replace('fromStage: { angle: Math.PI, elevation: 0.18, distance: 42, x: 0, z: stageZ - 2 }','fromStage: { angle: Math.PI, elevation: 0.10, distance: 40, x: 0, z: 0 }')
# Replace camera transitions with a scoped tween so pointer navigation can interrupt it safely.
s=s.replace('smoothView(p.angle, p.elevation, p.distance, p.x, p.z);','setCutaway(v===\'overview\');transitionTo(p);')
start=s.index('  function enterBigPandal(){');end=s.index("  hud.querySelector('#exitPandalBtn')",start)
s=s[:start]+'''  let snapshot=new Map<THREE.Object3D,boolean>();
  let cameraTween:gsap.core.Tween|null=null;
  let previousHandlers:{down:typeof canvas.onpointerdown;move:typeof canvas.onpointermove;up:typeof canvas.onpointerup;wheel:typeof canvas.onwheel;cancel:typeof canvas.onpointercancel}|null=null;
  let hallDrag:{x:number;y:number;state:CameraState;button:number}|null=null;
  const controlsHidden=new Map<HTMLElement,string>();
  function transitionTo(state:CameraState){cameraTween?.kill();const moving={...getCameraState()};cameraTween=gsap.to(moving,{...state,duration:.9,ease:'power2.inOut',onUpdate:()=>setCameraState(moving)})}
  function setCutaway(open:boolean){roofMesh.visible=!open;leftWall.visible=!open;rightWall.visible=!open;entranceWall.visible=!open;const cb=hud.querySelector<HTMLInputElement>('#hallCutaway');if(cb)cb.checked=open}
  function enterBigPandal(){
    if(isInsidePandal)return;
    savedExteriorState={...getCameraState()};snapshot=new Map(scene.children.map(o=>[o,o.visible]));
    isInsidePandal=true;globals.setVenueExteriorVisibility?.(false);
    scene.children.forEach(o=>{o.visible=o===hallGroup});hallGroup.visible=true;hud.style.display='flex';
    setCutaway(false);setCameraState({...cameraPresets.aisle});
    document.querySelectorAll<HTMLElement>('#viewport .quick-views,#viewport [data-hall-hide="true"]').forEach(o=>{controlsHidden.set(o,o.style.display);o.style.display='none'});
    previousHandlers={down:canvas.onpointerdown,move:canvas.onpointermove,up:canvas.onpointerup,wheel:canvas.onwheel,cancel:canvas.onpointercancel};
    canvas.onpointerdown=e=>{cameraTween?.kill();hallDrag={x:e.offsetX,y:e.offsetY,state:{...getCameraState()},button:e.button};canvas.setPointerCapture(e.pointerId)};
    canvas.onpointermove=e=>{if(!hallDrag)return;const dx=e.offsetX-hallDrag.x,dy=e.offsetY-hallDrag.y,st={...hallDrag.state};if(hallDrag.button===2){st.x-=dx*st.distance/700;st.z-=dy*st.distance/700}else{st.angle-=dx*.005;st.elevation=Math.max(.04,Math.min(1.5,st.elevation+dy*.003))}setCameraState(st)};
    canvas.onpointerup=()=>{hallDrag=null};canvas.onpointercancel=()=>{hallDrag=null};
    canvas.onwheel=e=>{e.preventDefault();cameraTween?.kill();const st={...getCameraState()};st.distance=Math.max(6,Math.min(180,st.distance+e.deltaY*.12));setCameraState(st)};
    const hint=document.querySelector('#hint');if(hint)hint.textContent='Hall concept · drag to orbit · right-drag to pan · roof cutaway for the whole layout';
  }
  function exitBigPandal(){
    if(!isInsidePandal)return;cameraTween?.kill();hallDrag=null;isInsidePandal=false;
    hallGroup.visible=false;hud.style.display='none';globals.setVenueExteriorVisibility?.(true);
    snapshot.forEach((visible,o)=>o.visible=visible);hallGroup.visible=false;
    controlsHidden.forEach((display,o)=>o.style.display=display);controlsHidden.clear();
    if(previousHandlers){canvas.onpointerdown=previousHandlers.down;canvas.onpointermove=previousHandlers.move;canvas.onpointerup=previousHandlers.up;canvas.onwheel=previousHandlers.wheel;canvas.onpointercancel=previousHandlers.cancel;previousHandlers=null}
    setCameraState(savedExteriorState);
    const hint=document.querySelector('#hint');if(hint)hint.textContent='Drag resource to move · Drag ground to orbit · Right-drag to pan · Wheel: zoom';
  }

''' +s[end:]
# Extra hall controls with actual object toggles and layout scale.
pos=s.index("  hud.querySelector('#exitPandalBtn')")
s=s[:pos]+'''  const extras=document.createElement('div');extras.style.cssText='display:flex;flex-wrap:wrap;gap:12px;align-items:center;width:100%;font-size:12px';
  extras.innerHTML='<label style="margin:0"><input id="hallCutaway" type="checkbox" style="width:auto"> Open roof / cutaway</label><label style="margin:0"><input id="hallAudience" type="checkbox" checked style="width:auto"> Audience & seating</label><label style="margin:0">Stage width <input id="hallStageWidth" type="range" min="30" max="50" value="42" style="width:105px;padding:0;vertical-align:middle"></label><span id="hallFigures" style="color:#b5c6d4"></span>';
  hud.append(extras);hud.querySelector('#hallFigures')!.textContent=illustrativePeople+' illustrative audience figures · not a capacity figure';
  hud.querySelector<HTMLInputElement>('#hallCutaway')!.onchange=e=>setCutaway((e.target as HTMLInputElement).checked);
  hud.querySelector<HTMLInputElement>('#hallAudience')!.onchange=e=>audienceGroup.visible=(e.target as HTMLInputElement).checked;
  hud.querySelector<HTMLInputElement>('#hallStageWidth')!.oninput=e=>stageGroup.scale.x=Number((e.target as HTMLInputElement).value)/stageWidth;
''' +s[pos:]
s=s.replace('    hallGroup,\n    enterBigPandal,','    hallGroup,\n    enterBigPandal,')
p.write_text(s,encoding='utf8')
# Keep hall transitions separate from exterior editing/asset controls.
p=Path('work/r3f-build/src/main.tsx');s=p.read_text(encoding='utf8').replace("return <div style={{position:'absolute'", "return <div data-hall-hide=\"true\" style={{position:'absolute'")
p.write_text(s,encoding='utf8')
# Include hall sources in the downloadable project.
p=Path('work/package-source.py');s=p.read_text(encoding='utf8').replace("'plan.ts','deployment.ts'","'plan.ts','deployment.ts','bigPandal.ts'");p.write_text(s,encoding='utf8')
print('Hall isolation, camera controls, roof surface, seating batching and concept editor integrated')
