import * as THREE from 'three';

export interface RouteNode {
  id: string;
  name: string;
  x: number;
  z: number;
  category: 'gate' | 'parking' | 'pandal' | 'langar' | 'medical' | 'transit';
}

const ROUTE_NODES: Record<string, RouteNode> = {
  gate1: { id: 'gate1', name: 'Gate 1 (VVIP Corridor)', x: -210, z: -85, category: 'gate' },
  gate2: { id: 'gate2', name: 'Gate 2 (West Pedestrian)', x: -220, z: 20, category: 'gate' },
  gate3: { id: 'gate3', name: 'Gate 3 (South Entry)', x: -180, z: 140, category: 'gate' },
  gate4: { id: 'gate4', name: 'Gate 4 (Main East Public Gate)', x: -120, z: 155, category: 'gate' },
  p1: { id: 'p1', name: 'P1 Heavy Vehicles / Bus Parking', x: -160, z: 120, category: 'parking' },
  p2: { id: 'p2', name: 'P2 Bus Depot & Transit Hub', x: 20, z: 145, category: 'parking' },
  p3: { id: 'p3', name: 'P3 Light Vehicles & Car Parking', x: 140, z: 130, category: 'parking' },
  pandal: { id: 'pandal', name: 'Main Satsang Pandal Stage', x: -45, z: 55, category: 'pandal' },
  langar1: { id: 'langar1', name: 'Langar Complex 1 (North)', x: 120, z: -70, category: 'langar' },
  langar2: { id: 'langar2', name: 'Langar Complex 2 (South)', x: 130, z: 75, category: 'langar' },
  medical: { id: 'medical', name: 'Emergency Hospital & Dispensary', x: -60, z: -60, category: 'medical' },
  police: { id: 'police', name: 'Central Police Command Chowki', x: 40, z: -40, category: 'transit' },
  fob1: { id: 'fob1', name: 'Foot Over Bridge 1 (NH-44)', x: -80, z: -130, category: 'transit' },
  fob2: { id: 'fob2', name: 'Foot Over Bridge 2 (Railway Side)', x: 160, z: -130, category: 'transit' },
  railway: { id: 'railway', name: 'Ganaur / Bhodwal Railway Halt', x: 210, z: -120, category: 'transit' },
  exhibition: { id: 'exhibition', name: 'Nirankari Exhibition Ground', x: -140, z: -30, category: 'pandal' },
  toilets1: { id: 'toilets1', name: 'Sanitization & Toilets North', x: 60, z: -80, category: 'transit' },
  toilets2: { id: 'toilets2', name: 'Sanitization & Toilets South', x: 60, z: 90, category: 'transit' }
};

// Road Network Adjacency Graph (bidirectional edges)
const ROAD_EDGES: [string, string][] = [
  ['gate1', 'exhibition'],
  ['gate1', 'fob1'],
  ['gate1', 'medical'],
  ['gate2', 'exhibition'],
  ['gate2', 'pandal'],
  ['gate2', 'p1'],
  ['gate3', 'p1'],
  ['gate3', 'gate4'],
  ['gate4', 'pandal'],
  ['gate4', 'p2'],
  ['p1', 'pandal'],
  ['p1', 'p2'],
  ['p2', 'p3'],
  ['p2', 'toilets2'],
  ['p3', 'langar2'],
  ['pandal', 'medical'],
  ['pandal', 'police'],
  ['pandal', 'toilets1'],
  ['pandal', 'toilets2'],
  ['medical', 'fob1'],
  ['medical', 'police'],
  ['police', 'toilets1'],
  ['police', 'langar1'],
  ['toilets1', 'langar1'],
  ['toilets2', 'langar2'],
  ['langar1', 'fob2'],
  ['langar1', 'railway'],
  ['fob2', 'railway'],
  ['langar1', 'langar2']
];

interface WayfindingAPI {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  ground: THREE.Object3D;
  focus: (x: number, z: number, dist?: number) => void;
  panel: HTMLElement;
}

