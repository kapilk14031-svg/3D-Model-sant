import * as THREE from 'three';
import {DeploymentItem, Zone} from './plan';

export interface AdvancedBandobastAPI {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  canvas: HTMLCanvasElement;
  ground: THREE.Object3D;
  resources: THREE.Group;
  panels: Record<string, HTMLElement>;
  getItems: () => DeploymentItem[];
  setItems: (items: DeploymentItem[]) => void;
  getSelected: () => number;
  setSelected: (i: number) => void;
  getRebuild: () => () => void;
  focus: (x: number, z: number, d?: number) => void;
  getView: () => {distance: number; elevation: number; angle: number};
}

// -------------------------------------------------------------
// VENUE WAYPOINT GRAPH FOR ACCURATE 3D ROUTING & PATHFINDING
// -------------------------------------------------------------
interface Waypoint {
  id: string;
  name: string;
  pos: THREE.Vector3;
  category: 'gate' | 'parking' | 'pandal' | 'langar' | 'medical' | 'transit' | 'road';
}

const WAYPOINTS: Record<string, Waypoint> = {
  gate1: {id: 'gate1', name: 'Gate 1 (VIP & Main Entry)', pos: new THREE.Vector3(-170, 0.4, 140), category: 'gate'},
  gate2: {id: 'gate2', name: 'Gate 2 (Transit & Alighting)', pos: new THREE.Vector3(-80, 0.4, 160), category: 'gate'},
  gate3: {id: 'gate3', name: 'Gate 3 (South Arrival)', pos: new THREE.Vector3(60, 0.4, 160), category: 'gate'},
  gate5: {id: 'gate5', name: 'Gate 5 (Ambala Side Entry)', pos: new THREE.Vector3(-120, 0.4, -140), category: 'gate'},
  east_gate: {id: 'east_gate', name: 'Eastern Alighting Gate', pos: new THREE.Vector3(180, 0.4, 80), category: 'gate'},

  p1_parking: {id: 'p1_parking', name: 'P1 Parking (Heavy Buses & Trucks)', pos: new THREE.Vector3(-190, 0.4, 60), category: 'parking'},
  p2_parking: {id: 'p2_parking', name: 'P2 Parking (Private Light Vehicles)', pos: new THREE.Vector3(-140, 0.4, -60), category: 'parking'},
  p3_parking: {id: 'p3_parking', name: 'P3 Parking (North-East Overflow)', pos: new THREE.Vector3(40, 0.4, -120), category: 'parking'},
  p4_parking: {id: 'p4_parking', name: 'P4 Parking (VIP & Officials)', pos: new THREE.Vector3(140, 0.4, -80), category: 'parking'},
  p5_parking: {id: 'p5_parking', name: 'P5 Parking (East Boundary)', pos: new THREE.Vector3(200, 0.4, -30), category: 'parking'},

  pandal_main: {id: 'pandal_main', name: 'Main Satsang Pandal (Central Plaza)', pos: new THREE.Vector3(-40, 0.4, 50), category: 'pandal'},
  pandal_stage: {id: 'pandal_stage', name: 'Pandal Holy Stage & Diwas', pos: new THREE.Vector3(-40, 0.4, -15), category: 'pandal'},
  pandal_east: {id: 'pandal_east', name: 'Pandal East Egress Gates', pos: new THREE.Vector3(5, 0.4, 50), category: 'pandal'},
  pandal_north: {id: 'pandal_north', name: 'Pandal North Gate', pos: new THREE.Vector3(-40, 0.4, -55), category: 'pandal'},

  langar1: {id: 'langar1', name: 'Langar Complex 1 (Main Hall)', pos: new THREE.Vector3(28, 0.4, 45), category: 'langar'},
  langar2: {id: 'langar2', name: 'Langar Complex 2 (East Extension)', pos: new THREE.Vector3(75, 0.4, 45), category: 'langar'},
  canteen3: {id: 'canteen3', name: 'Tea & Canteen Point 3', pos: new THREE.Vector3(95, 0.4, -20), category: 'langar'},

  medical_icu: {id: 'medical_icu', name: 'Civil Hospital ICU & Trauma Centre', pos: new THREE.Vector3(160, 0.4, 40), category: 'medical'},
  first_aid_g2: {id: 'first_aid_g2', name: 'First Aid Post (Ground 2)', pos: new THREE.Vector3(-10, 0.4, 85), category: 'medical'},
  dispensary_g1: {id: 'dispensary_g1', name: 'Dispensary (Gate 1 Sector)', pos: new THREE.Vector3(-150, 0.4, 110), category: 'medical'},

  police_chowki: {id: 'police_chowki', name: 'Police Control Room & Chowki', pos: new THREE.Vector3(23, 0.4, 80), category: 'transit'},
  railway_hub: {id: 'railway_hub', name: 'Railway Special Shuttle Terminal', pos: new THREE.Vector3(220, 0.4, 20), category: 'transit'},
  exhibition: {id: 'exhibition', name: 'SNCF Exhibition & Museum Hall', pos: new THREE.Vector3(-40, 0.4, 130), category: 'transit'},
  fob1: {id: 'fob1', name: 'Foot Over Bridge 1 (FOB 1)', pos: new THREE.Vector3(-110, 0.4, 150), category: 'transit'},
  fob2: {id: 'fob2', name: 'Foot Over Bridge 2 (FOB 2)', pos: new THREE.Vector3(20, 0.4, 150), category: 'transit'},

  // Arterial road junctions
  r_r2_south: {id: 'r_r2_south', name: 'R-2 Road South (GT Karnal Junction)', pos: new THREE.Vector3(-130, 0.4, 150), category: 'road'},
  r_r2_mid: {id: 'r_r2_mid', name: 'R-2 Road Central Spine', pos: new THREE.Vector3(-130, 0.4, 50), category: 'road'},
  r_r2_north: {id: 'r_r2_north', name: 'R-2 Road North (Ambala Side)', pos: new THREE.Vector3(-130, 0.4, -100), category: 'road'},
  r_spine_mid: {id: 'r_spine_mid', name: 'Central Boulevard Spine', pos: new THREE.Vector3(-20, 0.4, 50), category: 'road'},
  r_spine_north: {id: 'r_spine_north', name: 'North Boulevard Spine', pos: new THREE.Vector3(-20, 0.4, -60), category: 'road'},
  r_east_spine: {id: 'r_east_spine', name: 'East Circulation Road', pos: new THREE.Vector3(120, 0.4, 45), category: 'road'},
  r_south_lane: {id: 'r_south_lane', name: 'Southern Bypass Lane', pos: new THREE.Vector3(0, 0.4, 155), category: 'road'}
};

const GRAPH_EDGES: [string, string][] = [
  ['gate1', 'r_r2_south'], ['fob1', 'r_r2_south'], ['gate2', 'r_r2_south'],
  ['r_r2_south', 'r_r2_mid'], ['r_r2_mid', 'r_r2_north'], ['r_r2_north', 'gate5'],
  ['p1_parking', 'r_r2_mid'], ['p2_parking', 'r_r2_north'],
  ['r_r2_south', 'dispensary_g1'], ['r_r2_south', 'exhibition'],
  ['r_r2_south', 'r_south_lane'], ['r_south_lane', 'fob2'], ['r_south_lane', 'gate3'],
  ['gate3', 'police_chowki'], ['police_chowki', 'first_aid_g2'],
  ['r_r2_mid', 'pandal_main'], ['pandal_main', 'pandal_stage'], ['pandal_stage', 'pandal_north'],
  ['pandal_north', 'r_spine_north'], ['r_spine_north', 'p3_parking'], ['r_spine_north', 'p4_parking'],
  ['pandal_main', 'pandal_east'], ['pandal_east', 'r_spine_mid'],
  ['r_spine_mid', 'langar1'], ['langar1', 'langar2'], ['langar2', 'canteen3'],
  ['langar2', 'r_east_spine'], ['r_east_spine', 'medical_icu'],
  ['medical_icu', 'east_gate'], ['r_east_spine', 'railway_hub'],
  ['railway_hub', 'p5_parking'], ['first_aid_g2', 'r_spine_mid'],
  ['r_south_lane', 'police_chowki']
];

