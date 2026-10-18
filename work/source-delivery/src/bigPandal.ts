import * as THREE from 'three';
import {gsap} from 'gsap';

interface CameraState {angle:number;elevation:number;distance:number;x:number;z:number}
interface HallAPI {scene:THREE.Scene;camera:THREE.PerspectiveCamera;renderer:THREE.WebGLRenderer;canvas:HTMLCanvasElement;smoothView:(a:number,e:number,d:number,x:number,z:number)=>void;getCameraState:()=>CameraState;setCameraState:(state:CameraState)=>void}
const globals=globalThis as typeof globalThis & {setVenueExteriorVisibility?:(visible:boolean)=>void;pandalSitePos?:{x:number;z:number}};
export function createBigPandal({scene, camera, renderer, canvas, smoothView, getCameraState, setCameraState}:HallAPI){
  const hallGroup = new THREE.Group();
  hallGroup.name = 'bigPandalHall';
  hallGroup.visible = false;
  scene.add(hallGroup);

  // Materials Cache
  const mats = {
    concrete: new THREE.MeshStandardMaterial({color:'#32363e',roughness:.85,metalness:.1}),
    fabricRoof: new THREE.MeshStandardMaterial({color:'#f8f4ec',roughness:.6,side:THREE.DoubleSide}),
    steelTruss: new THREE.MeshStandardMaterial({color:'#8e969d',roughness:.35,metalness:.8}),
    darkSteel: new THREE.MeshStandardMaterial({color:'#1f2428',roughness:.4,metalness:.7}),
    chrome: new THREE.MeshStandardMaterial({color:'#d8dee4',roughness:.15,metalness:.95}),
    gold: new THREE.MeshStandardMaterial({color:'#e5b822',roughness:.25,metalness:.85}),
    redCarpet: new THREE.MeshStandardMaterial({color:'#961622',roughness:.9}),
    greenCarpet: new THREE.MeshStandardMaterial({color:'#1f4732',roughness:.92}),
    stageWood: new THREE.MeshStandardMaterial({color:'#281c16',roughness:.7}),
    whiteSilk: new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.4}),
    cushionMaroon: new THREE.MeshStandardMaterial({color:'#70121d',roughness:.6}),
    marigoldOrange: new THREE.MeshStandardMaterial({color:'#ff7b00',roughness:.5}),
    marigoldYellow: new THREE.MeshStandardMaterial({color:'#ffc400',roughness:.5}),
    jasmineWhite: new THREE.MeshStandardMaterial({color:'#f0f5ee',roughness:.6}),
    chairCover: new THREE.MeshStandardMaterial({color:'#f4f4f4',roughness:.8}),
    chairSash: new THREE.MeshStandardMaterial({color:'#8b1c2b',roughness:.7}),
    barrierMojo: new THREE.MeshStandardMaterial({color:'#a0a6ab',roughness:.3,metalness:.85}),
    blackTech: new THREE.MeshStandardMaterial({color:'#151719',roughness:.5,metalness:.5}),
    wallPanel: new THREE.MeshStandardMaterial({color:'#e8e4dc',roughness:.75}),
    exitGreen: new THREE.MeshBasicMaterial({color:'#00e676'}),
    screenBorder: new THREE.MeshStandardMaterial({color:'#0a0d10',roughness:.3,metalness:.8})
  };

  // Helper primitives
  function box(x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material,parent:THREE.Object3D=hallGroup){
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    m.position.set(x,y,z);
    m.castShadow=m.receiveShadow=true;
    parent.add(m);
    return m;
  }
  function cyl(x:number,y:number,z:number,r:number,h:number,mat:THREE.Material,parent:THREE.Object3D=hallGroup,seg=12){
    const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),mat);
    m.position.set(x,y,z);
    m.castShadow=m.receiveShadow=true;
    parent.add(m);
    return m;
  }
  function beam(p1:THREE.Vector3,p2:THREE.Vector3,r:number,mat:THREE.Material,parent:THREE.Object3D=hallGroup){
    const v=p2.clone().sub(p1),len=v.length();
    const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,8),mat);
    m.position.copy(p1).addScaledVector(v,.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());
    m.castShadow=m.receiveShadow=true;
    parent.add(m);
    return m;
  }

  // --- 1. FLOOR & CARPETS ---
  // Main Hall Base Floor: 76m wide, 126m long
  box(0, 0, 0, 76, 0.4, 126, mats.concrete);

  // Grand Central VIP Red Carpet: 5.4m wide, runs full length to front stage
  box(0, 0.22, 5, 5.4, 0.05, 94, mats.redCarpet);
  // Gold fringe edges along red carpet
  box(-2.75, 0.23, 5, 0.1, 0.06, 94, mats.gold);
  box(2.75, 0.23, 5, 0.1, 0.06, 94, mats.gold);

  // Cross Aisle Red Carpets (at Z = 0 and Z = 28)
  box(0, 0.22, 0, 72, 0.04, 3.8, mats.redCarpet);
  box(0, 0.22, 28, 72, 0.04, 3.8, mats.redCarpet);

  // Green Seating Carpets (Devotee bays)
  // Left Bay Front & Back
  box(-19, 0.21, -18, 30, 0.03, 30, mats.greenCarpet);
  box(-19, 0.21, 14, 30, 0.03, 22, mats.greenCarpet);
  box(-19, 0.21, 42, 30, 0.03, 22, mats.greenCarpet);
  // Right Bay Front & Back
  box(19, 0.21, -18, 30, 0.03, 30, mats.greenCarpet);
  box(19, 0.21, 14, 30, 0.03, 22, mats.greenCarpet);
  box(19, 0.21, 42, 30, 0.03, 22, mats.greenCarpet);

  // VIP Red Carpet Velvet Stanchions along central aisle
  for(let z=-34; z<=48; z+=5.5){
    for(let x of [-2.9, 2.9]){
      cyl(x, 0.65, z, 0.05, 0.9, mats.chrome);
      cyl(x, 0.23, z, 0.2, 0.06, mats.chrome);
      const topBall = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), mats.gold);
      topBall.position.set(x, 1.15, z);
      hallGroup.add(topBall);
    }
    // Velvet rope segments between stanchions
    if(z < 48){
      for(let x of [-2.9, 2.9]){
        const p1 = new THREE.Vector3(x, 1.05, z);
        const p2 = new THREE.Vector3(x, 1.05, z + 5.5);
        beam(p1, p2, 0.035, mats.cushionMaroon);
      }
    }
  }

  // --- 2. GERMAN HANGER ARCHITECTURAL SHELL ---
  const hallWidth = 74, hallHeight = 19.5, numArches = 15;
  const zStart = -54, zEnd = 58;
  const archSpacing = (zEnd - zStart) / (numArches - 1);

  // Structural Curved Lattice Arches
  for(let i=0; i<numArches; i++){
    const z = zStart + i * archSpacing;
    const pts = [];
    const innerPts = [];
    const segments = 24;
    for(let s=0; s<=segments; s++){
      const angle = (s / segments) * Math.PI;
      const x = -Math.cos(angle) * (hallWidth / 2);
      const y = Math.sin(angle) * hallHeight + 0.2;
      pts.push(new THREE.Vector3(x, y, z));
      innerPts.push(new THREE.Vector3(x * 0.96, Math.max(0.2, y - 0.7), z));
    }
    // Outer chord & Inner chord
    for(let k=1; k<pts.length; k++){
      beam(pts[k-1], pts[k], 0.16, mats.steelTruss);
      beam(innerPts[k-1], innerPts[k], 0.14, mats.steelTruss);
      // Web cross-bracing
      if(k % 2 === 0){
        beam(pts[k-1], innerPts[k], 0.08, mats.steelTruss);
        beam(innerPts[k-1], pts[k], 0.08, mats.steelTruss);
      }
    }
    // Base anchor shoe columns
    cyl(-hallWidth/2, 1.5, z, 0.45, 3, mats.steelTruss);
    cyl(hallWidth/2, 1.5, z, 0.45, 3, mats.steelTruss);

    // Suspended High-Bay LED Lights hanging from arches
    if(i >= 2 && i <= numArches - 2 && i % 2 === 0){
      for(let lx of [-18, 0, 18]){
        const hangY = hallHeight * 0.78;
        cyl(lx, hangY + 1.2, z, 0.02, 2.4, mats.darkSteel); // wire
        cyl(lx, hangY, z, 0.55, 0.25, mats.darkSteel); // fixture housing
        const lightGlow = new THREE.Mesh(new THREE.CircleGeometry(0.48, 16), new THREE.MeshBasicMaterial({color:'#fff9e6'}));
        lightGlow.rotation.x = Math.PI / 2;
        lightGlow.position.set(lx, hangY - 0.13, z);
        hallGroup.add(lightGlow);
      }
    }
  }

  // Tension Fabric Roof Canopy
  const vertices:number[]=[],indices:number[]=[];
  for(let side=0;side<2;side++)for(let i=0;i<=48;i++){const a=i/48*Math.PI;vertices.push(-Math.cos(a)*hallWidth/2,Math.sin(a)*hallHeight+.2,side?zEnd:zStart)}
  for(let i=0;i<48;i++){const a=i,b=i+1,c=i+49,d=i+50;indices.push(a,c,b,b,c,d)}
  const roofGeo=new THREE.BufferGeometry();roofGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));roofGeo.setIndex(indices);roofGeo.computeVertexNormals();
  const roofMesh=new THREE.Mesh(roofGeo,mats.fabricRoof);roofMesh.name='Concept hall canopy';roofMesh.castShadow=roofMesh.receiveShadow=true;
  hallGroup.add(roofMesh);

  // Lower Side Wall Panels (3.5m high)
  const leftWall=box(-hallWidth/2, 1.8, (zStart+zEnd)/2, 0.35, 3.5, zEnd-zStart, mats.wallPanel);
  const rightWall=box(hallWidth/2, 1.8, (zStart+zEnd)/2, 0.35, 3.5, zEnd-zStart, mats.wallPanel);

  // Rear Entrance Wall & Portals (Z = zEnd)
  const entranceWall=box(0, hallHeight/2, zEnd, hallWidth, hallHeight, 0.4, mats.wallPanel);
  // Main Entrance Doors
  for(let dx of [-8, 0, 8]){
    box(dx, 2.2, zEnd - 0.1, 4.2, 4.2, 0.5, mats.darkSteel);
    box(dx, 2.2, zEnd + 0.1, 3.8, 3.8, 0.3, mats.stageWood);
  }
  // Overhead Entrance Welcome Sign
  const cvWel=document.createElement('canvas');cvWel.width=1024;cvWel.height=128;
  const ctxWel=cvWel.getContext('2d')!;
  ctxWel.fillStyle='#0f2b3e';ctxWel.fillRect(0,0,1024,128);
  ctxWel.strokeStyle='#e8c35a';ctxWel.lineWidth=6;ctxWel.strokeRect(6,6,1012,116);
  ctxWel.fillStyle='#ffffff';ctxWel.font='bold 44px Arial';ctxWel.textAlign='center';
  ctxWel.fillText('WELCOME TO GRAND SAMAGAM PANDAL • स्वागतम्',512,65);
  ctxWel.fillStyle='#e5b822';ctxWel.font='28px Arial';
  ctxWel.fillText('MAIN AUDITORIUM & CONGREGATION HALL',512,105);
  box(0, 5.8, zEnd - 0.3, 16, 2.2, 0.2, new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(cvWel),emissive:'#112233',emissiveIntensity:0.5}));

  // Front Backdrop Acoustic Wall (behind stage, Z = zStart)
  box(0, hallHeight/2, zStart, hallWidth, hallHeight, 0.4, mats.darkSteel);

  // Emergency Exits along side walls
  for(let zEx of [0, 28]){
    for(let side of [-1, 1]){
      const xEx = side * (hallWidth / 2 - 0.2);
      box(xEx, 1.8, zEx, 0.3, 3.2, 3.4, mats.darkSteel);
      // Illuminated Green EXIT sign
      const cvEx=document.createElement('canvas');cvEx.width=256;cvEx.height=64;
      const ctxEx=cvEx.getContext('2d')!;
      ctxEx.fillStyle='#00a854';ctxEx.fillRect(0,0,256,64);
      ctxEx.fillStyle='#ffffff';ctxEx.font='bold 36px Arial';ctxEx.textAlign='center';
      ctxEx.fillText('EMERGENCY EXIT ➔',128,45);
      const exMesh = box(xEx + (side > 0 ? -0.2 : 0.2), 3.8, zEx, 0.1, 0.7, 2.2, new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cvEx)}));
      if(side > 0) exMesh.rotation.y = Math.PI;
    }
  }

  // --- 3. THE GRAND FRONT STAGE (STAGE AAGE HO) ---
  const stageZ = -44, stageWidth = 42, stageDepth = 18, stageHeight = 2.4;
  const stageGroup = new THREE.Group();
  stageGroup.position.set(0, 0, stageZ);
  hallGroup.add(stageGroup);

  // Main Stage Platform
  box(0, stageHeight / 2, 0, stageWidth, stageHeight, stageDepth, mats.darkSteel, stageGroup);
  // Rich Royal Crimson Top Carpet
  box(0, stageHeight + 0.02, 0, stageWidth - 0.2, 0.04, stageDepth - 0.2, mats.redCarpet, stageGroup);
  // Gold Trim Lip around stage edge
  box(0, stageHeight + 0.04, stageDepth / 2, stageWidth, 0.08, 0.12, mats.gold, stageGroup);
  box(-stageWidth / 2, stageHeight + 0.04, 0, 0.12, 0.08, stageDepth, mats.gold, stageGroup);
  box(stageWidth / 2, stageHeight + 0.04, 0, 0.12, 0.08, stageDepth, mats.gold, stageGroup);

  // Front Stage Central Ceremonial Steps
  const numSteps = 5;
  for(let st=0; st<numSteps; st++){
    const stY = (st + 0.5) * (stageHeight / numSteps);
    const stZ = stageDepth / 2 + (numSteps - st) * 0.45;
    box(0, stY, stZ, 8, stageHeight / numSteps, 0.45, mats.redCarpet, stageGroup);
    box(0, stY + 0.15, stZ, 8.05, 0.05, 0.08, mats.gold, stageGroup);
  }

  // Floral Garland Border along stage apron (Marigold orange & yellow)
  for(let fx=-stageWidth/2 + 1; fx<=stageWidth/2 - 1; fx+=0.9){
    if(Math.abs(fx) > 4.2){ // gap for stairs
      const isYellow = Math.floor(Math.abs(fx)) % 2 === 0;
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), isYellow ? mats.marigoldYellow : mats.marigoldOrange);
      flower.position.set(fx, stageHeight + 0.18, stageDepth / 2 + 0.05);
      stageGroup.add(flower);
    }
  }

  // --- CENTRAL VIP DAIS (SANT / SATGURU / SPEAKER DAIS) ---
  const daisGroup = new THREE.Group();
  daisGroup.position.set(0, stageHeight, 0);
  stageGroup.add(daisGroup);

  // Raised Circular Dais Platform
  cyl(0, 0.22, 0, 3.8, 0.44, mats.redCarpet, daisGroup, 24);
  cyl(0, 0.46, 0, 3.82, 0.06, mats.gold, daisGroup, 24);

  // Pure White Silk Gaddi / Sacred Asan
  box(0, 0.65, 0, 3.2, 0.35, 2.4, mats.whiteSilk, daisGroup);
  // Golden Embroidered Borders
  box(0, 0.84, 1.2, 3.2, 0.04, 0.08, mats.gold, daisGroup);
  box(0, 0.84, -1.2, 3.2, 0.04, 0.08, mats.gold, daisGroup);

  // Traditional Bolster Cushions (Gao-Takiya / Masand)
  const bolster1 = cyl(0, 0.95, -0.9, 0.22, 2.8, mats.cushionMaroon, daisGroup, 16);
  bolster1.rotation.z = Math.PI / 2;
  const bolsterL = cyl(-1.4, 0.9, 0, 0.18, 1.8, mats.whiteSilk, daisGroup, 16);
  bolsterL.rotation.x = Math.PI / 2;
  const bolsterR = cyl(1.4, 0.9, 0, 0.18, 1.8, mats.whiteSilk, daisGroup, 16);
  bolsterR.rotation.x = Math.PI / 2;

  // Golden Chhatar / Royal Canopy suspended above Dais
  cyl(0, 4.8, 0, 1.6, 0.2, mats.gold, daisGroup, 24);
  const canopyDome = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.gold);
  canopyDome.position.set(0, 4.8, 0);
  daisGroup.add(canopyDome);
  cyl(0, 6.2, 0, 0.03, 2.8, mats.gold, daisGroup); // hanging support rod

  // Ceremonial Brass Samai / Tall Oil Lamp Stands
  for(let lx of [-2.6, 2.6]){
    cyl(lx, 0.75, 1.2, 0.06, 1.5, mats.gold, daisGroup);
    cyl(lx, 0.03, 1.2, 0.35, 0.06, mats.gold, daisGroup);
    cyl(lx, 1.5, 1.2, 0.22, 0.15, mats.gold, daisGroup);
    // Glowing lamp flame
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 8), new THREE.MeshBasicMaterial({color:'#ffbb22'}));
    flame.position.set(lx, 1.68, 1.2);
    daisGroup.add(flame);
  }

  // Speaker Podium with Microphones
  const podium = new THREE.Group();
  podium.position.set(3.8, stageHeight, 5.2);
  stageGroup.add(podium);
  box(0, 0.65, 0, 0.9, 1.3, 0.6, mats.stageWood, podium);
  box(0, 1.32, 0, 0.95, 0.06, 0.65, mats.chrome, podium);
  // Microphones
  cyl(-0.2, 1.52, -0.1, 0.015, 0.4, mats.darkSteel, podium);
  cyl(0.2, 1.52, -0.1, 0.015, 0.4, mats.darkSteel, podium);
  const micHead1 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), mats.blackTech);
  micHead1.position.set(-0.2, 1.72, -0.1);
  podium.add(micHead1);
  const micHead2 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), mats.blackTech);
  micHead2.position.set(0.2, 1.72, -0.1);
  podium.add(micHead2);

  // VIP Executive Chairs on Stage (Wings)
  for(let row=0; row<2; row++){
    for(let chair=0; chair<6; chair++){
      // Left Wing
      const xL = -7.5 - chair * 1.5;
      const zL = -2 + row * 1.8;
      box(xL, stageHeight + 0.4, zL, 0.7, 0.8, 0.7, mats.chairCover, stageGroup);
      box(xL, stageHeight + 0.9, zL - 0.3, 0.7, 0.7, 0.15, mats.chairCover, stageGroup);
      box(xL, stageHeight + 0.6, zL - 0.28, 0.72, 0.12, 0.16, mats.chairSash, stageGroup);
      // Right Wing
      const xR = 7.5 + chair * 1.5;
      const zR = -2 + row * 1.8;
      box(xR, stageHeight + 0.4, zR, 0.7, 0.8, 0.7, mats.chairCover, stageGroup);
      box(xR, stageHeight + 0.9, zR - 0.3, 0.7, 0.7, 0.15, mats.chairCover, stageGroup);
      box(xR, stageHeight + 0.6, zR - 0.28, 0.72, 0.12, 0.16, mats.chairSash, stageGroup);
    }
  }

  // --- GIGANTIC STAGE LED VIDEO WALLS ---
  // Main Center LED Screen: 28m wide, 10m high
  const cvMainLed = document.createElement('canvas'); cvMainLed.width = 1024; cvMainLed.height = 512;
  const ctxMain = cvMainLed.getContext('2d')!;
  function drawMainScreen(time=0){
    const grad = ctxMain.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, '#0a1d37'); grad.addColorStop(0.5, '#193f6c'); grad.addColorStop(1, '#0b203c');
    ctxMain.fillStyle = grad; ctxMain.fillRect(0, 0, 1024, 512);

    // Glowing Decorative Halo Border
    ctxMain.strokeStyle = '#d4af37'; ctxMain.lineWidth = 10; ctxMain.strokeRect(15, 15, 994, 482);
    ctxMain.strokeStyle = 'rgba(255,255,255,0.4)'; ctxMain.lineWidth = 3; ctxMain.strokeRect(26, 26, 972, 460);

    // Header Emblem
    ctxMain.fillStyle = '#ffdf6d'; ctxMain.font = 'bold 36px Arial'; ctxMain.textAlign = 'center';
    ctxMain.fillText('॥ धन निरंकार जी ॥   •   79th SANT SAMAGAM', 512, 75);

    // Main Title
    ctxMain.fillStyle = '#ffffff'; ctxMain.font = 'bold 52px "Trebuchet MS", Arial';
    ctxMain.fillText('79वां वार्षिक निरंकारी संत समागम', 512, 145);

    // Universal Symbol Ring Graphics
    ctxMain.beginPath(); ctxMain.arc(512, 275, 80, 0, Math.PI * 2);
    ctxMain.strokeStyle = '#ffcc00'; ctxMain.lineWidth = 8; ctxMain.stroke();

    ctxMain.fillStyle = '#00ffcc'; ctxMain.font = 'bold 26px Arial';
    ctxMain.fillText('EK TO AN-EK', 512, 270);
    ctxMain.fillStyle = '#ffffff'; ctxMain.font = '22px Arial';
    ctxMain.fillText('ONE TO MANY', 512, 298);

    // Live Broadcast Banner
    ctxMain.fillStyle = '#ff3333'; ctxMain.fillRect(362, 385, 300, 48);
    ctxMain.fillStyle = '#ffffff'; ctxMain.font = 'bold 25px Arial';
    ctxMain.fillText('🔴 LIVE STAGE RELAY', 512, 418);

    ctxMain.fillStyle = '#d0e5f2'; ctxMain.font = '22px Arial';
    ctxMain.fillText('SAMALKHA (PANIPAT), HARYANA', 512, 465);
  }
  drawMainScreen();
  const mainLedTex = new THREE.CanvasTexture(cvMainLed);
  mainLedTex.colorSpace = THREE.SRGBColorSpace;
  const mainLedMat = new THREE.MeshStandardMaterial({
    map: mainLedTex,
    emissive: '#1c3654',
    emissiveIntensity: 0.85,
    roughness: 0.2
  });

  // Central Screen Mesh at rear of stage (Z = stageZ - 7.5)
  box(0, stageHeight + 5.5, stageZ - 7.6, 28.6, 10.4, 0.4, mats.screenBorder);
  box(0, stageHeight + 5.5, stageZ - 7.4, 28, 9.8, 0.1, mainLedMat);

  // Flanking Side LED Screens (Portrait 6.5m x 8m)
  const cvSideLed = document.createElement('canvas'); cvSideLed.width = 512; cvSideLed.height = 640;
  const ctxSide = cvSideLed.getContext('2d')!;
  ctxSide.fillStyle = '#081726'; ctxSide.fillRect(0,0,512,640);
  ctxSide.strokeStyle = '#e8c35a'; ctxSide.lineWidth = 8; ctxSide.strokeRect(10,10,492,620);
  ctxSide.fillStyle = '#ffcc00'; ctxSide.font = 'bold 36px Arial'; ctxSide.textAlign = 'center';
  ctxSide.fillText('LIVE AUDITORIUM', 256, 70);
  ctxSide.fillText('CAMERA RELAY 1', 256, 115);
  ctxSide.fillStyle = '#00e5ff'; ctxSide.fillRect(40, 150, 432, 380);
  ctxSide.fillStyle = '#0b203c'; ctxSide.fillRect(46, 156, 420, 368);
  ctxSide.fillStyle = '#ffffff'; ctxSide.font = '32px Arial';
  ctxSide.fillText('STAGE CLOSE-UP', 256, 320);
  ctxSide.fillText('DIRECT BROADCAST', 256, 365);
  ctxSide.fillStyle = '#e0ecf4'; ctxSide.font = '24px Arial';
  ctxSide.fillText('AUDIO CHANNEL: DIGITAL STEREO', 256, 580);

  const sideLedTex = new THREE.CanvasTexture(cvSideLed);
  sideLedTex.colorSpace = THREE.SRGBColorSpace;
  const sideLedMat = new THREE.MeshStandardMaterial({map:sideLedTex, emissive:'#11283d', emissiveIntensity:0.75});

  // Left & Right Side Screens
  for(let side of [-1, 1]){
    const sx = side * 18.5;
    box(sx, stageHeight + 4.8, stageZ - 5, 6.6, 8.2, 0.4, mats.screenBorder);
    const sMesh = box(sx, stageHeight + 4.8, stageZ - 4.8, 6.2, 7.8, 0.1, sideLedMat);
    sMesh.rotation.y = -side * 0.18; // angled towards center audience
  }

  // --- OVERHEAD STAGE LIGHTING TRUSS GRID ---
  const trussY = stageHeight + 11.5;
  box(0, trussY, stageZ + 1, stageWidth - 2, 0.5, 0.5, mats.darkSteel);
  box(0, trussY, stageZ - 6, stageWidth - 2, 0.5, 0.5, mats.darkSteel);
  box(-stageWidth/2 + 2, trussY, stageZ - 2.5, 0.5, 0.5, 8, mats.darkSteel);
  box(stageWidth/2 - 2, trussY, stageZ - 2.5, 0.5, 0.5, 8, mats.darkSteel);

  // Spotlights fixtures aimed at stage
  for(let spX=-16; spX<=16; spX+=3.2){
    const spotFixture = cyl(spX, trussY - 0.4, stageZ + 1, 0.18, 0.5, mats.darkSteel);
    spotFixture.rotation.x = -Math.PI / 4;
    // Downward warm light cone (subtle transparent mesh)
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.4, 8, 12, 1, true), new THREE.MeshBasicMaterial({color:'#fff2cc',transparent:true,opacity:0.07,side:THREE.DoubleSide,depthWrite:false}));
    cone.position.set(spX, trussY - 4.5, stageZ + 1 + 2.2);
    cone.rotation.x = Math.PI - 0.25;
    hallGroup.add(cone);
  }

  // Suspended Line-Array Speaker Clusters
  for(let spSide of [-1, 1]){
    const spX = spSide * 14.5;
    const spGroup = new THREE.Group();
    spGroup.position.set(spX, trussY - 1, stageZ + 2);
    hallGroup.add(spGroup);
    cyl(0, 0.8, 0, 0.03, 1.6, mats.darkSteel, spGroup);
    // 5 curved speaker boxes in array
    for(let k=0; k<5; k++){
      const boxSp = box(0, -k * 0.45, k * 0.08, 1.4, 0.38, 0.9, mats.blackTech, spGroup);
      boxSp.rotation.x = (k + 1) * 0.06;
    }
  }

  // --- 4. AUDIENCE SEATING AREA (AUDIENCE KI BETHNE KI JAGAH HO) ---
  const audienceGroup = new THREE.Group();
  audienceGroup.name = 'audienceGroup';
  hallGroup.add(audienceGroup);

  // SECTOR A: FRONT VIP EXECUTIVE CHAIRS & TABLES
  // 5 rows of VIP chairs on both sides of central aisle
  for(let r=0; r<5; r++){
    const zRow = -31 + r * 2.4;
    for(let c=0; c<10; c++){
      // Left VIP Block
      const xL = -3.8 - c * 1.35;
      box(xL, 0.55, zRow, 0.65, 0.65, 0.6, mats.chairCover, audienceGroup);
      box(xL, 0.95, zRow + 0.28, 0.65, 0.65, 0.12, mats.chairCover, audienceGroup);
      box(xL, 0.75, zRow + 0.26, 0.67, 0.1, 0.14, mats.chairSash, audienceGroup);

      // Right VIP Block
      const xR = 3.8 + c * 1.35;
      box(xR, 0.55, zRow, 0.65, 0.65, 0.6, mats.chairCover, audienceGroup);
      box(xR, 0.95, zRow + 0.28, 0.65, 0.65, 0.12, mats.chairCover, audienceGroup);
      box(xR, 0.75, zRow + 0.26, 0.67, 0.1, 0.14, mats.chairSash, audienceGroup);
    }
    // VIP delegate front desks
    if(r === 0){
      box(-10, 0.6, zRow - 0.85, 13.5, 0.75, 0.6, mats.darkSteel, audienceGroup);
      box(10, 0.6, zRow - 0.85, 13.5, 0.75, 0.6, mats.darkSteel, audienceGroup);
    }
  }

  // VIP Sector Demarcation Mojo Barriers
  for(let x=-34; x<=34; x+=2.5){
    if(Math.abs(x) > 3.2){
      box(x, 0.7, -19.5, 2.4, 1.1, 0.08, mats.barrierMojo, audienceGroup);
      cyl(x, 0.1, -19.5, 0.22, 0.05, mats.barrierMojo, audienceGroup);
    }
  }

  // SECTOR B & C: MASS AUDIENCE SEATED ON CARPETS
  // Realistic Sant Nirankari congregation attire (predominantly serene white, cream, and Sewadal uniform)
  const devoteeColors = [
    '#ffffff', '#ffffff', '#ffffff', '#f8fafc', '#f8fafc', '#f1f5f9', '#fefdfa', '#fffdf2', '#f5ede3', '#e2edf8', '#2a4365', '#967444'
  ];
  const devoteeMats = devoteeColors.map(c => new THREE.MeshStandardMaterial({color:c, roughness:0.85}));
  const skinMat = new THREE.MeshStandardMaterial({color:'#c68642', roughness:0.65});
  const turbanMats = [
    new THREE.MeshStandardMaterial({color:'#ffffff', roughness:0.8}),
    new THREE.MeshStandardMaterial({color:'#fefefe', roughness:0.8}),
    new THREE.MeshStandardMaterial({color:'#ff9933', roughness:0.8}),
    new THREE.MeshStandardMaterial({color:'#1a365d', roughness:0.8})
  ];

  // Reusable Geo for seated figures (Realistic human seated proportions)
  const torsoGeo = new THREE.BoxGeometry(0.48, 0.44, 0.24);
  const neckGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.08, 8);
  const headGeo = new THREE.SphereGeometry(0.12, 12, 10);
  const turbanGeo = new THREE.CylinderGeometry(0.15, 0.14, 0.12, 12);
  const dupattaGeo = new THREE.BoxGeometry(0.52, 0.12, 0.28);
  const baseLegsGeo = new THREE.BoxGeometry(0.68, 0.16, 0.50);

  let seed = 42;
  function rnd(){ seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }

  // Generate seated audience blocks (Dense congregation)
  const zRows = [
    // Block 1 (Z = -17 to -2)
    ...Array.from({length: 12}, (_, i) => -16.5 + i * 1.25),
    // Block 2 (Z = +3 to +25)
    ...Array.from({length: 17}, (_, i) => 3.5 + i * 1.25),
    // Block 3 (Z = +31 to +50)
    ...Array.from({length: 14}, (_, i) => 31.5 + i * 1.25)
  ];

  for(let z of zRows){
    // Left Wing Devotees
    for(let col=0; col<16; col++){
      const x = -3.8 - col * 1.85 + (rnd() - 0.5) * 0.3;
      if(rnd() > 0.12){ // 88% density
        createDevotee(x, z, -0.05 + (rnd() - 0.5) * 0.1);
      }
    }
    // Right Wing Devotees
    for(let col=0; col<16; col++){
      const x = 3.8 + col * 1.85 + (rnd() - 0.5) * 0.3;
      if(rnd() > 0.12){
        createDevotee(x, z, 0.05 + (rnd() - 0.5) * 0.1);
      }
    }
  }

  const illustrativePeople=audienceGroup.children.filter(o=>o.name==='Concept seated attendee').length;
  const batches=new Map<string,{geometry:THREE.BufferGeometry;material:THREE.Material;matrices:THREE.Matrix4[]}>();
  hallGroup.updateMatrixWorld(true);
  audienceGroup.traverse(o=>{if(o instanceof THREE.Mesh&&!Array.isArray(o.material)){const geo=o.geometry;const key=geo.type+JSON.stringify((geo as THREE.BoxGeometry).parameters??{})+o.material.uuid;let b=batches.get(key);if(!b){b={geometry:geo,material:o.material,matrices:[]};batches.set(key,b)}b.matrices.push(o.matrixWorld.clone())}});
  audienceGroup.clear();for(const batch of batches.values()){const im=new THREE.InstancedMesh(batch.geometry,batch.material,batch.matrices.length);batch.matrices.forEach((m,i)=>im.setMatrixAt(i,m));im.instanceMatrix.needsUpdate=true;im.receiveShadow=true;im.name='Concept audience / seating';audienceGroup.add(im)}
  function createDevotee(x:number, z:number, yaw:number){
    const dGroup = new THREE.Group();dGroup.name="Concept seated attendee";
    dGroup.position.set(x, 0.22, z);
    dGroup.rotation.y = yaw;
    audienceGroup.add(dGroup);

    const kurtiMat = devoteeMats[Math.floor(rnd() * devoteeMats.length)];
    // Seated legs base
    const legs = new THREE.Mesh(baseLegsGeo, kurtiMat);
    legs.position.set(0, 0.08, 0);
    dGroup.add(legs);
    // Torso with shoulders
    const torso = new THREE.Mesh(torsoGeo, kurtiMat);
    torso.position.set(0, 0.36, -0.02);
    dGroup.add(torso);
    // Dupatta / Shawl across shoulders
    const shawl = new THREE.Mesh(dupattaGeo, kurtiMat);
    shawl.position.set(0, 0.52, -0.02);
    dGroup.add(shawl);
    // Neck
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, 0.62, -0.02);
    dGroup.add(neck);
    // Head
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 0.74, -0.02);
    dGroup.add(head);
    // Turban / Pagri (50% of devotees)
    if(rnd() > 0.4){
      const turb = new THREE.Mesh(turbanGeo, turbanMats[Math.floor(rnd() * turbanMats.length)]);
      turb.position.set(0, 0.82, -0.02);
      dGroup.add(turb);
    }
  }

  // --- 5. FOH TECH RISER (SOUND & VIDEO CONTROL DESK) ---
  // Positioned off the central aisle at left wing (x = -22, z = 14) so the central VIP red carpet is 100% open!
  const fohX = -22, fohZ = 14;
  const fohGroup = new THREE.Group();
  fohGroup.position.set(fohX, 0.22, fohZ);
  hallGroup.add(fohGroup);

  // Riser platform: 6m wide, 4m deep, 0.6m high
  box(0, 0.3, 0, 6.2, 0.6, 4.2, mats.darkSteel, fohGroup);
  box(0, 0.62, 0, 6.2, 0.04, 4.2, mats.concrete, fohGroup);
  // Railing around FOH
  box(-3.0, 1.1, 0, 0.08, 0.9, 4.2, mats.chrome, fohGroup);
  box(3.0, 1.1, 0, 0.08, 0.9, 4.2, mats.chrome, fohGroup);
  box(0, 1.1, -2.0, 6.2, 0.9, 0.08, mats.chrome, fohGroup);

  // Audio / Video Mixing Consoles
  box(-1.4, 1.0, -0.7, 2.2, 0.7, 1.0, mats.blackTech, fohGroup);
  box(1.4, 1.0, -0.7, 2.2, 0.7, 1.0, mats.blackTech, fohGroup);
  // Glowing multi-color LED fader strips on mixers
  const cvMix = document.createElement('canvas'); cvMix.width = 256; cvMix.height = 128;
  const ctxM = cvMix.getContext('2d')!;
  ctxM.fillStyle = '#111'; ctxM.fillRect(0,0,256,128);
  for(let f=10; f<240; f+=14){
    ctxM.fillStyle = f%28===0?'#00ff00':f%42===0?'#ffaa00':'#00ccff';
    ctxM.fillRect(f, 20, 8, 90);
  }
  const mixTex = new THREE.CanvasTexture(cvMix);
  box(-1.4, 1.38, -0.7, 2.0, 0.05, 0.8, new THREE.MeshBasicMaterial({map:mixTex}), fohGroup);
  box(1.4, 1.38, -0.7, 2.0, 0.05, 0.8, new THREE.MeshBasicMaterial({map:mixTex}), fohGroup);

  // Broadcast Camera Operators on Heavy Pedestals
  for(let cx of [-1.2, 1.2]){
    cyl(cx, 1.35, 0.8, 0.08, 1.2, mats.darkSteel, fohGroup);
    cyl(cx, 0.7, 0.8, 0.4, 0.06, mats.darkSteel, fohGroup); // base
    box(cx, 2.0, 0.7, 0.35, 0.35, 0.75, mats.blackTech, fohGroup);
    cyl(cx, 2.0, 0.25, 0.11, 0.55, mats.darkSteel, fohGroup).rotation.x = Math.PI / 2;
    createDevotee(fohX + cx, fohZ + 1.2, 0);
  }

  // Sector Overhead Hanging Signs (positioned high to maintain clean open view)
  function makeHangingSign(text:string, x:number, z:number){
    const cv=document.createElement('canvas');cv.width=512;cv.height=90;
    const ctx=cv.getContext('2d')!;
    ctx.fillStyle='rgba(10,25,40,0.92)';ctx.fillRect(0,0,512,90);
    ctx.strokeStyle='#e8c35a';ctx.lineWidth=5;ctx.strokeRect(5,5,502,80);
    ctx.fillStyle='#ffffff';ctx.font='bold 34px Arial';ctx.textAlign='center';
    ctx.fillText(text,256,58);
    const sTex = new THREE.CanvasTexture(cv);
    sTex.generateMipmaps = true; sTex.minFilter = THREE.LinearMipmapLinearFilter;
    const sMat=new THREE.MeshBasicMaterial({map:sTex,side:THREE.DoubleSide});
    const sMesh=new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.15), sMat);
    sMesh.position.set(x, 8.4, z);
    hallGroup.add(sMesh);
    // Suspension wires
    cyl(x - 2.8, 10.2, z, 0.015, 3.6, mats.darkSteel);
    cyl(x + 2.8, 10.2, z, 0.015, 3.6, mats.darkSteel);
  }
  makeHangingSign('SECTOR A • VIP SEATING', -18, -20);
  makeHangingSign('SECTOR A • VIP SEATING', 18, -20);
  makeHangingSign('SECTOR B • DEVOTEES SEATING', -18, 5);
  makeHangingSign('SECTOR C • DEVOTEES SEATING', 18, 5);

  // --- 6. INDOOR LIGHTING SYSTEM ---
  const hallLights = new THREE.Group();
  hallGroup.add(hallLights);

  // Warm indoor ambient fill
  const hallAmb = new THREE.AmbientLight('#fff3e0', 0.85);
  hallLights.add(hallAmb);

  // Directional Stage Key Light (focused on holy dais)
  const stageSpot = new THREE.DirectionalLight('#ffe099', 2.2);
  stageSpot.position.set(0, 18, stageZ + 18);
  stageSpot.target.position.set(0, stageHeight + 0.5, stageZ);
  hallLights.add(stageSpot);
  hallLights.add(stageSpot.target);

  // Secondary soft back-stage fill
  const backFill = new THREE.DirectionalLight('#c8e4ff', 0.7);
  backFill.position.set(0, 14, stageZ - 12);
  backFill.target.position.set(0, stageHeight, stageZ);
  hallLights.add(backFill);
  hallLights.add(backFill.target);

  // Hall High-Bay Downlights (along central aisle)
  for(let lz=-25; lz<=45; lz+=18){
    const dl = new THREE.PointLight('#fff2d6', 1.2, 35, 1.2);
    dl.position.set(0, 14.5, lz);
    hallLights.add(dl);
  }

  // --- 7. SIDE HUD NAVIGATION OVERLAY (INSIDE BIG PANDAL) ---
  const hud = document.createElement('div');
  hud.id = 'bigPandalHud';
  hud.style.cssText = `
    display: none;
    position: absolute;
    top: 14px;
    right: 16px;
    background: rgba(10, 20, 32, 0.95);
    border: 1px solid #4a6d88;
    box-shadow: 0 10px 32px rgba(0,0,0,0.65), 0 0 16px rgba(0, 200, 255, 0.2);
    border-radius: 12px;
    padding: 12px 14px;
    z-index: 1000;
    color: #eef6ff;
    font-family: system-ui, -apple-system, sans-serif;
    flex-direction: column;
    gap: 8px;
    backdrop-filter: blur(10px);
    width: 340px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 35px);
    overflow-y: auto;
  `;

  hud.innerHTML = `
    <div id="pandalHudHeader" style="display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:grab;user-select:none">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">🏛️</span>
        <div>
          <b style="font-size:13px;letter-spacing:0.4px;color:#ffdf79">BIG PANDAL CONCEPT</b>
          <div style="font-size:10px;color:#a3c5dd">Stage, Aisle & Devotees View</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <button id="minPandalBtn" title="Minimize/Expand Controls" style="
          background:#1c354d;color:#9eccf0;border:1px solid #486e91;border-radius:6px;
          padding:4px 8px;cursor:pointer;font-size:12px;font-weight:bold;width:auto
        ">−</button>
        <button id="exitPandalBtn" style="
          background: linear-gradient(135deg, #d32f2f, #991b1b);
          color: white;
          border: 1px solid #ff7b7b;
          font-weight: bold;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 4px 10px rgba(211,47,47,0.4);
          white-space: nowrap;
          width: auto;
        ">
          ← Exit
        </button>
      </div>
    </div>

    <div id="pandalHudBody" style="display:flex;flex-direction:column;gap:8px;border-top:1px solid rgba(255,255,255,0.1);padding-top:8px">
      <div>
        <div style="font-size:10px;color:#8caec5;font-weight:600;text-transform:uppercase;margin-bottom:6px">Camera Views:</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <button class="pandalCamBtn" data-view="stage" style="padding:6px;font-size:11px;background:#1e354a;border:1px solid #4a6d88;border-radius:6px;color:#e1effa;cursor:pointer;text-align:left">🎙️ Stage Close-Up</button>
          <button class="pandalCamBtn" data-view="aisle" style="padding:6px;font-size:11px;background:#1e354a;border:1px solid #4a6d88;border-radius:6px;color:#e1effa;cursor:pointer;text-align:left">🚶 Central Aisle</button>
          <button class="pandalCamBtn" data-view="audience" style="padding:6px;font-size:11px;background:#1e354a;border:1px solid #4a6d88;border-radius:6px;color:#e1effa;cursor:pointer;text-align:left">👥 Audience View</button>
          <button class="pandalCamBtn" data-view="overview" style="padding:6px;font-size:11px;background:#1e354a;border:1px solid #4a6d88;border-radius:6px;color:#e1effa;cursor:pointer;text-align:left">🦅 Hall Overview</button>
          <button class="pandalCamBtn" data-view="fromStage" style="padding:6px;font-size:11px;background:#1e354a;border:1px solid #4a6d88;border-radius:6px;color:#e1effa;cursor:pointer;text-align:left;grid-column:span 2">🎤 View From Stage (To Sangat)</button>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px">
        <span style="font-size:11px;color:#8caec5">Hall Lighting:</span>
        <select id="pandalLightSel" style="padding:4px 8px;font-size:11px;background:#162738;border:1px solid #486985;border-radius:6px;color:#fff;width:auto">
          <option value="full">☀️ Full Samagam Lighting</option>
          <option value="stage">🎭 Stage Spotlight Mode</option>
          <option value="warm">🌙 Devotional Evening Warm</option>
        </select>
      </div>

      <div id="pandalExtrasSlot"></div>
      <div style="font-size:10px;color:#ffcc00;margin-top:2px">
        💡 Drag ground to orbit · Right-drag to pan · Wheel: zoom · ESC: exit
      </div>
    </div>
  `;
  document.querySelector('#viewport')?.append(hud);

  // Minimize Toggle
  const minPandalBtn = hud.querySelector('#minPandalBtn');
  const pandalHudBody = hud.querySelector('#pandalHudBody') as HTMLElement;
  let isPandalMin = false;
  minPandalBtn?.addEventListener('click', () => {
    isPandalMin = !isPandalMin;
    if (pandalHudBody) pandalHudBody.style.display = isPandalMin ? 'none' : 'flex';
    if (minPandalBtn) minPandalBtn.textContent = isPandalMin ? '+' : '−';
    hud.style.width = isPandalMin ? 'auto' : '340px';
  });

  // Draggable HUD
  const pHeader = hud.querySelector('#pandalHudHeader') as HTMLElement;
  if (pHeader) {
    let isDragging = false, startX = 0, startY = 0, initLeft = 0, initTop = 0;
    pHeader.addEventListener('pointerdown', (e: PointerEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'SELECT') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = hud.getBoundingClientRect();
      initLeft = rect.left;
      initTop = rect.top;
      hud.style.right = 'auto';
      hud.style.left = `${initLeft}px`;
      hud.style.top = `${initTop}px`;
      pHeader.style.cursor = 'grabbing';
      pHeader.setPointerCapture(e.pointerId);
    });
    pHeader.addEventListener('pointermove', (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      hud.style.left = `${Math.max(10, Math.min(window.innerWidth - hud.offsetWidth - 10, initLeft + dx))}px`;
      hud.style.top = `${Math.max(10, Math.min(window.innerHeight - hud.offsetHeight - 10, initTop + dy))}px`;
    });
    const stopPDrag = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        pHeader.style.cursor = 'grab';
        try { pHeader.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };
    pHeader.addEventListener('pointerup', stopPDrag);
    pHeader.addEventListener('pointercancel', stopPDrag);
  }

  // Camera Presets inside Big Pandal
  const cameraPresets:Record<string,CameraState> = {
    aisle: { angle: 0, elevation: 0.12, distance: 42, x: 0, z: -16 },
    stage: { angle: 0, elevation: 0.18, distance: 26, x: 0, z: -22 },
    audience: { angle: 0.28, elevation: 0.20, distance: 34, x: -6, z: -10 },
    overview: { angle: 0, elevation: 0.24, distance: 58, x: 0, z: -14 },
    fromStage: { angle: Math.PI, elevation: 0.12, distance: 38, x: 0, z: -5 }
  };

  hud.querySelectorAll('.pandalCamBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const v = (e.currentTarget as HTMLElement).dataset.view;
      if(v && cameraPresets[v]){
        const p = cameraPresets[v];
        transitionTo(p);
      }
    });
  });

  // Lighting Mode Switcher inside Hall
  const lightSel = hud.querySelector('#pandalLightSel') as HTMLSelectElement;
  if(lightSel){
    lightSel.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value;
      if(val === 'stage'){
        hallAmb.intensity = 0.25;
        stageSpot.intensity = 3.2;
        mainLedMat.emissiveIntensity = 1.3;
      }else if(val === 'warm'){
        hallAmb.color.set('#ffc988');
        hallAmb.intensity = 0.95;
        stageSpot.intensity = 1.8;
        mainLedMat.emissiveIntensity = 0.9;
      }else{
        hallAmb.color.set('#fff3e0');
        hallAmb.intensity = 0.85;
        stageSpot.intensity = 2.2;
        mainLedMat.emissiveIntensity = 0.85;
      }
    });
  }

  // --- 8. MODE SWITCHING LOGIC ---
  let isInsidePandal = false;
  let savedExteriorState = { angle: -0.25, elevation: 0.85, distance: 480, x: 0, z: 25 };

  let savedMainGrid='',savedAsideHidden=false;
  let snapshot=new Map<THREE.Object3D,boolean>();
  let cameraTween:gsap.core.Tween|null=null;
  let previousHandlers:{down:typeof canvas.onpointerdown;move:typeof canvas.onpointermove;up:typeof canvas.onpointerup;wheel:typeof canvas.onwheel;cancel:typeof canvas.onpointercancel}|null=null;
  let hallDrag:{x:number;y:number;state:CameraState;button:number}|null=null;
  const controlsHidden=new Map<HTMLElement,string>();
  function transitionTo(state:CameraState){cameraTween?.kill();const moving={...getCameraState()};cameraTween=gsap.to(moving,{...state,duration:.9,ease:'power2.inOut',onUpdate:()=>setCameraState(moving)})}
  function setCutaway(open:boolean){roofMesh.visible=!open;leftWall.visible=!open;rightWall.visible=!open;entranceWall.visible=!open;const cb=hud.querySelector<HTMLInputElement>('#hallCutaway');if(cb)cb.checked=open}
  function enterBigPandal(){
    if(isInsidePandal)return;
    savedExteriorState={...getCameraState()};const main=document.querySelector<HTMLElement>('main'),aside=document.querySelector<HTMLElement>('aside');if(main){savedMainGrid=main.style.gridTemplateColumns;main.style.gridTemplateColumns='1fr'}if(aside){savedAsideHidden=aside.hidden;aside.hidden=true}snapshot=new Map(scene.children.map(o=>[o,o.visible]));
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
    setCameraState(savedExteriorState);const main=document.querySelector<HTMLElement>('main'),aside=document.querySelector<HTMLElement>('aside');if(main)main.style.gridTemplateColumns=savedMainGrid;if(aside)aside.hidden=savedAsideHidden;
    const hint=document.querySelector('#hint');if(hint)hint.textContent='Drag resource to move · Drag ground to orbit · Right-drag to pan · Wheel: zoom';
  }

  const extras=document.createElement('div');extras.style.cssText='display:flex;flex-direction:column;gap:6px;width:100%;font-size:11px';
  extras.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:8px"><label style="margin:0;display:flex;align-items:center;gap:4px"><input id="hallCutaway" type="checkbox" style="width:auto;margin:0"> Open roof / cutaway</label><label style="margin:0;display:flex;align-items:center;gap:4px"><input id="hallAudience" type="checkbox" checked style="width:auto;margin:0"> Audience seating</label></div><div style="display:flex;align-items:center;justify-content:space-between;gap:6px"><span>Stage width:</span><input id="hallStageWidth" type="range" min="30" max="50" value="42" style="width:110px;padding:0;margin:0"></div><span id="hallFigures" style="color:#8caec5;font-size:10px"></span>';
  const slot = hud.querySelector('#pandalExtrasSlot');
  if(slot) slot.append(extras); else hud.append(extras);
  hud.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.style.width='auto');
  hud.querySelector('#hallFigures')!.textContent=illustrativePeople+' illustrative figures · schematic scale';
  hud.querySelector<HTMLInputElement>('#hallCutaway')!.onchange=e=>setCutaway((e.target as HTMLInputElement).checked);
  hud.querySelector<HTMLInputElement>('#hallAudience')!.onchange=e=>audienceGroup.visible=(e.target as HTMLInputElement).checked;
  hud.querySelector<HTMLInputElement>('#hallStageWidth')!.oninput=e=>stageGroup.scale.x=Number((e.target as HTMLInputElement).value)/stageWidth;
  hud.querySelector('#exitPandalBtn')?.addEventListener('click', exitBigPandal);

  return {
    hallGroup,
    enterBigPandal,
    exitBigPandal,
    isInside: () => isInsidePandal,
    update: () => {
      // Dynamic subtle flicker / glow animation if needed
    }
  };
}
