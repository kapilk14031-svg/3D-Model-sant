import * as THREE from 'three';
import { gsap } from 'gsap';

export interface FacilityModelsOptions {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  smoothView: (a: number, e: number, d: number, x: number, z: number) => void;
  getCameraState: () => { angle: number; elevation: number; distance: number; x: number; z: number };
  setCameraState: (st: { angle: number; elevation: number; distance: number; x: number; z: number }) => void;
  openBigPandal?: () => void;
}

export interface FacilityDef {
  id: string;
  name: string;
  hiName: string;
  icon: string;
  category: 'spiritual' | 'security' | 'transit' | 'parking' | 'welfare';
  desc: string;
  exteriorPos: { x: number; z: number; y: number };
  camPresets: Record<string, { angle: number; elevation: number; distance: number; x: number; z: number }>;
}

export function createFacilityModels({
  scene,
  camera,
  canvas,
  smoothView,
  getCameraState,
  setCameraState,
  openBigPandal
}: FacilityModelsOptions) {
  let activeFacilityId: string | null = null;
  let savedExteriorState = { angle: -0.25, elevation: 0.85, distance: 480, x: 0, z: 25 };

  // Master container for all facility detailed models (hidden initially)
  const masterGroup = new THREE.Group();
  masterGroup.name = 'allFacilityModelsGroup';
  masterGroup.visible = false;
  scene.add(masterGroup);

  // Dedicated Natural Daytime Facility Lighting System
  const facAmbLight = new THREE.AmbientLight('#eef5fb', 1.25);
  masterGroup.add(facAmbLight);
  const facKeyLight = new THREE.DirectionalLight('#fffbf0', 2.2);
  facKeyLight.position.set(50, 75, 45);
  facKeyLight.castShadow = true;
  facKeyLight.shadow.mapSize.set(2048, 2048);
  facKeyLight.shadow.bias = -0.00015;
  masterGroup.add(facKeyLight);
  const facFillLight = new THREE.DirectionalLight('#c8e1f5', 0.95);
  facFillLight.position.set(-50, 50, -40);
  masterGroup.add(facFillLight);

  // Procedural Canvas Texture Generator
  function makeTex(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, rx = 1, ry = 1) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d')!;
    draw(ctx, w, h);
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(rx, ry);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    return tex;
  }

  // Realistic Grass & Earth Texture
  const grassTex = makeTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#4e6332'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 22000; i++) {
      const r = Math.random();
      ctx.fillStyle = r > 0.65 ? '#5d753c' : r > 0.35 ? '#3f5028' : r > 0.15 ? '#6a8244' : '#7d6e4d';
      ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 2 + 1, Math.random() * 2 + 1);
    }
  }, 12, 10);

  // Realistic Aggregate Asphalt Texture
  const roadTex = makeTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#26292b'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      const r = Math.random();
      ctx.fillStyle = r > 0.6 ? '#323639' : r > 0.3 ? '#1c1e1f' : '#414649';
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
  }, 8, 8);

  // Precast Concrete Texture with Expansion Seams
  const concTex = makeTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#9e9c93'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 6000; i++) {
      const r = Math.random();
      ctx.fillStyle = r > 0.5 ? '#b2b0a6' : '#8c8a81';
      ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 2 + 1, Math.random() * 2 + 1);
    }
    ctx.strokeStyle = 'rgba(60,58,54,0.3)'; ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
  }, 4, 4);

  // High quality PBR materials
  const mats = {
    grass: new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.94 }),
    road: new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.9 }),
    curb: new THREE.MeshStandardMaterial({ color: '#c5c2b8', roughness: 0.8 }),
    concrete: new THREE.MeshStandardMaterial({ map: concTex, roughness: 0.88 }),
    lightConcrete: new THREE.MeshStandardMaterial({ color: '#d8dee3', roughness: 0.7 }),
    whiteWall: new THREE.MeshStandardMaterial({ color: '#f3f4f6', roughness: 0.65 }),
    steel: new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.3, metalness: 0.8 }),
    darkSteel: new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.45, metalness: 0.7 }),
    copper: new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.28, metalness: 0.85 }),
    brassGold: new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.22, metalness: 0.85 }),
    redCarpet: new THREE.MeshStandardMaterial({ color: '#881320', roughness: 0.88 }),
    diningMatYellow: new THREE.MeshStandardMaterial({ color: '#ca8a04', roughness: 0.82 }),
    pangatGreen: new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.85 }),
    woodDesk: new THREE.MeshStandardMaterial({ color: '#54361e', roughness: 0.75 }),
    medicalWhite: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.35 }),
    policeBlue: new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.4 }),
    tentCanvas: new THREE.MeshStandardMaterial({ color: '#1b3827', roughness: 0.92, side: THREE.DoubleSide }),
    roofIvory: new THREE.MeshStandardMaterial({ color: '#f1efe9', roughness: 0.65, side: THREE.DoubleSide }),
    cautionStripe: new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.45 }),
    carBodyRed: new THREE.MeshStandardMaterial({ color: '#991b1b', roughness: 0.25, metalness: 0.5 }),
    carBodyWhite: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.25, metalness: 0.3 }),
    carBodySilver: new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.22, metalness: 0.8 }),
    busBlue: new THREE.MeshStandardMaterial({ color: '#0369a1', roughness: 0.32, metalness: 0.2 }),
    busRoof: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.4 }),
    glass: new THREE.MeshStandardMaterial({ color: '#1c3448', roughness: 0.08, metalness: 0.85, transparent: true, opacity: 0.75 }),
    trunk: new THREE.MeshStandardMaterial({ color: '#4a3321', roughness: 0.92 }),
    foliage: new THREE.MeshStandardMaterial({ color: '#2b5825', roughness: 0.85 })
  };

  function box(x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material, parent: THREE.Group = masterGroup) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function cyl(x: number, y: number, z: number, r: number, h: number, mat: THREE.Material, parent: THREE.Group = masterGroup, seg = 16) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  function canvasSign(text: string, subText: string, w: number, h: number, x: number, y: number, z: number, parent: THREE.Group, bg = '#0f2742', border = '#f59e0b') {
    const cv = document.createElement('canvas');
    cv.width = 1024; cv.height = 300;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1024, 300);
    ctx.strokeStyle = border; ctx.lineWidth = 14; ctx.strokeRect(10, 10, 1004, 280);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 4; ctx.strokeRect(26, 26, 972, 248);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 64px Arial'; ctx.textAlign = 'center';
    ctx.fillText(text, 512, 125);
    ctx.fillStyle = '#fef08a'; ctx.font = 'bold 44px Arial';
    ctx.fillText(subText, 512, 225);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.anisotropy = 8;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  // Realistic Vehicle Generator with Real Wheels, Rims, Headlights, Windshield & Livery
  function createDetailedCar(x: number, y: number, z: number, yaw: number, color: string, type: 'sedan' | 'suv' | 'police' | 'ambulance' | 'bus' | 'bike' | 'vip' = 'sedan', parent: THREE.Group = masterGroup) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = yaw;
    parent.add(g);

    function addWheel(wx: number, wy: number, wz: number, r = 0.38, w = 0.22) {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 16), mats.darkSteel);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx, wy, wz);
      tire.castShadow = true;
      g.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.65, r * 0.65, w + 0.02, 12), mats.steel);
      rim.rotation.z = Math.PI / 2;
      rim.position.set(wx, wy, wz);
      g.add(rim);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.25, r * 0.25, w + 0.04, 8), mats.brassGold);
      hub.rotation.z = Math.PI / 2;
      hub.position.set(wx, wy, wz);
      g.add(hub);
    }

    if (type === 'bike') {
      addWheel(0, 0.35, -0.9, 0.35, 0.12);
      addWheel(0, 0.35, 0.9, 0.35, 0.12);
      box(0, 0.55, 0, 0.3, 0.45, 1.2, mats.darkSteel, g);
      box(0, 0.45, 0.1, 0.42, 0.35, 0.5, mats.steel, g);
      box(0, 0.78, 0.15, 0.38, 0.28, 0.65, new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 }), g);
      box(0, 0.72, -0.35, 0.35, 0.16, 0.65, mats.darkSteel, g);
      box(0, 0.95, 0.65, 0.8, 0.06, 0.06, mats.steel, g);
      cyl(0, 0.85, 0.8, 0.12, 0.14, mats.whiteWall, g).rotation.x = Math.PI / 2;
      return g;
    }

    if (type === 'bus') {
      const bw = 2.9, bl = 11.5;
      const bMat = new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.25 });
      addWheel(-bw/2 - 0.02, 0.55, bl * 0.3, 0.55, 0.28);
      addWheel(bw/2 + 0.02, 0.55, bl * 0.3, 0.55, 0.28);
      addWheel(-bw/2 - 0.02, 0.55, -bl * 0.26, 0.55, 0.28);
      addWheel(bw/2 + 0.02, 0.55, -bl * 0.26, 0.55, 0.28);
      box(0, 0.65, 0, bw, 0.4, bl, mats.darkSteel, g);
      box(0, 1.45, 0, bw, 1.2, bl, bMat, g);
      box(0, 2.35, -0.1, bw - 0.04, 0.85, bl * 0.82, mats.glass, g);
      for (let k = -4; k <= 4; k++) {
        box(-bw/2 - 0.01, 2.35, k * 1.05, 0.06, 0.86, 0.12, mats.darkSteel, g);
        box(bw/2 + 0.01, 2.35, k * 1.05, 0.06, 0.86, 0.12, mats.darkSteel, g);
      }
      box(0, 2.25, bl/2 - 0.1, bw * 0.92, 1.15, 0.3, mats.glass, g);
      box(0, 2.95, 0, bw * 0.98, 0.42, bl * 0.98, mats.roofIvory, g);
      box(0, 3.3, 0, 1.8, 0.35, 3.2, mats.lightConcrete, g);
      box(-bw * 0.38, 1.1, bl/2 + 0.02, 0.35, 0.22, 0.06, mats.lightConcrete, g);
      box(bw * 0.38, 1.1, bl/2 + 0.02, 0.35, 0.22, 0.06, mats.lightConcrete, g);
      box(-bw * 0.38, 1.1, -bl/2 - 0.02, 0.32, 0.38, 0.06, mats.redCarpet, g);
      box(bw * 0.38, 1.1, -bl/2 - 0.02, 0.32, 0.38, 0.06, mats.redCarpet, g);
      box(0, 2.95, bl/2 + 0.02, 1.6, 0.32, 0.06, mats.darkSteel, g);
      return g;
    }

    const isSuv = type === 'suv' || type === 'police' || type === 'ambulance' || type === 'vip';
    const cw = isSuv ? 2.2 : 2.0;
    const cl = isSuv ? 4.9 : 4.5;
    const bodyMat = new THREE.MeshStandardMaterial({
      color: type === 'police' || type === 'ambulance' ? '#fcfbf9' : color,
      roughness: 0.25,
      metalness: 0.4
    });

    const wheelR = isSuv ? 0.44 : 0.36;
    const wheelW = isSuv ? 0.24 : 0.20;
    const wheelY = wheelR;
    addWheel(-cw/2 - 0.02, wheelY, cl * 0.28, wheelR, wheelW);
    addWheel(cw/2 + 0.02, wheelY, cl * 0.28, wheelR, wheelW);
    addWheel(-cw/2 - 0.02, wheelY, -cl * 0.28, wheelR, wheelW);
    addWheel(cw/2 + 0.02, wheelY, -cl * 0.28, wheelR, wheelW);

    box(0, wheelY + 0.1, 0, cw * 0.9, 0.2, cl * 0.88, mats.darkSteel, g);
    const lowerH = isSuv ? 0.75 : 0.58;
    const lowerY = wheelY + lowerH/2 + 0.05;
    box(0, lowerY, 0, cw, lowerH, cl, bodyMat, g);

    const cabinH = isSuv ? 0.72 : 0.62;
    const cabinL = isSuv ? cl * 0.58 : cl * 0.52;
    const cabinZ = -cl * 0.06;
    const cabinY = lowerY + lowerH/2 + cabinH/2;
    box(0, cabinY, cabinZ, cw * 0.88, cabinH, cabinL, mats.glass, g);
    box(0, cabinY + cabinH/2 + 0.03, cabinZ, cw * 0.86, 0.08, cabinL * 0.96, bodyMat, g);
    box(-cw * 0.43, cabinY, cabinZ + cabinL/2, 0.06, cabinH, 0.1, bodyMat, g);
    box(cw * 0.43, cabinY, cabinZ + cabinL/2, 0.06, cabinH, 0.1, bodyMat, g);
    box(-cw * 0.43, cabinY, cabinZ - cabinL/2, 0.06, cabinH, 0.1, bodyMat, g);
    box(cw * 0.43, cabinY, cabinZ - cabinL/2, 0.06, cabinH, 0.1, bodyMat, g);

    box(0, wheelY + 0.32, cl/2 + 0.02, cw * 0.65, 0.28, 0.08, mats.darkSteel, g);
    box(-cw * 0.36, wheelY + 0.42, cl/2 + 0.02, 0.32, 0.18, 0.06, mats.roofIvory, g);
    box(cw * 0.36, wheelY + 0.42, cl/2 + 0.02, 0.32, 0.18, 0.06, mats.roofIvory, g);
    box(-cw * 0.36, wheelY + 0.46, -cl/2 - 0.02, 0.3, 0.18, 0.06, mats.redCarpet, g);
    box(cw * 0.36, wheelY + 0.46, -cl/2 - 0.02, 0.3, 0.18, 0.06, mats.redCarpet, g);
    box(0, wheelY + 0.18, cl/2 + 0.03, 0.58, 0.16, 0.04, mats.whiteWall, g);
    box(0, wheelY + 0.22, -cl/2 - 0.03, 0.58, 0.16, 0.04, mats.whiteWall, g);
    box(-cw/2 - 0.12, cabinY - 0.1, cabinZ + cabinL/2 - 0.2, 0.18, 0.12, 0.14, bodyMat, g);
    box(cw/2 + 0.12, cabinY - 0.1, cabinZ + cabinL/2 - 0.2, 0.18, 0.12, 0.14, bodyMat, g);

    if (type === 'police') {
      box(cw/2 + 0.01, lowerY, 0, 0.02, 0.28, cl * 0.8, mats.policeBlue, g);
      box(-cw/2 - 0.01, lowerY, 0, 0.02, 0.28, cl * 0.8, mats.policeBlue, g);
      box(0, wheelY + 0.4, cl/2 + 0.12, cw * 0.7, 0.45, 0.08, mats.darkSteel, g);
      const barY = cabinY + cabinH/2 + 0.16;
      box(0, barY, cabinZ, cw * 0.65, 0.12, 0.25, mats.darkSteel, g);
      box(-cw * 0.18, barY + 0.02, cabinZ, cw * 0.24, 0.14, 0.22, new THREE.MeshStandardMaterial({color:'#2563eb', emissive:'#1d4ed8', emissiveIntensity:0.9}), g);
      box(cw * 0.18, barY + 0.02, cabinZ, cw * 0.24, 0.14, 0.22, new THREE.MeshStandardMaterial({color:'#dc2626', emissive:'#b91c1c', emissiveIntensity:0.9}), g);
    } else if (type === 'ambulance') {
      box(cw/2 + 0.01, lowerY, 0, 0.02, 0.26, cl * 0.85, mats.redCarpet, g);
      box(-cw/2 - 0.01, lowerY, 0, 0.02, 0.26, cl * 0.85, mats.redCarpet, g);
      box(0, cabinY + 0.1, cl * 0.1, cw + 0.02, 0.4, 0.12, mats.redCarpet, g);
      box(0, cabinY + 0.1, cl * 0.1, cw + 0.02, 0.12, 0.4, mats.redCarpet, g);
      const barY = cabinY + cabinH/2 + 0.16;
      box(0, barY, cabinZ + 0.3, cw * 0.55, 0.14, 0.22, new THREE.MeshStandardMaterial({color:'#dc2626', emissive:'#ef4444', emissiveIntensity:0.95}), g);
    } else if (type === 'vip') {
      box(-cw * 0.45, wheelY + 0.18, 0, 0.12, 0.08, cl * 0.55, mats.steel, g);
      box(cw * 0.45, wheelY + 0.18, 0, 0.12, 0.08, cl * 0.55, mats.steel, g);
      cyl(cw * 0.35, wheelY + 0.9, cl/2 - 0.2, 0.02, 0.8, mats.steel, g);
      box(cw * 0.35, wheelY + 1.25, cl/2 - 0.28, 0.02, 0.15, 0.22, mats.brassGold, g);
    }

    return g;
  }

  // Realistic Organic Tree Builder (Ashoka & Spreading Neem Trees)
  function addTree(x: number, z: number, s = 1, type: 'ashoka' | 'neem' = 'ashoka', parent: THREE.Group = envGroup) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    parent.add(g);

    if (type === 'ashoka') {
      const th = 8.5 * s;
      cyl(0, th * 0.2, 0, 0.16 * s, th * 0.4, mats.trunk, g);
      const tiers = 6;
      const ashokaMats = [
        new THREE.MeshStandardMaterial({ color: '#1b4318', roughness: 0.85 }),
        new THREE.MeshStandardMaterial({ color: '#275822', roughness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: '#356e2e', roughness: 0.75 })
      ];
      for (let i = 0; i < tiers; i++) {
        const ty = (2.2 + i * 1.1) * s;
        const tr = (1.4 - i * 0.16) * s;
        const mat = ashokaMats[i % ashokaMats.length];
        const cone = new THREE.Mesh(new THREE.ConeGeometry(tr, 1.8 * s, 10), mat);
        cone.position.set(0, ty, 0);
        cone.castShadow = true;
        g.add(cone);
      }
    } else {
      const trunkH = 3.6 * s;
      cyl(0, trunkH / 2, 0, 0.32 * s, trunkH, mats.trunk, g);
      cyl(0, 0.3 * s, 0, 0.48 * s, 0.6 * s, mats.trunk, g);
      const b1 = cyl(0.6 * s, trunkH + 0.6 * s, 0.3 * s, 0.18 * s, 1.6 * s, mats.trunk, g);
      b1.rotation.z = -0.55;
      const b2 = cyl(-0.5 * s, trunkH + 0.8 * s, -0.4 * s, 0.16 * s, 1.8 * s, mats.trunk, g);
      b2.rotation.z = 0.5;
      b2.rotation.x = -0.3;
      const canopyMats = [
        new THREE.MeshStandardMaterial({ color: '#2d5322', roughness: 0.9 }),
        new THREE.MeshStandardMaterial({ color: '#3d6c2e', roughness: 0.85 }),
        new THREE.MeshStandardMaterial({ color: '#4a7d37', roughness: 0.8 })
      ];
      const clusters = [
        { x: 0, y: trunkH + 1.8 * s, z: 0, r: 2.2 * s },
        { x: 1.2 * s, y: trunkH + 1.2 * s, z: 0.8 * s, r: 1.8 * s },
        { x: -1.3 * s, y: trunkH + 1.5 * s, z: -0.6 * s, r: 1.9 * s },
        { x: 0.5 * s, y: trunkH + 2.5 * s, z: -0.8 * s, r: 1.7 * s },
        { x: -0.6 * s, y: trunkH + 2.4 * s, z: 0.9 * s, r: 1.6 * s }
      ];
      clusters.forEach((c, idx) => {
        const f = new THREE.Mesh(new THREE.DodecahedronGeometry(c.r, 2), canopyMats[idx % canopyMats.length]);
        f.position.set(c.x, c.y, c.z);
        f.scale.set(1, 0.85, 1);
        f.castShadow = true;
        f.receiveShadow = true;
        g.add(f);
      });
    }
    return g;
  }

  // Shared Realistic Daytime Venue Environment (Open air site ground)
  const envGroup = new THREE.Group();
  envGroup.name = 'facilitySharedSiteEnvironment';
  masterGroup.add(envGroup);

  // Large Grass Ground: 360m x 300m with realistic grass map
  const facGround = new THREE.Mesh(new THREE.PlaneGeometry(360, 300), mats.grass);
  facGround.rotation.x = -Math.PI / 2;
  facGround.position.y = -0.05;
  facGround.receiveShadow = true;
  envGroup.add(facGround);

  // Paved Perimeter Roadway & Walkways
  box(0, 0.02, -68, 190, 0.1, 16, mats.road, envGroup);
  box(0, 0.02, 68, 190, 0.1, 16, mats.road, envGroup);
  box(-92, 0.02, 0, 16, 0.1, 152, mats.road, envGroup);
  box(92, 0.02, 0, 16, 0.1, 152, mats.road, envGroup);

  // Roadway white shoulder lines & curbs
  box(0, 0.08, -60.5, 190, 0.02, 0.35, mats.whiteWall, envGroup);
  box(0, 0.08, -75.5, 190, 0.02, 0.35, mats.whiteWall, envGroup);
  box(0, 0.08, 60.5, 190, 0.02, 0.35, mats.whiteWall, envGroup);
  box(0, 0.08, 75.5, 190, 0.02, 0.35, mats.whiteWall, envGroup);

  // Decorative Ashoka and Neem Trees around perimeter
  for (let tz = -55; tz <= 55; tz += 22) {
    addTree(-80, tz, 1.1, tz % 44 === 0 ? 'neem' : 'ashoka');
    addTree(80, tz, 1.1, tz % 44 === 0 ? 'neem' : 'ashoka');
  }
  for (let tx = -65; tx <= 65; tx += 26) {
    addTree(tx, -58, 1.0, tx === 0 ? 'neem' : 'ashoka');
    addTree(tx, 58, 1.0, tx === 0 ? 'neem' : 'ashoka');
  }

  // Master facilities map
  const facilities: Record<string, { group: THREE.Group; def: FacilityDef; build: () => void }> = {};

  function registerFacility(def: FacilityDef, buildFn: (grp: THREE.Group) => void) {
    const grp = new THREE.Group();
    grp.name = `facility_${def.id}`;
    masterGroup.add(grp);
    facilities[def.id] = { group: grp, def, build: () => buildFn(grp) };
  }

  // =========================================================================
  // 1. LANGAR COMPLEX & MEGA KITCHEN (लंगर भवन)
  // =========================================================================
  registerFacility({
    id: 'langar',
    name: 'Grand Langar Complex & Dining Hall',
    hiName: 'विशाल लंगर भवन एवं भोजन व्यवस्था',
    icon: '🍲',
    category: 'welfare',
    desc: 'Mega community kitchen with cooking bhattis, boiling cauldrons, serving lines & vast pangat seating.',
    exteriorPos: { x: 10, z: 46, y: 0 },
    camPresets: {
      overview: { angle: 0.15, elevation: 0.42, distance: 58, x: 0, z: 0 },
      kitchen: { angle: -0.6, elevation: 0.22, distance: 28, x: -16, z: -8 },
      dining: { angle: 0.4, elevation: 0.24, distance: 34, x: 12, z: 6 },
      serving: { angle: 0.0, elevation: 0.18, distance: 22, x: 0, z: -4 }
    }
  }, (g) => {
    // Plinth
    box(0, 0.15, 0, 72, 0.3, 46, mats.lightConcrete, g);
    box(-17, 0.32, 0, 34, 0.04, 42, mats.lightConcrete, g); // Kitchen zone
    box(18, 0.32, 0, 32, 0.04, 42, mats.pangatGreen, g);   // Dining zone

    // Pavilion Steel Pillars (Clean perimeter structure)
    for (let z = -20; z <= 20; z += 10) {
      cyl(-34, 4.0, z, 0.28, 8.0, mats.steel, g);
      cyl(34, 4.0, z, 0.28, 8.0, mats.steel, g);
      cyl(0, 4.0, z, 0.28, 8.0, mats.steel, g);
    }
    // Perimeter eave roof framework (open center for easy viewing)
    box(-34, 8.0, 0, 2.5, 0.3, 44, mats.roofIvory, g);
    box(34, 8.0, 0, 2.5, 0.3, 44, mats.roofIvory, g);
    box(0, 8.0, -21, 70, 0.3, 2.5, mats.roofIvory, g);
    box(0, 8.0, 21, 70, 0.3, 2.5, mats.roofIvory, g);

    // Cooking Bhattis & Cauldrons (Deghs)
    box(-24, 0.8, -6, 6, 1.0, 22, mats.darkSteel, g);
    for (let z = -14; z <= 2; z += 4.5) {
      cyl(-24, 1.8, z, 1.3, 1.1, mats.copper, g);
      cyl(-24, 2.4, z, 1.4, 0.1, mats.brassGold, g);
      cyl(-24, 5.5, z, 0.2, 5.5, mats.steel, g); // exhaust chimney
    }

    // Food Service Counters
    for (let z = -14; z <= 14; z += 7.0) {
      box(-2, 0.8, z, 2.4, 1.1, 4.5, mats.whiteWall, g);
      box(-2, 1.4, z, 2.5, 0.06, 4.6, mats.steel, g); // stainless top
      cyl(-2, 1.65, z - 1.2, 0.5, 0.45, mats.steel, g); // serving vessel
      cyl(-2, 1.65, z + 1.2, 0.5, 0.45, mats.copper, g);
    }

    // Jute Flour Sacks
    for (let sx = -30; sx <= -26; sx += 1.8) {
      for (let sz = 8; sz <= 16; sz += 2.0) {
        box(sx, 0.5, sz, 1.5, 0.7, 1.6, mats.diningMatYellow, g);
        box(sx, 1.1, sz, 1.4, 0.6, 1.5, mats.diningMatYellow, g);
      }
    }

    // Stainless Drinking Water Dispenser
    for (let wz of [-14, 0, 14]) {
      cyl(-10, 1.6, wz, 1.0, 2.4, mats.steel, g);
      box(-10, 0.3, wz, 2.4, 0.6, 2.4, mats.lightConcrete, g);
    }

    // Pangat (Devotee Dining Rows)
    for (let r = 0; r < 4; r++) {
      const xMat = 8 + r * 6.5;
      box(xMat, 0.36, 0, 1.6, 0.02, 36, mats.diningMatYellow, g);
      for (let z = -16; z <= 16; z += 2.6) {
        // Devotee in clean white kurta
        cyl(xMat - 0.4, 0.6, z, 0.25, 0.5, mats.whiteWall, g);
        cyl(xMat - 0.4, 0.95, z, 0.14, 0.24, mats.whiteWall, g);
        // Devotee facing opposite
        cyl(xMat + 0.4, 0.6, z, 0.25, 0.5, mats.whiteWall, g);
        cyl(xMat + 0.4, 0.95, z, 0.14, 0.24, mats.whiteWall, g);
      }
    }

    canvasSign('GRAND LANGAR COMPLEX', 'विशाल लंगर भवन एवं भोजन व्यवस्था', 18, 3.8, 0, 4.8, 22.5, g);
  });

  // =========================================================================
  // 2. SPIRITUAL EXHIBITION & HERITAGE MUSEUM (प्रदर्शनी दीर्घा)
  // =========================================================================
  registerFacility({
    id: 'exhibition',
    name: 'Spiritual Exhibition & Heritage Museum',
    hiName: 'अध्यात्मिक प्रदर्शनी एवं मिशन गैलरी',
    icon: '🖼️',
    category: 'spiritual',
    desc: 'Showcase museum gallery with historical dioramas, LED media walls, photo archive and literature pavilion.',
    exteriorPos: { x: -44, z: 16, y: 0 },
    camPresets: {
      overview: { angle: 0.1, elevation: 0.44, distance: 44, x: 0, z: -2 },
      gallery: { angle: -0.8, elevation: 0.20, distance: 24, x: -12, z: 2 },
      diorama: { angle: 0.7, elevation: 0.22, distance: 22, x: 10, z: -4 },
      entrance: { angle: 0.0, elevation: 0.16, distance: 26, x: 0, z: 16 }
    }
  }, (g) => {
    // Gallery Plinth & Red Carpet Corridor
    box(0, 0.15, 0, 60, 0.3, 40, mats.lightConcrete, g);
    box(0, 0.32, 0, 6, 0.03, 36, mats.redCarpet, g);
    box(0, 0.32, 0, 52, 0.03, 5, mats.redCarpet, g);

    // Perimeter Exhibition Walls
    box(0, 2.6, -19.6, 60, 5.0, 0.5, mats.whiteWall, g);
    box(-20, 2.6, 19.6, 20, 5.0, 0.5, mats.whiteWall, g);
    box(20, 2.6, 19.6, 20, 5.0, 0.5, mats.whiteWall, g);
    box(-29.6, 2.6, 0, 0.5, 5.0, 40, mats.whiteWall, g);
    box(29.6, 2.6, 0, 0.5, 5.0, 40, mats.whiteWall, g);

    // Gallery Partition Walls with Gold Framed Photos
    for (let x of [-16, 16]) {
      box(x, 2.2, -6, 0.4, 4.0, 18, mats.whiteWall, g);
      box(x, 2.2, 10, 0.4, 4.0, 12, mats.whiteWall, g);
      for (let z = -12; z <= 2; z += 4) {
        box(x + 0.22, 2.5, z, 0.06, 1.8, 2.5, mats.brassGold, g);
        box(x - 0.22, 2.5, z, 0.06, 1.8, 2.5, mats.brassGold, g);
      }
    }

    // Central Spiritual Emblem Diorama
    cyl(0, 0.4, 0, 3.6, 0.5, mats.brassGold, g);
    cyl(0, 1.2, 0, 2.2, 1.0, mats.whiteWall, g);
    cyl(0, 2.2, 0, 1.0, 1.0, mats.brassGold, g);

    // LED Media Display Wall
    const cvEx = document.createElement('canvas'); cvEx.width = 1024; cvEx.height = 512;
    const ctxE = cvEx.getContext('2d')!;
    ctxE.fillStyle = '#0a1d37'; ctxE.fillRect(0, 0, 1024, 512);
    ctxE.strokeStyle = '#f59e0b'; ctxE.lineWidth = 14; ctxE.strokeRect(12, 12, 1000, 488);
    ctxE.fillStyle = '#ffffff'; ctxE.font = 'bold 58px Arial'; ctxE.textAlign = 'center';
    ctxE.fillText('SANT NIRANKARI MISSION', 512, 140);
    ctxE.fillStyle = '#38bdf8'; ctxE.font = 'bold 42px Arial';
    ctxE.fillText('SEVA • SIMRAN • SATSANG', 512, 240);
    ctxE.fillStyle = '#fef08a'; ctxE.font = '34px Arial';
    ctxE.fillText('GLOBAL HUMAN WELFARE & PEACE EXHIBITION', 512, 350);
    const scrTex = new THREE.CanvasTexture(cvEx);
    scrTex.generateMipmaps = true; scrTex.minFilter = THREE.LinearMipmapLinearFilter;
    const scrMesh = new THREE.Mesh(new THREE.PlaneGeometry(18, 4.4), new THREE.MeshBasicMaterial({ map: scrTex }));
    scrMesh.position.set(0, 3.2, -19.2);
    g.add(scrMesh);

    // Welcome & Reception Desks
    box(16, 0.6, 15, 10, 1.1, 2.4, mats.woodDesk, g);
    box(-16, 0.6, 15, 10, 1.1, 2.4, mats.woodDesk, g);

    canvasSign('MISSION HERITAGE EXHIBITION', 'अध्यात्मिक एवं समाज कल्याण प्रदर्शनी', 16, 3.4, 0, 4.6, 19.8, g);
  });

  // =========================================================================
  // 3. POLICE COMMAND & SECURITY POST (पुलिस कंट्रोल रूम)
  // =========================================================================
  registerFacility({
    id: 'police',
    name: 'Police Command & Emergency Response',
    hiName: 'पुलिस कंट्रोल रूम एवं सुरक्षा चौकी',
    icon: '👮',
    category: 'security',
    desc: 'Joint command post with multi-feed CCTV wall, wireless dispatch center, officer patrol & PCR vehicles.',
    exteriorPos: { x: 26, z: 28, y: 0 },
    camPresets: {
      overview: { angle: 0.25, elevation: 0.40, distance: 38, x: 0, z: 0 },
      cctvWall: { angle: 0.0, elevation: 0.18, distance: 16, x: 0, z: -4 },
      vehicles: { angle: -0.8, elevation: 0.22, distance: 22, x: 12, z: 8 },
      checkpoint: { angle: 0.6, elevation: 0.16, distance: 18, x: -8, z: 10 }
    }
  }, (g) => {
    // Plinth
    box(0, 0.15, 0, 52, 0.3, 38, mats.concrete, g);

    // Realistic Modern Police Command Building (Architecture & Details)
    box(0, 2.3, -8, 28, 4.2, 16, mats.whiteWall, g);
    // Dark coping parapet ledge
    box(0, 4.45, -8, 28.5, 0.25, 16.5, mats.darkSteel, g);
    // Entrance Cantilevered Porch Canopy
    box(0, 3.4, 0.8, 8, 0.25, 4.5, mats.darkSteel, g);
    cyl(-3.6, 1.7, 2.8, 0.1, 3.4, mats.steel, g);
    cyl(3.6, 1.7, 2.8, 0.1, 3.4, mats.steel, g);

    // Glass Double Entrance Doors
    box(0, 1.6, 0.05, 3.2, 2.8, 0.08, mats.glass, g);
    // Bronze Window Bands with Mullions
    box(-8.5, 2.4, 0.05, 8.5, 2.0, 0.15, mats.glass, g);
    box(8.5, 2.4, 0.05, 8.5, 2.0, 0.15, mats.glass, g);
    for (let wx of [-11, -8.5, -6, 6, 8.5, 11]) {
      box(wx, 2.4, 0.12, 0.08, 2.0, 0.08, mats.darkSteel, g);
    }

    // Rooftop Communications Lattice Mast & Warning Light
    cyl(-10, 7.5, -8, 0.18, 6.5, mats.steel, g);
    box(-10, 11.0, -8, 0.12, 0.25, 0.12, new THREE.MeshStandardMaterial({color:'#ef4444', emissive:'#dc2626', emissiveIntensity:0.95}), g); // red warning beacon
    cyl(-10, 8.2, -7.5, 0.6, 0.12, mats.lightConcrete, g).rotation.x = Math.PI / 4; // Microwave dish

    // Rooftop AC Condenser Units & Sintex Water Tank
    box(8, 4.9, -6, 1.6, 1.0, 2.4, mats.lightConcrete, g);
    cyl(10, 5.2, -11, 1.1, 1.5, mats.darkSteel, g);

    // Corner CCTV Security Camera Domes
    box(-13.8, 4.1, 0.4, 0.35, 0.35, 0.5, mats.whiteWall, g);
    box(13.8, 4.1, 0.4, 0.35, 0.35, 0.5, mats.whiteWall, g);

    // CCTV Video Wall (Inside cabin)
    const cvCctv = document.createElement('canvas'); cvCctv.width = 1024; cvCctv.height = 512;
    const ctxC = cvCctv.getContext('2d')!;
    ctxC.fillStyle = '#061320'; ctxC.fillRect(0, 0, 1024, 512);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const cx = 20 + col * 336, cy = 20 + row * 160;
        ctxC.fillStyle = '#0f2742'; ctxC.fillRect(cx, cy, 312, 140);
        ctxC.strokeStyle = '#38bdf8'; ctxC.lineWidth = 4; ctxC.strokeRect(cx, cy, 312, 140);
        ctxC.fillStyle = '#f87171'; ctxC.beginPath(); ctxC.arc(cx + 20, cy + 20, 8, 0, Math.PI * 2); ctxC.fill();
        ctxC.fillStyle = '#ffffff'; ctxC.font = 'bold 20px Arial';
        ctxC.fillText(`CAM ${row * 3 + col + 1}: LIVE FEED`, cx + 40, cy + 26);
      }
    }
    const cctvTex = new THREE.CanvasTexture(cvCctv);
    cctvTex.generateMipmaps = true; cctvTex.minFilter = THREE.LinearMipmapLinearFilter;
    const cctvMesh = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.2), new THREE.MeshBasicMaterial({ map: cctvTex }));
    cctvMesh.position.set(0, 2.6, -15.8);
    g.add(cctvMesh);

    // Dispatch Consoles & Officers
    box(0, 0.6, -12, 14, 0.9, 2.0, mats.darkSteel, g);
    cyl(0, 1.1, -10.5, 0.3, 0.8, mats.policeBlue, g);

    // Detailed Police PCR Patrol Vehicle (with real wheels & flashing lightbar)
    createDetailedCar(14, 0, 8, Math.PI / 2, '#ffffff', 'police', g);

    // Security Checkpoint: Mojo Barricades, Boom Barrier & DFMD Metal Detector Gate
    box(-10, 1.8, 10, 0.2, 3.2, 0.4, mats.darkSteel, g);
    box(-7, 1.8, 10, 0.2, 3.2, 0.4, mats.darkSteel, g);
    box(-8.5, 3.3, 10, 3.2, 0.3, 0.4, mats.cautionStripe, g);
    box(-14, 0.6, 10, 4.5, 1.1, 0.1, mats.cautionStripe, g);
    // Yellow housing with boom barrier arm
    box(-5, 0.6, 10, 0.5, 1.2, 0.5, mats.cautionStripe, g);
    box(-2.5, 0.9, 10, 4.5, 0.12, 0.12, mats.roofIvory, g);

    canvasSign('POLICE CONTROL ROOM', 'हरियाणा पुलिस एवं संयुक्त सुरक्षा नियंत्रण कक्ष', 16, 3.4, 0, 4.8, 0.9, g, '#082f49');
  });

  // =========================================================================
  // 4. RAILWAY STATION & ISBT TERMINAL (रेलवे एवं बस टर्मिनल)
  // =========================================================================
  registerFacility({
    id: 'railway',
    name: 'Railway Station & ISBT Alighting Terminal',
    hiName: 'रेलवे हॉल्ट एवं ISBT यात्री टर्मिनल',
    icon: '🚆',
    category: 'transit',
    desc: 'High-capacity alighting platforms, train tracks, passenger waiting concourse, baggage X-ray & bus bays.',
    exteriorPos: { x: -48, z: -38, y: 0 },
    camPresets: {
      overview: { angle: 0.3, elevation: 0.45, distance: 48, x: 0, z: 0 },
      platform: { angle: -0.1, elevation: 0.18, distance: 26, x: 0, z: -8 },
      busBay: { angle: 0.8, elevation: 0.22, distance: 28, x: 12, z: 12 },
      tracks: { angle: -0.7, elevation: 0.20, distance: 22, x: -16, z: -16 }
    }
  }, (g) => {
    // Ground & Railway Platform
    box(0, 0.15, 0, 74, 0.3, 44, mats.concrete, g);
    box(0, 0.7, -10, 72, 0.8, 14, mats.lightConcrete, g);
    box(0, 1.12, -3.2, 72, 0.05, 0.4, mats.cautionStripe, g);

    // 2 Parallel Railway Tracks
    box(0, 0.25, -20, 72, 0.15, 6, mats.darkSteel, g);
    for (let ty of [-21.2, -18.8]) {
      box(0, 0.4, ty, 72, 0.15, 0.15, mats.steel, g);
    }
    for (let tx = -34; tx <= 34; tx += 1.8) {
      box(tx, 0.32, -20, 0.25, 0.12, 3.2, mats.woodDesk, g);
    }

    // Platform Waiting Canopy
    for (let tx = -28; tx <= 28; tx += 14) {
      cyl(tx, 3.0, -10, 0.25, 4.6, mats.steel, g);
      box(tx, 5.3, -10, 14, 0.3, 10, mats.roofIvory, g);
    }

    // Passenger Benches
    for (let bx of [-20, -7, 7, 20]) {
      box(bx, 1.4, -10, 3.2, 0.6, 0.9, mats.policeBlue, g);
    }

    canvasSign('NIRANKARI SAMAGAM HALT', 'निरंकारी संत समागम विशेष रेलवे हॉल्ट', 14, 2.6, 0, 4.2, -10, g, '#1e3a8a');

    // ISBT Bus Terminal: Detailed Passenger Coach with Real Wheels & Glass
    createDetailedCar(14, 0, 12, 0, '#0284c7', 'bus', g);

    canvasSign('ISBT BUS TERMINAL', 'रोडवेज एवं प्राइवेट बस अराइवल बे', 12, 2.4, 14, 4.6, 12, g, '#0369a1');
  });

  // =========================================================================
  // 5. EMERGENCY MEDICAL HOSPITAL & DISPENSARY (चिकित्सालय)
  // =========================================================================
  registerFacility({
    id: 'medical',
    name: 'Emergency Hospital & Medical Center',
    hiName: 'आपातकालीन चिकित्सालय एवं डिस्पेंसरी',
    icon: '🏥',
    category: 'welfare',
    desc: 'Round-the-clock emergency hospital with ICU triage beds, oxygen bank, pharmacy & stationed ambulances.',
    exteriorPos: { x: -8, z: 22, y: 0 },
    camPresets: {
      overview: { angle: 0.1, elevation: 0.42, distance: 38, x: 0, z: 0 },
      icuBeds: { angle: -0.5, elevation: 0.20, distance: 20, x: -8, z: -4 },
      pharmacy: { angle: 0.6, elevation: 0.18, distance: 18, x: 8, z: -2 },
      ambulance: { angle: 0.8, elevation: 0.22, distance: 22, x: 12, z: 10 }
    }
  }, (g) => {
    box(0, 0.15, 0, 50, 0.3, 36, mats.concrete, g);

    // Hospital Clinic Building (White with Red Cross & Parapet)
    box(0, 2.4, -6, 36, 4.4, 18, mats.medicalWhite, g);
    box(0, 4.7, -6, 36.4, 0.3, 18.4, mats.lightConcrete, g);
    // Hospital Entrance Canopy
    box(0, 3.4, 3.5, 10, 0.25, 4.2, mats.steel, g);
    cyl(-4.6, 1.7, 5.2, 0.1, 3.4, mats.steel, g);
    cyl(4.6, 1.7, 5.2, 0.1, 3.4, mats.steel, g);

    // Red Cross Emblem
    box(0, 5.6, 3.1, 0.9, 2.4, 0.1, mats.carBodyRed, g);
    box(0, 5.6, 3.1, 2.4, 0.9, 0.1, mats.carBodyRed, g);

    // Triage / ICU Beds (4 complete hospital beds)
    for (let i = 0; i < 4; i++) {
      const bx = -13 + i * 5.5;
      box(bx, 0.45, -7, 2.4, 0.6, 4.4, mats.darkSteel, g);
      box(bx, 0.85, -7, 2.2, 0.25, 4.2, mats.medicalWhite, g);
      box(bx, 1.05, -8.6, 1.8, 0.15, 0.8, mats.medicalWhite, g);
      cyl(bx - 1.3, 1.6, -8.6, 0.03, 2.6, mats.steel, g);
      cyl(bx - 1.3, 2.6, -8.6, 0.12, 0.3, mats.glass, g);
    }

    // Doctor Consultation Desk & Pharmacy
    box(10, 0.65, -6, 5.5, 1.0, 2.4, mats.woodDesk, g);
    box(10, 2.2, -14.6, 7.0, 3.0, 0.6, mats.medicalWhite, g);

    // Detailed Emergency Ambulance Van (with real wheels & siren)
    createDetailedCar(12, 0, 10, -Math.PI / 2, '#ffffff', 'ambulance', g);

    canvasSign('EMERGENCY HOSPITAL', 'आपातकालीन चिकित्सालय एवं डिस्पेंसरी', 16, 3.2, 0, 4.2, 3.2, g, '#1e3a5f');
  });

  // =========================================================================
  // 6. P1 PARKING PLAZA (हल्के एवं भारी वाहन पार्किंग)
  // =========================================================================
  registerFacility({
    id: 'p1_parking',
    name: 'P1 Parking Plaza (Cars & SUVs)',
    hiName: 'P1 कार एवं भारी वाहन पार्किंग स्थल',
    icon: '🚗',
    category: 'parking',
    desc: 'Multi-acre organized vehicle parking with numbered parking bays, automated boom barriers & floodlight masts.',
    exteriorPos: { x: -36, z: 54, y: 0 },
    camPresets: {
      overview: { angle: 0.2, elevation: 0.44, distance: 48, x: 0, z: 0 },
      lanes: { angle: -0.4, elevation: 0.22, distance: 26, x: -8, z: 4 },
      tollBooth: { angle: 0.6, elevation: 0.18, distance: 20, x: 8, z: 12 }
    }
  }, (g) => {
    // Dark Asphalt Parking Ground with realistic texture
    box(0, 0.1, 0, 68, 0.2, 48, mats.road, g);

    // Crisp Yellow Lane Striping (Numbered parking bays)
    for (let lx of [-20, -5, 10, 25]) {
      box(lx, 0.22, 0, 0.25, 0.02, 40, mats.cautionStripe, g);
    }
    for (let z = -18; z <= 18; z += 6.5) {
      box(-12.5, 0.22, z, 14.5, 0.02, 0.2, mats.whiteWall, g);
      box(2.5, 0.22, z, 14.5, 0.02, 0.2, mats.whiteWall, g);
      box(17.5, 0.22, z, 14.5, 0.02, 0.2, mats.whiteWall, g);
    }

    // Realistic Parked Vehicles with Real Wheels, Rims, Mirrors, Lights & Plates
    const carPal = ['#f8fafc', '#cbd5e1', '#b91c1c', '#1e3a8a', '#1e293b', '#64748b', '#991b1b', '#ffffff'];
    let carIdx = 0;
    for (let row = 0; row < 3; row++) {
      const rx = -12 + row * 15;
      for (let z = -14; z <= 14; z += 6.5) {
        const cColor = carPal[carIdx % carPal.length];
        const vType = carIdx % 3 === 0 ? 'suv' : 'sedan';
        createDetailedCar(rx, 0, z, Math.PI / 2, cColor, vType, g);
        carIdx++;
      }
    }

    // Modern Electronic Toll Booth with Concrete Island & Boom Barrier
    box(0, 0.25, 22, 5.0, 0.3, 4.0, mats.concrete, g); // concrete island
    box(0, 1.6, 22, 2.6, 2.4, 2.4, mats.whiteWall, g); // cabin
    box(0, 2.85, 22, 3.0, 0.15, 2.8, mats.darkSteel, g); // roof
    box(0, 3.2, 22, 1.2, 0.5, 0.8, mats.lightConcrete, g); // roof AC unit
    box(0, 1.65, 23.22, 2.0, 1.1, 0.08, mats.glass, g); // toll window
    // Automated barrier
    box(-3.2, 0.6, 22, 0.45, 1.2, 0.45, mats.cautionStripe, g); // housing
    box(-0.6, 0.95, 22, 5.0, 0.12, 0.12, mats.roofIvory, g); // barrier arm

    // 25m High-Mast Floodlight Tower with 12 Lamps
    cyl(-28, 7.0, -18, 0.25, 14, mats.steel, g);
    box(-28, 14.0, -18, 2.2, 0.3, 2.2, mats.steel, g);
    for (let sp = 0; sp < 6; sp++) {
      const a = (sp / 6) * Math.PI * 2;
      box(-28 + Math.cos(a) * 1.0, 14.2, -18 + Math.sin(a) * 1.0, 0.4, 0.25, 0.4, mats.roofIvory, g);
    }

    canvasSign('P1 PARKING PLAZA', 'हल्के एवं भारी वाहन पार्किंग स्थल', 16, 3.2, 0, 4.4, 22, g, '#1e293b');
  });

  // =========================================================================
  // 7. P2 TRANSIT TERMINAL (बस एवं दोपहिया पार्किंग)
  // =========================================================================
  registerFacility({
    id: 'p2_parking',
    name: 'P2 Transit Terminal (Buses & Two-Wheelers)',
    hiName: 'P2 बस स्टैंड एवं दोपहिया वाहन पार्किंग',
    icon: '🚌',
    category: 'transit',
    desc: 'Public transit interchange with Haryana Roadways passenger bus bays & secure two-wheeler parking.',
    exteriorPos: { x: -44, z: -18, y: 0 },
    camPresets: {
      overview: { angle: 0.15, elevation: 0.42, distance: 44, x: 0, z: 0 },
      busBays: { angle: -0.6, elevation: 0.20, distance: 24, x: -10, z: 0 },
      twoWheelers: { angle: 0.5, elevation: 0.18, distance: 20, x: 12, z: 4 }
    }
  }, (g) => {
    box(0, 0.1, 0, 62, 0.2, 44, mats.road, g);

    // 2 Realistic Haryana Roadways Passenger Coaches with Dual Wheels & Detailing
    createDetailedCar(-12, 0, -8, 0, '#0284c7', 'bus', g);
    createDetailedCar(-12, 0, 8, 0, '#15803d', 'bus', g);

    // Realistic Two-Wheelers with spoked wheels & handlebars
    const bikeColors = ['#1e293b', '#dc2626', '#2563eb', '#ca8a04', '#059669'];
    let bIdx = 0;
    for (let z = -14; z <= 14; z += 3.2) {
      createDetailedCar(14, 0, z, Math.PI / 2, bikeColors[bIdx % bikeColors.length], 'bike', g);
      bIdx++;
    }

    // Commuter Waiting Shelter
    box(0, 2.2, -18, 22, 4.0, 3.5, mats.whiteWall, g);
    box(0, 4.3, -18, 23, 0.3, 4.0, mats.roofIvory, g);

    canvasSign('P2 TRANSIT TERMINAL', 'बस स्टैंड एवं दोपहिया वाहन पार्किंग', 16, 3.2, 0, 4.6, 18, g, '#0369a1');
  });

  // =========================================================================
  // 8. GATE 1 VIP BOULEVARD & PROTOCOL PLAZA (मुख्य वीआईपी द्वार)
  // =========================================================================
  registerFacility({
    id: 'vip_gate1',
    name: 'Gate 1 VIP Boulevard & Protocol Plaza',
    hiName: 'गेट 1 वीआईपी मुख्य प्रवेश एवं प्रोटोकॉल प्लाजा',
    icon: '🚩',
    category: 'security',
    desc: 'Grand ceremonial welcome gate with illuminated triumphal arch, VIP red carpet lane and security checkpoint.',
    exteriorPos: { x: -62, z: 28, y: 0 },
    camPresets: {
      overview: { angle: 0.1, elevation: 0.40, distance: 36, x: 0, z: 0 },
      gateArch: { angle: 0.0, elevation: 0.18, distance: 22, x: 0, z: -2 },
      vipLane: { angle: -0.6, elevation: 0.20, distance: 24, x: -6, z: 8 }
    }
  }, (g) => {
    box(0, 0.1, 0, 52, 0.2, 42, mats.road, g);
    // VIP Red Carpet Driveway with gold border
    box(0, 0.22, 0, 8, 0.04, 38, mats.redCarpet, g);
    box(-4.1, 0.23, 0, 0.2, 0.02, 38, mats.brassGold, g);
    box(4.1, 0.23, 0, 0.2, 0.02, 38, mats.brassGold, g);

    // Grand Triumphal Welcome Arch (Pillars + Archway Header)
    cyl(-9, 4.5, 0, 1.2, 9.0, mats.brassGold, g);
    cyl(9, 4.5, 0, 1.2, 9.0, mats.brassGold, g);
    box(0, 9.5, 0, 24, 2.2, 2.6, mats.whiteWall, g);
    cyl(0, 11.8, 0, 1.6, 0.3, mats.brassGold, g);

    // Realistic Ashoka Avenue Trees flanking red carpet
    for (let z of [-14, -6, 6, 14]) {
      addTree(-7.5, z, 0.9, 'ashoka', g);
      addTree(7.5, z, 0.9, 'ashoka', g);
    }

    // Protocol Security Cabins
    box(-16, 1.5, 0, 3.5, 2.8, 3.5, mats.whiteWall, g);
    box(16, 1.5, 0, 3.5, 2.8, 3.5, mats.whiteWall, g);

    // Parked VIP Motorcade SUVs with flags & tinted glass
    createDetailedCar(-16, 0, 12, 0, '#ffffff', 'vip', g);
    createDetailedCar(16, 0, 12, 0, '#0f172a', 'vip', g);

    canvasSign('GATE 1 VIP ENTRANCE', 'मुख्य वीआईपी द्वार एवं प्रोटोकॉल प्लाजा', 18, 3.4, 0, 8.5, 1.4, g, '#78350f');
  });

  // =========================================================================
  // 9. FOOT OVERBRIDGE (FOB) & HIGHWAY CROSSING (पैदल पुल)
  // =========================================================================
  registerFacility({
    id: 'p5_fob',
    name: 'Foot Overbridge (FOB) & Highway Crossing',
    hiName: 'पैदल पुल (FOB) एवं हाईवे क्रॉसिंग',
    icon: '🌉',
    category: 'transit',
    desc: 'Elevated pedestrian foot overbridge with staircases, overhead protective cage & highway traffic overview.',
    exteriorPos: { x: -28, z: 62, y: 0 },
    camPresets: {
      overview: { angle: 0.2, elevation: 0.38, distance: 42, x: 0, z: 0 },
      bridgeDeck: { angle: 0.0, elevation: 0.16, distance: 24, x: 0, z: 0 },
      highwayView: { angle: 0.8, elevation: 0.20, distance: 28, x: 10, z: -8 }
    }
  }, (g) => {
    // 4-Lane Highway Roadway Below
    box(0, 0.1, 0, 56, 0.2, 38, mats.road, g);
    box(0, 0.22, 0, 56, 0.03, 0.4, mats.whiteWall, g); // central median

    // Elevated Bridge Columns (Piers)
    cyl(-14, 4.0, 0, 0.6, 8.0, mats.concrete, g);
    cyl(14, 4.0, 0, 0.6, 8.0, mats.concrete, g);

    // Bridge Walkway Deck & Protective Safety Cage
    box(0, 7.8, 0, 5.0, 0.4, 38, mats.lightConcrete, g); // Deck
    box(0, 10.4, 0, 5.2, 0.2, 38, mats.roofIvory, g); // Roof
    // Side safety railings
    box(-2.4, 9.0, 0, 0.1, 2.2, 38, mats.steel, g);
    box(2.4, 9.0, 0, 0.1, 2.2, 38, mats.steel, g);

    // Staircase Ramps on both ends
    box(0, 3.8, -24, 4.6, 0.3, 12, mats.steel, g).rotation.x = 0.45;
    box(0, 3.8, 24, 4.6, 0.3, 12, mats.steel, g).rotation.x = -0.45;

    canvasSign('PEDESTRIAN FOOT OVERBRIDGE', 'सुरक्षित पैदल पुल एवं हाईवे क्रॉसिंग', 14, 2.6, 0, 11.2, 0, g, '#1e3a8a');
  });

  // =========================================================================
  // 10. SEWADAL RESIDENCE & VOLUNTEER CAMP (सेवादल कैंप)
  // =========================================================================
  registerFacility({
    id: 'sewadal_camp',
    name: 'Sewadal Residence & Volunteer Base Camp',
    hiName: 'सेवादल आवासीय परिसर एवं कैंप कार्यालय',
    icon: '⛺',
    category: 'welfare',
    desc: 'Organized residential tent barracks, roll-call assembly square, administrative desks and welfare stations.',
    exteriorPos: { x: 22, z: -14, y: 0 },
    camPresets: {
      overview: { angle: 0.15, elevation: 0.42, distance: 44, x: 0, z: 0 },
      tents: { angle: -0.6, elevation: 0.20, distance: 24, x: -10, z: 0 },
      paradeGround: { angle: 0.6, elevation: 0.22, distance: 22, x: 10, z: 4 }
    }
  }, (g) => {
    box(0, 0.1, 0, 58, 0.2, 42, mats.lightConcrete, g);
    // Roll-call Parade Ground
    box(12, 0.22, 0, 26, 0.04, 34, mats.whiteWall, g);

    // Ceremonial Flagmast atop raised marble dais
    box(12, 0.5, 0, 3.6, 0.8, 3.6, mats.whiteWall, g);
    cyl(12, 7.5, 0, 0.12, 14, mats.steel, g); // flagpole
    box(12, 13.5, 0.6, 0.1, 1.2, 1.8, mats.brassGold, g); // flag

    // Symmetrical Rows of Canvas Residential Tents
    for (let row = 0; row < 3; row++) {
      const tz = -12 + row * 12;
      for (let col = 0; col < 3; col++) {
        const tx = -20 + col * 7;
        box(tx, 1.5, tz, 5.5, 2.8, 7.5, mats.tentCanvas, g);
        cyl(tx, 2.9, tz, 0.06, 7.6, mats.steel, g).rotation.x = Math.PI / 2;
      }
    }

    // Administrative Cabin
    box(18, 1.8, 12, 10, 3.4, 6.5, mats.whiteWall, g);

    canvasSign('SEWADAL RESIDENCE', 'सेवादल आवासीय कैंप एवं कार्यालय', 14, 2.8, 0, 4.8, 19, g, '#14532d');
  });

  // =========================================================================
  // 11. SANITATION & RESTROOMS COMPLEX (शौचालय परिसर)
  // =========================================================================
  registerFacility({
    id: 'toilets',
    name: 'Sanitation, Restrooms & Hygiene Complex',
    hiName: 'शौचालय एवं जन-सुविधा परिसर',
    icon: '🚻',
    category: 'welfare',
    desc: 'Modular hygienic toilet blocks with separate Gents/Ladies wings, washbasin troughs & overhead water storage.',
    exteriorPos: { x: -74, z: -4, y: 0 },
    camPresets: {
      overview: { angle: 0.1, elevation: 0.42, distance: 38, x: 0, z: 0 },
      cubicles: { angle: -0.5, elevation: 0.22, distance: 20, x: -8, z: 0 },
      washbasins: { angle: 0.6, elevation: 0.20, distance: 18, x: 8, z: 2 }
    }
  }, (g) => {
    box(0, 0.1, 0, 48, 0.2, 34, mats.lightConcrete, g);

    // Two Modular Restroom Blocks (Ladies & Gents)
    for (let side of [-1, 1]) {
      const bx = side * 13;
      box(bx, 1.8, 0, 15, 3.4, 24, mats.whiteWall, g);
      // Overhead Sintex Water Tanks
      cyl(bx - 3.5, 4.3, 0, 1.2, 1.6, mats.darkSteel, g);
      cyl(bx + 3.5, 4.3, 0, 1.2, 1.6, mats.darkSteel, g);
      // Cubicle doors
      for (let dz = -8; dz <= 8; dz += 4) {
        box(bx + side * 7.4, 1.5, dz, 0.2, 2.4, 1.8, mats.policeBlue, g);
      }
    }

    // Central Handwashing Basin Trough with Faucets
    box(0, 0.8, 0, 4.0, 1.2, 18, mats.steel, g);

    canvasSign('SANITATION & HYGIENE COMPLEX', 'शौचालय एवं जन-सुविधा परिसर', 14, 2.8, 0, 4.4, 15, g, '#0f766e');
  });

  // =========================================================================
  // 12. HIGHWAY FLYOVER & UNDERPASS SUBWAY (हाईवे फ्लाईओवर)
  // =========================================================================
  registerFacility({
    id: 'flyover_underpass',
    name: 'Highway Flyover & Underpass Subway',
    hiName: 'NH-44 हाईवे फ्लाईओवर एवं अंडरपास',
    icon: '🛣️',
    category: 'transit',
    desc: '4-lane elevated highway bridge overpass with crash barriers, underpass corridor & traffic management gates.',
    exteriorPos: { x: 4, z: 12, y: 0 },
    camPresets: {
      overview: { angle: 0.2, elevation: 0.40, distance: 48, x: 0, z: 0 },
      underpass: { angle: 0.0, elevation: 0.12, distance: 22, x: 0, z: 0 },
      flyoverDeck: { angle: -0.6, elevation: 0.24, distance: 32, x: -8, z: 6 }
    }
  }, (g) => {
    // Ground & Underpass Passage Road
    box(0, 0.1, 0, 64, 0.2, 44, mats.road, g);

    // Concrete Overpass Highway Bridge (Elevated 4-lane deck)
    box(0, 7.2, 0, 64, 0.8, 18, mats.concrete, g);
    box(0, 7.7, 0, 64, 0.05, 0.3, mats.whiteWall, g); // central divider
    // Crash barriers
    box(0, 8.2, -8.8, 64, 1.1, 0.3, mats.lightConcrete, g);
    box(0, 8.2, 8.8, 64, 1.1, 0.3, mats.lightConcrete, g);

    // Support Piers (Pillars)
    for (let px of [-20, 0, 20]) {
      cyl(px, 3.4, -6.5, 0.9, 6.8, mats.concrete, g);
      cyl(px, 3.4, 6.5, 0.9, 6.8, mats.concrete, g);
    }

    canvasSign('NH-44 HIGHWAY FLYOVER', 'राष्ट्रीय राजमार्ग 44 फ्लाईओवर एवं अंडरपास', 16, 3.2, 0, 10.4, 0, g, '#1e293b');
  });

  // Build all facilities now
  Object.values(facilities).forEach(f => f.build());

  // --- SIDE FLOATING HUD INTERFACE ---
  const hud = document.createElement('div');
  hud.id = 'facilityModelHud';
  hud.style.cssText = `
    display: none;
    position: absolute;
    top: 14px;
    right: 16px;
    background: rgba(12, 22, 34, 0.95);
    border: 1px solid #4583b2;
    box-shadow: 0 12px 35px rgba(0,0,0,0.7), 0 0 20px rgba(0, 160, 255, 0.25);
    border-radius: 12px;
    padding: 12px 14px;
    z-index: 1000;
    color: #edf5fc;
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
    <div id="facHudHeader" style="display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:grab;user-select:none">
      <div style="display:flex;align-items:center;gap:8px">
        <span id="facIcon" style="font-size:20px">🏛️</span>
        <div>
          <b id="facTitle" style="font-size:13px;color:#ffdf79;letter-spacing:0.4px">FACILITY 3D MODEL</b>
          <div id="facDesc" style="font-size:10px;color:#bfe0fa">Detailed operational 3D model</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <button id="minFacBtn" title="Minimize/Expand Controls" style="
          background:#1b3952;color:#9eccf0;border:1px solid #45739c;border-radius:6px;
          padding:4px 8px;cursor:pointer;font-size:12px;font-weight:bold;width:auto
        ">−</button>
        <button id="exitFacilityBtn" style="
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

    <div id="facHudBody" style="display:flex;flex-direction:column;gap:8px;border-top:1px solid rgba(255,255,255,0.12);padding-top:8px">
      <div>
        <div style="font-size:10px;color:#8ab0cc;font-weight:600;text-transform:uppercase;margin-bottom:6px">Camera Views:</div>
        <div id="facCamButtons" style="display:grid;grid-template-columns:1fr 1fr;gap:6px"></div>
      </div>
      <div style="font-size:10px;color:#ffcc00;margin-top:2px">
        💡 Drag ground to orbit · Wheel to zoom · ESC: exit
      </div>
    </div>
  `;
  document.querySelector('#viewport')?.append(hud);

  // Minimize Toggle
  const minFacBtn = hud.querySelector('#minFacBtn');
  const facHudBody = hud.querySelector('#facHudBody') as HTMLElement;
  let isFacMin = false;
  minFacBtn?.addEventListener('click', () => {
    isFacMin = !isFacMin;
    if (facHudBody) facHudBody.style.display = isFacMin ? 'none' : 'flex';
    if (minFacBtn) minFacBtn.textContent = isFacMin ? '+' : '−';
    hud.style.width = isFacMin ? 'auto' : '340px';
  });

  // Draggable HUD
  const fHeader = hud.querySelector('#facHudHeader') as HTMLElement;
  if (fHeader) {
    let isDragging = false, startX = 0, startY = 0, initLeft = 0, initTop = 0;
    fHeader.addEventListener('pointerdown', (e: PointerEvent) => {
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
      fHeader.style.cursor = 'grabbing';
      fHeader.setPointerCapture(e.pointerId);
    });
    fHeader.addEventListener('pointermove', (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      hud.style.left = `${Math.max(10, Math.min(window.innerWidth - hud.offsetWidth - 10, initLeft + dx))}px`;
      hud.style.top = `${Math.max(10, Math.min(window.innerHeight - hud.offsetHeight - 10, initTop + dy))}px`;
    });
    const stopFDrag = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        fHeader.style.cursor = 'grab';
        try { fHeader.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };
    fHeader.addEventListener('pointerup', stopFDrag);
    fHeader.addEventListener('pointercancel', stopFDrag);
  }

  // --- 3D CLICKABLE SIGNS ACROSS VENUE ---
  const interactiveBillboards: THREE.Object3D[] = [];

  function makeFacilitySignBillboard(facId: string, label: string, pos: { x: number; z: number; y: number }) {
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 240;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = 'rgba(10, 26, 46, 0.94)'; ctx.fillRect(0, 0, 1024, 240);
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 10; ctx.strokeRect(10, 10, 1004, 220);
    ctx.fillStyle = '#ffdf79'; ctx.font = 'bold 54px Arial'; ctx.textAlign = 'center';
    ctx.fillText(label, 512, 105);
    ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 40px Arial';
    ctx.fillText('🔍 CLICK TO OPEN 3D MODEL', 512, 190);

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.anisotropy = 8;
    const spriteMat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(pos.x, pos.y + 14, pos.z);
    sprite.scale.set(18, 4.5, 1);
    sprite.userData = { isFacilitySign: true, facilityId: facId };
    scene.add(sprite);
    interactiveBillboards.push(sprite);
  }

  // Create billboards for all registered facilities
  Object.values(facilities).forEach(f => {
    makeFacilitySignBillboard(f.def.id, `${f.def.icon} ${f.def.name.toUpperCase()}`, f.def.exteriorPos);
  });

  // --- OPEN & CLOSE LOGIC ---

  const controlsHidden = new Map<HTMLElement, string>();

  function openFacility(id: string) {
    if (id === 'pandal') {
      if (openBigPandal) openBigPandal();
      return;
    }
    if (!facilities[id]) return;
    activeFacilityId = id;
    savedExteriorState = getCameraState();

    document.querySelectorAll<HTMLElement>('#viewport [data-hall-hide="true"]').forEach(o => {
      controlsHidden.set(o, o.style.display);
      o.style.display = 'none';
    });

    if (globalThis.setVenueExteriorVisibility) {
      globalThis.setVenueExteriorVisibility(false);
    }

    // Natural daytime soft sky for facility preview
    scene.background.set('#c8dff0');
    if (scene.fog) {
      scene.fog.color.set('#c8dff0');
      scene.fog.near = 160;
      scene.fog.far = 700;
    }

    masterGroup.visible = true;
    Object.keys(facilities).forEach(k => {
      facilities[k].group.visible = (k === id);
    });

    const fac = facilities[id].def;
    const iconEl = hud.querySelector('#facIcon');
    const titleEl = hud.querySelector('#facTitle');
    const descEl = hud.querySelector('#facDesc');
    const btnsEl = hud.querySelector('#facCamButtons');

    if (iconEl) iconEl.textContent = fac.icon;
    if (titleEl) titleEl.textContent = `${fac.name.toUpperCase()} · ${fac.hiName}`;
    if (descEl) descEl.textContent = fac.desc;

    if (btnsEl) {
      btnsEl.innerHTML = '';
      Object.keys(fac.camPresets).forEach(vKey => {
        const b = document.createElement('button');
        b.style.cssText = 'padding:5px 8px;font-size:11px;background:#1e354a;border:1px solid #4a6d88;border-radius:6px;color:#e1effa;cursor:pointer;text-transform:capitalize;text-align:left';
        b.textContent = `🎯 ${vKey}`;
        b.onclick = () => {
          const p = fac.camPresets[vKey];
          smoothView(p.angle, p.elevation, p.distance, p.x, p.z);
        };
        btnsEl.append(b);
      });
    }

    hud.style.display = 'flex';

    const initCam = fac.camPresets.overview;
    smoothView(initCam.angle, initCam.elevation, initCam.distance, initCam.x, initCam.z);

    const hint = document.querySelector('#hint');
    if (hint) hint.textContent = `${fac.name} · Drag to orbit · Wheel to zoom · Top presets · Press ESC to exit`;
  }

  function closeFacility() {
    if (!activeFacilityId) return;
    const facDef = facilities[activeFacilityId]?.def;
    activeFacilityId = null;

    masterGroup.visible = false;
    hud.style.display = 'none';

    controlsHidden.forEach((display, o) => {
      o.style.display = display;
    });
    controlsHidden.clear();

    if (globalThis.setVenueExteriorVisibility) {
      globalThis.setVenueExteriorVisibility(true);
    }
    if (scene.fog) {
      scene.fog.color.set('#b4cee0');
      scene.fog.near = 600;
      scene.fog.far = 1950;
    }
    scene.background.set('#b5cee0');

    const retX = facDef?.exteriorPos.x || savedExteriorState.x;
    const retZ = facDef?.exteriorPos.z || savedExteriorState.z;
    smoothView(-0.25, 0.65, 220, retX, retZ);

    const hint = document.querySelector('#hint');
    if (hint) hint.textContent = 'Drag resource to move · Drag ground to orbit · Right-drag to pan · Wheel: zoom';
  }

  hud.querySelector('#exitFacilityBtn')?.addEventListener('click', closeFacility);

  return {
    masterGroup,
    openFacility,
    closeFacility,
    isInsideAny: () => activeFacilityId !== null,
    getActiveFacilityId: () => activeFacilityId,
    interactiveBillboards,
    facilitiesList: Object.values(facilities).map(f => f.def)
  };
}
