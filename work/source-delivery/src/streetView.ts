import * as THREE from 'three';
import { gsap } from 'gsap';

export interface StreetViewOptions {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  ground: THREE.Mesh;
  pdfFeatures: Array<[string, number, number, number, number, number, string]>;
  smoothView: (a: number, e: number, d: number, x: number, z: number) => void;
  getCameraState: () => { angle: number; elevation: number; distance: number; x: number; z: number };
  setCameraState: (st: { angle: number; elevation: number; distance: number; x: number; z: number }) => void;
}

export function createStreetView({
  scene,
  camera,
  canvas,
  ground,
  pdfFeatures,
  smoothView,
  getCameraState,
  setCameraState
}: StreetViewOptions) {
  let isActive = false;
  let isDropMode = false;

  // Eye-level camera state
  const pos = new THREE.Vector3(-75, 1.8, 100); // Start near Gate 1
  let yaw = 0; // horizontal angle in radians (0 = looking along -Z)
  let pitch = 0; // vertical tilt in radians
  let eyeHeight = 1.8; // Pedestrian default
  let savedVenueState = { angle: -0.25, elevation: 0.85, distance: 480, x: 0, z: 25 };

  // Pointer drag state
  let drag: { x: number; y: number; yaw: number; pitch: number; moved: boolean } | null = null;
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // 13 Curated Street View Vantage Hotspots across the Samagam venue
  const hotspots: Array<{ id: string; name: string; hiName: string; x: number; z: number; y: number; yaw: number }> = [
    { id: 'gate1', name: 'Gate 1 Main Entrance & VIP Boulevard', hiName: 'गेट 1 मुख्य प्रवेश एवं वीआईपी मार्ग', x: -75, z: 100, y: 1.8, yaw: 0.0 },
    { id: 'pandalFront', name: 'Grand Pandal Main Entrance & Porch', hiName: 'बड़ा पंडाल मुख्य द्वार एवं पोर्च', x: -43, z: 102, y: 1.8, yaw: -0.05 },
    { id: 'highwayFlyover', name: 'NH-44 GT Road Highway Overpass Flyover', hiName: 'NH-44 जीटी रोड हाईवे ओवरपास फ्लाईओवर', x: 22, z: 98, y: 11.5, yaw: 0.4 },
    { id: 'fob', name: 'Foot Overbridge (FOB) Pedestrian Skywalk', hiName: 'पैदल पुल (FOB) एवं हाईवे क्रॉसिंग', x: -46, z: 146, y: 6.2, yaw: 0.1 },
    { id: 'p1Parking', name: 'P1 Light Vehicles & Car Parking', hiName: 'P1 कार एवं हल्के वाहन पार्किंग ग्राउंड', x: -166, z: 72, y: 1.8, yaw: 1.2 },
    { id: 'p2BusBay', name: 'P2 Buses & Daily Commuters Bay', hiName: 'P2 बस टर्मिनल एवं दैनिक यात्री क्षेत्र', x: -107, z: 32, y: 1.8, yaw: 0.8 },
    { id: 'p3Outstation', name: 'P3 Outstation Heavy Vehicles Ground', hiName: 'P3 बाहरी राज्य वाहन एवं बस मैदान', x: 75, z: -152, y: 1.8, yaw: 2.4 },
    { id: 'p4Saints', name: 'P4 Saints From Abroad & Sewadars Camp', hiName: 'P4 विदेशी श्रद्धालु एवं सेवादल निवास', x: 81, z: 40, y: 1.8, yaw: 1.6 },
    { id: 'langar2', name: 'Langar 2 & Grand Dining Enclosure', hiName: 'लंगर 2 एवं विशाल भोजन व्यवस्था हॉल', x: 10, z: 46, y: 1.8, yaw: -1.8 },
    { id: 'railwayAlight', name: 'Railway Station & ISBT Alighting Point', hiName: 'रेलवे स्टेशन एवं बस ड्रॉपिंग पॉइंट', x: -76, z: 29, y: 1.8, yaw: -0.4 },
    { id: 'policeChowki', name: 'Central Security Chowki & Police Post', hiName: 'केंद्रीय सुरक्षा चौकी एवं पुलिस कंट्रोल पोस्ट', x: 23, z: 79, y: 1.8, yaw: -2.1 },
    { id: 'underpassRamp', name: 'Delhi-Side Underpass & Loop Ramp', hiName: 'दिल्ली साइड अंडरपास एवं लूप रोड', x: 130, z: 118, y: 2.2, yaw: 3.0 },
    { id: 'eastGate', name: 'East Gate Entry & Alighting Corridor', hiName: 'ईस्ट गेट प्रवेश एवं वाहन डिस्चार्ज कॉरिडोर', x: 56, z: -16, y: 1.8, yaw: -1.1 }
  ];

  let currentHotspotIdx = 0;

  // --- 1. 3D VISUAL INDICATORS (STREET VIEW GROUND RING & ARROW) ---
  const svGroup = new THREE.Group();
  svGroup.name = 'streetViewGroup';
  scene.add(svGroup);

  // Ground Target Cursor Ring (Google Maps Street View Navigation Disc)
  const ringGeo = new THREE.RingGeometry(0.9, 1.35, 32);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: '#ffcc00',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    depthWrite: false
  });
  const groundRing = new THREE.Mesh(ringGeo, ringMat);
  groundRing.position.set(0, 0.08, 0);
  groundRing.visible = false;
  svGroup.add(groundRing);

  // Directional chevron arrow inside ring
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, 0.7);
  arrowShape.lineTo(-0.45, -0.45);
  arrowShape.lineTo(0, -0.2);
  arrowShape.lineTo(0.45, -0.45);
  arrowShape.closePath();
  const arrowGeo = new THREE.ShapeGeometry(arrowShape);
  arrowGeo.rotateX(-Math.PI / 2);
  const arrowMesh = new THREE.Mesh(arrowGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthWrite: false }));
  arrowMesh.position.set(0, 0.09, 0);
  groundRing.add(arrowMesh);

  // Floating Pegman Avatar mesh for Drop Mode preview
  const pegmanAvatar = new THREE.Group();
  const pMat = new THREE.MeshStandardMaterial({ color: '#ffb300', roughness: 0.3, metalness: 0.2 });
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), pMat); headMesh.position.y = 2.4;
  const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 1.2, 12), pMat); torsoMesh.position.y = 1.4;
  const legsMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.2, 0.9, 12), pMat); legsMesh.position.y = 0.45;
  pegmanAvatar.add(headMesh, torsoMesh, legsMesh);
  pegmanAvatar.position.set(0, 0.2, 0);
  pegmanAvatar.visible = false;
  svGroup.add(pegmanAvatar);

  // --- 2. GOOGLE STREET VIEW HUD INTERFACE ---
  // --- 2. SIDE FLOATING HUD INTERFACE ---
  const hud = document.createElement('div');
  hud.id = 'streetViewHud';
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
    <div id="svHudHeader" style="display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:grab;user-select:none">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="
          width:28px;height:28px;border-radius:50%;background:#ffb300;color:#111;
          display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold
        ">🚶</div>
        <div>
          <b style="font-size:13px;color:#ffdf79;letter-spacing:0.4px">STREET VIEW 360°</b>
          <div id="svLocationBadge" style="font-size:10px;color:#bfe0fa;max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            📍 Gate 1 VIP Boulevard
          </div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <button id="minSvBtn" title="Minimize/Expand Controls" style="
          background:#1b3952;color:#9eccf0;border:1px solid #45739c;border-radius:6px;
          padding:4px 8px;cursor:pointer;font-size:12px;font-weight:bold;width:auto
        ">−</button>
        <button id="exitStreetViewBtn" style="
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

    <!-- Collapsible Controls Body -->
    <div id="svHudBody" style="display:flex;flex-direction:column;gap:8px;border-top:1px solid rgba(255,255,255,0.12);padding-top:8px">
      <div style="display:flex;flex-direction:column;gap:4px">
        <span style="font-size:10px;color:#8ab0cc;font-weight:600;text-transform:uppercase">Jump to Location:</span>
        <select id="svHotspotSelect" style="
          background:#162738;border:1px solid #486985;border-radius:6px;color:#fff;padding:5px 8px;font-size:11px;cursor:pointer
        ">
          ${hotspots.map((h, i) => `<option value="${i}">${h.name}</option>`).join('')}
        </select>
      </div>

      <div style="display:flex;gap:6px">
        <button id="svPrevBtn" title="Previous Spot" style="flex:1;padding:5px;font-size:11px;background:#1f374c;border:1px solid #4d7594;border-radius:6px;color:#fff;cursor:pointer">◀ Prev Spot</button>
        <button id="svNextBtn" title="Next Spot" style="flex:1;padding:5px;font-size:11px;background:#1f374c;border:1px solid #4d7594;border-radius:6px;color:#fff;cursor:pointer">Next Spot ▶</button>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:11px;color:#8ab0cc">Height:</span>
          <select id="svHeightSelect" style="background:#162738;border:1px solid #486985;border-radius:6px;color:#fff;padding:3px 6px;font-size:11px;width:auto">
            <option value="1.8">🚶 Pedestrian (1.8m)</option>
            <option value="4.5">🗼 Tower (4.5m)</option>
            <option value="12.0">🚁 Drone (12m)</option>
          </select>
        </div>
        <div id="svCompassIndicator" style="
          display:flex;align-items:center;gap:4px;padding:3px 8px;background:rgba(0,0,0,0.3);border:1px solid #3e607b;border-radius:6px;font-size:11px;color:#64b5f6;font-family:monospace
        ">
          🧭 <span>000° N</span>
        </div>
      </div>

      <div style="font-size:10px;color:#ffcc00;margin-top:2px">
        💡 Drag ground to look 360° · Click road to walk · WASD/Keys · ESC: exit
      </div>
    </div>
  `;
  document.querySelector('#viewport')?.append(hud);

  // Minimize Toggle
  const minSvBtn = hud.querySelector('#minSvBtn');
  const svHudBody = hud.querySelector('#svHudBody') as HTMLElement;
  let isSvMin = false;
  minSvBtn?.addEventListener('click', () => {
    isSvMin = !isSvMin;
    if (svHudBody) svHudBody.style.display = isSvMin ? 'none' : 'flex';
    if (minSvBtn) minSvBtn.textContent = isSvMin ? '+' : '−';
    hud.style.width = isSvMin ? 'auto' : '340px';
  });

  // Draggable HUD
  const sHeader = hud.querySelector('#svHudHeader') as HTMLElement;
  if (sHeader) {
    let isDragging = false, startX = 0, startY = 0, initLeft = 0, initTop = 0;
    sHeader.addEventListener('pointerdown', (e: PointerEvent) => {
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
      sHeader.style.cursor = 'grabbing';
      sHeader.setPointerCapture(e.pointerId);
    });
    sHeader.addEventListener('pointermove', (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      hud.style.left = `${Math.max(10, Math.min(window.innerWidth - hud.offsetWidth - 10, initLeft + dx))}px`;
      hud.style.top = `${Math.max(10, Math.min(window.innerHeight - hud.offsetHeight - 10, initTop + dy))}px`;
    });
    const stopSDrag = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        sHeader.style.cursor = 'grab';
        try { sHeader.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };
    sHeader.addEventListener('pointerup', stopSDrag);
    sHeader.addEventListener('pointercancel', stopSDrag);
  }

  // --- 3. CORNER MINI-MAP RADAR WIDGET ---
  const radarContainer = document.createElement('div');
  radarContainer.id = 'streetViewRadar';
  radarContainer.style.cssText = `
    display: none;
    position: absolute;
    bottom: 38px;
    right: 18px;
    width: 130px;
    height: 130px;
    background: rgba(10, 20, 32, 0.88);
    border: 2px solid #ffb300;
    box-shadow: 0 6px 20px rgba(0,0,0,0.6);
    border-radius: 50%;
    z-index: 1000;
    overflow: hidden;
    cursor: crosshair;
    backdrop-filter: blur(6px);
  `;
  radarContainer.title = 'Click anywhere on radar to teleport there in Street View';
  const radarCanvas = document.createElement('canvas');
  radarCanvas.width = 130;
  radarCanvas.height = 130;
  radarContainer.append(radarCanvas);
  document.querySelector('#viewport')?.append(radarContainer);

  const radarCtx = radarCanvas.getContext('2d');

  function drawMiniRadar() {
    if (!radarCtx || !isActive) return;
    const w = 130, h = 130, cx = 65, cy = 65;
    radarCtx.clearRect(0, 0, w, h);

    // Dark radar background
    radarCtx.fillStyle = '#0a1622';
    radarCtx.beginPath();
    radarCtx.arc(cx, cy, 63, 0, Math.PI * 2);
    radarCtx.fill();

    // Radar concentric distance rings
    radarCtx.strokeStyle = 'rgba(74, 137, 184, 0.35)';
    radarCtx.lineWidth = 1;
    for (let r of [20, 42, 60]) {
      radarCtx.beginPath();
      radarCtx.arc(cx, cy, r, 0, Math.PI * 2);
      radarCtx.stroke();
    }

    // Radar crosshairs (North / South / East / West)
    radarCtx.beginPath();
    radarCtx.moveTo(cx, 4); radarCtx.lineTo(cx, 126);
    radarCtx.moveTo(4, cy); radarCtx.lineTo(126, cy);
    radarCtx.stroke();

    // North Indicator
    radarCtx.fillStyle = '#ff5252';
    radarCtx.font = 'bold 10px Arial';
    radarCtx.textAlign = 'center';
    radarCtx.fillText('N', cx, 14);

    // Map venue coordinates to radar coordinates:
    // Venue X: -300..300, Z: -225..225
    function toRadar(vx: number, vz: number) {
      const rx = cx + (vx / 300) * 54;
      const ry = cy + (vz / 225) * 54;
      return { x: rx, y: ry };
    }

    // Draw schematic venue roads / Pandal footprint
    radarCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    radarCtx.lineWidth = 2;
    // Highway line
    const h1 = toRadar(-250, 135), h2 = toRadar(250, 135);
    radarCtx.beginPath(); radarCtx.moveTo(h1.x, h1.y); radarCtx.lineTo(h2.x, h2.y); radarCtx.stroke();

    // Pandal block
    const pb = toRadar(-43, 58);
    radarCtx.fillStyle = 'rgba(100, 181, 246, 0.4)';
    radarCtx.fillRect(pb.x - 7, pb.y - 10, 14, 20);

    // Current Pegman Position
    const cur = toRadar(pos.x, pos.z);

    // Vision FOV Cone pointing in yaw direction
    // Yaw: 0 is looking towards -Z (upwards on radar)
    const fovAngle = Math.PI / 3.5;
    const coneDist = 26;
    const dirAngle = -yaw - Math.PI / 2; // adjust for canvas coordinates
    radarCtx.fillStyle = 'rgba(255, 200, 0, 0.32)';
    radarCtx.beginPath();
    radarCtx.moveTo(cur.x, cur.y);
    radarCtx.arc(cur.x, cur.y, coneDist, dirAngle - fovAngle / 2, dirAngle + fovAngle / 2);
    radarCtx.closePath();
    radarCtx.fill();

    // Golden Pegman dot
    radarCtx.fillStyle = '#ffcc00';
    radarCtx.beginPath();
    radarCtx.arc(cur.x, cur.y, 4.5, 0, Math.PI * 2);
    radarCtx.fill();
    radarCtx.strokeStyle = '#ffffff';
    radarCtx.lineWidth = 1.5;
    radarCtx.stroke();
  }

  // Click on radar to teleport!
  radarContainer.addEventListener('click', (e) => {
    const rect = radarCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left - 65;
    const clickY = e.clientY - rect.top - 65;
    // Reverse map to venue coordinates
    const targetX = Math.max(-280, Math.min(280, (clickX / 54) * 300));
    const targetZ = Math.max(-210, Math.min(210, (clickY / 54) * 225));
    walkTo(targetX, targetZ);
  });

  // --- 4. FLOATING PEGMAN STREET VIEW LAUNCHER BUTTON ---
  const launcherBtn = document.createElement('button');
  launcherBtn.id = 'floatingStreetViewBtn';
  launcherBtn.style.cssText = `
    position: absolute;
    bottom: 34px;
    right: 18px;
    width: auto !important;
    max-width: max-content;
    background: linear-gradient(135deg, #ffb300, #ff8f00);
    color: #111;
    font-weight: 800;
    border: 2px solid #ffe082;
    border-radius: 28px;
    padding: 10px 18px;
    font-size: 13px;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(0,0,0,0.5), 0 0 16px rgba(255,179,0,0.4);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 990;
    transition: transform 0.15s, box-shadow 0.15s;
    font-family: system-ui, sans-serif;
  `;
  launcherBtn.innerHTML = `<span style="font-size:18px">🚶</span> <span>Street View (स्ट्रीट व्यू)</span>`;
  launcherBtn.onmouseover = () => { launcherBtn.style.transform = 'scale(1.05)'; };
  launcherBtn.onmouseout = () => { launcherBtn.style.transform = 'scale(1)'; };
  document.querySelector('#viewport')?.append(launcherBtn);

  // --- 5. STREET VIEW DROP PROMPT BANNER ---
  const dropBanner = document.createElement('div');
  dropBanner.id = 'svDropBanner';
  dropBanner.style.cssText = `
    display: none;
    position: absolute;
    top: 65px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 179, 0, 0.95);
    color: #1a1a1a;
    font-weight: bold;
    padding: 8px 18px;
    border-radius: 24px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    z-index: 1000;
    font-size: 13px;
    font-family: system-ui, sans-serif;
    align-items: center;
    gap: 10px;
    pointer-events: auto;
  `;
  dropBanner.innerHTML = `
    <span>📍 नक्शे पर किसी भी सड़क, गेट, या ग्राउंड पर क्लिक करें और वहां स्ट्रीट व्यू देखें!</span>
    <button id="cancelDropBtn" style="background:#111;color:#fff;border:none;border-radius:12px;padding:3px 10px;font-size:11px;cursor:pointer">रद्द करें (Cancel)</button>
  `;
  document.querySelector('#viewport')?.append(dropBanner);

  dropBanner.querySelector('#cancelDropBtn')?.addEventListener('click', () => {
    cancelDropMode();
  });

  // --- 6. CORE LOGIC: ENTER, EXIT, WALK, AND UPDATE ---

  function enterStreetView(initialPos?: { x: number; z: number; y?: number; yaw?: number }) {
    if (isActive) return;
    isActive = true;
    cancelDropMode();

    savedVenueState = getCameraState();
    launcherBtn.style.display = 'none';
    hud.style.display = 'flex';
    radarContainer.style.display = 'block';

    if (initialPos) {
      pos.x = initialPos.x;
      pos.z = initialPos.z;
      if (initialPos.y !== undefined) pos.y = initialPos.y;
      if (initialPos.yaw !== undefined) yaw = initialPos.yaw;
    } else {
      const def = hotspots[currentHotspotIdx];
      pos.set(def.x, def.y, def.z);
      yaw = def.yaw;
    }
    pitch = 0.02;

    camera.fov = 68;
    camera.updateProjectionMatrix();

    updateLocationDisplay();
    drawMiniRadar();

    const hint = document.querySelector('#hint');
    if (hint) hint.textContent = 'Google Street View · Drag to look 360° · Click road to walk · WASD/Arrow keys to explore · ESC to exit';
  }

  function exitStreetView() {
    if (!isActive) return;
    isActive = false;

    hud.style.display = 'none';
    radarContainer.style.display = 'none';
    groundRing.visible = false;
    launcherBtn.style.display = 'flex';

    camera.fov = 45;
    camera.updateProjectionMatrix();

    // Smoothly swoop camera back up to orbital perspective
    smoothView(savedVenueState.angle, savedVenueState.elevation, savedVenueState.distance, pos.x, pos.z);

    const hint = document.querySelector('#hint');
    if (hint) hint.textContent = 'Drag resource to move · Drag ground to orbit · Right-drag to pan · Wheel: zoom';
  }

  function walkTo(targetX: number, targetZ: number, targetY?: number) {
    if (!isActive) return;
    const finalY = targetY !== undefined ? targetY : eyeHeight;
    // Animate smoothly to new position
    gsap.to(pos, {
      x: targetX,
      y: finalY,
      z: targetZ,
      duration: 1.1,
      ease: 'power2.out',
      onUpdate: () => {
        updateLocationDisplay();
        drawMiniRadar();
      }
    });
  }

  function jumpToHotspot(idx: number) {
    if (idx < 0 || idx >= hotspots.length) return;
    currentHotspotIdx = idx;
    const spot = hotspots[idx];
    const sel = hud.querySelector('#svHotspotSelect') as HTMLSelectElement;
    if (sel) sel.value = String(idx);

    if (!isActive) {
      enterStreetView(spot);
    } else {
      gsap.to(pos, { x: spot.x, y: spot.y, z: spot.z, duration: 1.2, ease: 'power2.inOut' });
      gsap.to({ yaw }, {
        yaw: spot.yaw,
        duration: 1.0,
        onUpdate: function () { yaw = this.targets()[0].yaw; }
      });
      pitch = 0.02;
    }
    updateLocationDisplay();
  }

  function updateLocationDisplay() {
    // Find closest landmark among pdfFeatures and hotspots
    let closestName = 'Samagam Grounds Area';
    let minDist = 99999;

    hotspots.forEach(h => {
      const d = Math.hypot(pos.x - h.x, pos.z - h.z);
      if (d < minDist) {
        minDist = d;
        closestName = `${h.name} (${h.hiName})`;
      }
    });

    pdfFeatures.forEach(([fname, u, v]) => {
      const fx = (u - 0.5) * 600;
      const fz = (v - 0.5) * 450;
      const d = Math.hypot(pos.x - fx, pos.z - fz);
      if (d < minDist) {
        minDist = d;
        closestName = fname;
      }
    });

    const badge = hud.querySelector('#svLocationBadge');
    if (badge) {
      badge.textContent = `📍 ${closestName} · (Dist: ${Math.round(minDist)}m)`;
    }

    // Update compass heading indicator
    const comp = hud.querySelector('#svCompassIndicator span');
    if (comp) {
      let deg = Math.round((-yaw * (180 / Math.PI)) % 360);
      if (deg < 0) deg += 360;
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const dirStr = dirs[Math.round(deg / 45) % 8];
      comp.textContent = `${String(deg).padStart(3, '0')}° ${dirStr}`;
    }
  }

  // --- 7. POINTER & KEYBOARD EVENT HANDLERS ---

  function onPointerDown(e: PointerEvent) {
    if (!isActive) return;
    drag = { x: e.offsetX, y: e.offsetY, yaw, pitch, moved: false };
    canvas.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!isActive) return;
    if (drag) {
      const dx = e.offsetX - drag.x;
      const dy = e.offsetY - drag.y;
      if (Math.hypot(dx, dy) > 3) drag.moved = true;
      yaw = drag.yaw - dx * 0.0045;
      pitch = Math.max(-1.15, Math.min(1.15, drag.pitch + dy * 0.0035));
      drawMiniRadar();
      updateLocationDisplay();
    } else {
      // Raycast to position ground target ring under mouse
      mouse.set((e.offsetX / canvas.clientWidth) * 2 - 1, -(e.offsetY / canvas.clientHeight) * 2 + 1);
      ray.setFromCamera(mouse, camera);
      const hit = ray.intersectObject(ground)[0];
      if (hit && Math.abs(hit.point.x) < 300 && Math.abs(hit.point.z) < 225) {
        groundRing.position.set(hit.point.x, hit.point.y + 0.08, hit.point.z);
        // Point arrow towards camera
        groundRing.rotation.y = Math.atan2(hit.point.x - pos.x, hit.point.z - pos.z);
        groundRing.visible = true;
        canvas.style.cursor = 'pointer';
      } else {
        groundRing.visible = false;
        canvas.style.cursor = 'default';
      }
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (!isActive) return;
    if (drag && !drag.moved) {
      // User tapped/clicked on ground to walk forward!
      mouse.set((e.offsetX / canvas.clientWidth) * 2 - 1, -(e.offsetY / canvas.clientHeight) * 2 + 1);
      ray.setFromCamera(mouse, camera);
      const hit = ray.intersectObject(ground)[0];
      if (hit && Math.abs(hit.point.x) < 300 && Math.abs(hit.point.z) < 225) {
        walkTo(hit.point.x, hit.point.z);
      }
    }
    drag = null;
  }

  function onWheel(e: WheelEvent) {
    if (!isActive) return;
    e.preventDefault();
    // Adjust field of view zoom (telephoto vs wide-angle)
    camera.fov = Math.max(30, Math.min(85, camera.fov + e.deltaY * 0.05));
    camera.updateProjectionMatrix();
  }

  // Keyboard navigation (WASD or Arrow Keys)
  window.addEventListener('keydown', (e) => {
    if (!isActive) return;
    if (e.key === 'Escape') {
      exitStreetView();
      return;
    }
    const moveDist = 4.5;
    const forwardX = Math.sin(yaw) * moveDist;
    const forwardZ = -Math.cos(yaw) * moveDist;
    const rightX = Math.cos(yaw) * moveDist;
    const rightZ = Math.sin(yaw) * moveDist;

    let targetX = pos.x;
    let targetZ = pos.z;

    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
      targetX += forwardX; targetZ += forwardZ;
    } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
      targetX -= forwardX; targetZ -= forwardZ;
    } else if (e.key === 'a' || e.key === 'A') {
      targetX -= rightX; targetZ -= rightZ;
    } else if (e.key === 'd' || e.key === 'D') {
      targetX += rightX; targetZ += rightZ;
    } else if (e.key === 'ArrowLeft' || e.key === 'q' || e.key === 'Q') {
      yaw += 0.12;
      drawMiniRadar();
      updateLocationDisplay();
      return;
    } else if (e.key === 'ArrowRight' || e.key === 'e' || e.key === 'E') {
      yaw -= 0.12;
      drawMiniRadar();
      updateLocationDisplay();
      return;
    } else {
      return;
    }

    targetX = Math.max(-285, Math.min(285, targetX));
    targetZ = Math.max(-215, Math.min(215, targetZ));
    walkTo(targetX, targetZ);
  });

  // --- 8. PEGMAN DROP MODE (CLICK ANYWHERE ON 3D VENUE TO ENTER STREET VIEW) ---

  function startDropMode() {
    if (isActive) return;
    isDropMode = true;
    dropBanner.style.display = 'flex';
    pegmanAvatar.visible = true;
    canvas.style.cursor = 'crosshair';
  }

  function cancelDropMode() {
    isDropMode = false;
    dropBanner.style.display = 'none';
    pegmanAvatar.visible = false;
    canvas.style.cursor = 'default';
  }

  function handleDropHover(e: PointerEvent) {
    if (!isDropMode) return;
    mouse.set((e.offsetX / canvas.clientWidth) * 2 - 1, -(e.offsetY / canvas.clientHeight) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObject(ground)[0];
    if (hit && Math.abs(hit.point.x) < 300 && Math.abs(hit.point.z) < 225) {
      pegmanAvatar.position.set(hit.point.x, hit.point.y + 0.1, hit.point.z);
      pegmanAvatar.visible = true;
    } else {
      pegmanAvatar.visible = false;
    }
  }

  function handleDropClick(e: PointerEvent) {
    if (!isDropMode) return;
    mouse.set((e.offsetX / canvas.clientWidth) * 2 - 1, -(e.offsetY / canvas.clientHeight) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObject(ground)[0];
    if (hit && Math.abs(hit.point.x) < 300 && Math.abs(hit.point.z) < 225) {
      cancelDropMode();
      enterStreetView({ x: hit.point.x, z: hit.point.z, y: 1.8, yaw: 0 });
    }
  }

  // --- 9. ATTACH UI LISTENERS ---

  launcherBtn.addEventListener('click', () => {
    if (isDropMode) {
      cancelDropMode();
    } else {
      startDropMode();
    }
  });

  hud.querySelector('#exitStreetViewBtn')?.addEventListener('click', exitStreetView);

  hud.querySelector('#svHotspotSelect')?.addEventListener('change', (e) => {
    const idx = Number((e.target as HTMLSelectElement).value);
    jumpToHotspot(idx);
  });

  hud.querySelector('#svPrevBtn')?.addEventListener('click', () => {
    const nextIdx = (currentHotspotIdx - 1 + hotspots.length) % hotspots.length;
    jumpToHotspot(nextIdx);
  });

  hud.querySelector('#svNextBtn')?.addEventListener('click', () => {
    const nextIdx = (currentHotspotIdx + 1) % hotspots.length;
    jumpToHotspot(nextIdx);
  });

  hud.querySelector('#svHeightSelect')?.addEventListener('change', (e) => {
    eyeHeight = Number((e.target as HTMLSelectElement).value);
    pos.y = eyeHeight;
  });

  return {
    isActive: () => isActive,
    isDropMode: () => isDropMode,
    enterStreetView,
    exitStreetView,
    startDropMode,
    cancelDropMode,
    jumpToHotspot,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel,
    handleDropHover,
    handleDropClick,
    updateCamera: (cam: THREE.PerspectiveCamera) => {
      if (!isActive) return;
      cam.position.set(pos.x, pos.y, pos.z);
      const lookDir = new THREE.Vector3(
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        -Math.cos(yaw) * Math.cos(pitch)
      );
      cam.lookAt(pos.clone().add(lookDir));
    }
  };
}