// Simple Dijkstra Pathfinding
function computeShortestPath(startId: string, endId: string): Waypoint[] | null {
  if (!WAYPOINTS[startId] || !WAYPOINTS[endId]) return null;
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const queue: string[] = Object.keys(WAYPOINTS);

  for (const k of queue) {
    dist[k] = Infinity;
    prev[k] = null;
  }
  dist[startId] = 0;

  const adj: Record<string, {node: string; weight: number}[]> = {};
  for (const k of queue) adj[k] = [];
  for (const [u, v] of GRAPH_EDGES) {
    if (WAYPOINTS[u] && WAYPOINTS[v]) {
      const d = WAYPOINTS[u].pos.distanceTo(WAYPOINTS[v].pos);
      adj[u].push({node: v, weight: d});
      adj[v].push({node: u, weight: d});
    }
  }

  while (queue.length > 0) {
    queue.sort((a, b) => dist[a] - dist[b]);
    const curr = queue.shift()!;
    if (curr === endId || dist[curr] === Infinity) break;

    for (const neighbor of adj[curr]) {
      if (!queue.includes(neighbor.node)) continue;
      const alt = dist[curr] + neighbor.weight;
      if (alt < dist[neighbor.node]) {
        dist[neighbor.node] = alt;
        prev[neighbor.node] = curr;
      }
    }
  }

  if (dist[endId] === Infinity) return null;
  const path: Waypoint[] = [];
  let u: string | null = endId;
  while (u) {
    path.unshift(WAYPOINTS[u]);
    u = prev[u];
  }
  return path;
}