export function setupWayfindingAndCrowd(api: WayfindingAPI) {
  const wayfindingGroup = new THREE.Group();
  wayfindingGroup.name = 'WayfindingAndCrowdLayer';
  api.scene.add(wayfindingGroup);

  const routeRibbonGroup = new THREE.Group();
  const crowdAgentsGroup = new THREE.Group();
  wayfindingGroup.add(routeRibbonGroup);
  wayfindingGroup.add(crowdAgentsGroup);

  let activeRoutePoints: THREE.Vector3[] = [];
  let isEvacuating = false;
  let evacuationStartTime = 0;
  let remainingEvacuees = 100;

  // 1. Dijkstra Shortest Path Finder
  function findShortestPath(startId: string, endId: string): string[] | null {
    if (startId === endId) return [startId];
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const unvisited = new Set<string>();

    Object.keys(ROUTE_NODES).forEach(node => {
      distances[node] = Infinity;
      previous[node] = null;
      unvisited.add(node);
    });

    distances[startId] = 0;

    // Build adjacency list
    const adj: Record<string, { node: string; weight: number }[]> = {};
    Object.keys(ROUTE_NODES).forEach(node => { adj[node] = []; });
    ROAD_EDGES.forEach(([u, v]) => {
      const p1 = ROUTE_NODES[u], p2 = ROUTE_NODES[v];
      if (p1 && p2) {
        const d = Math.hypot(p1.x - p2.x, p1.z - p2.z);
        adj[u].push({ node: v, weight: d });
        adj[v].push({ node: u, weight: d });
      }
    });

    while (unvisited.size > 0) {
      let current: string | null = null;
      let smallestDist = Infinity;
      unvisited.forEach(node => {
        if (distances[node] < smallestDist) {
          smallestDist = distances[node];
          current = node;
        }
      });

      if (!current || smallestDist === Infinity) break;
      if (current === endId) break;

      unvisited.delete(current);

      adj[current].forEach(neighbor => {
        if (unvisited.has(neighbor.node)) {
          const alt = distances[current!] + neighbor.weight;
          if (alt < distances[neighbor.node]) {
            distances[neighbor.node] = alt;
            previous[neighbor.node] = current;
          }
        }
      });
    }

    if (distances[endId] === Infinity) return null;

    const path: string[] = [];
    let curr: string | null = endId;
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }
    return path;
  }

  // Animated Glowing Path Ribbon
  let routeRibbonMesh: THREE.Mesh | null = null;
  let pathOffset = 0;

  function renderRoutePath(nodeIds: string[]) {
    routeRibbonGroup.clear();
    activeRoutePoints = [];

    if (nodeIds.length < 2) return;

    const pts = nodeIds.map(id => {
      const n = ROUTE_NODES[id];
      return new THREE.Vector3(n.x, 0.45, n.z);
    });
    activeRoutePoints = pts;

    // Smooth spline curve
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.2);
    const curvePoints = curve.getPoints(Math.max(20, nodeIds.length * 15));

    // Create 3D Glowing Ribbon Geometry (thick flat ribbon on ground)
    const ribbonGeo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const ribbonWidth = 2.8;

    for (let i = 0; i < curvePoints.length; i++) {
      const p = curvePoints[i];
      let tangent = new THREE.Vector3(0, 0, 1);
      if (i < curvePoints.length - 1) {
        tangent.subVectors(curvePoints[i + 1], p).normalize();
      } else if (i > 0) {
        tangent.subVectors(p, curvePoints[i - 1]).normalize();
      }
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      // Left and right vertices
      positions.push(p.x + normal.x * ribbonWidth, p.y, p.z + normal.z * ribbonWidth);
      positions.push(p.x - normal.x * ribbonWidth, p.y, p.z - normal.z * ribbonWidth);

      const u = i / (curvePoints.length - 1);
      uvs.push(0, u * 8);
      uvs.push(1, u * 8);
    }

    const indices: number[] = [];
    for (let i = 0; i < curvePoints.length - 1; i++) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }

    ribbonGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    ribbonGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    ribbonGeo.setIndex(indices);
    ribbonGeo.computeVertexNormals();

    // Procedural Chevron Flow Texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#ffffff';
    // Chevron arrows
    ctx.beginPath();
    ctx.moveTo(64, 20);
    ctx.lineTo(110, 80);
    ctx.lineTo(90, 80);
    ctx.lineTo(64, 45);
    ctx.lineTo(38, 80);
    ctx.lineTo(18, 80);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 10);

    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      color: '#00e5ff',
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    routeRibbonMesh = new THREE.Mesh(ribbonGeo, mat);
    routeRibbonGroup.add(routeRibbonMesh);

    // Add glowing pin at destination
    const dest = pts[pts.length - 1];
    const pin = new THREE.Mesh(
      new THREE.SphereGeometry(2, 16, 16),
      new THREE.MeshBasicMaterial({ color: '#ffea00' })
    );
    pin.position.set(dest.x, 6, dest.z);
    routeRibbonGroup.add(pin);
  }

  // 2. Microscopic Pedestrian Agent System
  interface Agent {
    mesh: THREE.Mesh;
    startX: number;
    startZ: number;
    targetX: number;
    targetZ: number;
    speed: number;
    progress: number;
    category: string;
  }

  const agents: Agent[] = [];
  const AGENT_COUNT = 180;

  function initCrowdAgents() {
    crowdAgentsGroup.clear();
    agents.length = 0;

    const agentGeo = new THREE.CylinderGeometry(0.35, 0.4, 1.6, 8);
    const colors = ['#ffffff', '#ff9800', '#29b6f6', '#ec407a', '#78909c', '#ffd54f'];

    const hubs = [
      ROUTE_NODES.gate1,
      ROUTE_NODES.gate4,
      ROUTE_NODES.pandal,
      ROUTE_NODES.langar1,
      ROUTE_NODES.langar2,
      ROUTE_NODES.p1,
      ROUTE_NODES.p2
    ];

    for (let i = 0; i < AGENT_COUNT; i++) {
      const color = colors[i % colors.length];
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
      const mesh = new THREE.Mesh(agentGeo, mat);

      const fromHub = hubs[Math.floor(Math.random() * hubs.length)];
      let toHub = hubs[Math.floor(Math.random() * hubs.length)];
      while (toHub === fromHub) toHub = hubs[Math.floor(Math.random() * hubs.length)];

      const speed = 0.08 + Math.random() * 0.12;
      const progress = Math.random();

      // Random jitter around hub
      const startX = fromHub.x + (Math.random() - 0.5) * 15;
      const startZ = fromHub.z + (Math.random() - 0.5) * 15;
      const targetX = toHub.x + (Math.random() - 0.5) * 15;
      const targetZ = toHub.z + (Math.random() - 0.5) * 15;

      mesh.position.set(startX, 0.8, startZ);
      crowdAgentsGroup.add(mesh);

      agents.push({
        mesh,
        startX,
        startZ,
        targetX,
        targetZ,
        speed,
        progress,
        category: fromHub.category
      });
    }
  }

  // Animation step for Crowd Agents & Route Ribbon
  function updateWayfindingAndCrowd(delta = 0.016) {
    // Flow texture on route ribbon
    if (routeRibbonMesh && routeRibbonMesh.material) {
      const mat = routeRibbonMesh.material as THREE.MeshBasicMaterial;
      if (mat.map) {
        pathOffset -= delta * 1.5;
        mat.map.offset.y = pathOffset;
      }
    }

    // Update crowd agents
    const emergencyExits = [ROUTE_NODES.gate1, ROUTE_NODES.gate2, ROUTE_NODES.gate3, ROUTE_NODES.gate4, ROUTE_NODES.railway];

    agents.forEach(a => {
      if (isEvacuating) {
        // Fast sprint to nearest emergency exit
        a.speed = 0.35 + Math.random() * 0.1;
        const currentPos = a.mesh.position;
        let nearestExit = emergencyExits[0];
        let minD = Infinity;
        emergencyExits.forEach(ex => {
          const d = Math.hypot(ex.x - currentPos.x, ex.z - currentPos.z);
          if (d < minD) { minD = d; nearestExit = ex; }
        });
        const dx = nearestExit.x - currentPos.x;
        const dz = nearestExit.z - currentPos.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 3) {
          a.mesh.position.x += (dx / dist) * a.speed;
          a.mesh.position.z += (dz / dist) * a.speed;
        } else {
          a.mesh.visible = false; // Safely evacuated
        }
      } else {
        // Normal movement
        a.progress += (a.speed * delta) / 10;
        if (a.progress >= 1) {
          a.progress = 0;
          // Swap targets
          const tempX = a.startX, tempZ = a.startZ;
          a.startX = a.targetX; a.startZ = a.targetZ;
          a.targetX = tempX; a.targetZ = tempZ;
        }
        a.mesh.position.x = a.startX + (a.targetX - a.startX) * a.progress;
        a.mesh.position.z = a.startZ + (a.targetZ - a.startZ) * a.progress;
      }
    });

    // Update Evacuation Gauge & Bottleneck Density
    if (isEvacuating) {
      const elapsed = (Date.now() - evacuationStartTime) / 1000;
      const totalEstimated = 240; // 4 minutes
      const remainingPct = Math.max(0, Math.round(100 - (elapsed / totalEstimated) * 100));
      remainingEvacuees = remainingPct;

      const evacStatus = document.querySelector('#evacGaugeText');
      const evacBar = document.querySelector('#evacGaugeBar') as HTMLElement;
      if (evacStatus && evacBar) {
        evacStatus.textContent = remainingPct > 0
          ? `🚨 Evacuation in progress: ${remainingPct}% remaining in sectors (${Math.max(0, Math.round(totalEstimated - elapsed))}s left)`
          : `✅ ALL SECTORS 100% EVACUATED TO SAFE ASSEMBLY GROUNDS!`;
        evacBar.style.width = `${100 - remainingPct}%`;
      }
    }
  }

  // 3. Audio Alarm Synthesizer for Emergency Evacuation
  function triggerSirenSound() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.0);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.0);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // 4. Picture-in-Picture (PIP) Viewport Camera
  const pipCanvas = document.createElement('canvas');
  pipCanvas.id = 'pipCanvas';
  pipCanvas.width = 240;
  pipCanvas.height = 150;
  pipCanvas.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 240px;
    height: 150px;
    border: 2px solid #00e5ff;
    border-radius: 8px;
    background: #000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.6);
    z-index: 999;
    display: block;
  `;

  const pipHeader = document.createElement('div');
  pipHeader.id = 'pipHeader';
  pipHeader.style.cssText = `
    position: fixed;
    bottom: 172px;
    right: 20px;
    width: 240px;
    background: #0d1e2f;
    border: 1px solid #00e5ff;
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    padding: 4px 8px;
    font-size: 11px;
    color: #00e5ff;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1000;
  `;
  pipHeader.innerHTML = `
    <span>📹 LIVE CCTV PIP</span>
    <select id="pipCamSelect" style="background:#162b3d;color:#fff;border:1px solid #455a64;border-radius:3px;font-size:10px;">
      <option value="gate1">Gate 1 VIP</option>
      <option value="stage">Main Stage</option>
      <option value="langar">Langar Hall</option>
      <option value="drone">Security Drone</option>
    </select>
  `;

  document.body.appendChild(pipHeader);
  document.body.appendChild(pipCanvas);

  const pipRenderer = new THREE.WebGLRenderer({ canvas: pipCanvas, antialias: true });
  pipRenderer.setSize(240, 150);
  const pipCamera = new THREE.PerspectiveCamera(50, 240 / 150, 0.5, 1000);

  function updatePIPCamera() {
    const sel = (document.querySelector('#pipCamSelect') as HTMLSelectElement)?.value || 'gate1';
    if (sel === 'gate1') {
      pipCamera.position.set(-210, 14, -60);
      pipCamera.lookAt(-210, 0, -85);
    } else if (sel === 'stage') {
      pipCamera.position.set(-45, 12, 10);
      pipCamera.lookAt(-45, 4, 60);
    } else if (sel === 'langar') {
      pipCamera.position.set(120, 14, -40);
      pipCamera.lookAt(120, 0, -70);
    } else if (sel === 'drone') {
      const t = Date.now() * 0.0005;
      pipCamera.position.set(Math.cos(t) * 180, 120, Math.sin(t) * 180);
      pipCamera.lookAt(0, 0, 0);
    }
    pipRenderer.render(api.scene, pipCamera);
  }

  // 5. Printable Police Bandobast Order (HTML Print Sheet)
  function printBandobastOrder() {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) return;
    const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Police Bandobast Order - 78th Annual Nirankari Samagam</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
          h1 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
          h2 { margin: 4px 0; font-size: 16px; font-weight: normal; }
          .meta { display: flex; justify-content: space-between; margin: 15px 0; font-weight: bold; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
          th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
          th { background: #f0f0f0; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; font-weight: bold; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>OFFICE OF THE SUPERINTENDENT OF POLICE, PANIPAT (HARYANA)</h1>
          <h2>TACTICAL SECURITY & TRAFFIC BANDOBAST ORDER</h2>
          <h3>78th Annual Nirankari Sant Samagam · Samalkha Grounds (NH-44)</h3>
        </div>
        <div class="meta">
          <div>ORDER NO: SP/PNP/SEC/2026/78-SAM</div>
          <div>DATE: ${now}</div>
          <div>LEVEL: TOP SECRET / OPERATIONAL</div>
        </div>
        <p><b>1. FORCE DISTRIBUTION & SECTOR DEPLOYMENT SUMMARY:</b></p>
        <table>
          <thead>
            <tr><th>Sector / Morcha Point</th><th>Incharge Officer</th><th>Rank & Mobile</th><th>Shift</th><th>Force Allotted</th></tr>
          </thead>
          <tbody>
            <tr><td>Gate 1 VVIP Entry Corridor</td><td>Insp. Rajender Singh</td><td>Inspector · +91 94161 33202</td><td>Morning</td><td>12 Staff</td></tr>
            <tr><td>Main Satsang Pandal Stage</td><td>DSP Vikram Sharma</td><td>DSP · +91 98120 44101</td><td>Full Day</td><td>25 Staff</td></tr>
            <tr><td>Langar Hall 1 Distribution Post</td><td>SI Amit Deswal</td><td>SI · +91 98960 77303</td><td>Evening</td><td>20 Staff</td></tr>
            <tr><td>P1 Heavy Vehicle Parking</td><td>Insp. Suresh Malik</td><td>Inspector (Traffic) · +91 98135 66505</td><td>Morning</td><td>16 Staff</td></tr>
            <tr><td>Central Police Command Post</td><td>DSP Sandeep Kaushik</td><td>DSP (HQ) · +91 98965 11808</td><td>24 Hours</td><td>30 Staff</td></tr>
            <tr><td>Emergency Medical Centre</td><td>Dr. Anuj / Insp. Meena</td><td>Inspector · +91 98131 44010</td><td>24 Hours</td><td>10 Staff</td></tr>
          </tbody>
        </table>
        <p><b>2. EMERGENCY & TRAFFIC PREEMPTION:</b> In the event of a critical triage or fire alarm, the Green Corridor from Dispensary to Highway NH-44 shall be automatically activated under the control of PCR Master. All boom barriers and crowd crossings shall yield immediate priority.</p>
        <p><b>3. WIRELESS CALL SIGNS:</b> Master Control: 'EAGLE-1', Stage Security: 'PANTHER-2', Traffic Incharge: 'TRAFFIC-ALPHA'.</p>
        <div class="footer">
          <div>Verified By: DSP Headquarters</div>
          <div>Approved: Superintendent of Police, Panipat</div>
        </div>
        <div style="margin-top:30px;text-align:center;">
          <button onclick="window.print()" style="padding:10px 24px;font-size:14px;background:#0d47a1;color:#fff;border:none;border-radius:4px;cursor:pointer;">🖨️ Print / Save as PDF</button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  // 6. UI Setup in Wayfinding Tab
  function renderUI() {
    api.panel.innerHTML = `
      <h2>Turn-by-Turn Wayfinding ("Find Route")</h2>
      <label>Starting Point
        <select id="routeFrom" style="margin-top:4px;">
          ${Object.values(ROUTE_NODES).map(n => `<option value="${n.id}">${n.name}</option>`).join('')}
        </select>
      </label>
      <label>Destination Landmark
        <select id="routeTo" style="margin-top:4px;">
          ${Object.values(ROUTE_NODES).map((n, i) => `<option value="${n.id}" ${i === 7 ? 'selected' : ''}>${n.name}</option>`).join('')}
        </select>
      </label>
      <div style="display:flex;gap:6px;margin:10px 0;">
        <button id="btnFindRoute" style="flex:2;padding:9px;background:linear-gradient(135deg,#00897b,#00bfa5);color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">🧭 Calculate Shortest Route</button>
        <button id="btnClearRoute" style="flex:1;padding:9px;background:#37474f;color:#cfd8dc;border:none;border-radius:6px;cursor:pointer;">Clear</button>
      </div>

      <div id="routeResultBox" style="display:none;padding:10px;background:#0d233a;border:1px solid #00e5ff;border-radius:6px;margin-bottom:14px;font-size:12px;">
        <div style="display:flex;justify-content:space-between;color:#00e5ff;font-weight:bold;margin-bottom:6px;">
          <span id="routeDistance"></span>
          <span id="routeTime"></span>
        </div>
        <div id="routeStepsList" style="font-size:11px;color:#eceff1;line-height:1.5;"></div>
      </div>

      <h2>Crowd Density & Evacuation Science</h2>
      <div style="background:#091927;padding:10px;border-radius:6px;border:1px solid #29435c;margin-bottom:12px;font-size:11px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span>FOB 1 Overpass Density:</span>
          <b style="color:#00e676;">1.6 p/m² (Safe)</b>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span>Pandal Entry Bottleneck:</span>
          <b style="color:#ffb300;">2.4 p/m² (Moderate)</b>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span>Gate 4 Main Choke Point:</span>
          <b style="color:#00e676;">1.2 p/m² (Free Flow)</b>
        </div>
      </div>

      <button id="btnTriggerEvac" style="width:100%;padding:10px;background:linear-gradient(135deg,#c62828,#e53935);color:#fff;border:1px solid #ff5252;border-radius:6px;font-weight:bold;font-size:12px;cursor:pointer;margin-bottom:10px;box-shadow:0 3px 10px rgba(198,40,40,0.4);">
        🚨 TRIGGER 1-CLICK EMERGENCY EVACUATION
      </button>

      <div id="evacStatusContainer" style="display:none;background:#260909;border:1px solid #ff1744;border-radius:6px;padding:10px;margin-bottom:14px;">
        <div id="evacGaugeText" style="font-size:11px;color:#ff5252;font-weight:bold;margin-bottom:6px;"></div>
        <div style="width:100%;height:8px;background:#37474f;border-radius:4px;overflow:hidden;">
          <div id="evacGaugeBar" style="width:0%;height:100%;background:#00e676;transition:width 0.3s;"></div>
        </div>
        <button id="btnResetEvac" style="margin-top:8px;padding:5px 10px;font-size:10px;background:#455a64;color:#fff;border:none;border-radius:4px;cursor:pointer;">Reset Normal Operation</button>
      </div>

      <h2>What-If Parking Inflow Sandbox</h2>
      <label>Simulate Incoming Buses: <b id="busCountVal">+35 Buses</b>
        <input id="rngBuses" type="range" min="0" max="200" value="35" style="margin-top:4px;">
      </label>
      <div id="parkingPredictionBox" style="font-size:11px;color:#b0bec5;margin-top:6px;line-height:1.5;">
        <div>P1 Bus Parking: <b>420 / 600 slots (70% full)</b></div>
        <div>P2 Depot Hub: <b>290 / 450 slots (64% full)</b></div>
        <div style="color:#81c784;">Safe Buffer Remaining: ~340 heavy vehicles</div>
      </div>

      <h2 style="margin-top:16px;">Reports & Mobile Operation</h2>
      <button id="btnPrintOrder" style="width:100%;padding:9px;background:#1565c0;color:#fff;border:1px solid #42a5f5;border-radius:6px;font-weight:bold;font-size:12px;cursor:pointer;margin-bottom:8px;">
        🖨️ Generate Police Bandobast Order (PDF)
      </button>
      <label><input id="chkPIP" type="checkbox" class="check" checked> Show Picture-in-Picture (PIP) CCTV</label>
    `;

    // Wire Route Finder
    document.querySelector('#btnFindRoute')?.addEventListener('click', () => {
      const from = (document.querySelector('#routeFrom') as HTMLSelectElement).value;
      const to = (document.querySelector('#routeTo') as HTMLSelectElement).value;
      const path = findShortestPath(from, to);
      if (path && path.length >= 2) {
        renderRoutePath(path);

        // Calculate distance in meters
        let totalUnits = 0;
        for (let i = 0; i < path.length - 1; i++) {
          const p1 = ROUTE_NODES[path[i]], p2 = ROUTE_NODES[path[i + 1]];
          totalUnits += Math.hypot(p1.x - p2.x, p1.z - p2.z);
        }
        const meters = Math.round(totalUnits * 2.8);
        const mins = (meters / 75).toFixed(1);

        const resBox = document.querySelector('#routeResultBox') as HTMLElement;
        resBox.style.display = 'block';
        (document.querySelector('#routeDistance') as HTMLElement).textContent = `📏 Distance: ${meters}m`;
        (document.querySelector('#routeTime') as HTMLElement).textContent = `⏱️ Walk Time: ~${mins} mins`;

        const stepsList = document.querySelector('#routeStepsList') as HTMLElement;
        stepsList.innerHTML = path.map((id, idx) => `<div>${idx + 1}. ${ROUTE_NODES[id].name}</div>`).join('');

        // Focus camera on first point
        api.focus(ROUTE_NODES[path[0]].x, ROUTE_NODES[path[0]].z, 45);
      }
    });

    document.querySelector('#btnClearRoute')?.addEventListener('click', () => {
      routeRibbonGroup.clear();
      activeRoutePoints = [];
      const resBox = document.querySelector('#routeResultBox') as HTMLElement;
      if (resBox) resBox.style.display = 'none';
    });

    // Wire Evacuation Button
    document.querySelector('#btnTriggerEvac')?.addEventListener('click', () => {
      isEvacuating = true;
      evacuationStartTime = Date.now();
      triggerSirenSound();
      const evacContainer = document.querySelector('#evacStatusContainer') as HTMLElement;
      if (evacContainer) evacContainer.style.display = 'block';
    });

    document.querySelector('#btnResetEvac')?.addEventListener('click', () => {
      isEvacuating = false;
      initCrowdAgents();
      const evacContainer = document.querySelector('#evacStatusContainer') as HTMLElement;
      if (evacContainer) evacContainer.style.display = 'none';
    });

    // Wire Parking Sandbox
    const rngBuses = document.querySelector('#rngBuses') as HTMLInputElement;
    rngBuses?.addEventListener('input', e => {
      const val = Number((e.target as HTMLInputElement).value);
      (document.querySelector('#busCountVal') as HTMLElement).textContent = `+${val} Buses`;
      const p1Filled = Math.min(600, 350 + Math.round(val * 1.4));
      const p2Filled = Math.min(450, 240 + Math.round(val * 0.8));
      const p1Pct = Math.round((p1Filled / 600) * 100);
      const p2Pct = Math.round((p2Filled / 450) * 100);
      const predBox = document.querySelector('#parkingPredictionBox') as HTMLElement;
      if (predBox) {
        predBox.innerHTML = `
          <div>P1 Bus Parking: <b>${p1Filled} / 600 slots (${p1Pct}% full)</b></div>
          <div>P2 Depot Hub: <b>${p2Filled} / 450 slots (${p2Pct}% full)</b></div>
          <div style="color:${p1Pct > 90 ? '#ff5252' : '#81c784'};font-weight:bold;">
            ${p1Pct > 90 ? '⚠️ WARNING: P1 nearing overflow! Divert buses to P3 overflow lot.' : 'Safe Buffer Remaining: ~' + (1050 - p1Filled - p2Filled) + ' heavy vehicles'}
          </div>
        `;
      }
    });

    // Wire Print PDF
    document.querySelector('#btnPrintOrder')?.addEventListener('click', printBandobastOrder);

    // Wire PIP toggle
    document.querySelector('#chkPIP')?.addEventListener('change', e => {
      const checked = (e.target as HTMLInputElement).checked;
      pipCanvas.style.display = checked ? 'block' : 'none';
      pipHeader.style.display = checked ? 'flex' : 'none';
    });
  }

  // Initialize
  initCrowdAgents();
  renderUI();

  return {
    findShortestPath,
    renderRoutePath,
    update: (delta = 0.016) => {
      updateWayfindingAndCrowd(delta);
      if (pipCanvas.style.display !== 'none') {
        updatePIPCamera();
      }
    }
  };
}
