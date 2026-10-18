import re
from pathlib import Path

# Load extracted sourceImage
source_img_code = Path('work/source_image_tmp.js').read_text(encoding='utf-8')

script_content = r'''import {setupDeployment} from './deployment';
import * as THREE from 'three';
import {gsap} from 'gsap';

export function createVenue(){

const $=s=>document.querySelector(s),canvas=$('#c');
const scene=new THREE.Scene();
scene.background=new THREE.Color('#b5cee0');
scene.fog=new THREE.Fog('#b4cee0',600,1950);

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;

const camera=new THREE.PerspectiveCamera(45,1,.5,2800);

// --- Natural Daylight & Atmosphere ---
const hemiLight=new THREE.HemisphereLight('#c2dff5','#4a4032',1.15);
scene.add(hemiLight);

const sun=new THREE.DirectionalLight('#fff4de',2.75);
sun.position.set(-220,340,-170);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-440,right:440,top:400,bottom:-400,near:1,far:1050});
sun.shadow.bias=-.00012;
sun.shadow.normalBias=.08;
sun.shadow.radius=2.5;
scene.add(sun);

const ambLight=new THREE.AmbientLight('#e6edf2',.35);
scene.add(ambLight);

// Group for night/sunset high-mast floodlights & glowing window meshes
const floodlightGroup=new THREE.Group();floodlightGroup.visible=false;scene.add(floodlightGroup);
const nightWindowGlow=new THREE.Group();nightWindowGlow.visible=false;scene.add(nightWindowGlow);

// --- Procedural Canvas Textures ---
function createTexture(w,h,drawFn,repeatX=1,repeatY=1){
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const ctx=cv.getContext('2d');
  drawFn(ctx,w,h);
  const tex=new THREE.CanvasTexture(cv);
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  tex.repeat.set(repeatX,repeatY);
  tex.colorSpace=THREE.SRGBColorSpace;
  tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  return tex;
}

let seed=1337;
function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}

// Sky Dome Texture with Realistic Clouds
const skyTex=createTexture(1024,512,(ctx,w,h)=>{
  let grad=ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0,'#16568c');
  grad.addColorStop(.35,'#4187b5');
  grad.addColorStop(.7,'#9ac1d9');
  grad.addColorStop(.88,'#d6e4ed');
  grad.addColorStop(1,'#ecdcc2');
  ctx.fillStyle=grad;
  ctx.fillRect(0,0,w,h);
  ctx.fillStyle='rgba(255,255,255,0.42)';
  for(let i=0;i<70;i++){
    let cx=rand()*w,cy=rand()*h*.55+h*.15,r=rand()*75+35;
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
    ctx.arc(cx+r*.6,cy-r*.2,r*.7,0,Math.PI*2);ctx.fill();
    ctx.arc(cx-r*.6,cy-r*.1,r*.6,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle='rgba(255,255,255,0.22)';
  for(let i=0;i<45;i++){
    let cx=rand()*w,cy=rand()*h*.4+h*.1,r=rand()*110+50;
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
  }
});
const skyDome=new THREE.Mesh(new THREE.SphereGeometry(1500,32,20),new THREE.MeshBasicMaterial({map:skyTex,side:THREE.BackSide,depthWrite:false,toneMapped:false}));
scene.add(skyDome);

// Sun Flare
const sunCoronaTex=createTexture(256,256,(ctx,w,h)=>{
  let rad=ctx.createRadialGradient(w/2,h/2,10,w/2,h/2,w/2);
  rad.addColorStop(0,'rgba(255,255,240,1)');
  rad.addColorStop(.2,'rgba(255,235,180,0.8)');
  rad.addColorStop(.5,'rgba(255,200,120,0.25)');
  rad.addColorStop(1,'rgba(255,200,100,0)');
  ctx.fillStyle=rad;ctx.fillRect(0,0,w,h);
});
const sunSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:sunCoronaTex,transparent:true,depthWrite:false,toneMapped:false}));
sunSprite.position.copy(sun.position).normalize().multiplyScalar(1400);
sunSprite.scale.set(170,170,1);
scene.add(sunSprite);

// Rich Terrain Grass Texture with Soil Variations
const grassTex=createTexture(512,512,(ctx,w,h)=>{
  ctx.fillStyle='#526137';ctx.fillRect(0,0,w,h);
  for(let i=0;i<28000;i++){
    let r=rand();
    ctx.fillStyle=r>.7?'#637343':r>.4?'#43522a':r>.15?'#74854f':'#877759';
    ctx.fillRect(rand()*w,rand()*h,rand()*3+1,rand()*3+1);
  }
},42,42);

// Real Asphalt Aggregate Texture
const asphaltTex=createTexture(256,256,(ctx,w,h)=>{
  ctx.fillStyle='#2b2e30';ctx.fillRect(0,0,w,h);
  for(let i=0;i<12000;i++){
    let r=rand();
    ctx.fillStyle=r>.5?'#383c3e':'#202224';
    ctx.fillRect(rand()*w,rand()*h,1,1);
  }
},6,6);

// Concrete Slab Texture
const concreteTex=createTexture(256,256,(ctx,w,h)=>{
  ctx.fillStyle='#a4a197';ctx.fillRect(0,0,w,h);
  for(let i=0;i<7000;i++){
    let r=rand();
    ctx.fillStyle=r>.6?'#b5b2a8':'#928f86';
    ctx.fillRect(rand()*w,rand()*h,rand()*2+1,rand()*2+1);
  }
  ctx.strokeStyle='rgba(80,78,72,0.25)';ctx.strokeRect(0,0,w,h);
},3,3);

// Architectural Pandal Tent Fabric
const fabricTex=createTexture(256,256,(ctx,w,h)=>{
  ctx.fillStyle='#f0eae0';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#d3cbbe';ctx.lineWidth=2;
  for(let y=0;y<h;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
},4,4);

// Police Hazard Barricade Texture
const barricadeTex=createTexture(512,128,(ctx,w,h)=>{
  ctx.fillStyle='#eeb815';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#1c1c1c';
  for(let x=-w;x<w*2;x+=44){
    ctx.beginPath();
    ctx.moveTo(x,0);ctx.lineTo(x+28,0);ctx.lineTo(x+28+h,h);ctx.lineTo(x+h,h);
    ctx.fill();
  }
  ctx.fillStyle='rgba(255,255,255,0.92)';ctx.fillRect(85,38,342,52);
  ctx.fillStyle='#0f1c24';ctx.font='bold 27px Arial';ctx.textAlign='center';
  ctx.fillText('POLICE BANDOBAST',w/2,75);
});

// Police PCR Vehicle Livery Texture
const policeLiveryTex=createTexture(256,64,(ctx,w,h)=>{
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#0a2342';ctx.fillRect(0,h*.4,w,h*.22);
  ctx.fillStyle='#b81414';ctx.fillRect(0,h*.62,w,h*.14);
  ctx.fillStyle='#0a2342';ctx.font='bold 20px Arial';ctx.fillText('POLICE',15,22);
});

// Black & Yellow Painted Curb Texture
const curbStripedTex=createTexture(128,32,(ctx,w,h)=>{
  ctx.fillStyle='#f5c818';ctx.fillRect(0,0,w/2,h);
  ctx.fillStyle='#202020';ctx.fillRect(w/2,0,w/2,h);
},8,1);

// --- Materials ---
const mat=(c,rough=.85,metal=0)=>new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal});
const asphalt=new THREE.MeshStandardMaterial({color:'#323638',roughness:.92,map:asphaltTex});
const concrete=new THREE.MeshStandardMaterial({color:'#aba89f',roughness:.88,map:concreteTex});
const curbMat=new THREE.MeshStandardMaterial({color:'#b8b4aa',roughness:.85});
const curbStripedMat=new THREE.MeshStandardMaterial({map:curbStripedTex,roughness:.8});
const white=mat('#eee8db',.6);
const glass=new THREE.MeshStandardMaterial({color:'#2b4556',roughness:.08,metalness:.9,transparent:true,opacity:.85});
const rubber=mat('#1c1e20',.95);
const chrome=mat('#dedede',.15,.95);
const khaki=mat('#92805b',.9);
const policeBlue=mat('#142238',.6);
const trafficVest=new THREE.MeshStandardMaterial({color:'#c2f018',roughness:.5,emissive:'#4a5d00',emissiveIntensity:.35});
const beaconRed=new THREE.MeshStandardMaterial({color:'#ff1a1a',roughness:.15,emissive:'#dd0a0a',emissiveIntensity:.9});
const beaconBlue=new THREE.MeshStandardMaterial({color:'#1a66ff',roughness:.15,emissive:'#0044ee',emissiveIntensity:.9});
const headlight=new THREE.MeshStandardMaterial({color:'#fffbe8',roughness:.2,emissive:'#fff4be',emissiveIntensity:.85});
const taillight=new THREE.MeshStandardMaterial({color:'#ff1100',roughness:.3,emissive:'#bb0000',emissiveIntensity:.75});
const redCarpet=mat('#8a1b22',.95);
const floodlightGlowMat=new THREE.MeshBasicMaterial({color:'#fffef0',transparent:true,opacity:.3,side:THREE.DoubleSide});
const windowGlowMat=new THREE.MeshBasicMaterial({color:'#ffe9aa',transparent:true,opacity:.85});

// Main Ground
let ground=new THREE.Mesh(new THREE.PlaneGeometry(1750,1400),new THREE.MeshStandardMaterial({map:grassTex,roughness:.96}));
ground.rotation.x=-Math.PI/2;
ground.position.y=-.15;
ground.receiveShadow=true;
scene.add(ground);

// --- Real-World Farmland & Agricultural Fields around Ground ---
const farmlandGroup=new THREE.Group();scene.add(farmlandGroup);
function farmPlot(x,z,w,d,color){
  let p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat(color,.98));
  p.rotation.x=-Math.PI/2;
  p.position.set(x,-.12,z);
  p.receiveShadow=true;
  farmlandGroup.add(p);
}
// Surrounding rural Haryana crop fields (mustard, wheat, tilled soil)
farmPlot(-450,-250,280,180,'#7d753c'); // Golden mustard field
farmPlot(-450,-50,280,180,'#5c6838');  // Green wheat field
farmPlot(-450,150,280,180,'#554838');  // Brown tilled soil
farmPlot(450,-250,280,180,'#7a7238');
farmPlot(450,-50,280,180,'#586536');
farmPlot(450,150,280,180,'#524434');
farmPlot(0,-450,650,200,'#5e683b');
farmPlot(0,450,650,200,'#6b6238');

// --- Helper Functions ---
function mesh(geo,m,x,y,z,parent=scene){let o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function box(x,y,z,w,h,d,m,parent=scene){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent)}
function cyl(x,y,z,r,h,m,parent=scene,segs=16){return mesh(new THREE.CylinderGeometry(r,r,h,segs),m,x,y,z,parent)}
function pt(u,v,y=0){return new THREE.Vector3((u-.5)*600,y,(v-.5)*450)}

function beam(a,b,width,height,m,parent=scene){
  let mid=a.clone().add(b).multiplyScalar(.5),len=a.distanceTo(b);
  let o=box(mid.x,mid.y,mid.z,width,height,len,m,parent);
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),b.clone().sub(a).normalize());
  return o;
}

// Raised Curbs & Road Surface
function road(points,w=5,y=.12,material=asphalt,stripedCurbs=false){
  for(let i=1;i<points.length;i++){
    let a=pt(...points[i-1],y),b=pt(...points[i],y);
    beam(a,b,w,.22,material);
    let dir=b.clone().sub(a).normalize(),norm=new THREE.Vector3(-dir.z,0,dir.x);
    for(let s of [-1,1]){
      let ca=a.clone().addScaledVector(norm,s*(w/2+.16)),cb=b.clone().addScaledVector(norm,s*(w/2+.16));
      beam(ca.setY(y+.04),cb.setY(y+.04),.32,.28,stripedCurbs?curbStripedMat:curbMat);
    }
  }
}

function dashed(points,y=.28,color='#ded8c6',dashLen=4,gapLen=3){
  for(let i=1;i<points.length;i++){
    let a=pt(...points[i-1],y),b=pt(...points[i],y),len=a.distanceTo(b);
    let step=dashLen+gapLen;
    for(let k=0;k<len;k+=step){
      beam(a.clone().lerp(b,k/len),a.clone().lerp(b,Math.min((k+dashLen)/len,1)),.2,.03,mat(color));
    }
  }
}

function zebra(center,dir,width=7,length=4){
  let norm=new THREE.Vector3(-dir.z,0,dir.x);
  for(let k=-width/2+0.5;k<width/2;k+=1.2){
    let p=center.clone().addScaledVector(norm,k);
    let a=p.clone().addScaledVector(dir,-length/2).setY(.25);
    let b=p.clone().addScaledVector(dir,length/2).setY(.25);
    beam(a,b,.6,.02,white);
  }
}

// Modern Highway Street Light Pole
function streetLight(x,z,rotY=0,doubleArm=true){
  let g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotY;scene.add(g);
  cyl(0,5.5,0,.15,11,chrome,g,10);
  box(0,.15,0,.8,.3,.8,concrete,g);
  for(let s of doubleArm?[-1,1]:[1]){
    let arm=box(s*1.8,11.2,0,3.6,.12,.12,chrome,g);
    box(s*3.5,11.1,0,1.1,.18,.5,mat('#454e52'),g);
    box(s*3.5,10.99,0,.9,.05,.38,headlight,g);
  }
}

// 25m Stadium High-Mast Floodlight Tower
function highMastLight(x,z){
  let g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  // Octagonal tapered steel mast (25m high)
  cyl(0,12.5,0,.75,25,chrome,g,12);
  box(0,.4,0,2.6,.8,2.6,concrete,g);
  // Headframe ring with 12 floodlight lamps
  let ring=mesh(new THREE.TorusGeometry(2.2,.2,8,24),chrome,0,25.2,0,g);
  ring.rotation.x=Math.PI/2;
  for(let i=0;i<12;i++){
    let ang=i*Math.PI/6,lx=Math.cos(ang)*2.2,lz=Math.sin(ang)*2.2;
    box(lx,25.2,lz,.5,.4,.6,headlight,g);
  }
  // Soft volumetric cone of light at night
  let cone=mesh(new THREE.ConeGeometry(38,45,24,1,true),floodlightGlowMat,0,12,0,floodlightGroup);
}

// Gantry Sign Structure
function highwayGantry(a,b,signTextA,signTextB){
  let mid=a.clone().add(b).multiplyScalar(.5),len=a.distanceTo(b);
  let dir=b.clone().sub(a).normalize(),norm=new THREE.Vector3(-dir.z,0,dir.x);
  let g=new THREE.Group();g.position.copy(mid);g.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dir);scene.add(g);
  cyl(-len/2+1,5.5,0,.28,11,chrome,g,12);
  cyl(len/2-1,5.5,0,.28,11,chrome,g,12);
  box(0,10.5,0,len,.3,.4,chrome,g);
  box(0,12.5,0,len,.3,.4,chrome,g);
  for(let k=-len/2+2;k<len/2-1;k+=3.5)box(k,11.5,0,.15,2,.3,chrome,g);
  function makeSign(txt,xPos){
    let cv=document.createElement('canvas');cv.width=512;cv.height=128;
    let c=cv.getContext('2d');
    c.fillStyle='#0f5a34';c.fillRect(0,0,512,128);
    c.strokeStyle='#ffffff';c.lineWidth=6;c.strokeRect(6,6,500,116);
    c.fillStyle='#ffffff';c.textAlign='center';c.font='bold 34px Arial';
    c.fillText(txt,256,76);
    box(xPos,11.5,.35,len*.4,2.2,.08,new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(cv),roughness:.4}),g);
  }
  makeSign(signTextA,-len*.25);
  makeSign(signTextB,len*.25);
}

function sign(text,u,v,y=8){
  let cv=document.createElement('canvas');cv.width=512;cv.height=90;let c=cv.getContext('2d');
  c.fillStyle='rgba(16,42,54,0.95)';c.fillRect(0,0,512,90);
  c.strokeStyle='#5ea8c2';c.lineWidth=5;c.strokeRect(4,4,504,82);
  c.fillStyle='#ffffff';c.textAlign='center';c.font='bold 29px Arial';
  c.fillText(text,256,56);
  let sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv)}));
  sprite.position.copy(pt(u,v,y));
  sprite.scale.set(30,5.2,1);
  sprite.userData.label=text;
  scene.add(sprite);
}

// Indian Highway Milestone (KM Stone)
function milestone(x,z,km="62 KM"){
  let g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  // Concrete milestone cylinder with domed top
  cyl(0,.55,0,.28,1.1,white,g,16);
  mesh(new THREE.SphereGeometry(.28,16,12),mat('#e8c312'),0,1.1,0,g); // Yellow top
  box(0,.6,.3,.4,.4,.02,mat('#111111'),g); // Text face
}
milestone(pt(.37,.78).x,pt(.37,.78).z+9.5,"DELHI 62");

// Boom Barrier / Drop-Arm Gate
function boomBarrier(x,z,yaw=0){
  let g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;scene.add(g);
  box(0,.6,0,.45,1.2,.45,mat('#d94d1a'),g); // Orange housing
  // Red & White striped arm
  box(2.2,1,0,4.4,.12,.12,mat('#eeeeee'),g);
  for(let k=0;k<5;k++)box(.6+k*.8,1,.01,.4,.13,.13,beaconRed,g);
}

// --- High-Mast Lighting Towers stationed across grounds ---
highMastLight(pt(.428,.63).x-45,pt(.428,.63).z); // Pandal West
highMastLight(pt(.428,.63).x+45,pt(.428,.63).z); // Pandal East
highMastLight(pt(.36,.74).x,pt(.36,.74).z);       // Gate 1 Plaza
highMastLight(pt(.495,.70).x,pt(.495,.70).z);      // Gate 2 Plaza
highMastLight(pt(.22,.68).x,pt(.22,.68).z);        // P1 Parking
highMastLight(pt(.62,.16).x,pt(.62,.16).z);        // P3 Parking

// --- Highway Network (NH-44) ---
let highway=[[.03,.88],[.18,.82],[.36,.765],[.53,.71],[.7,.66],[.88,.606]];
for(let i=1;i<highway.length;i++){
  let a=pt(...highway[i-1],0),b=pt(...highway[i],0);
  let dir=b.clone().sub(a).normalize(),norm=new THREE.Vector3(-dir.z,0,dir.x);
  // North carriageway (Ambala)
  let na=a.clone().addScaledVector(norm,-4.5),nb=b.clone().addScaledVector(norm,-4.5);
  beam(na.clone().setY(.15),nb.clone().setY(.15),8,.24,asphalt);
  beam(na.clone().addScaledVector(norm,-4).setY(.25),nb.clone().addScaledVector(norm,-4).setY(.25),.28,.04,white);
  beam(na.clone().addScaledVector(norm,3.8).setY(.25),nb.clone().addScaledVector(norm,3.8).setY(.25),.28,.04,mat('#ddaa22'));
  // South carriageway (Delhi)
  let sa=a.clone().addScaledVector(norm,4.5),sb=b.clone().addScaledVector(norm,4.5);
  beam(sa.clone().setY(.15),sb.clone().setY(.15),8,.24,asphalt);
  beam(sa.clone().addScaledVector(norm,4).setY(.25),sb.clone().addScaledVector(norm,4).setY(.25),.28,.04,white);
  beam(sa.clone().addScaledVector(norm,-3.8).setY(.25),sb.clone().addScaledVector(norm,-3.8).setY(.25),.28,.04,mat('#ddaa22'));
  // Center Concrete Jersey Barrier (Median)
  beam(a.clone().setY(.5),b.clone().setY(.5),.9,1,concrete);
  beam(a.clone().setY(1.15),b.clone().setY(1.15),.12,.4,mat('#284534'));
  // Steel guardrails
  for(let s of [-8.8,8.8]){
    let ga=a.clone().addScaledVector(norm,s).setY(.6),gb=b.clone().addScaledVector(norm,s).setY(.6);
    beam(ga,gb,.18,.5,chrome);
    for(let t=0;t<ga.distanceTo(gb);t+=8){
      let q=ga.clone().lerp(gb,t/ga.distanceTo(gb));
      cyl(q.x,.3,q.z,.08,.65,chrome);
    }
  }
}

// Spaced Street Lights along Highway Median
for(let i=0;i<highway.length-1;i++){
  let a=pt(...highway[i]),b=pt(...highway[i+1]),len=a.distanceTo(b);
  let dir=b.clone().sub(a).normalize(),rot=Math.atan2(dir.x,dir.z);
  for(let t=10;t<len-5;t+=38){
    let q=a.clone().lerp(b,t/len);
    streetLight(q.x,q.z,rot);
  }
}

// Zebra Crossings
let z1=pt(.386,.779);zebra(z1,new THREE.Vector3(.97,0,-.25),16,4);
let z2=pt(.495,.705);zebra(z2,new THREE.Vector3(.97,0,-.25),16,4);

// Highway Gantry Signs
highwayGantry(pt(.22,.805,-9),pt(.22,.805,9),'NH-44  DELHI ➜','➜ PANIPAT / AMBALA');
highwayGantry(pt(.58,.69,-9),pt(.58,.69,9),'SAMAGAM GATE 1-3 ➜','NH-44 AMBALA ➜');

// Internal Roads Network with Striped Curbs along VIP routes
let roads=[
  [[.16,.81],[.163,.49],[.16,.3],[.4,.23],[.56,.18]],
  [[.16,.49],[.23,.48],[.4,.23]],
  [[.23,.48],[.32,.6],[.35,.6],[.35,.755]],
  [[.397,.72],[.397,.418],[.56,.418],[.56,.18]],
  [[.56,.418],[.56,.21],[.75,.21]],
  [[.59,.68],[.59,.515],[.66,.43],[.72,.31],[.77,.31],[.81,.61]],
  [[.35,.525],[.54,.525]],
  [[.495,.7],[.495,.42]],
  [[.56,.18],[.58,.1],[.77,.09]],
  [[.75,.1],[.77,.21],[.81,.4],[.81,.61]]
];
roads.forEach((r,idx)=>{
  let isVip=idx===2||idx===3||idx===7;
  road(r,6,.06,asphalt,isVip);
  dashed(r,.18);
});

const structures=new THREE.Group();scene.add(structures);

// Detailed Building Generator with Night Glowing Windows
function building(u,v,w,d,h,color='#c7bba8'){
  let p=pt(u,v),g=new THREE.Group();g.position.copy(p);structures.add(g);
  box(0,h/2,0,w,h,d,mat(color),g);
  box(0,h+.25,0,w+.4,.5,d+.4,concrete,g);
  box(0,h+.05,0,w-.4,.1,d-.4,mat('#504d47'),g);
  for(let yy=2.2;yy<h-1.2;yy+=3.2){
    for(let xx=-w/2+1.5;xx<w/2-1.2;xx+=2.8){
      box(xx,yy,d/2+.03,1.4,1.8,.08,glass,g);
      box(xx,yy-1,d/2+.06,1.6,.15,.15,curbMat,g);
      box(xx,yy,-d/2-.03,1.4,1.8,.08,glass,g);
      box(xx,yy-1,-d/2-.06,1.6,.15,.15,curbMat,g);
      // Night glowing window counterpart
      let gw=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.7),windowGlowMat);
      gw.position.set(p.x+xx,yy,p.z+d/2+.04);
      nightWindowGlow.add(gw);
    }
  }
  box(0,1.5,d/2+.8,2.4,.15,1.5,concrete,g);
  box(0,1.2,d/2+.06,1.8,2.4,.1,mat('#2b261f'),g);
  if(h>=5){
    cyl(w*.25,h+1,d*.2,1,1.5,mat('#1f2b38'),g,14);
    box(-w*.25,h+.6,-d*.2,1.2,.8,.9,mat('#d2d4d6'),g);
  }
  return g;
}

for(let r=0;r<5;r++)for(let j=0;j<5;j++){if(j===3)continue;building(.411+j*.026,.26+r*.029,10,8,5+rand()*7,['#cbbda5','#d8cdb8','#b9bcae','#cbb59e'][(r+j)%4])}
for(let r=0;r<6;r++)for(let j=0;j<4;j++)building(.601+j*.027,.25+r*.027,10,6.5,5+rand()*9,['#c9c0ae','#c8b8a3','#bcc3b9'][(j+r)%3]);

function footprint(points,h,color){
  let shape=new THREE.Shape();
  points.forEach((p,i)=>{let q=pt(...p);i?shape.lineTo(q.x,-q.z):shape.moveTo(q.x,-q.z)});
  shape.closePath();
  let geo=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:true,bevelThickness:.2,bevelSize:.1,bevelSegments:2});
  let o=new THREE.Mesh(geo,mat(color));
  o.rotation.x=-Math.PI/2;
  o.castShadow=o.receiveShadow=true;
  structures.add(o);
  decorateFootprint(points,h,o);
}
footprint([[.405,.26],[.465,.26],[.465,.298],[.477,.298],[.477,.35],[.465,.35],[.465,.4],[.407,.4]],3,'#c1b99c');
footprint([[.572,.216],[.627,.216],[.627,.28],[.65,.28],[.65,.31],[.665,.31],[.665,.375],[.645,.375],[.645,.39],[.62,.39],[.62,.372],[.60,.372],[.60,.35],[.572,.35]],4,'#bfb8a5');
footprint([[.576,.355],[.6,.355],[.6,.29],[.613,.29],[.613,.34],[.628,.34],[.628,.415],[.61,.415],[.61,.405],[.575,.405]],3,'#c8bdab');
footprint([[.34,.348],[.405,.348],[.405,.376],[.39,.376],[.39,.412],[.36,.412],[.36,.39],[.34,.39]],2.5,'#c6bda6');
footprint([[.46,.13],[.53,.13],[.53,.193],[.475,.193],[.475,.205],[.462,.205],[.462,.195]],4,'#c9bdab');

// --- GRAND MAIN PANDAL ---
let pandal=pt(.428,.63);
let pandalGroup=new THREE.Group();pandalGroup.position.copy(pandal);structures.add(pandalGroup);
box(0,.2,0,38,.4,86,concrete,pandalGroup);

let numBays=9,baySpacing=86/(numBays-1),pandalWidth=36,pandalHeight=13;
for(let b=0;b<numBays;b++){
  let zPos=-43+b*baySpacing;
  let archPts=[];
  for(let a=0;a<=Math.PI;a+=Math.PI/12){
    archPts.push(new THREE.Vector3(-Math.cos(a)*pandalWidth/2,Math.sin(a)*pandalHeight+.4,zPos));
  }
  for(let k=1;k<archPts.length;k++)beam(archPts[k-1],archPts[k],.35,.45,chrome,pandalGroup);
  cyl(-pandalWidth/2,2,zPos,.35,4,chrome,pandalGroup);
  cyl(pandalWidth/2,2,zPos,.35,4,chrome,pandalGroup);
}
let roofCurve=new THREE.Shape();
for(let a=0;a<=Math.PI;a+=Math.PI/16){
  let rx=-Math.cos(a)*pandalWidth/2,ry=Math.sin(a)*pandalHeight+.4;
  a===0?roofCurve.moveTo(rx,ry):roofCurve.lineTo(rx,ry);
}
roofCurve.lineTo(pandalWidth/2,.4);roofCurve.lineTo(-pandalWidth/2,.4);roofCurve.closePath();
let pandalRoofGeo=new THREE.ExtrudeGeometry(roofCurve,{depth:86,bevelEnabled:false});
let pandalRoofMesh=new THREE.Mesh(pandalRoofGeo,new THREE.MeshStandardMaterial({color:'#f4efe6',roughness:.65,map:fabricTex,side:THREE.DoubleSide}));
pandalRoofMesh.position.z=-43;
pandalRoofMesh.castShadow=pandalRoofMesh.receiveShadow=true;
pandalGroup.add(pandalRoofMesh);

// Grand Entrance Portal & Banner
box(0,pandalHeight*.7,43.2,pandalWidth*.6,4,.6,mat('#123b56'),pandalGroup);
let cv=document.createElement('canvas');cv.width=512;cv.height=90;let c=cv.getContext('2d');
c.fillStyle='#0e2e42';c.fillRect(0,0,512,90);
c.strokeStyle='#e8c35a';c.lineWidth=6;c.strokeRect(5,5,502,80);
c.fillStyle='#ffffff';c.textAlign='center';c.font='bold 27px Arial';
c.fillText('79th SANT SAMAGAM - MAIN PANDAL',256,54);
box(0,pandalHeight*.7,43.6,pandalWidth*.55,2.4,.1,new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(cv)}),pandalGroup);

// VIP Red Carpet Pathway
box(0,.25,56,4,.05,26,redCarpet,pandalGroup);
for(let z=-12;z<=12;z+=4){
  for(let x of [-2.3,2.3]){
    cyl(x,.5,56+z,.05,1,chrome,pandalGroup);
    mesh(new THREE.SphereGeometry(.1,8,8),mat('#e5b822'),x,1,56+z,pandalGroup);
  }
}
sign('MAIN PANDAL',.428,.63,22);

// Giant Outdoor LED Video Walls outside Main Pandal
function ledScreen(x,z,yaw){
  let g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;scene.add(g);
  // Steel truss legs
  box(-4.5,4,0,.3,8,.3,chrome,g);
  box(4.5,4,0,.3,8,.3,chrome,g);
  box(0,8,0,10,.3,.3,chrome,g);
  // LED Display Board with Glowing Event Broadcast
  let cv=document.createElement('canvas');cv.width=512;cv.height=256;let ct=cv.getContext('2d');
  let gr=ct.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#1a3a5c');gr.addColorStop(1,'#0a1828');
  ct.fillStyle=gr;ct.fillRect(0,0,512,256);
  ct.fillStyle='#ffcc00';ct.font='bold 32px Arial';ct.textAlign='center';
  ct.fillText('79th NIRANKARI SANT SAMAGAM',256,70);
  ct.fillStyle='#ffffff';ct.font='24px Arial';
  ct.fillText('LIVE BROADCAST / सीधा प्रसारण',256,120);
  ct.fillStyle='#00ffcc';ct.font='bold 28px Arial';
  ct.fillText('BHODWAL MAJRI, SAMALKHA',256,175);
  let screenMesh=box(0,5.5,.15,9.5,5.2,.15,new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(cv),emissive:'#223344',emissiveIntensity:.7}),g);
}
ledScreen(pandal.x-24,pandal.z+44,.35);
ledScreen(pandal.x+24,pandal.z+44,-.35);

// Sound System Line-Array Truss Towers
function soundTower(x,z){
  let g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  cyl(0,5,0,.2,10,chrome,g,8);
  for(let k=0;k<4;k++){
    box(0,8.5-k*.8,.3,1.2,.6,.8,mat('#111111'),g); // Speakers
  }
}
soundTower(pandal.x-22,pandal.z+28);
soundTower(pandal.x+22,pandal.z+28);

// --- BHODWAL MAJRI RAILWAY STATION & INDIAN TRAIN ---
let stationGroup=new THREE.Group();structures.add(stationGroup);
building(.56,.081,52,11,7,'#c8baa0');
let plat=pt(.56,.097);
box(plat.x,1.1,plat.z,64,1.2,5.5,concrete,stationGroup);
box(plat.x,1.72,plat.z,64,.04,.3,mat('#e8c818'),stationGroup);
for(let x=-25;x<=25;x+=12.5)cyl(plat.x+x,3.2,plat.z,.16,3.6,chrome,stationGroup);
box(plat.x,5,plat.z,58,.2,6,mat('#465a68'),stationGroup);

// Station Signboard
let cvSt=document.createElement('canvas');cvSt.width=512;cvSt.height=110;let cSt=cvSt.getContext('2d');
cSt.fillStyle='#003399';cSt.fillRect(0,0,512,110);
cSt.strokeStyle='#ffffff';cSt.lineWidth=6;cSt.strokeRect(5,5,502,100);
cSt.fillStyle='#ffffff';cSt.textAlign='center';cSt.font='bold 34px Arial';
cSt.fillText('भोडवाल माजरी | BHODWAL MAJRI',256,68);
box(plat.x,3.8,plat.z,16,2.2,.2,new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(cvSt)}),stationGroup);

// Double Railway Tracks
let ra=pt(.14,.145),rb=pt(.92,.07),rv=rb.clone().sub(ra).normalize(),rn=new THREE.Vector3(-rv.z,0,rv.x);
let trackLen=ra.distanceTo(rb);
beam(ra.clone().setY(.15),rb.clone().setY(.15),8,.3,mat('#655e54',.95));
for(let t=0;t<trackLen;t+=1.8){
  let q=ra.clone().addScaledVector(rv,t);
  beam(q.clone().addScaledVector(rn,-3.4).setY(.28),q.clone().addScaledVector(rn,3.4).setY(.28),.28,.2,mat('#88837a'));
}
for(let d of [-2.4,-1,-0.2,1.2]){
  beam(ra.clone().addScaledVector(rn,d).setY(.42),rb.clone().addScaledVector(rn,d).setY(.42),.12,.18,chrome);
}
for(let t=10;t<trackLen-10;t+=38){
  let q=ra.clone().addScaledVector(rv,t).addScaledVector(rn,4.6);
  cyl(q.x,5.5,q.z,.14,11,chrome,stationGroup,8);
  box(q.x-rn.x*1.8,10.5,q.z-rn.z*1.8,3.8,.1,.1,chrome,stationGroup);
}

// REALISTIC INDIAN RAILWAYS TRAIN ON TRACK (WAP-7 Loco + Blue ICF Passenger Coaches)
function createIndianTrain(startPos,dir,coachCount=5){
  let tg=new THREE.Group();tg.position.copy(startPos);
  tg.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dir);
  scene.add(tg);
  // Electric Locomotive WAP-7
  let lw=3.2,ll=18,lh=3.8;
  box(0,2.3,0,lw,2.6,ll,mat('#ffffff',.3),tg); // White body with red stripe
  box(0,2.3,.01,lw+.02,.5,ll,beaconRed,tg);
  box(0,1,0,lw-.2,1,ll-.6,mat('#1e2226'),tg); // Chassis
  box(0,3.7,ll*.25,1.8,.6,1.4,chrome,tg); // Pantograph front
  box(0,3.7,-ll*.25,1.8,.6,1.4,chrome,tg); // Pantograph rear
  box(0,2.4,ll/2+.04,2.2,.8,.1,glass,tg); // Windshield
  box(0,2.4,ll/2+.1,.5,.35,.1,headlight,tg); // Top Twin Headlights
  // Blue ICF Passenger Coaches
  for(let c=1;c<=coachCount;c++){
    let cz=-ll/2-c*22+10;
    box(0,2.4,cz,3.2,2.7,21,mat('#184b8c',.35),tg); // Classic Railway Blue
    box(0,2.4,cz,3.24,.25,21,white,tg); // White horizontal stripe
    for(let w=0;w<9;w++){
      for(let s of [-1.62,1.62]){
        box(s,2.6,cz-8.5+w*1.9,.04,.6,1.1,glass,tg); // Windows
      }
    }
  }
}
createIndianTrain(ra.clone().addScaledVector(rv,trackLen*.45).addScaledVector(rn,-1).setY(.45),rv,5);

// --- ELEVATED FLYOVER BRIDGE & UNDERPASSES ---
let fly=[[.425,.747,.2],[.48,.729,10.5],[.64,.678,10.5],[.705,.656,.2]];
for(let i=1;i<fly.length;i++){
  let a=pt(fly[i-1][0],fly[i-1][1],fly[i-1][2]),b=pt(fly[i][0],fly[i][1],fly[i][2]);
  let v=b.clone().sub(a).normalize(),norm=new THREE.Vector3(-v.z,0,v.x);
  beam(a,b,13,1.8,concrete);
  beam(a.clone().add(new THREE.Vector3(0,1,0)),b.clone().add(new THREE.Vector3(0,1,0)),12,.16,asphalt);
  for(let d of [-6.3,6.3]){
    beam(a.clone().addScaledVector(norm,d).add(new THREE.Vector3(0,1.5,0)),b.clone().addScaledVector(norm,d).add(new THREE.Vector3(0,1.5,0)),.3,1.2,white);
    beam(a.clone().addScaledVector(norm,d).add(new THREE.Vector3(0,2,0)),b.clone().addScaledVector(norm,d).add(new THREE.Vector3(0,2,0)),.15,.2,chrome);
  }
}
for(let i=0;i<6;i++){
  let q=pt(.485+i*.03,.728-i*.00955);
  for(let dx of [-3.8,3.8])cyl(q.x+dx,4.8,q.z,1,9.6,concrete,scene,16);
  box(q.x,9.8,q.z,12.5,1.2,3.5,concrete);
}
sign('FLYOVER / UNDERPASS',.565,.714,20);

let uq=pt(.18,.84);
for(let dx of [-5,5])box(uq.x+dx,2.8,uq.z,1.5,5.6,15,concrete);
box(uq.x,5.8,uq.z,11.5,1.2,15,concrete);
sign('DELHI-SIDE UNDERPASS',.18,.84,12);

let fq=pt(.386,.779);
box(fq.x,6.5,fq.z,3,.6,22,concrete);
beam(new THREE.Vector3(fq.x,7.2,fq.z-11),new THREE.Vector3(fq.x,7.2,fq.z+11),.15,1,chrome);
for(let dz of [-10,10]){
  cyl(fq.x,3.2,fq.z+dz,.4,6.5,concrete);
  for(let k=0;k<11;k++)box(fq.x+2.2+k*.7,.3+k*.58,fq.z+dz,1.2,.32,2.2,concrete);
}
sign('FOOT OVER BRIDGE',.41,.80,16);

// --- VEHICLE GENERATORS (Indian Vehicles, Fire Engine, Water Tanker, DG Set) ---
function fireTender(u,v,yaw=0){
  let q=pt(u,v),g=new THREE.Group();g.position.copy(q);g.rotation.y=yaw;scene.add(g);
  let w=2.7,l=8.8;
  box(0,1.6,0,w,2.2,l,mat('#d91a1a',.3),g); // Fire Engine Red
  box(0,2,l/2-.8,w*.9,1.1,1.8,glass,g); // Crew Cab
  box(0,2.8,0,w*.7,.2,l*.7,chrome,g); // Roof equipment tray
  box(0,3,l*.2,.8,.4,.8,mat('#d91a1a'),g); // Water Cannon Nozzle
  box(-w*.4,3,0,.3,.3,6,mat('#e8e8e8'),g); // Extension Ladder
  // Beacons & Headlights
  box(-.8,2.8,l/2-.5,.4,.25,.25,beaconRed,g);
  box(.8,2.8,l/2-.5,.4,.25,.25,beaconBlue,g);
  box(-w*.35,.8,l/2+.05,.4,.25,.08,headlight,g);
  box(w*.35,.8,l/2+.05,.4,.25,.08,headlight,g);
  for(let x of [-w/2,w/2]){
    let wf=mesh(new THREE.CylinderGeometry(.52,.52,.3,14),rubber,x,.52,l*.3,g);wf.rotation.z=Math.PI/2;
    let wr=mesh(new THREE.CylinderGeometry(.52,.52,.3,14),rubber,x,.52,-l*.28,g);wr.rotation.z=Math.PI/2;
  }
}
fireTender(.459,.664,1.57); // Stationed at First Aid / Emergency post

function waterTanker(u,v,yaw=0){
  let q=pt(u,v),g=new THREE.Group();g.position.copy(q);g.rotation.y=yaw;scene.add(g);
  let w=2.6,l=7.8;
  box(0,1.2,l*.32,w,1.6,2.2,mat('#28527a'),g); // Cab
  box(0,1.5,l*.35,w*.9,.8,1,glass,g);
  // Water Tank (Cylinder)
  let tank=mesh(new THREE.CylinderGeometry(1.15,1.15,l*.65,20),mat('#d2d8de',.4),0,1.7,-l*.1,g);
  tank.rotation.x=Math.PI/2;
  // Wheels
  for(let x of [-w/2,w/2]){
    cyl(x,.5,l*.32,.48,.28,rubber,g,12).rotation.z=Math.PI/2;
    cyl(x,.5,-l*.1,.48,.28,rubber,g,12).rotation.z=Math.PI/2;
    cyl(x,.5,-l*.3,.48,.28,rubber,g,12).rotation.z=Math.PI/2;
  }
}
waterTanker(.517,.615,0);
waterTanker(.504,.375,0);

function dgGenerator(x,z,yaw=0){
  let g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=yaw;scene.add(g);
  box(0,1.2,0,2.2,2.1,4.2,mat('#f0c418',.5),g); // Industrial Yellow
  box(0,2.3,-.8,.2,.8,.2,mat('#111111'),g); // Exhaust stack
  box(0,.1,0,2.4,.2,4.4,mat('#222222'),g); // Base frame
}
dgGenerator(pt(.428,.63).x+22,pt(.428,.63).z-40,0);
dgGenerator(pt(.517,.602).x+10,pt(.517,.602).z,1.57);

function car(u,v,color='#dedbd2',yaw=0,type='sedan'){
  let q=pt(u,v),g=new THREE.Group();g.position.copy(q);g.rotation.y=yaw;scene.add(g);
  if(type==='police'){
    let w=2.1,l=4.6;
    box(0,.9,0,w,.9,l,mat('#ffffff',.3),g);
    box(w/2+.02,1,0,.02,.35,l*.8,new THREE.MeshStandardMaterial({map:policeLiveryTex}),g);
    box(-w/2-.02,1,0,.02,.35,l*.8,new THREE.MeshStandardMaterial({map:policeLiveryTex}),g);
    box(0,1.75,-.2,w*.9,.85,l*.58,glass,g);
    box(0,2.2,-.2,w*.94,.12,l*.6,mat('#ffffff'),g);
    box(0,.8,l/2+.12,w*.8,.5,.15,rubber,g);
    box(0,.9,l/2+.22,w*.6,.1,.1,chrome,g);
    box(-w*.35,.95,l/2+.05,.35,.25,.08,headlight,g);
    box(w*.35,.95,l/2+.05,.35,.25,.08,headlight,g);
    box(-w*.35,.9,-l/2-.04,.3,.2,.06,taillight,g);
    box(w*.35,.9,-l/2-.04,.3,.2,.06,taillight,g);
    box(0,2.35,-.2,w*.5,.15,.2,mat('#222222'),g);
    box(-.35,2.45,-.2,.3,.15,.2,beaconRed,g);
    box(.35,2.45,-.2,.3,.15,.2,beaconBlue,g);
    let spTire=mesh(new THREE.CylinderGeometry(.45,.45,.28,14),rubber,0,1,-l/2-.2,g);
    spTire.rotation.x=Math.PI/2;
    for(let x of [-w/2,w/2])for(let z of [-l*.3,l*.3]){
      let wh=mesh(new THREE.CylinderGeometry(.46,.46,.28,14),rubber,x,.48,z,g);wh.rotation.z=Math.PI/2;
      cyl(x*1.02,.48,z,.25,.29,chrome,g,10).rotation.z=Math.PI/2;
    }
  } else if(type==='vip'){
    let w=2.2,l=4.9;
    box(0,.95,0,w,.85,l,mat('#fcfbfa',.25),g);
    box(0,1.8,-.1,w*.9,.85,l*.62,glass,g);
    box(0,2.25,-.1,w*.92,.12,l*.64,mat('#fcfbfa'),g);
    box(0,.95,l/2+.04,w*.7,.3,.08,chrome,g);
    box(-w*.4,2.35,-.1,.08,.1,l*.5,chrome,g);
    box(w*.4,2.35,-.1,.08,.1,l*.5,chrome,g);
    box(-w*.35,.95,l/2+.04,.4,.2,.08,headlight,g);
    box(w*.35,.95,l/2+.04,.4,.2,.08,headlight,g);
    box(-w*.35,.95,-l/2-.04,.35,.2,.06,taillight,g);
    box(w*.35,.95,-l/2-.04,.35,.2,.06,taillight,g);
    for(let x of [-w/2,w/2])for(let z of [-l*.3,l*.3]){
      let wh=mesh(new THREE.CylinderGeometry(.48,.48,.28,14),rubber,x,.5,z,g);wh.rotation.z=Math.PI/2;
      cyl(x*1.02,.5,z,.28,.29,chrome,g,12).rotation.z=Math.PI/2;
    }
  } else if(type==='bus'){
    let w=2.8,l=9.5;
    box(0,1.7,0,w,2.1,l,mat(color,.4),g);
    box(0,2.2,l/2+.04,w*.88,.95,.08,glass,g);
    box(0,2.8,l/2+.06,w*.7,.35,.08,mat('#111111'),g);
    for(let k=0;k<6;k++)for(let side of [-1,1]){
      box(side*(w/2+.02),2.1,-l*.3+k*l*.11,.06,.75,.85,glass,g);
    }
    box(0,.7,l/2+.06,w*.92,.35,.15,mat('#3a3a3a'),g);
    box(0,.7,-l/2-.06,w*.92,.35,.15,mat('#3a3a3a'),g);
    box(-w*.38,.8,l/2+.08,.35,.25,.08,headlight,g);
    box(w*.38,.8,l/2+.08,.35,.25,.08,headlight,g);
    box(-w*.38,.8,-l/2-.08,.35,.25,.08,taillight,g);
    box(w*.38,.8,-l/2-.08,.35,.25,.08,taillight,g);
    for(let x of [-w/2,w/2]){
      mesh(new THREE.CylinderGeometry(.55,.55,.32,16),rubber,x,.55,l*.32,g).rotation.z=Math.PI/2;
      mesh(new THREE.CylinderGeometry(.55,.55,.32,16),rubber,x,.55,-l*.28,g).rotation.z=Math.PI/2;
    }
  } else if(type==='auto'){
    box(0,.75,-.15,1.5,.65,2.4,mat('#157a3b'),g);
    box(0,1.45,-.2,1.4,.75,2.1,mat('#f5c318'),g);
    box(0,1.3,1.05,1.3,.6,.08,glass,g);
    let fwh=mesh(new THREE.CylinderGeometry(.32,.32,.2,12),rubber,0,.35,1.1,g);fwh.rotation.z=Math.PI/2;
    for(let x of [-.75,.75]){
      mesh(new THREE.CylinderGeometry(.32,.32,.2,12),rubber,x,.35,-.75,g).rotation.z=Math.PI/2;
    }
    box(0,.8,1.25,.25,.25,.1,headlight,g);
  } else {
    let w=1.9,l=4.3;
    box(0,.9,0,w,.8,l,mat(color,.3),g);
    box(0,1.65,-.2,w*.85,.75,l*.52,glass,g);
    box(0,2.05,-.2,w*.88,.1,l*.54,mat(color),g);
    box(-w*.33,.85,l/2+.04,.35,.2,.06,headlight,g);
    box(w*.33,.85,l/2+.04,.35,.2,.06,headlight,g);
    box(-w*.33,.85,-l/2-.04,.3,.2,.06,taillight,g);
    box(w*.33,.85,-l/2-.04,.3,.2,.06,taillight,g);
    for(let x of [-w/2,w/2])for(let z of [-l*.3,l*.3]){
      mesh(new THREE.CylinderGeometry(.42,.42,.25,12),rubber,x,.45,z,g).rotation.z=Math.PI/2;
    }
  }
  return g;
}

for(let [name,u,v,w,d] of [['P1',.17,.64,.08,.15],['P2',.28,.54,.07,.06],['P3',.58,.12,.085,.085],['P4',.593,.562,.09,.095],['P5',.36,.815,.09,.035]]){
  let q=pt(u+w/2,v+d/2);
  box(q.x,.02,q.z,w*600,.08,d*450,mat('#9e947d'));
  for(let r=0;r<3;r++)for(let j=0;j<5;j++){
    let cType=name==='P2'?'bus':(r===0&&j===0)?'police':(j%2===0)?'vip':'sedan';
    car(u+.008+j*w/5,v+.01+r*d/3,['#f5f5f0','#38424a','#b8b09d','#8a221b'][Math.floor(rand()*4)],0,cType);
  }
  sign(name+' PARKING',u+w/2,v+d/2,9);
}

for(let i=0;i<18;i++){
  let vType=i%4===0?'police':i%3===0?'bus':i%2===0?'vip':'sedan';
  car(.1+i*.04,.855-i*.013,['#f2f2eb','#2b3238','#c8baa5'][i%3],-1.26,vType);
}

for(let r=0;r<3;r++)for(let j=0;j<9;j++){
  let q=pt(.362+j*.003,.617+r*.005);
  let g=new THREE.Group();g.position.copy(q);scene.add(g);
  box(0,.6,0,.25,.5,1.2,mat('#2b333a'),g);
  cyl(0,.4,.45,.22,.1,rubber,g,10).rotation.z=Math.PI/2;
  cyl(0,.4,-.45,.22,.1,rubber,g,10).rotation.z=Math.PI/2;
  box(0,.9,.3,.6,.08,.08,chrome,g);
}

for(let i=0;i<5;i++)car(.368+i*.005,.75,'#dedbd2',1.57,'auto');

// --- CROWD & HUMAN SCALE DEVOTEES / SEWADARS ---
const crowdGroup=new THREE.Group();scene.add(crowdGroup);
function person(x,z,isSewadar=false,rot=0){
  let g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;crowdGroup.add(g);
  // Legs
  box(-.12,.45,0,.14,.9,.16,mat('#111111'),g);
  box(.12,.45,0,.14,.9,.16,mat('#111111'),g);
  // Torso / White Kurta or Volunteer Blue Sash
  box(0,1.35,0,.52,.85,.28,isSewadar?mat('#1a4f8a'):mat('#f4f4ee'),g);
  // Head
  mesh(new THREE.SphereGeometry(.17,10,8),mat('#b88e68'),0,1.95,0,g);
  // Headwear / Turban / Scarf
  cyl(0,2.08,0,.19,.12,isSewadar?mat('#e8c412'):mat('#ffffff'),g,10);
}
// Crowd along VIP Red Carpet and Gate 1 Entrance
for(let i=0;i<45;i++){
  let px=pandal.x+(rand()-.5)*8,pz=pandal.z+44+rand()*24;
  person(px,pz,rand()>.65,rand()*Math.PI*2);
}
// Queues at Security Gate 1 & 2
for(let i=0;i<35;i++){
  let g1=pt(.357,.75);person(g1.x+(rand()-.5)*6,g1.z+(rand()-.5)*8,rand()>.7,0);
  let g2=pt(.495,.70);person(g2.x+(rand()-.5)*6,g2.z+(rand()-.5)*8,rand()>.7,0);
}

// --- DIVERSE REALISTIC TREES ---
function tree(u,v,type='neem'){
  let q=pt(u,v),g=new THREE.Group();g.position.copy(q);scene.add(g);
  if(type==='ashoka'){
    cyl(0,2,0,.22,4,mat('#574635'),g);
    for(let h=2;h<9;h+=1.2){
      let r=(1-(h-2)/8)*1.4+.5;
      mesh(new THREE.ConeGeometry(r,1.6,10),mat(['#385427','#2e451e','#43632f'][Math.floor(rand()*3)]),0,h,0,g);
    }
  } else {
    cyl(0,2.2,0,.45,4.4,mat('#5c4a36'),g);
    let leafMats=[mat('#4c6b32'),mat('#3e5728'),mat('#597a3b')];
    for(let i=0;i<4;i++){
      let rx=(rand()-.5)*2.6,rz=(rand()-.5)*2.6,ry=5+rand()*2;
      mesh(new THREE.IcosahedronGeometry(2.4+rand()*.6,2),leafMats[i%3],rx,ry,rz,g);
    }
  }
}
for(let i=0;i<130;i++){
  let u=.08+rand()*.84,v=.09+rand()*.72;
  if(u<.14||u>.85||v<.14)tree(u,v,rand()>.4?'neem':'ashoka');
}
for(let i=0;i<14;i++){
  tree(.35+i*.004,.73-i*.008,'ashoka');
  tree(.365+i*.004,.73-i*.008,'ashoka');
}

// Security Gates & Checkpoints with Boom Barriers
for(let [t,u,v] of [['GATE 1',.357,.75],['GATE 2',.495,.70],['GATE 3',.58,.68]]){
  let q=pt(u,v),g=new THREE.Group();g.position.copy(q);scene.add(g);
  box(-5,3.5,0,.8,7,.8,concrete,g);
  box(5,3.5,0,.8,7,.8,concrete,g);
  box(0,7,0,10.8,.8,.8,mat('#154256'),g);
  for(let x of [-2,0,2]){
    box(x-.6,1.4,0,.14,2.8,.4,mat('#303840'),g);
    box(x+.6,1.4,0,.14,2.8,.4,mat('#303840'),g);
    box(x,2.75,0,1.34,.16,.4,mat('#303840'),g);
  }
  for(let dx of [-4,4]){
    mesh(new THREE.ConeGeometry(.35,1.1,12),mat('#e85d17'),dx,.55,1.5,g);
    box(dx,.08,1.5,.8,.16,.8,rubber,g);
  }
  boomBarrier(q.x-4,q.z-2.5,1.57);
  sign(t,u,v,8);
}

// --- POLICE BANDOBAST RESOURCE REBUILD ---
const colors={officer:'#3a99e8',barricade:'#e9b139',traffic:'#a49adf',medical:'#e9687e',command:'#45bfa5',cctv:'#cdd8e1',water:'#60c9e8',access:'#92c986'};
const names={officer:'Police officers',barricade:'Barricades',traffic:'Traffic posts',medical:'Medical points',command:'Command posts',cctv:'CCTV',water:'Water points',access:'Emergency access'};

let defaults=[
  {type:'officer',x:.357,y:.748,label:'Gate 1 Command',qty:4,rotationDeg:0,zoneId:'auto',duty:{shift:'Morning (06:00 - 14:00)',reportingOfficer:'Insp. Rajesh Kumar',notes:'Gate 1 security & VIP entry'},officers:[]},
  {type:'officer',x:.493,y:.695,label:'Gate 2 Post',qty:4,rotationDeg:0,zoneId:'auto',duty:{shift:'Morning',reportingOfficer:'SI Suresh Verma',notes:'Public ingress'},officers:[]},
  {type:'officer',x:.578,y:.677,label:'Gate 3 Post',qty:4,rotationDeg:0,zoneId:'auto',duty:{shift:'Morning',reportingOfficer:'SI Amit Singh',notes:'East gate & parking control'},officers:[]},
  {type:'barricade',x:.346,y:.72,label:'Gate 1 Barricades',qty:4,rotationDeg:0,zoneId:'auto',duty:{shift:'',reportingOfficer:'',notes:''},officers:[]},
  {type:'traffic',x:.166,y:.491,label:'Delhi Intersection Post',qty:2,rotationDeg:0,zoneId:'auto',duty:{shift:'General',reportingOfficer:'TI Baljeet',notes:'Traffic diversion'},officers:[]},
  {type:'medical',x:.459,y:.664,label:'First Aid Centre',qty:1,rotationDeg:0,zoneId:'auto',duty:{shift:'24 Hours',reportingOfficer:'Dr. M. Sharma',notes:'Ambulance & Fire Tender on standby'},officers:[]}
];

let items=structuredClone(defaults),selected=-1,placing=false;
const resources=new THREE.Group();scene.add(resources);

function officer(g,x,z,isTraffic=false){
  let og=new THREE.Group();og.position.set(x,0,z);g.add(og);
  box(-.18,.5,0,.22,1,.24,khaki,og);
  box(.18,.5,0,.22,1,.24,khaki,og);
  box(-.18,.08,.05,.24,.16,.34,mat('#111111'),og);
  box(.18,.08,.05,.24,.16,.34,mat('#111111'),og);
  box(0,1.45,0,.68,.85,.38,isTraffic?trafficVest:khaki,og);
  box(0,1.1,0,.7,.1,.4,mat('#3d2817'),og);
  box(0,1.48,.03,.12,.8,.4,mat('#3d2817'),og);
  mesh(new THREE.SphereGeometry(.22,12,10),mat('#b88e68'),0,2.15,0,og);
  cyl(0,2.35,0,.28,.14,isTraffic?khaki:mat('#8b1c1c'),og,14);
  box(0,2.3,.15,.28,.04,.14,mat('#111111'),og);
  box(-.44,1.4,0,.18,.75,.2,isTraffic?trafficVest:khaki,og);
  box(.44,1.4,0,.18,.75,.2,isTraffic?trafficVest:khaki,og);
}

function barricade(g,x,z){
  let bg=new THREE.Group();bg.position.set(x,0,z);g.add(bg);
  box(0,1.1,0,3.2,.9,.12,mat('#f2bc18'),bg);
  box(0,1.1,.07,3.1,.82,.04,new THREE.MeshStandardMaterial({map:barricadeTex}),bg);
  for(let dx of [-1.3,1.3]){
    cyl(dx,.65,0,.06,1.3,mat('#f2bc18'),bg,8);
    box(dx,.06,0,.45,.12,.9,rubber,bg);
  }
}

function rebuild(){
  resources.clear();
  items.forEach((it,i)=>{
    let g=new THREE.Group();
    g.position.copy(pt(it.x,it.y));
    g.userData.index=i;
    resources.add(g);
    
    if(it.type==='officer'||it.type==='traffic'){
      for(let n=0;n<Math.min(it.qty,12);n++){
        officer(g,(n%4)*1.3,Math.floor(n/4)*1.5,it.type==='traffic');
      }
    } else if(it.type==='barricade'){
      for(let n=0;n<Math.min(it.qty,8);n++){
        barricade(g,n*3.4,0);
      }
    } else if(it.type==='cctv'){
      cyl(0,4,0,.14,8,chrome,g);
      box(0,8,0,.6,.3,.6,white,g);
      mesh(new THREE.SphereGeometry(.22,12,10),mat('#111111'),0,7.85,0,g);
      box(0,8.4,-.4,.8,.06,.6,mat('#1a324a'),g);
      mesh(new THREE.SphereGeometry(.08,8,8),beaconRed,0,8.2,.35,g);
    } else if(it.type==='medical'){
      box(0,1.8,0,5,3.6,4.5,mat('#ffffff'),g);
      box(0,3.7,0,5.4,.25,4.9,mat('#dddddd'),g);
      box(0,2,2.28,1.6,.45,.06,beaconRed,g);
      box(0,2,2.29,.45,1.6,.06,beaconRed,g);
    } else {
      box(0,1.8,0,4.5,3.6,4.5,mat(colors[it.type]||'#45bfa5'),g);
      box(0,3.7,0,5,.25,5,white,g);
    }
    
    let ring=mesh(new THREE.RingGeometry(2.6,2.85,32),new THREE.MeshBasicMaterial({color:i===selected?'#ffffff':colors[it.type],side:THREE.DoubleSide}),0,.18,0,g);
    ring.rotation.x=-Math.PI/2;
    g.traverse(o=>o.userData.index=i);
  });
  
  try{localStorage.setItem('ebandobast-v1',JSON.stringify(items))}catch(e){}
  
  let countsEl=$('#counts');
  if(countsEl){
    countsEl.innerHTML=Object.keys(names).map(k=>`<div>${names[k]} <b style="float:right">${items.filter(i=>i.type===k).reduce((a,b)=>a+b.qty,0)}</b></div>`).join('');
  }
  let selEl=$('#selected');
  if(selEl){
    let it=items[selected];
    selEl.innerHTML=it?'<label>Label<input id="label"></label><label>Quantity<input id="qty" type="number" min="1" max="1000"></label><button id="move">Move selected</button><button id="delete">Delete selected</button>':'Click a resource to edit.';
    if(it){
      $('#label').value=it.label;
      $('#qty').value=it.qty;
      $('#label').onchange=e=>{it.label=e.target.value;rebuild()};
      $('#qty').onchange=e=>{it.qty=Math.max(1,Math.min(1000,+e.target.value||1));rebuild()};
      $('#delete').onclick=()=>{items.splice(selected,1);selected=-1;rebuild()};
      $('#move').onclick=()=>{placing='move';$('#hint').textContent='Click the new position'};
    }
  }
}

// --- Interaction & Controls ---
let angle=-.25,elevation=.85,distance=480,target=new THREE.Vector3(0,0,25),tour=false,drag=null;
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();

function resize(){
  renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);
  camera.aspect=canvas.clientWidth/canvas.clientHeight;
  camera.updateProjectionMatrix();
}
window.onresize=resize;

function animate(){
  if(globalThis.venueTrafficTick)globalThis.venueTrafficTick();
  if(tour)angle+=.0012;
  camera.position.set(
    target.x+Math.sin(angle)*Math.cos(elevation)*distance,
    target.y+Math.sin(elevation)*distance,
    target.z+Math.cos(angle)*Math.cos(elevation)*distance
  );
  camera.lookAt(target);
  if(globalThis.pdfFineLabels)globalThis.pdfFineLabels.children.forEach(o=>{
    o.visible=distance<250||/P1 |P2 |P3 |P4 |SC Parking|Langar|Exhibition|Police chowki/.test(o.userData.feature[0]);
  });
  if(globalThis.smartVenueLabels)globalThis.smartVenueLabels();
}

canvas.oncontextmenu=e=>e.preventDefault();
canvas.onpointerdown=e=>{
  drag={x:e.offsetX,y:e.offsetY,a:angle,b:elevation,tx:target.x,tz:target.z,button:e.button,moved:false};
  canvas.setPointerCapture(e.pointerId);
};
canvas.onpointermove=e=>{
  if(!drag)return;
  let dx=e.offsetX-drag.x,dy=e.offsetY-drag.y;
  if(Math.hypot(dx,dy)>4)drag.moved=true;
  if(drag.button===2){
    target.x=drag.tx-dx*distance/700;
    target.z=drag.tz-dy*distance/700;
  }else{
    angle=drag.a-dx*.006;
    elevation=Math.max(.06,Math.min(1.55,drag.b+dy*.004));
  }
};
canvas.onpointerup=e=>{
  if(drag&&!drag.moved){
    mouse.set(e.offsetX/canvas.clientWidth*2-1,-e.offsetY/canvas.clientHeight*2+1);
    ray.setFromCamera(mouse,camera);
    if(placing){
      let hit=ray.intersectObject(ground)[0];
      if(hit){
        let x=hit.point.x/600+.5,y=hit.point.z/450+.5;
        if(x>=0&&x<=1&&y>=0&&y<=1){
          if(placing==='move'){items[selected].x=x;items[selected].y=y}
          else{items.push({type:$('#type').value,x,y,label:names[$('#type').value],qty:1,rotationDeg:0,zoneId:'auto',duty:{shift:'',reportingOfficer:'',notes:''},officers:[]});selected=items.length-1}
          placing=false;rebuild();
        }
      }
    }else{
      let hit=ray.intersectObjects(resources.children,true)[0];
      selected=hit?hit.object.userData.index:-1;rebuild();
    }
  }
  drag=null;
};
canvas.onwheel=e=>{e.preventDefault();distance=Math.max(25,Math.min(1000,distance+e.deltaY*.3));};

function smoothView(a,e,d,x=0,z=25){
  tour=false;
  let state={a:angle,e:elevation,d:distance,x:target.x,z:target.z};
  gsap.to(state,{a,e,d,x,z,duration:1.5,ease:'power2.inOut',onUpdate:()=>{
    angle=state.a;elevation=state.e;distance=state.d;target.set(state.x,0,state.z);
  }});
}

$('#iso').onclick=()=>smoothView(-.25,.85,480);
$('#top').onclick=()=>smoothView(0,1.55,510);
$('#yaw').oninput=e=>angle=+e.target.value*Math.PI/180;
$('#tilt').oninput=e=>elevation=Math.max(.08,(90-+e.target.value)*Math.PI/180);
$('#zoom').oninput=e=>distance=500*90/+e.target.value;
$('#land').onchange=e=>structures.visible=e.target.checked;
$('#scanToggle').parentElement.style.display='none';
$('#place').onclick=()=>{placing=true;$('#hint').textContent='Click ground to place selected resource'};

function download(blob,name){
  let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
$('#save').onclick=()=>download(new Blob([JSON.stringify({version:3,items},null,2)],{type:'application/json'}),'e-bandobast-deployment.json');
$('#png').onclick=()=>{renderer.render(scene,camera);canvas.toBlob(b=>download(b,'e-bandobast-realistic-view.png'))};
$('#reset').onclick=()=>{if(confirm('Restore example deployment?')){items=structuredClone(defaults);selected=-1;rebuild()}};

$('#obj').textContent='Download current 3D geometry OBJ';
$('#obj').onclick=()=>{
  let lines=['# E-Bandobast realistic 3D model.'],offset=0;
  scene.updateMatrixWorld(true);
  scene.traverse(o=>{
    if(!o.isMesh||o===ground||o===skyDome)return;
    let g=o.geometry,p=g.attributes.position,idx=g.index;
    if(!p)return;
    lines.push('o object_'+o.id);
    let v=new THREE.Vector3();
    for(let i=0;i<p.count;i++){
      v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);
      lines.push(`v ${v.x.toFixed(3)} ${v.y.toFixed(3)} ${v.z.toFixed(3)}`);
    }
    let count=idx?idx.count:p.count;
    for(let i=0;i<count;i+=3)lines.push('f '+[0,1,2].map(j=>offset+(idx?idx.getX(i+j):i+j)+1).join(' '));
    offset+=p.count;
  });
  download(new Blob([lines.join('\n')]),'e-bandobast-detailed-model.obj');
};

let btn=document.createElement('button');btn.textContent='▶ Fly around site';
btn.onclick=()=>{tour=!tour;btn.textContent=tour?'■ Stop fly-through':'▶ Fly around site'};
$('#iso').parentElement.after(btn);
let low=document.createElement('button');low.textContent='Street-level view';
low.onclick=()=>smoothView(-.4,.12,90,0,80);
btn.after(low);
$('#hint').textContent='Drag: look around · Right-drag: pan · Wheel: zoom · Click: select';

// --- PDF Features & Landmarks ---
const pdfFeatures=[
  ["P1 Light vehicles / car parking", 0.223, 0.659, 0.045, 0.049, 1, "#bab29b"],
  ["P1 Heavy vehicles", 0.207, 0.744, 0.071, 0.11, 1, "#a6a18f"],
  ["P2 Buses & cars / daily commuters", 0.321, 0.572, 0.045, 0.044, 1, "#c1b99e"],
  ["P2 Two wheelers", 0.375, 0.626, 0.035, 0.027, 1, "#b8b49e"],
  ["P2 Parking", 0.375, 0.669, 0.034, 0.045, 1, "#b8b49e"],
  ["Invited guests / VIP I-parking (Gate 1)", 0.375, 0.723, 0.034, 0.064, 1, "#b1baa0"],
  ["P3 Light & heavy vehicle parking", 0.624, 0.162, 0.079, 0.081, 1, "#b9b29f"],
  ["P4 Light vehicles / sewadars / daily commuters / saints from abroad", 0.635, 0.589, 0.089, 0.066, 1, "#c1b49f"],
  ["P5 Daily commuters / local bus stop near foot over bridge", 0.423, 0.824, 0.07, 0.026, 1, "#c3bca8"],
  ["Exhibition", 0.426, 0.535, 0.058, 0.018, 3, "#dac6a2"],
  ["S/D Office", 0.376, 0.49, 0.035, 0.033, 3, "#c8beaa"],
  ["Toilets — P2", 0.32, 0.529, 0.07, 0.009, 2, "#b9c7bf"],
  ["Toilets — railway alighting", 0.373, 0.532, 0.034, 0.009, 2, "#b9c7bf"],
  ["Railway station & ISBT vehicles alighting", 0.373, 0.565, 0.034, 0.061, 1, "#c4b9a3"],
  ["Parking (partly clipped label)", 0.478, 0.555, 0.022, 0.025, 1, "#bfb39a"],
  ["SC Parking — north", 0.478, 0.583, 0.022, 0.027, 1, "#a1b8a0"],
  ["SC Parking — south", 0.478, 0.614, 0.022, 0.028, 1, "#a1b8a0"],
  ["Invited / VIP I-parking (Gate 2)", 0.477, 0.657, 0.028, 0.043, 1, "#a6baa0"],
  ["Waste land", 0.478, 0.69, 0.024, 0.02, 1, "#9eaa86"],
  ["Langar — Gate 2", 0.517, 0.602, 0.032, 0.062, 4, "#d2c4a9"],
  ["Langar — central", 0.504, 0.361, 0.031, 0.099, 4, "#d2c4a9"],
  ["Langar — north", 0.538, 0.247, 0.025, 0.096, 4, "#d2c4a9"],
  ["Langar — west", 0.376, 0.466, 0.034, 0.097, 3, "#d2c4a9"],
  ["Toilets — east 1", 0.548, 0.605, 0.008, 0.061, 2, "#b8c4bc"],
  ["Toilets — east 2", 0.575, 0.605, 0.009, 0.061, 2, "#b8c4bc"],
  ["Sewadal residence", 0.562, 0.607, 0.019, 0.063, 4, "#c4b9a1"],
  ["Petrol pump", 0.506, 0.678, 0.012, 0.027, 3, "#e1d1b6"],
  ["Adjoining plot (small text unclear)", 0.52, 0.679, 0.013, 0.027, 1, "#b9b296"],
  ["Police chowki", 0.539, 0.676, 0.025, 0.034, 3, "#c6c0ab"],
  ["Karishna Polymer (as printed)", 0.621, 0.632, 0.051, 0.057, 4, "#b6b2a3"],
  ["SNCF Nursery (as printed)", 0.721, 0.471, 0.035, 0.014, 1, "#7d9c6b"],
  ["Alighting — east gate", 0.594, 0.464, 0.029, 0.037, 1, "#c4b9a3"]
];

const detailGroup=new THREE.Group();scene.add(detailGroup);
for(let [name,u,v,w,d,h,color] of pdfFeatures){
  let q=pt(u,v);
  let flat=/parking|alighting|waste|nursery|adjoining/i.test(name);
  let hh=flat?.04:h;
  box(q.x,hh/2+.02,q.z,w*600,hh,d*450,mat(flat?'#a79c83':color),detailGroup);
  if(!flat&&h>1.5){
    box(q.x,h+.2,q.z,w*600+.3,.3,d*450+.3,concrete,detailGroup);
  }
}

const extraRoads=[
  [[.465,.54],[.465,.665],[.492,.665]],
  [[.492,.54],[.492,.636],[.58,.636]],
  [[.492,.418],[.58,.418],[.58,.478],[.604,.48]],
  [[.3,.418],[.396,.418]],
  [[.3,.525],[.396,.525]],
  [[.465,.497],[.465,.312],[.492,.312]],
  [[.492,.312],[.492,.2]],
  [[.77,.199],[.75,.204],[.718,.238],[.718,.292],[.768,.321],[.8,.297]],
  [[.18,.64],[.245,.64],[.245,.69],[.166,.69]],
  [[.576,.51],[.677,.519],[.684,.54],[.684,.635],[.672,.652]],
  [[.57,.103],[.78,.094]]
];
extraRoads.forEach(r=>road(r,3.5,.18));

for(let r of [
  [[.303,.413],[.303,.34],[.339,.34]],
  [[.35,.34],[.406,.34],[.406,.302],[.465,.302]],
  [[.502,.498],[.568,.498]],
  [[.658,.36],[.672,.36],[.672,.327]],
  [[.62,.49],[.703,.5],[.703,.609]]
]){
  for(let i=1;i<r.length;i++){
    beam(pt(...r[i-1],1.1),pt(...r[i],1.1),.35,2.2,mat('#b6ad96'));
  }
}

sign('VILLAGE PANCHI GUJRAN',.105,.57,10);
sign('VILLAGE BHODWAL MAJRI',.85,.22,10);
sign('VILLAGE PATTI KALYANA',.78,.55,10);
sign('TO GANAUR',.128,.29,8);
sign('TO DELHI',.07,.877,8);
sign('TO AMBALA',.87,.61,8);
sign('RAILWAY TO DELHI',.24,.17,8);

const flows=new THREE.Group();scene.add(flows);
function flow(points,color){
  for(let i=1;i<points.length;i++){
    let a=pt(...points[i-1],.55),b=pt(...points[i],.55),delta=b.clone().sub(a),len=delta.length();
    for(let t=3;t<len;t+=13){
      let arrow=new THREE.ArrowHelper(delta.clone().normalize(),a.clone().addScaledVector(delta,t/len),4.5,color,1.8,1.3);
      flows.add(arrow);
    }
  }
}
flow([[.07,.863],[.35,.763],[.35,.608],[.31,.608],[.23,.49],[.165,.49],[.165,.79]],'#ba71a0');
flow([[.87,.619],[.70,.673],[.60,.706],[.50,.737],[.36,.783]],'#3a7fa8');
flow([[.35,.742],[.35,.612],[.397,.612],[.397,.418],[.556,.418],[.557,.204],[.59,.18],[.65,.175]],'#3a7fa8');
flow([[.81,.608],[.703,.649],[.69,.62],[.69,.561],[.64,.55],[.60,.52],[.62,.49]],'#c47c83');
flow([[.35,.758],[.376,.71],[.376,.678]],'#458f7d');
flow([[.495,.707],[.495,.65],[.477,.65]],'#458f7d');

const legendRows=[
  ['#ba71a0','1 · Outstation vehicles from Delhi side'],
  ['#ba71a0','2 · Delhi: sewadars on duty / daily commuters / chartered buses'],
  ['#b56e79','3 · Parking P1'],
  ['#3a7fa8','4 · Delhi: sewadars / daily commuters — Parking P2'],
  ['#3a7fa8','5 · Outstation vehicles from Ambala side'],
  ['#3a7fa8','6 · Ambala: sewadars on duty / daily commuters'],
  ['#3a7fa8','7 · Ambala outstation vehicles — Parking P3'],
  ['#3a7fa8','8 · Ambala: sewadars / daily up & down — Parking P4'],
  ['#c47c83','9 · Saints from abroad — Parking P4'],
  ['#458f7d','10 · Vehicles for SC parking'],
  ['#458f7d','11 · Invited guests / VIP I-parking']
];

let labels=new THREE.Group();scene.add(labels);
let index=document.createElement('section');
index.innerHTML='<h2>PDF landmarks / jump to</h2><input id="searchPdf" placeholder="Search parking, langar, toilets…"><select id="pdfIndex" size="7" style="height:150px"></select><label><input id="flowToggle" class="check" type="checkbox" checked> PDF route arrows</label><label><input id="pdfOverlay" class="check" type="checkbox"> Original scan on ground</label><button id="sourceButton">View original drawing</button><h2>PDF traffic legend</h2>'+legendRows.map(([c,t])=>'<p class="note" style="margin:7px 0"><span style="color:'+c+'">➜</span> '+t+'</p>').join('')+'<p class="note">Road labels in PDF: R-2 90\u2032; 60\u2032 wide; 44\u2032 wide; government road. The drawing does not provide a surveyed scale. Route arrows here are schematic; consult the original scan for each turn.</p>';
document.querySelector('aside').prepend(index);

function populate(q=''){
  let sel=$('#pdfIndex');sel.innerHTML='';
  pdfFeatures.forEach((f,i)=>{
    if(f[0].toLowerCase().includes(q.toLowerCase())){
      let o=document.createElement('option');o.value=i;o.textContent=f[0];sel.append(o);
    }
  });
}
populate();
$('#searchPdf').oninput=e=>populate(e.target.value);
$('#pdfIndex').onchange=e=>{
  let f=pdfFeatures[+e.target.value];
  smoothView(angle,.65,110,(f[1]-.5)*600,(f[2]-.5)*450);
  $('#status').textContent=f[0];
};
$('#flowToggle').onchange=e=>flows.visible=e.target.checked;

// --- SOURCE IMAGE INJECTION HERE ---
''' + source_img_code + r'''

let scanMesh=null;
$('#pdfOverlay').onchange=e=>{
  if(e.target.checked){
    if(!scanMesh){
      let cv=document.createElement('canvas');cv.width=1024;cv.height=768;
      let ctx=cv.getContext('2d');
      let tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
      let img=new Image();
      img.onload=()=>{
        cv.width=img.width||1024;cv.height=img.height||768;
        ctx.drawImage(img,0,0);
        tex.needsUpdate=true;
      };
      img.src=sourceImage;
      scanMesh=mesh(new THREE.PlaneGeometry(600,450),new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.75,toneMapped:false}),0,.25,0);
      scanMesh.rotation.x=-Math.PI/2;
      scanMesh.name='scanMesh';
    }
    scanMesh.visible=true;
  }else if(scanMesh){
    scanMesh.visible=false;
  }
};

$('#sourceButton').onclick=()=>{
  let w=window.open('','_blank');
  if(w)w.document.write('<title>Original Scan</title><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center"><img style="max-width:100%;max-height:100vh" src="'+sourceImage+'"></body>');
};

let focusLabel=null;
$('#pdfIndex').addEventListener('change',e=>{
  if(focusLabel)scene.remove(focusLabel);
  let f=pdfFeatures[+e.target.value];
  if(f){
    let cv=document.createElement('canvas');cv.width=512;cv.height=90;let c=cv.getContext('2d');
    c.fillStyle='#0f5a34';c.fillRect(0,0,512,90);
    c.strokeStyle='#ffffff';c.lineWidth=4;c.strokeRect(4,4,504,82);
    c.fillStyle='white';c.textAlign='center';c.font='bold 28px Arial';c.fillText(f[0],256,54);
    focusLabel=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false}));
    focusLabel.position.copy(pt(f[1],f[2],f[5]+6));
    focusLabel.scale.set(32,5.6,1);
    scene.add(focusLabel);
  }
});

const palette={delhi:'#ba71a0',ambala:'#3a7fa8',abroad:'#c47c83',sc:'#458f7d',outline:'#303934',paper:'#e6deca'};
function flatMaterial(color){return new THREE.MeshBasicMaterial({color,toneMapped:false})}
const sourceLines=new THREE.Group();scene.add(sourceLines);

for(let r of [...roads,...extraRoads,highway]){
  for(let i=1;i<r.length;i++){
    let a=pt(...r[i-1],.45),b=pt(...r[i],.45),delta=b.clone().sub(a),len=delta.length();
    if(len<.1)continue;
    let n=new THREE.Vector3(-delta.z,0,delta.x).normalize();
    for(let side of [-1,1]){
      let offset=n.clone().multiplyScalar(side*3.2);
      beam(a.clone().add(offset),b.clone().add(offset),.18,.05,flatMaterial(palette.ambala),sourceLines);
    }
  }
}

const fineLabels=new THREE.Group();scene.add(fineLabels);
function featureLabel(f){
  let [name,u,v]=f;
  let text=name.replace(' (as printed)','').replace(' (partly clipped label)','').replace(' (small text unclear)','');
  let cv=document.createElement('canvas');cv.width=256;cv.height=52;let c=cv.getContext('2d');
  c.fillStyle='rgba(15,25,35,0.85)';c.fillRect(0,0,256,52);
  c.strokeStyle='#3f6880';c.strokeRect(2,2,252,48);
  c.fillStyle='#eaf3f8';c.textAlign='center';c.font='bold 19px Arial';c.fillText(text.slice(0,25),128,34);
  let sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:true}));
  sp.position.copy(pt(u,v,f[5]+2));
  sp.scale.set(16,3.3,1);
  sp.userData.feature=f;
  fineLabels.add(sp);
}
pdfFeatures.forEach(featureLabel);

let audit=document.createElement('section');
audit.innerHTML='<h2>Drawing detail layers</h2><label><input id="sourceLinesToggle" class="check" type="checkbox" checked> Traced boundary lines</label><label><input id="fineLabelsToggle" class="check" type="checkbox" checked> Fine landmark labels</label><p class="note">Displays precise outlines matched against the scanned map.</p>';
document.querySelector('aside').append(audit);
$('#sourceLinesToggle').onchange=e=>sourceLines.visible=e.target.checked;
$('#fineLabelsToggle').onchange=e=>fineLabels.visible=e.target.checked;

function decorateFootprint(points,h,obj){
  let wm=mat('#3b5563',.25),frame=mat('#d4cbba'),base=mat('#8c826e');
  for(let i=0;i<points.length;i++){
    let a=pt(...points[i]),b=pt(...points[(i+1)%points.length]),v=b.clone().sub(a),len=v.length();
    if(len<2)continue;
    v.normalize();
    let area=points.reduce((sum,p,k)=>{let q=points[(k+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1]},0);
    let n=new THREE.Vector3(v.z,0,-v.x).multiplyScalar(area>0?1:-1);
    let ledge=beam(a.clone().setY(.4),b.clone().setY(.4),.25,.8,base);scene.remove(ledge);structures.add(ledge);
    let roof=beam(a.clone().setY(h+.15),b.clone().setY(h+.15),.35,.3,frame);scene.remove(roof);structures.add(roof);
    for(let t=1.8;t<len-1;t+=3.4){
      let q=a.clone().addScaledVector(v,t).addScaledVector(n,.05);
      let ww=box(q.x,Math.min(2,h*.6),q.z,1.3,Math.min(1.2,h*.34),.07,wm,structures);
      ww.rotation.y=Math.atan2(-v.z,v.x);
      let sill=box(q.x,Math.min(2,h*.6)-.69,q.z,1.5,.1,.16,frame,structures);
      sill.rotation.y=ww.rotation.y;
    }
  }
}

// Lighting Environment Modes: Day / Golden Sunset / Night Bandobast
function setEnvironmentTime(mode){
  if(mode==='sunset'){
    scene.background.set('#cf7e52');
    scene.fog.color.set('#c87448');
    sun.color.set('#ff9944');
    sun.intensity=2.3;
    sun.position.set(-450,110,-260);
    hemiLight.color.set('#e89265');
    hemiLight.groundColor.set('#3a2418');
    hemiLight.intensity=.95;
    renderer.toneMappingExposure=1.12;
    floodlightGroup.visible=true;
    nightWindowGlow.visible=false;
  }else if(mode==='night'){
    scene.background.set('#0b1424');
    scene.fog.color.set('#0a1320');
    sun.color.set('#485b80');
    sun.intensity=.4;
    sun.position.set(-150,280,-120);
    hemiLight.color.set('#162540');
    hemiLight.groundColor.set('#0c1218');
    hemiLight.intensity=.45;
    renderer.toneMappingExposure=1.35;
    floodlightGroup.visible=true;
    nightWindowGlow.visible=true;
  }else{
    scene.background.set('#b5cee0');
    scene.fog.color.set('#b4cee0');
    sun.color.set('#fff4de');
    sun.intensity=2.75;
    sun.position.set(-220,340,-170);
    hemiLight.color.set('#c2dff5');
    hemiLight.groundColor.set('#4a4032');
    hemiLight.intensity=1.15;
    renderer.toneMappingExposure=1.05;
    floodlightGroup.visible=false;
    nightWindowGlow.visible=false;
  }
}

const allSignSprites=scene.children.filter(o=>o.isSprite&&o!==sunSprite);
let realism=document.createElement('section');
realism.innerHTML=`
<h2>Real-World Environment</h2>
<label>Lighting Mode
  <select id="envMode" style="margin-top:4px">
    <option value="day">☀️ Bright Daylight</option>
    <option value="sunset">🌅 Golden Sunset</option>
    <option value="night">🌙 Night Bandobast (Floodlights ON)</option>
  </select>
</label>
<label>Daylight brightness<input id="brightness" type="range" min="60" max="140" value="105"></label>
<label><input id="signsToggle" class="check" type="checkbox" checked> Sign labels</label>
<label><input id="crowdToggle" class="check" type="checkbox" checked> Pedestrian crowds & sewadars</label>
<p class="note">High-mast stadium floodlights, Indian train, fire tenders, water tankers, rural farmlands, boom barriers & 3D crowds.</p>
`;
audit.after(realism);
$('#envMode').onchange=e=>setEnvironmentTime(e.target.value);
$('#brightness').oninput=e=>renderer.toneMappingExposure=+e.target.value/100;
$('#signsToggle').onchange=e=>allSignSprites.forEach(o=>o.visible=e.target.checked);
$('#crowdToggle').onchange=e=>crowdGroup.visible=e.target.checked;

// UI Styling & Tabs Layout
let uiStyle=document.createElement('style');
uiStyle.textContent=`
header{background:linear-gradient(100deg,#0e2333,#091420)}
header .badge{background:#174044;color:#aee2df;padding:4px 8px;border-radius:4px}
aside{padding:15px;background:#0d1d2b}
main{grid-template-columns:315px 1fr}
h2{margin:18px 0 9px}
.panel-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;position:sticky;top:0;z-index:4;background:#0d1d2b;padding:4px 0 10px}
.tab-btn{background:#162c3f;color:#9ec2d8;border:1px solid #304d65;border-radius:6px;padding:7px 2px;cursor:pointer;font-size:11px}
.tab-btn.active{background:#235277;color:#fff;font-weight:bold;border-color:#5ea0d0}
.map-panel{display:none}
.map-panel.active{display:block}
`;
document.head.append(uiStyle);

const side=document.querySelector('aside'),nodes=[...side.children],panels={deploy:document.createElement('div'),view:document.createElement('div'),audit:document.createElement('div'),files:document.createElement('div')};
let tabs=document.createElement('nav');tabs.className='panel-tabs';side.append(tabs);
Object.entries(panels).forEach(([k,p],i)=>{
  p.className='map-panel'+(i===0?' active':'');
  let b=document.createElement('button');b.className='tab-btn'+(i===0?' active':'');
  b.textContent={deploy:'Deploy',view:'View',audit:'Audit',files:'Files'}[k];
  b.onclick=()=>{
    document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.map-panel').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');p.classList.add('active');
  };
  tabs.append(b);side.append(p);
});
nodes.forEach(n=>{
  if(n===index||n.contains($('#searchPdf')))panels.view.append(n);
  else if(n===audit||n===realism)panels.audit.append(n);
  else if(n.querySelector&&n.querySelector('#save,#load,#png,#obj'))panels.files.append(n);
  else panels.deploy.append(n);
});

// Highway Traffic Preview
let previewTraffic=false;
let trafficActors=[];
for(let i=0;i<8;i++){
  let actor=car(.03,.88,['#ffffff','#2b353e','#c74232','#ded5c5'][i%4],0,i%3===0?'police':i%2===0?'bus':'sedan');
  actor.visible=false;
  trafficActors.push(actor);
}
let lengths=[],total=0;
for(let i=1;i<highway.length;i++){
  let a=pt(...highway[i-1]),b=pt(...highway[i]);
  lengths.push(a.distanceTo(b));total+=a.distanceTo(b);
}
globalThis.venueTrafficTick=()=>{
  if(!previewTraffic)return;
  let seconds=performance.now()/1000;
  trafficActors.forEach((actor,i)=>{
    let d=(seconds*12+i*total/8)%total,idx=0;
    while(d>lengths[idx]&&idx<lengths.length-1){d-=lengths[idx];idx++}
    let a=pt(...highway[idx]),b=pt(...highway[idx+1]),dir=b.clone().sub(a).normalize(),n=new THREE.Vector3(-dir.z,0,dir.x);
    actor.position.copy(a.lerp(b,d/lengths[idx]).addScaledVector(n,i%2===0?4.5:-4.5));
    actor.position.y=.35;
    actor.rotation.y=Math.atan2(dir.x,dir.z)+(i%2===0?0:Math.PI);
  });
};

let trafficButton=document.createElement('button');
trafficButton.textContent='Preview highway traffic';
trafficButton.onclick=()=>{
  previewTraffic=!previewTraffic;
  trafficActors.forEach(a=>a.visible=previewTraffic);
  trafficButton.textContent=previewTraffic?'Pause & hide traffic preview':'Preview highway traffic';
};
panels.view.prepend(trafficButton);

// Header Title
let h1=document.querySelector('header h1');if(h1)h1.textContent='E-Bandobast · 3D Real-World Venue Simulation';
let hSmall=document.querySelector('header small');if(hSmall)hSmall.textContent='79th Nirankari Sant Samagam · Live Security & Deployment Model';

// Smart Venue Labels
globalThis.smartVenueLabels=()=>{
  camera.updateMatrixWorld();
  let candidates=[];
  if($('#signsToggle').checked)allSignSprites.forEach(o=>candidates.push({o,priority:/GATE|PANDAL|FLYOVER/.test(o.userData.label||'')?0:2}));
  else allSignSprites.forEach(o=>o.visible=false);
  if(fineLabels.visible)fineLabels.children.forEach(o=>candidates.push({o,priority:1}));
  candidates.sort((a,b)=>a.priority-b.priority||a.o.position.distanceToSquared(target)-b.o.position.distanceToSquared(target));
  let occupied=[],shown=0;
  for(let {o} of candidates){
    let pp=o.position.clone().project(camera),dep=o.position.distanceTo(camera.position),width=Math.min(125,Math.max(85,canvas.clientWidth*.09)),units=2*dep*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))/canvas.clientHeight;
    let sx=(pp.x+1)*canvas.clientWidth/2,sy=(1-pp.y)*canvas.clientHeight/2;
    let rect=[sx-width/2-5,sy-12,width+10,24];
    let overlap=occupied.some(r=>rect[0]<r[0]+r[2]&&rect[0]+rect[2]>r[0]&&rect[1]<r[1]+r[3]&&rect[1]+rect[3]>r[1]);
    o.visible=pp.z>-1&&pp.z<1&&sx>15&&sx<canvas.clientWidth-20&&sy>30&&sy<canvas.clientHeight-115&&!overlap&&shown<14;
    if(o.visible){o.scale.set(width*units,16*units,1);occupied.push(rect);shown++;}
  }
};

const deployment=setupDeployment({
  scene,camera,canvas,ground,resources,panel:panels.deploy,filesPanel:panels.files,
  getItems:()=>items,setItems:v=>{items=v},
  getSelected:()=>selected,setSelected:i=>{selected=i},
  getPlacing:()=>placing,cancelInteraction:()=>{placing=false;drag=null},
  getRebuild:()=>rebuild,setRebuild:fn=>{rebuild=fn},
  setExport:fn=>{$('#save').onclick=fn},
  setImport:fn=>{$('#file').onchange=async e=>{const file=e.target.files?.[0];if(file)await fn(file);e.target.value=''}},
  focus:(u,v)=>smoothView(angle,.7,130,(u-.5)*600,(v-.5)*450),
  download
});

$('#hint').textContent='Drag resource to move · Drag ground to orbit · Right-drag to pan · Wheel: zoom';
rebuild();
resize();

return {
  deployment,scene,renderer,camera,canvas,update:animate,ground,resources,items,pdfFeatures,target,
  getView:()=>({distance,elevation,angle}),
  focus:(x,z,d=70)=>smoothView(angle,.35,d,x,z)
};

}
'''

out_file = Path('work/r3f-build/src/venue.js')
out_file.write_text(script_content, encoding='utf-8')
print(f"Generated enhanced real-world venue.js ({out_file.stat().st_size} bytes)")