// -------------------------------------------------------------
// MAIN ADVANCED BANDOBAST MODULE
// -------------------------------------------------------------
export function createAdvancedBandobast(api: AdvancedBandobastAPI) {
  const {scene, camera, canvas, panels, getItems, setItems, setSelected, getRebuild, focus} = api;

  // Dedicated groups
  const pathGroup = new THREE.Group();
  pathGroup.name = 'Navigation & Wayfinding Path';
  scene.add(pathGroup);

  const cctvConesGroup = new THREE.Group();
  cctvConesGroup.name = 'CCTV & Watchtower Frustums';
  scene.add(cctvConesGroup);

  const fireHydrantGroup = new THREE.Group();
  fireHydrantGroup.name = 'Fire Hose Coverage Rings';
  scene.add(fireHydrantGroup);

  const crowdGroup = new THREE.Group();
  crowdGroup.name = 'Microscopic Pedestrian Agents';
  scene.add(crowdGroup);

  const chokeAlertGroup = new THREE.Group();
  chokeAlertGroup.name = 'Stampede Bottleneck Monitors';
  scene.add(chokeAlertGroup);

  const ambulanceGroup = new THREE.Group();
  ambulanceGroup.name = 'Emergency Corridor Dispatch';
  scene.add(ambulanceGroup);

  // States
  let cctvConesVisible = true;
  let fireReachVisible = false;
  let crowdSimActive = true;
  let evacuationActive = false;
  let evacuationProgress = 0;
  let evacuationStartTime = 0;
  let greenCorridorActive = false;
  let activePathCurve: THREE.CatmullRomCurve3 | null = null;
  let pathAnimatedMesh: THREE.Mesh | null = null;
  let pathTextureOffset = 0;

  // -------------------------------------------------------------
  // 1. OFFICER DUTY ROSTER CSV IMPORT/EXPORT & POPUP
  // -------------------------------------------------------------
  function exportDutyRosterCSV() {
    const items = getItems();
    const rows: string[] = [
      'Point_Index,Morcha_Label,Resource_Type,Sector,Officer_Name,Rank,Mobile_Phone,Shift_Timing,Reporting_Officer,Special_Notes'
    ];

    items.forEach((it, idx) => {
      const pointName = it.label || `${it.type.toUpperCase()} #${idx + 1}`;
      const sector = it.zoneId || 'Auto';
      const shift = it.duty?.shift || '06:00 - 14:00 (Shift 1)';
      const reporting = it.duty?.reportingOfficer || 'DSP Incharge';
      const notes = (it.duty?.notes || '').replace(/"/g, '""');

      if (it.officers && it.officers.length > 0) {
        it.officers.forEach(o => {
          rows.push(`${idx + 1},"${pointName}","${it.type}","${sector}","${o.name || 'Stationed Jawan'}","${o.rank || 'Constable'}","${o.phone || '+91-XXXXXXXXXX'}","${shift}","${reporting}","${notes}"`);
        });
      } else {
        rows.push(`${idx + 1},"${pointName}","${it.type}","${sector}","Unassigned Jawan","Constable","+91-XXXXXXXXXX","${shift}","${reporting}","${notes}"`);
      }
    });

    const csvContent = '\uFEFF' + rows.join('\r\n');
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `78_Samagam_Duty_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function importDutyRosterCSV(csvText: string) {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return alert('Invalid CSV: Need header and at least one officer row.');

    const items = getItems();
    let updatedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(s => s.replace(/^"|"$/g, '').trim());
      if (cols.length < 5) continue;
      const pointIdx = parseInt(cols[0], 10) - 1;
      const officerName = cols[4];
      const rank = cols[5] || 'Constable';
      const phone = cols[6] || '';
      const shift = cols[7] || '';
      const reporting = cols[8] || '';
      const notes = cols[9] || '';

      if (pointIdx >= 0 && pointIdx < items.length) {
        const it = items[pointIdx];
        it.officers = it.officers || [];
        it.officers.push({id: crypto.randomUUID(), name: officerName, rank, phone});
        it.qty = Math.max(it.qty, it.officers.length);
        if (shift) it.duty.shift = shift;
        if (reporting) it.duty.reportingOfficer = reporting;
        if (notes) it.duty.notes = notes;
        updatedCount++;
      }
    }

    getRebuild()();
    alert(`Duty Roster Updated: ${updatedCount} officer records loaded and mapped to morcha points!`);
  }

  // Floating Officer Badge Popup Modal
  let officerCardEl: HTMLElement | null = null;
  function showOfficerCard(itemIndex: number, screenX?: number, screenY?: number) {
    const items = getItems();
    const it = items[itemIndex];
    if (!it) return;

    if (!officerCardEl) {
      officerCardEl = document.createElement('div');
      officerCardEl.id = 'officer-duty-card';
      officerCardEl.style.cssText = `
        position: fixed; z-index: 9999; width: 330px;
        background: rgba(13, 29, 43, 0.96); backdrop-filter: blur(12px);
        border: 1px solid #38bdf8; border-radius: 12px;
        box-shadow: 0 12px 36px rgba(0,0,0,0.6), 0 0 16px rgba(56, 189, 248, 0.3);
        padding: 16px; color: #f8fafc; font-family: system-ui, sans-serif;
        font-size: 12px; transition: all 0.2s ease;
      `;
      document.body.appendChild(officerCardEl);
    }

    const firstOfficer = (it.officers && it.officers[0]) || {
      name: 'Stationed Incharge',
      rank: 'Sub-Inspector',
      phone: '+91 98123-45678'
    };

    const posX = Math.min(window.innerWidth - 350, Math.max(20, screenX ?? 340));
    const posY = Math.min(window.innerHeight - 380, Math.max(70, screenY ?? 120));
    officerCardEl.style.left = `${posX}px`;
    officerCardEl.style.top = `${posY}px`;
    officerCardEl.style.display = 'block';

    officerCardEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; border-bottom:1px solid #23425f; padding-bottom:8px">
        <div style="display:flex; align-items:center; gap:8px">
          <div style="width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,#0284c7,#0369a1); display:flex; align-items:center; justify-content:center; font-size:18px; border:1px solid #7dd3fc">
            👮
          </div>
          <div>
            <div style="font-weight:700; font-size:13px; color:#e0f2fe">${it.label || `${it.type.toUpperCase()} Morcha #${itemIndex + 1}`}</div>
            <div style="font-size:10px; color:#94a3b8">Duty Point #${itemIndex + 1} · Sector: <b style="color:#38bdf8">${it.zoneId || 'Sector A'}</b></div>
          </div>
        </div>
        <button id="closeOfficerCard" style="background:none; border:none; color:#94a3b8; font-size:16px; cursor:pointer; padding:2px 6px">✕</button>
      </div>

      <div style="background:#091420; border-radius:8px; padding:10px; margin-bottom:10px; border:1px solid #1e3a53">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px">
          <span style="color:#94a3b8">Officer on Duty:</span>
          <b style="color:#f8fafc">${firstOfficer.name}</b>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px">
          <span style="color:#94a3b8">Rank:</span>
          <span style="background:#1e40af; color:#dbeafe; padding:1px 6px; border-radius:4px; font-weight:600; font-size:11px">${firstOfficer.rank}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px">
          <span style="color:#94a3b8">Contact:</span>
          <a href="tel:${firstOfficer.phone}" style="color:#38bdf8; text-decoration:none; font-weight:bold; display:flex; align-items:center; gap:4px">
            📞 ${firstOfficer.phone}
          </a>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px">
          <span style="color:#94a3b8">Shift Timing:</span>
          <span style="color:#fbbf24">${it.duty?.shift || '06:00 - 14:00 (Shift 1)'}</span>
        </div>
        <div style="display:flex; justify-content:space-between">
          <span style="color:#94a3b8">Reporting DSP:</span>
          <span style="color:#e2e8f0">${it.duty?.reportingOfficer || 'DSP Security Incharge'}</span>
        </div>
      </div>

      <div style="font-size:11px; color:#cbd5e1; margin-bottom:12px; line-height:1.4">
        <b>Morcha Orders:</b> ${it.duty?.notes || 'Maintain strict pedestrian queue flow, ensure emergency vehicle lane clearance, keep VHF wireless active on Channel 4.'}
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px">
        <button id="callOfficerBtn" style="padding:6px; background:#0284c7; color:#fff; border:none; border-radius:6px; font-weight:600; cursor:pointer">📞 Call Officer</button>
        <button id="focusPointBtn" style="padding:6px; background:#1e293b; color:#cbd5e1; border:1px solid #475569; border-radius:6px; cursor:pointer">🎯 Focus Point</button>
      </div>
    `;

    officerCardEl.querySelector('#closeOfficerCard')!.addEventListener('click', () => {
      officerCardEl!.style.display = 'none';
    });
    officerCardEl.querySelector('#callOfficerBtn')!.addEventListener('click', () => {
      window.open(`tel:${firstOfficer.phone}`);
    });
    officerCardEl.querySelector('#focusPointBtn')!.addEventListener('click', () => {
      focus((it.x - 0.5) * 600, (it.y - 0.5) * 450, 45);
    });
  }

  // -------------------------------------------------------------
  // 2. QUICK DEPLOYMENT PRESETS
  // -------------------------------------------------------------
  const DEPLOYMENT_PRESETS: Record<string, DeploymentItem[]> = {
    vvip: [
      {type: 'officer', x: 0.22, y: 0.81, label: 'VIP Gate 1 Outer Morcha', qty: 4, rotationDeg: 0, zoneId: 'Sector A', duty: {shift: '06:00 - 18:00 (VVIP)', reportingOfficer: 'SP VVIP Security', notes: 'Z+ Security Sanitization Cordon'}, officers: [{id: '1', name: 'Insp. Vikram Rathore', rank: 'Inspector', phone: '+91 98111-22334'}]},
      {type: 'barricade', x: 0.23, y: 0.80, label: 'VIP Red Carpet Barricade', qty: 8, rotationDeg: 90, zoneId: 'Sector A', duty: {shift: 'Full Day', reportingOfficer: 'DSP Traffic', notes: 'Zero private vehicles permitted'}, officers: []},
      {type: 'traffic', x: 0.27, y: 0.78, label: 'VIP Flyover Escort PCR', qty: 2, rotationDeg: 45, zoneId: 'Sector A', duty: {shift: 'VVIP Shift', reportingOfficer: 'DSP Traffic', notes: 'Motorcade Pilot and Tail Escort'}, officers: [{id: '2', name: 'SI Rajesh Kumar', rank: 'Sub-Inspector', phone: '+91 98765-43210'}]},
      {type: 'command', x: 0.43, y: 0.47, label: 'Stage Holy Diwas Command Post', qty: 6, rotationDeg: 0, zoneId: 'Sector A', duty: {shift: 'Round-the-clock', reportingOfficer: 'IG Security', notes: 'Direct link to National Command Centre'}, officers: [{id: '3', name: 'DSP Anil Sharma', rank: 'DSP', phone: '+91 94140-55667'}]},
      {type: 'medical', x: 0.44, y: 0.45, label: 'Advanced Cardiac ICU Ambulance', qty: 1, rotationDeg: 0, zoneId: 'Sector A', duty: {shift: '24 Hours', reportingOfficer: 'Chief Medical Officer', notes: 'Equipped with Defibrillator & Ventilator'}, officers: []},
      {type: 'cctv', x: 0.22, y: 0.81, label: 'Gate 1 PTZ Surveillance Mast', qty: 1, rotationDeg: 45, zoneId: 'Sector A', duty: {shift: '24x7', reportingOfficer: 'IT Cell', notes: 'Face Recognition AI enabled'}, officers: []},
      {type: 'cctv', x: 0.43, y: 0.48, label: 'Stage Perimeter PTZ Mast', qty: 1, rotationDeg: 180, zoneId: 'Sector A', duty: {shift: '24x7', reportingOfficer: 'IT Cell', notes: '360 Frustum Zoom'}, officers: []}
    ],
    peak_rush: [
      {type: 'officer', x: 0.22, y: 0.81, label: 'Gate 1 Heavy Crowd Control', qty: 8, rotationDeg: 0, zoneId: 'Sector A', duty: {shift: '14:00 - 22:00 (Peak)', reportingOfficer: 'DSP Crowd Control', notes: 'Spillover queue management'}, officers: [{id: '4', name: 'Insp. Manpreet Kaur', rank: 'Inspector', phone: '+91 98123-99887'}]},
      {type: 'officer', x: 0.36, y: 0.85, label: 'Gate 2 Alighting Morcha', qty: 6, rotationDeg: 0, zoneId: 'Sector B', duty: {shift: '14:00 - 22:00 (Peak)', reportingOfficer: 'DSP Transit', notes: 'Bus passenger holding area'}, officers: []},
      {type: 'officer', x: 0.54, y: 0.60, label: 'Langar 1 Queue Control', qty: 10, rotationDeg: 90, zoneId: 'Sector B', duty: {shift: '16:00 - 23:00', reportingOfficer: 'DSP Langar Bandobast', notes: 'Maintain 4-lane single file entry'}, officers: [{id: '5', name: 'SI Deepak Verma', rank: 'Sub-Inspector', phone: '+91 97290-11223'}]},
      {type: 'barricade', x: 0.32, y: 0.83, label: 'FOB 1 Choke Point Barricades', qty: 12, rotationDeg: 0, zoneId: 'Sector A', duty: {shift: 'Evening Peak', reportingOfficer: 'Traffic Incharge', notes: 'Prevent crowd counter-flow on bridge'}, officers: []},
      {type: 'barricade', x: 0.53, y: 0.59, label: 'Langar Hall Zigzag Queue Barricades', qty: 14, rotationDeg: 90, zoneId: 'Sector B', duty: {shift: 'Peak Food Hours', reportingOfficer: 'Sewadal Incharge', notes: 'Dynamic wave releasing'}, officers: []},
      {type: 'traffic', x: 0.28, y: 0.88, label: 'GT Road Flyover Interceptor', qty: 4, rotationDeg: 270, zoneId: 'Sector A', duty: {shift: 'Evening Rush', reportingOfficer: 'ACP Traffic', notes: 'Divert heavy trucks to Panipat bypass'}, officers: []},
      {type: 'water', x: 0.54, y: 0.61, label: 'Langar Water Mist Station', qty: 2, rotationDeg: 0, zoneId: 'Sector B', duty: {shift: 'All Day', reportingOfficer: 'Sanitation Officer', notes: 'Drinking water distribution'}, officers: []}
    ],
    green_corridor: [
      {type: 'medical', x: 0.44, y: 0.46, label: 'Pandal Rapid Response Ambulance', qty: 1, rotationDeg: 0, zoneId: 'Sector A', duty: {shift: 'Standby', reportingOfficer: 'CMO Trauma', notes: 'Dedicated corridor vehicle'}, officers: [{id: '6', name: 'Dr. Neha Batra', rank: 'Medical Officer', phone: '+91 99887-77665'}]},
      {type: 'medical', x: 0.77, y: 0.59, label: 'Civil Hospital Trauma ICU Hub', qty: 2, rotationDeg: 0, zoneId: 'Sector C', duty: {shift: 'Emergency Corridor', reportingOfficer: 'Civil Surgeon', notes: 'Receiving Trauma Centre'}, officers: []},
      {type: 'officer', x: 0.28, y: 0.61, label: 'R-2 Corridor Holding Post 1', qty: 4, rotationDeg: 90, zoneId: 'Sector A', duty: {shift: 'Corridor Standby', reportingOfficer: 'DSP Emergency Dispatch', notes: 'Stop all cross traffic when siren activates'}, officers: []},
      {type: 'officer', x: 0.47, y: 0.61, label: 'Central Spine Holding Post 2', qty: 4, rotationDeg: 90, zoneId: 'Sector B', duty: {shift: 'Corridor Standby', reportingOfficer: 'DSP Emergency Dispatch', notes: 'Barricade auto-swing operator'}, officers: []},
      {type: 'barricade', x: 0.46, y: 0.61, label: 'Preemptible Dynamic Barricade A', qty: 2, rotationDeg: 0, zoneId: 'Sector B', duty: {shift: 'Dynamic Preemption', reportingOfficer: 'Traffic Command', notes: 'Swings open automatically for ambulance'}, officers: []},
      {type: 'barricade', x: 0.65, y: 0.60, label: 'Preemptible Dynamic Barricade B', qty: 2, rotationDeg: 0, zoneId: 'Sector C', duty: {shift: 'Dynamic Preemption', reportingOfficer: 'Traffic Command', notes: 'Swings open automatically for ambulance'}, officers: []}
    ]
  };

  function applyDeploymentPreset(key: string) {
    const preset = DEPLOYMENT_PRESETS[key];
    if (!preset) return;
    setItems([...preset]);
    getRebuild()();
    rebuildCCTVCones();
    rebuildFireRings();
    alert(`Preset "${key.toUpperCase()}" Deployed! Scene and Roster updated with optimized resource allocation.`);
  }

  // -------------------------------------------------------------
  // 3. LINE-OF-SIGHT & CCTV COVERAGE CONES
  // -------------------------------------------------------------
  function rebuildCCTVCones() {
    cctvConesGroup.clear();
    if (!cctvConesVisible) return;

    const items = getItems();
    const cctvMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const cctvWireMat = new THREE.LineBasicMaterial({color: '#7dd3fc', transparent: true, opacity: 0.6});

    items.forEach((it, idx) => {
      if (it.type === 'cctv' || it.type === 'command') {
        const posX = (it.x - 0.5) * 600;
        const posZ = (it.y - 0.5) * 450;
        const coneHeight = 16;
        const coneRadius = 32;

        const coneGeom = new THREE.ConeGeometry(coneRadius, coneHeight, 16, 1, true);
        coneGeom.translate(0, -coneHeight / 2, 0);
        const coneMesh = new THREE.Mesh(coneGeom, cctvMat);
        coneMesh.position.set(posX, coneHeight, posZ);

        // Ground coverage ring
        const ringGeom = new THREE.RingGeometry(coneRadius - 0.6, coneRadius, 32);
        ringGeom.rotateX(-Math.PI / 2);
        const ringMesh = new THREE.Mesh(ringGeom, cctvMat);
        ringMesh.position.set(posX, 0.45, posZ);

        // Camera mast pole
        const poleGeom = new THREE.CylinderGeometry(0.3, 0.4, coneHeight, 8);
        const poleMat = new THREE.MeshStandardMaterial({color: '#64748b', metalness: 0.8, roughness: 0.3});
        const poleMesh = new THREE.Mesh(poleGeom, poleMat);
        poleMesh.position.set(posX, coneHeight / 2, posZ);

        cctvConesGroup.add(coneMesh, ringMesh, poleMesh);
      }
    });
  }

  // -------------------------------------------------------------
  // 4. FIRE HYDRANT & WATER REACH RINGS (30m & 60m)
  // -------------------------------------------------------------
  function rebuildFireRings() {
    fireHydrantGroup.clear();
    if (!fireReachVisible) return;

    const items = getItems();
    items.forEach(it => {
      if (it.type === 'water') {
        const posX = (it.x - 0.5) * 600;
        const posZ = (it.y - 0.5) * 450;

        // 30m direct hose stream ring (solid blue)
        const innerRingGeom = new THREE.RingGeometry(29, 30, 48);
        innerRingGeom.rotateX(-Math.PI / 2);
        const innerMat = new THREE.MeshBasicMaterial({color: '#06b6d4', transparent: true, opacity: 0.45, side: THREE.DoubleSide});
        const innerMesh = new THREE.Mesh(innerRingGeom, innerMat);
        innerMesh.position.set(posX, 0.3, posZ);

        // 60m extended booster reach (dashed outer ring)
        const outerRingGeom = new THREE.RingGeometry(59, 60, 48);
        outerRingGeom.rotateX(-Math.PI / 2);
        const outerMat = new THREE.MeshBasicMaterial({color: '#0284c7', transparent: true, opacity: 0.25, side: THREE.DoubleSide});
        const outerMesh = new THREE.Mesh(outerRingGeom, outerMat);
        outerMesh.position.set(posX, 0.3, posZ);

        fireHydrantGroup.add(innerMesh, outerMesh);
      }
    });
  }

  // -------------------------------------------------------------
  // 5. TURN-BY-TURN WAYFINDING & GLOWING ANIMATED 3D PATH
  // -------------------------------------------------------------
  function findAndDrawRoute(startId: string, endId: string) {
    pathGroup.clear();
    activePathCurve = null;

    const waypoints = computeShortestPath(startId, endId);
    if (!waypoints || waypoints.length < 2) {
      alert('Could not find connected route between selected points.');
      return;
    }

    const points = waypoints.map(w => w.pos.clone());
    activePathCurve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);

    // Build glowing road tube
    const tubeGeom = new THREE.TubeGeometry(activePathCurve, 128, 1.4, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: '#00ffff',
      wireframe: false,
      transparent: true,
      opacity: 0.85
    });
    pathAnimatedMesh = new THREE.Mesh(tubeGeom, tubeMat);
    pathGroup.add(pathAnimatedMesh);

    // Beacons at Start and End
    const startBeacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 3, 10, 16),
      new THREE.MeshBasicMaterial({color: '#22c55e', transparent: true, opacity: 0.7})
    );
    startBeacon.position.copy(points[0]).setY(5);
    const endBeacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 3, 10, 16),
      new THREE.MeshBasicMaterial({color: '#f59e0b', transparent: true, opacity: 0.7})
    );
    endBeacon.position.copy(points[points.length - 1]).setY(5);
    pathGroup.add(startBeacon, endBeacon);

    // Calculate metric distance & walking time
    let totalLengthUnits = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalLengthUnits += points[i].distanceTo(points[i + 1]);
    }
    // Scale: 1 Three.js unit ≈ 3.0 meters in real world ground coordinates
    const distanceMeters = Math.round(totalLengthUnits * 3.0);
    // Walking speed: 4.5 km/h = 75 meters/minute
    const walkMinutes = (distanceMeters / 75).toFixed(1);

    // Turn by turn directions
    const instructions = waypoints.map((w, idx) => {
      if (idx === 0) return `🟢 Start from <b>${w.name}</b>`;
      if (idx === waypoints.length - 1) return `🏁 Arrive at destination: <b>${w.name}</b>`;
      return `➡️ Proceed via <b>${w.name}</b>`;
    });

    const routeInfoEl = document.querySelector('#route-directions-box');
    if (routeInfoEl) {
      routeInfoEl.innerHTML = `
        <div style="background:#091420; border:1px solid #00ffff; border-radius:8px; padding:12px; margin-top:10px">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px">
            <span style="font-size:13px; font-weight:bold; color:#00ffff">📏 Distance: ${distanceMeters} m</span>
            <span style="font-size:13px; font-weight:bold; color:#fde047">⏱️ Walking Time: ~${walkMinutes} min</span>
          </div>
          <div style="font-size:11px; line-height:1.6; color:#e2e8f0; max-height:140px; overflow-y:auto">
            ${instructions.map(s => `<div style="margin-bottom:4px">${s}</div>`).join('')}
          </div>
        </div>
      `;
    }

    // Smoothly focus camera on start
    focus(points[0].x, points[0].z, 75);
  }

  function clearRoute() {
    pathGroup.clear();
    activePathCurve = null;
    pathAnimatedMesh = null;
    const routeInfoEl = document.querySelector('#route-directions-box');
    if (routeInfoEl) routeInfoEl.innerHTML = '';
  }

  // -------------------------------------------------------------
  // 6. MICROSCOPIC PEDESTRIAN CROWD & STAMPEDE PREDICTION
  // -------------------------------------------------------------
  interface PedestrianAgent {
    mesh: THREE.Mesh;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    targetPos: THREE.Vector3;
    speed: number;
    evacuating: boolean;
  }

  const agents: PedestrianAgent[] = [];
  const agentCount = 180;
  const agentMat = new THREE.MeshLambertMaterial({color: '#e2e8f0'});
  const evacMat = new THREE.MeshLambertMaterial({color: '#ef4444'});
  const agentGeom = new THREE.CylinderGeometry(0.3, 0.4, 1.6, 6);

  // Initialize crowd agents along arterial paths
  const arterialPoints = [
    new THREE.Vector3(-140, 0, 140), new THREE.Vector3(-80, 0, 140),
    new THREE.Vector3(-40, 0, 50), new THREE.Vector3(25, 0, 45),
    new THREE.Vector3(75, 0, 45), new THREE.Vector3(-120, 0, 50),
    new THREE.Vector3(-40, 0, -20)
  ];

  for (let i = 0; i < agentCount; i++) {
    const mesh = new THREE.Mesh(agentGeom, agentMat);
    const startPoint = arterialPoints[i % arterialPoints.length].clone().add(
      new THREE.Vector3((Math.random() - 0.5) * 30, 0.8, (Math.random() - 0.5) * 30)
    );
    mesh.position.copy(startPoint);
    crowdGroup.add(mesh);

    agents.push({
      mesh,
      pos: startPoint,
      vel: new THREE.Vector3(),
      targetPos: arterialPoints[(i + 1) % arterialPoints.length].clone().add(
        new THREE.Vector3((Math.random() - 0.5) * 25, 0.8, (Math.random() - 0.5) * 25)
      ),
      speed: 0.15 + Math.random() * 0.18,
      evacuating: false
    });
  }

  // Choke Points for Stampede Risk Calculation
  interface ChokePoint {
    id: string;
    name: string;
    pos: THREE.Vector3;
    radius: number;
    areaM2: number;
    currentDensity: number;
    alertMesh: THREE.Mesh;
  }

  const CHOKE_POINTS: ChokePoint[] = [
    {id: 'fob1', name: 'Foot Over Bridge 1 Ramp', pos: new THREE.Vector3(-110, 0.5, 150), radius: 18, areaM2: 240, currentDensity: 0, alertMesh: null!},
    {id: 'gate1', name: 'Gate 1 Pedestrian Choke', pos: new THREE.Vector3(-170, 0.5, 140), radius: 20, areaM2: 320, currentDensity: 0, alertMesh: null!},
    {id: 'pandal_east', name: 'Pandal East Exit Egress', pos: new THREE.Vector3(5, 0.5, 50), radius: 18, areaM2: 250, currentDensity: 0, alertMesh: null!},
    {id: 'langar_queue', name: 'Langar 1 Queue Funnel', pos: new THREE.Vector3(28, 0.5, 45), radius: 16, areaM2: 200, currentDensity: 0, alertMesh: null!}
  ];

  CHOKE_POINTS.forEach(cp => {
    const geom = new THREE.RingGeometry(cp.radius - 1, cp.radius, 32);
    geom.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({color: '#22c55e', side: THREE.DoubleSide, transparent: true, opacity: 0.6});
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(cp.pos);
    chokeAlertGroup.add(mesh);
    cp.alertMesh = mesh;
  });

  function updateCrowdAndStampede(delta: number) {
    if (!crowdSimActive) return;

    // Reset choke counts
    const chokeCounts: Record<string, number> = {};
    CHOKE_POINTS.forEach(cp => (chokeCounts[cp.id] = 0));

    // Agent movement with collision avoidance
    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const dir = new THREE.Vector3().subVectors(a.targetPos, a.pos);
      const dist = dir.length();

      if (dist < 4) {
        if (evacuationActive) {
          // Keep fleeing to perimeter open grounds
          a.targetPos.set(
            (Math.random() > 0.5 ? 1 : -1) * (200 + Math.random() * 50),
            0.8,
            (Math.random() - 0.5) * 350
          );
        } else {
          // Select next venue waypoint
          const nextTarget = arterialPoints[Math.floor(Math.random() * arterialPoints.length)].clone().add(
            new THREE.Vector3((Math.random() - 0.5) * 20, 0.8, (Math.random() - 0.5) * 20)
          );
          a.targetPos.copy(nextTarget);
        }
      } else {
        dir.normalize();
        // Agent avoidance separation force
        for (let j = 0; j < Math.min(10, agents.length); j++) {
          if (i !== j) {
            const sep = new THREE.Vector3().subVectors(a.pos, agents[j].pos);
            const d = sep.length();
            if (d < 1.8 && d > 0.01) {
              dir.add(sep.normalize().multiplyScalar(0.4));
            }
          }
        }
        dir.normalize();
        a.vel.lerp(dir.multiplyScalar(a.speed), 0.1);
        a.pos.add(a.vel);
        a.mesh.position.copy(a.pos);
        a.mesh.rotation.y = Math.atan2(a.vel.x, a.vel.z);
      }

      // Check choke points
      CHOKE_POINTS.forEach(cp => {
        if (a.pos.distanceTo(cp.pos) < cp.radius) {
          chokeCounts[cp.id]++;
        }
      });
    }

    // Evaluate densities and stampede risk
    let maxRiskPoint: ChokePoint | null = null;
    let maxDensity = 0;

    CHOKE_POINTS.forEach(cp => {
      // Metric density formula: (simulated agents * scale factor 25) / areaM2
      const estimatedRealPeople = chokeCounts[cp.id] * 24;
      const density = +(estimatedRealPeople / cp.areaM2).toFixed(2);
      cp.currentDensity = density;

      if (density > 4.0) {
        // Critical Stampede Risk Threshold!
        (cp.alertMesh.material as THREE.MeshBasicMaterial).color.set('#ef4444');
        cp.alertMesh.scale.setScalar(1 + Math.sin(Date.now() * 0.008) * 0.1);
        if (density > maxDensity) {
          maxDensity = density;
          maxRiskPoint = cp;
        }
      } else if (density > 2.0) {
        // High density warning
        (cp.alertMesh.material as THREE.MeshBasicMaterial).color.set('#f59e0b');
        cp.alertMesh.scale.setScalar(1);
      } else {
        // Safe normal flow
        (cp.alertMesh.material as THREE.MeshBasicMaterial).color.set('#22c55e');
        cp.alertMesh.scale.setScalar(1);
      }
    });

    // Update Stampede Alert Banner in UI
    const bannerEl = document.querySelector('#stampede-alert-banner') as HTMLElement;
    if (bannerEl) {
      if (maxRiskPoint && maxDensity >= 4.0) {
        bannerEl.style.display = 'block';
        bannerEl.innerHTML = `
          ⚠️ <b>STAMPEDE DANGER DETECTED:</b> Density <b style="color:#fecaca">${maxDensity} people/m²</b> at <u>${(maxRiskPoint as ChokePoint).name}</u>!
          <button id="mitigateChokeBtn" style="margin-left:8px; padding:3px 8px; background:#fff; color:#b91c1c; font-weight:bold; border:none; border-radius:4px; cursor:pointer">Open Spillover Gates</button>
        `;
        const mitBtn = bannerEl.querySelector('#mitigateChokeBtn');
        if (mitBtn) {
          mitBtn.onclick = () => {
            alert(`Spillover Barricades Opened at ${(maxRiskPoint as ChokePoint).name}! Flow successfully diverted.`);
            bannerEl.style.display = 'none';
          };
        }
      } else {
        bannerEl.style.display = 'none';
      }
    }

    // Evacuation progress calculation (Hydraulic egress model)
    if (evacuationActive) {
      const elapsedSec = (Date.now() - evacuationStartTime) / 1000;
      // Hydraulic egress rate: Q = total exit width (48m) * 1.33 people/m/sec ≈ 64 people/sec
      const totalEvacuees = 100000;
      const evacuated = Math.min(totalEvacuees, Math.round(elapsedSec * 220));
      evacuationProgress = (evacuated / totalEvacuees) * 100;
      const remainingSeconds = Math.max(0, Math.round((totalEvacuees - evacuated) / 220));
      const remM = Math.floor(remainingSeconds / 60);
      const remS = remainingSeconds % 60;

      const evacInfoEl = document.querySelector('#evac-simulation-info');
      if (evacInfoEl) {
        evacInfoEl.innerHTML = `
          <div style="background:#7f1d1d; border:1px solid #ef4444; border-radius:8px; padding:10px; margin-top:8px">
            <div style="font-weight:bold; color:#fecaca; margin-bottom:4px">🚨 EMERGENCY EVACUATION ACTIVE (Fire/Storm)</div>
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:6px">
              <span>Evacuated: <b>${evacuated.toLocaleString()} / 100,000 (${evacuationProgress.toFixed(1)}%)</b></span>
              <span>Time Left: <b>${remM}m ${remS}s</b></span>
            </div>
            <div style="width:100%; height:8px; background:#450a0a; border-radius:4px; overflow:hidden">
              <div style="width:${evacuationProgress}%; height:100%; background:#ef4444"></div>
            </div>
            <div style="font-size:10px; color:#fca5a5; margin-top:6px">Hydraulic egress flow: 13,200 persons/min across 6 perimeter gates.</div>
          </div>
        `;
      }
    }
  }

  function triggerEvacuationSimulation() {
    evacuationActive = true;
    evacuationStartTime = Date.now();
    evacuationProgress = 0;

    // Turn agents into fleeing red markers towards safety assembly zones
    agents.forEach(a => {
      a.evacuating = true;
      (a.mesh.material as THREE.MeshLambertMaterial).color.set('#ef4444');
      a.speed = 0.35 + Math.random() * 0.25; // panicked run
      a.targetPos.set(
        (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 60),
        0.8,
        (Math.random() - 0.5) * 350
      );
    });
  }

  function stopEvacuationSimulation() {
    evacuationActive = false;
    agents.forEach(a => {
      a.evacuating = false;
      (a.mesh.material as THREE.MeshLambertMaterial).color.set('#e2e8f0');
      a.speed = 0.15 + Math.random() * 0.15;
    });
    const evacInfoEl = document.querySelector('#evac-simulation-info');
    if (evacInfoEl) evacInfoEl.innerHTML = '';
  }

  // -------------------------------------------------------------
  // 7. EMERGENCY GREEN CORRIDOR & AUTOMATED SIGNAL PREEMPTION
  // -------------------------------------------------------------
  let ambulanceMesh: THREE.Group | null = null;
  let ambulanceLightMat: THREE.MeshBasicMaterial | null = null;
  let ambulanceProgress = 0;
  let greenCorridorWaypoints: Waypoint[] = [];

  function create3DAmbulance(): THREE.Group {
    const g = new THREE.Group();
    // Body
    const bodyMat = new THREE.MeshStandardMaterial({color: '#ffffff', roughness: 0.2});
    const bodyGeom = new THREE.BoxGeometry(4.2, 2.2, 8.5);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 1.6;
    g.add(body);

    // Red Cross Decal / Stripe
    const stripeMat = new THREE.MeshBasicMaterial({color: '#ef4444'});
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(4.25, 0.5, 8.52), stripeMat);
    stripe.position.y = 1.6;
    g.add(stripe);

    // Emergency Roof Beacon Lights (Red & Blue)
    ambulanceLightMat = new THREE.MeshBasicMaterial({color: '#ef4444'});
    const beaconR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.8), ambulanceLightMat);
    beaconR.position.set(-0.8, 2.9, 1.5);
    const beaconB = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.8), new THREE.MeshBasicMaterial({color: '#3b82f6'}));
    beaconB.position.set(0.8, 2.9, 1.5);
    g.add(beaconR, beaconB);

    return g;
  }

  function dispatchGreenCorridor(startPointKey: string = 'pandal_main') {
    ambulanceGroup.clear();
    greenCorridorActive = true;
    ambulanceProgress = 0;

    // Compute route to Civil Hospital ICU
    const route = computeShortestPath(startPointKey, 'medical_icu');
    if (!route || route.length < 2) {
      alert('Unable to compute clear corridor to Hospital ICU.');
      return;
    }
    greenCorridorWaypoints = route;

    ambulanceMesh = create3DAmbulance();
    ambulanceMesh.position.copy(route[0].pos);
    ambulanceGroup.add(ambulanceMesh);

    // Highlight Green Corridor on ground
    const points = route.map(w => w.pos.clone().setY(0.5));
    const curve = new THREE.CatmullRomCurve3(points);
    const corridorTube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 64, 2.2, 8, false),
      new THREE.MeshBasicMaterial({color: '#22c55e', transparent: true, opacity: 0.65})
    );
    ambulanceGroup.add(corridorTube);

    // Dynamic Barricade Preemption Banner
    const statusBox = document.querySelector('#green-corridor-status');
    if (statusBox) {
      statusBox.innerHTML = `
        <div style="background:#14532d; border:1px solid #22c55e; border-radius:8px; padding:10px; margin-top:8px">
          <div style="font-weight:bold; color:#86efac; display:flex; align-items:center; gap:6px">
            <span>🚨</span> GREEN CORRIDOR DISPATCH ACTIVE
          </div>
          <div style="font-size:11px; color:#dcfce7; margin-top:4px">
            Ambulance dispatched to <b>Civil Hospital ICU</b>. Signal Preemption Active: Intersecting barricades auto-opening within 35m range.
          </div>
        </div>
      `;
    }

    focus(route[0].pos.x, route[0].pos.z, 70);
  }

  function updateGreenCorridor(delta: number) {
    if (!greenCorridorActive || !ambulanceMesh || greenCorridorWaypoints.length < 2) return;

    ambulanceProgress += 0.0035;

    // Flash emergency beacon strobe
    if (ambulanceLightMat) {
      ambulanceLightMat.color.set(Date.now() % 400 < 200 ? '#ef4444' : '#ffffff');
    }

    if (ambulanceProgress >= 1.0) {
      greenCorridorActive = false;
      ambulanceGroup.clear();
      alert('🚨 Green Corridor Success: Patient safely admitted to Civil Hospital ICU in Golden Hour window!');
      const statusBox = document.querySelector('#green-corridor-status');
      if (statusBox) statusBox.innerHTML = '';
      return;
    }

    const points = greenCorridorWaypoints.map(w => w.pos);
    const curve = new THREE.CatmullRomCurve3(points);
    const curPos = curve.getPointAt(ambulanceProgress);
    const nextPos = curve.getPointAt(Math.min(1, ambulanceProgress + 0.01));

    ambulanceMesh.position.copy(curPos);
    ambulanceMesh.lookAt(nextPos);

    // PREEMPTION: Dynamic Barricade Auto-Open within 35m
    const items = getItems();
    items.forEach((it, idx) => {
      if (it.type === 'barricade') {
        const barPos = new THREE.Vector3((it.x - 0.5) * 600, 0, (it.y - 0.5) * 450);
        const dist = barPos.distanceTo(curPos);
        const resourceMesh = api.resources.children[idx];
        if (resourceMesh) {
          if (dist < 35) {
            // Auto-swing open 90 degrees
            resourceMesh.rotation.y = THREE.MathUtils.degToRad(it.rotationDeg + 90);
          } else {
            resourceMesh.rotation.y = THREE.MathUtils.degToRad(it.rotationDeg);
          }
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 8. PRINTABLE PDF DEPLOYMENT REPORT GENERATOR
  // -------------------------------------------------------------
  function generatePrintablePDFReport() {
    const items = getItems();
    const officerCount = items.filter(i => i.type === 'officer' || i.type === 'traffic').reduce((s, i) => s + i.qty, 0);
    const namedOfficers = items.reduce((s, i) => s + (i.officers?.length || 0), 0);
    const barricadeCount = items.filter(i => i.type === 'barricade').reduce((s, i) => s + i.qty, 0);
    const pcrCount = items.filter(i => i.type === 'traffic').length;
    const cctvCount = items.filter(i => i.type === 'cctv').length;
    const medicalCount = items.filter(i => i.type === 'medical').length;
    const waterCount = items.filter(i => i.type === 'water').length;

    const printWin = window.open('', '_blank', 'width=900,height=1000');
    if (!printWin) return alert('Popup blocked. Please allow popups to export the PDF deployment report.');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>78th Nirankari Samagam - Police E-Bandobast Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
          .header { border-bottom: 3px double #0f172a; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
          .subtitle { font-size: 13px; color: #475569; margin-top: 4px; }
          .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
          .stat-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc; }
          .stat-num { font-size: 20px; font-weight: bold; color: #0284c7; }
          .stat-label { font-size: 11px; text-transform: uppercase; color: #64748b; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
          th { background: #0f172a; color: #fff; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; }
          td { border-bottom: 1px solid #e2e8f0; padding: 8px 10px; }
          tr:nth-child(even) { background: #f1f5f9; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
          .badge-officer { background: #dbeafe; color: #1e40af; }
          .badge-barricade { background: #fef3c7; color: #92400e; }
          .badge-medical { background: #fee2e2; color: #991b1b; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; }
          .sig-box { width: 220px; border-top: 1px solid #000; text-align: center; font-size: 12px; font-weight: bold; padding-top: 6px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="display:flex; justify-content:flex-end; margin-bottom:15px">
          <button onclick="window.print()" style="padding:8px 16px; background:#0284c7; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:bold">🖨️ Print / Save as PDF</button>
        </div>

        <div class="header">
          <div>
            <div class="title">Security & Traffic Deployment Bandobast Plan</div>
            <div class="subtitle">78th Annual Nirankari Sant Samagam · Samalkha, Haryana · Operation Suraksha</div>
          </div>
          <div style="text-align:right; font-size:11px; color:#64748b">
            <div><b>Report Date:</b> ${new Date().toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'})}</div>
            <div><b>Security Status:</b> ACTIVE (LEVEL-1)</div>
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-box"><div class="stat-num">${officerCount}</div><div class="stat-label">Police Personnel</div></div>
          <div class="stat-box"><div class="stat-num">${namedOfficers}</div><div class="stat-label">Rostered Officers</div></div>
          <div class="stat-box"><div class="stat-num">${barricadeCount}</div><div class="stat-label">Crowd Barricades</div></div>
          <div class="stat-box"><div class="stat-num">${pcrCount}</div><div class="stat-label">PCR / Interceptors</div></div>
          <div class="stat-box"><div class="stat-num">${cctvCount}</div><div class="stat-label">CCTV Surveillance Cones</div></div>
          <div class="stat-box"><div class="stat-num">${medicalCount}</div><div class="stat-label">Ambulances & ICU Posts</div></div>
          <div class="stat-box"><div class="stat-num">${waterCount}</div><div class="stat-label">Water Mist / Hydrants</div></div>
          <div class="stat-box"><div class="stat-num">4</div><div class="stat-label">Choke Bottleneck Sensors</div></div>
        </div>

        <h3>Morcha Allocation & Stationed Personnel Roster</h3>
        <table>
          <thead>
            <tr>
              <th>Pt #</th>
              <th>Morcha Name</th>
              <th>Type</th>
              <th>Sector</th>
              <th>Stationed Officer</th>
              <th>Rank</th>
              <th>Phone</th>
              <th>Shift Timing</th>
              <th>Reporting DSP</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((it, idx) => {
              const o = it.officers?.[0] || {name: 'Stationed Staff', rank: 'Constable', phone: '+91-XXXXXXXXXX'};
              return `
                <tr>
                  <td>${idx + 1}</td>
                  <td><b>${it.label || `${it.type.toUpperCase()} #${idx + 1}`}</b></td>
                  <td><span class="badge badge-${it.type}">${it.type.toUpperCase()}</span></td>
                  <td>${it.zoneId || 'Sector A'}</td>
                  <td>${o.name}</td>
                  <td>${o.rank}</td>
                  <td>${o.phone}</td>
                  <td>${it.duty?.shift || '06:00 - 14:00 (Shift 1)'}</td>
                  <td>${it.duty?.reportingOfficer || 'DSP Incharge'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">Duty Officer Incharge<br><small>Police Control Room</small></div>
          <div class="sig-box">DSP Security & Traffic<br><small>Samalkha Division</small></div>
          <div class="sig-box">Superintendent of Police (SP)<br><small>District Panipat / Haryana Police</small></div>
        </div>
      </body>
      </html>
    `);
    printWin.document.close();
  }

  // -------------------------------------------------------------
  // 9. TOUCH-FRIENDLY MOBILE FIELD MODE & VIRTUAL JOYSTICKS
  // -------------------------------------------------------------
  let mobileModeActive = false;
  let joystickEl: HTMLElement | null = null;
  let compassEl: HTMLElement | null = null;

  function setupMobileHUD() {
    // Live Compass
    compassEl = document.createElement('div');
    compassEl.id = 'field-compass-hud';
    compassEl.style.cssText = `
      position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px);
      border: 1px solid #38bdf8; border-radius: 20px; padding: 6px 16px;
      color: #f8fafc; font-family: system-ui; font-size: 12px; font-weight: bold;
      display: flex; align-items: center; gap: 8px; z-index: 1000;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5); pointer-events: none;
    `;
    compassEl.innerHTML = `<span id="compassNeedle" style="display:inline-block; transition:transform 0.1s">🧭</span> <span id="compassHeading">345° NNW</span>`;
    document.body.appendChild(compassEl);

    // Virtual Joysticks
    joystickEl = document.createElement('div');
    joystickEl.id = 'virtual-joysticks-container';
    joystickEl.style.cssText = `
      position: fixed; bottom: 30px; left: 0; right: 0; height: 120px;
      display: none; justify-content: space-between; padding: 0 30px;
      pointer-events: none; z-index: 2000;
    `;

    joystickEl.innerHTML = `
      <div id="joyMove" style="width:100px; height:100px; border-radius:50%; background:rgba(15,23,42,0.6); border:2px solid #38bdf8; position:relative; pointer-events:auto; touch-action:none; display:flex; align-items:center; justify-content:center">
        <div id="joyMoveThumb" style="width:40px; height:40px; border-radius:50%; background:#0284c7; box-shadow:0 0 10px #38bdf8; pointer-events:none"></div>
      </div>
      <div id="joyLook" style="width:100px; height:100px; border-radius:50%; background:rgba(15,23,42,0.6); border:2px solid #818cf8; position:relative; pointer-events:auto; touch-action:none; display:flex; align-items:center; justify-content:center">
        <div id="joyLookThumb" style="width:40px; height:40px; border-radius:50%; background:#4f46e5; box-shadow:0 0 10px #818cf8; pointer-events:none"></div>
      </div>
    `;
    document.body.appendChild(joystickEl);

    // Handle touch joystick interactions
    const joyMove = joystickEl.querySelector('#joyMove') as HTMLElement;
    const joyMoveThumb = joystickEl.querySelector('#joyMoveThumb') as HTMLElement;
    let moveActive = false;
    let moveVector = {x: 0, y: 0};

    joyMove.addEventListener('pointerdown', e => {
      moveActive = true;
      joyMove.setPointerCapture(e.pointerId);
    });
    joyMove.addEventListener('pointermove', e => {
      if (!moveActive) return;
      const rect = joyMove.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.min(35, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx);
      joyMoveThumb.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
      moveVector = {x: (Math.cos(angle) * dist) / 35, y: (Math.sin(angle) * dist) / 35};
    });
    const resetMove = () => {
      moveActive = false;
      joyMoveThumb.style.transform = 'translate(0, 0)';
      moveVector = {x: 0, y: 0};
    };
    joyMove.addEventListener('pointerup', resetMove);
    joyMove.addEventListener('pointercancel', resetMove);

    // Frame update for virtual joystick
    setInterval(() => {
      if (moveActive && (moveVector.x !== 0 || moveVector.y !== 0)) {
        const view = api.getView();
        const sin = Math.sin(view.angle);
        const cos = Math.cos(view.angle);
        const speed = 2.5;
        // Strafe & forward
        api.focus(
          camera.position.x + (cos * moveVector.x + sin * moveVector.y) * speed,
          camera.position.z + (-sin * moveVector.x + cos * moveVector.y) * speed,
          view.distance
        );
      }
    }, 30);
  }

  function toggleMobileFieldMode(enabled?: boolean) {
    mobileModeActive = enabled !== undefined ? enabled : !mobileModeActive;
    if (joystickEl) joystickEl.style.display = mobileModeActive ? 'flex' : 'none';
  }

  // -------------------------------------------------------------
  // 10. ADVANCED UI PANELS IN SIDEBAR
  // -------------------------------------------------------------
  function buildSidebarPanels() {
    // 1. Wayfinding Panel
    panels.wayfind.innerHTML = `
      <h2>🧭 Visitor Route & Wayfinding</h2>
      <p class="note">Find walking directions, glowing animated 3D path and walking times between any two samagam landmarks.</p>

      <label>Origin (प्रारंभिक स्थल)
        <select id="routeOrigin" style="width:100%; margin:4px 0 10px; padding:6px; background:#162c3f; border:1px solid #304d65; border-radius:6px; color:#fff">
          ${Object.values(WAYPOINTS).map(w => `<option value="${w.id}">${w.name}</option>`).join('')}
        </select>
      </label>

      <label>Destination (गंतव्य स्थल)
        <select id="routeDestination" style="width:100%; margin:4px 0 10px; padding:6px; background:#162c3f; border:1px solid #304d65; border-radius:6px; color:#fff">
          ${Object.values(WAYPOINTS).map((w, idx) => `<option value="${w.id}" ${idx === 10 ? 'selected' : ''}>${w.name}</option>`).join('')}
        </select>
      </label>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin:8px 0">
        <button id="btnFindRoute" style="background:#0284c7; color:#fff; font-weight:bold; padding:9px; border:none; border-radius:6px; cursor:pointer">⚡ Find Route</button>
        <button id="btnClearRoute" style="background:#334155; color:#cbd5e1; padding:9px; border:none; border-radius:6px; cursor:pointer">Clear Route</button>
      </div>

      <div id="route-directions-box"></div>
    `;

    panels.wayfind.querySelector('#btnFindRoute')!.addEventListener('click', () => {
      const from = (panels.wayfind.querySelector('#routeOrigin') as HTMLSelectElement).value;
      const to = (panels.wayfind.querySelector('#routeDestination') as HTMLSelectElement).value;
      findAndDrawRoute(from, to);
    });
    panels.wayfind.querySelector('#btnClearRoute')!.addEventListener('click', clearRoute);

    // 2. Crowd & Stampede Prediction Panel
    panels.crowd.innerHTML = `
      <h2>👥 Crowd Dynamics & Evacuation Science</h2>
      <p class="note">Microscopic agent simulation, real-time choke point bottleneck prediction, and hydraulic mass evacuation time counter.</p>

      <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px; margin-bottom:12px">
        <div style="font-size:11px; font-weight:bold; color:#38bdf8; margin-bottom:6px">STAMPEDE RISK SENSOR THRESHOLDS</div>
        <div style="font-size:11px; line-height:1.6; color:#94a3b8">
          <div>🟢 <b>&lt; 2.0 p/m²:</b> Safe & Free Pedestrian Flow</div>
          <div>🟡 <b>2.0 - 4.0 p/m²:</b> High Density Caution</div>
          <div>🔴 <b>&gt; 4.0 p/m²:</b> Critical Stampede Danger (Auto-Trigger)</div>
        </div>
      </div>

      <div style="margin-bottom:12px">
        <button id="btnTriggerEvac" style="width:100%; padding:10px; background:linear-gradient(135deg,#b91c1c,#dc2626); color:#fff; font-weight:bold; border:1px solid #f87171; border-radius:6px; cursor:pointer; margin-bottom:6px">
          🚨 Simulate Emergency Evacuation (Fire / Storm)
        </button>
        <button id="btnStopEvac" style="width:100%; padding:8px; background:#1e293b; color:#94a3b8; border:1px solid #475569; border-radius:6px; cursor:pointer">
          ⏹️ Reset Normal Crowd Flow
        </button>
      </div>

      <div id="evac-simulation-info"></div>
    `;

    panels.crowd.querySelector('#btnTriggerEvac')!.addEventListener('click', triggerEvacuationSimulation);
    panels.crowd.querySelector('#btnStopEvac')!.addEventListener('click', stopEvacuationSimulation);

    // 3. Emergency Dispatch & Green Corridor Panel
    panels.emergency.innerHTML = `
      <h2>🚑 Emergency Dispatch & Green Corridor</h2>
      <p class="note">Golden-Hour shortest emergency route calculation to Civil Hospital ICU with dynamic automatic barricade preemption.</p>

      <label>Incident Location (घटना स्थल)
        <select id="emergencyOrigin" style="width:100%; margin:4px 0 10px; padding:6px; background:#162c3f; border:1px solid #304d65; border-radius:6px; color:#fff">
          <option value="pandal_main">Main Satsang Pandal (Central Plaza)</option>
          <option value="langar1">Langar Complex 1</option>
          <option value="gate1">Gate 1 VIP Area</option>
          <option value="p1_parking">P1 Heavy Parking</option>
          <option value="fob1">Foot Over Bridge 1 (FOB 1)</option>
        </select>
      </label>

      <button id="btnDispatchCorridor" style="width:100%; padding:10px; background:linear-gradient(135deg,#15803d,#16a34a); color:#fff; font-weight:bold; border:1px solid #4ade80; border-radius:6px; cursor:pointer; margin-bottom:10px">
        🚨 Launch Golden-Hour Green Corridor
      </button>

      <div id="green-corridor-status"></div>

      <h2 style="margin-top:16px">🚒 Fire Hose Reach (30m / 60m)</h2>
      <label><input id="toggleFireReach" class="check" type="checkbox"> Show 30m / 60m Fire Hose Water Rings</label>
      <label><input id="toggleCCTVCones" class="check" type="checkbox" checked> Show CCTV & Watchtower Frustums</label>
    `;

    panels.emergency.querySelector('#btnDispatchCorridor')!.addEventListener('click', () => {
      const origin = (panels.emergency.querySelector('#emergencyOrigin') as HTMLSelectElement).value;
      dispatchGreenCorridor(origin);
    });

    const fireCheck = panels.emergency.querySelector('#toggleFireReach') as HTMLInputElement;
    fireCheck.onchange = () => {
      fireReachVisible = fireCheck.checked;
      rebuildFireRings();
    };

    const cctvCheck = panels.emergency.querySelector('#toggleCCTVCones') as HTMLInputElement;
    cctvCheck.onchange = () => {
      cctvConesVisible = cctvCheck.checked;
      rebuildCCTVCones();
    };

    // 4. Inject Presets & Duty Roster into Deploy Panel
    const deploySection = document.createElement('section');
    deploySection.style.cssText = 'border-bottom:1px solid #304d65; padding-bottom:12px; margin-bottom:12px';
    deploySection.innerHTML = `
      <h2>⚡ Quick Deployment Presets</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px">
        <button id="btnPresetVVIP" style="padding:7px; background:#1e3a5f; border:1px solid #38bdf8; color:#fff; border-radius:6px; cursor:pointer; font-size:11px">🌟 VVIP Movement</button>
        <button id="btnPresetPeak" style="padding:7px; background:#1e3a5f; border:1px solid #f59e0b; color:#fff; border-radius:6px; cursor:pointer; font-size:11px">🚗 Peak Rush</button>
        <button id="btnPresetCorridor" style="padding:7px; background:#1e3a5f; border:1px solid #22c55e; color:#fff; border-radius:6px; cursor:pointer; font-size:11px; grid-column:span 2">🚨 Emergency Corridor</button>
      </div>

      <h2>📋 Duty Roster Excel / CSV</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px">
        <button id="btnExportRosterCSV" style="padding:7px; background:#0f766e; border:1px solid #2dd4bf; color:#fff; border-radius:6px; cursor:pointer; font-size:11px">📥 Export CSV</button>
        <button id="btnImportRosterCSV" style="padding:7px; background:#1e293b; border:1px solid #64748b; color:#fff; border-radius:6px; cursor:pointer; font-size:11px">📤 Import CSV</button>
      </div>
      <input id="inputRosterCSV" type="file" accept=".csv" style="display:none">

      <button id="btnExportPDF" style="width:100%; padding:9px; background:linear-gradient(135deg,#0369a1,#0284c7); border:1px solid #38bdf8; color:#fff; font-weight:bold; border-radius:6px; cursor:pointer; margin-top:6px">
        📄 Export Printable Deployment PDF
      </button>

      <label style="margin-top:8px"><input id="toggleMobileMode" class="check" type="checkbox"> 📱 Mobile Field Mode (Virtual Joysticks)</label>
    `;

    deploySection.querySelector('#btnPresetVVIP')!.addEventListener('click', () => applyDeploymentPreset('vvip'));
    deploySection.querySelector('#btnPresetPeak')!.addEventListener('click', () => applyDeploymentPreset('peak_rush'));
    deploySection.querySelector('#btnPresetCorridor')!.addEventListener('click', () => applyDeploymentPreset('green_corridor'));
    deploySection.querySelector('#btnExportRosterCSV')!.addEventListener('click', exportDutyRosterCSV);

    const importInput = deploySection.querySelector('#inputRosterCSV') as HTMLInputElement;
    deploySection.querySelector('#btnImportRosterCSV')!.addEventListener('click', () => importInput.click());
    importInput.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => importDutyRosterCSV(ev.target?.result as string);
        reader.readAsText(file);
      }
    };

    deploySection.querySelector('#btnExportPDF')!.addEventListener('click', generatePrintablePDFReport);
    const mobileCheck = deploySection.querySelector('#toggleMobileMode') as HTMLInputElement;
    mobileCheck.onchange = () => toggleMobileFieldMode(mobileCheck.checked);

    panels.deploy.prepend(deploySection);

    // Top Stampede Danger Alert Banner
    const topAlert = document.createElement('div');
    topAlert.id = 'stampede-alert-banner';
    topAlert.style.cssText = `
      position: fixed; top: 12px; left: 340px; right: 340px;
      background: linear-gradient(135deg, #b91c1c, #991b1b);
      border: 1px solid #f87171; border-radius: 8px;
      color: #fff; padding: 10px 18px; font-family: system-ui; font-size: 13px;
      display: none; z-index: 9000; box-shadow: 0 8px 25px rgba(185, 28, 28, 0.6);
      text-align: center;
    `;
    document.body.appendChild(topAlert);
  }

  // Hook into Canvas Click for Officer Popup
  canvas.addEventListener('pointerup', e => {
    // Check if clicked a police or duty resource
    const mouse = new THREE.Vector2(
      (e.offsetX / canvas.clientWidth) * 2 - 1,
      -(e.offsetY / canvas.clientHeight) * 2 + 1
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(api.resources.children, true);
    if (hits.length > 0) {
      let cur: THREE.Object3D | null = hits[0].object;
      while (cur && cur !== scene) {
        if (Number.isInteger(cur.userData?.index)) {
          showOfficerCard(cur.userData.index, e.clientX, e.clientY);
          break;
        }
        cur = cur.parent;
      }
    }
  });

  // Init
  buildSidebarPanels();
  setupMobileHUD();
  rebuildCCTVCones();

  // Tick function called every animation frame
  function update(delta: number = 0.016) {
    // 1. Path tube animated scrolling pulse
    if (pathAnimatedMesh) {
      pathTextureOffset += 0.015;
      const mat = pathAnimatedMesh.material as THREE.MeshBasicMaterial;
      const pulse = 0.7 + Math.sin(Date.now() * 0.006) * 0.3;
      mat.opacity = pulse;
    }

    // 2. Crowd and stampede monitoring
    updateCrowdAndStampede(delta);

    // 3. Green corridor vehicle progression
    updateGreenCorridor(delta);

    // 4. Update Compass Heading
    if (compassEl) {
      const view = api.getView();
      const deg = Math.round(((-view.angle * 180) / Math.PI + 360) % 360);
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const dirText = dirs[Math.round(deg / 45) % 8];
      const headingEl = compassEl.querySelector('#compassHeading');
      const needleEl = compassEl.querySelector('#compassNeedle') as HTMLElement;
      if (headingEl) headingEl.textContent = `${deg}° ${dirText}`;
      if (needleEl) needleEl.style.transform = `rotate(${deg}deg)`;
    }
  }

  return {
    update,
    exportDutyRosterCSV,
    importDutyRosterCSV,
    applyDeploymentPreset,
    findAndDrawRoute,
    clearRoute,
    triggerEvacuationSimulation,
    stopEvacuationSimulation,
    dispatchGreenCorridor,
    rebuildCCTVCones,
    rebuildFireRings,
    generatePrintablePDFReport,
    toggleMobileFieldMode,
    showOfficerCard
  };
}
