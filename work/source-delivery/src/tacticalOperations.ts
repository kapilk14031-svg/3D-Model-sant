import * as THREE from 'three';

export interface DutyPoint {
  id: string;
  name: string;
  locationName: string;
  officer: string;
  rank: string;
  badge: string;
  phone: string;
  shift: string;
  strength: number;
  reporting: string;
  x: number;
  z: number;
  category: 'gate' | 'pandal' | 'langar' | 'traffic' | 'control' | 'medical';
}

const DEFAULT_ROSTER: DutyPoint[] = [
  { id: 'dp1', name: 'Morcha Gate 1 VIP', locationName: 'Gate 1 (VVIP Corridor)', officer: 'Insp. Rajender Singh', rank: 'Inspector', badge: 'HR-POL-1042', phone: '+91 94161 33202', shift: '06:00 - 14:00 (Morning)', strength: 12, reporting: 'DSP Vikram Sharma', x: -210, z: -85, category: 'gate' },
  { id: 'dp2', name: 'Main Pandal Security Morcha', locationName: 'Main Satsang Pandal Stage', officer: 'DSP Vikram Sharma', rank: 'DSP', badge: 'HR-POL-0210', phone: '+91 98120 44101', shift: '06:00 - 18:00 (Full Day)', strength: 25, reporting: 'SP Panipat', x: -45, z: 55, category: 'pandal' },
  { id: 'dp3', name: 'Langar Hall 1 Distribution Post', locationName: 'Langar Complex 1', officer: 'SI Amit Deswal', rank: 'Sub-Inspector', badge: 'HR-POL-3490', phone: '+91 98960 77303', shift: '14:00 - 22:00 (Evening)', strength: 20, reporting: 'Insp. Harish Chander', x: 120, z: -70, category: 'langar' },
  { id: 'dp4', name: 'Langar Hall 2 Chokidari', locationName: 'Langar Complex 2', officer: 'SI Manjeet Hooda', rank: 'Sub-Inspector', badge: 'HR-POL-4122', phone: '+91 94672 55404', shift: '14:00 - 22:00 (Evening)', strength: 18, reporting: 'Insp. Harish Chander', x: 130, z: 75, category: 'langar' },
  { id: 'dp5', name: 'P1 Heavy Vehicle Parking Morcha', locationName: 'P1 Parking (Buses & Trucks)', officer: 'Insp. Suresh Malik', rank: 'Inspector (Traffic)', badge: 'HR-TRF-0814', phone: '+91 98135 66505', shift: '06:00 - 14:00 (Morning)', strength: 16, reporting: 'DSP Traffic Panipat', x: -160, z: 120, category: 'traffic' },
  { id: 'dp6', name: 'P2 Bus Depot & Transit Hub', locationName: 'P2 Parking & Alighting', officer: 'SI Kuldeep Poonia', rank: 'Sub-Inspector', badge: 'HR-TRF-1930', phone: '+91 94168 88606', shift: '14:00 - 22:00 (Evening)', strength: 14, reporting: 'DSP Traffic Panipat', x: 20, z: 145, category: 'traffic' },
  { id: 'dp7', name: 'FOB-1 Pedestrian Overpass Control', locationName: 'Foot Over Bridge 1 (NH-44)', officer: 'ASI Satish Kumar', rank: 'Asst. Sub-Inspector', badge: 'HR-POL-5509', phone: '+91 98122 99707', shift: '14:00 - 22:00 (Evening)', strength: 8, reporting: 'Insp. Suresh Malik', x: -80, z: -130, category: 'gate' },
  { id: 'dp8', name: 'Central Police Command Chowki', locationName: 'Police Control Room (PCR Hub)', officer: 'DSP Sandeep Kaushik', rank: 'DSP (HQ)', badge: 'HR-POL-0105', phone: '+91 98965 11808', shift: '24 Hours Operational', strength: 30, reporting: 'SP Panipat', x: 40, z: -40, category: 'control' },
  { id: 'dp9', name: 'Railway Halt / Transit Intersection', locationName: 'Ganaur / Bhodwal Halt Point', officer: 'Insp. Deepak Tanwar', rank: 'Inspector', badge: 'HR-POL-2219', phone: '+94660 22909', shift: '06:00 - 14:00 (Morning)', strength: 15, reporting: 'DSP Sandeep Kaushik', x: 210, z: -120, category: 'traffic' },
  { id: 'dp10', name: 'Emergency Hospital / Trauma Centre', locationName: 'Main Medical Hospital & Dispensary', officer: 'Dr. Anuj / Insp. Meena', rank: 'Inspector (L&O)', badge: 'HR-MED-0044', phone: '+91 98131 44010', shift: '24 Hours Operational', strength: 10, reporting: 'Civil Surgeon / DSP HQ', x: -60, z: -60, category: 'medical' },
  { id: 'dp11', name: 'Exhibition Ground Sector Security', locationName: 'Nirankari Exhibition Ground', officer: 'SI Pooja Rani', rank: 'Sub-Inspector', badge: 'HR-POL-4411', phone: '+91 94165 55111', shift: '10:00 - 19:00 (Day)', strength: 12, reporting: 'DSP Vikram Sharma', x: -140, z: -30, category: 'pandal' },
  { id: 'dp12', name: 'Gate 4 Public Entry & Barricade Point', locationName: 'Gate 4 Main Entrance', officer: 'SI Harish Chander', rank: 'Sub-Inspector', badge: 'HR-POL-3908', phone: '+91 98962 77212', shift: '06:00 - 14:00 (Morning)', strength: 15, reporting: 'DSP Vikram Sharma', x: -120, z: 155, category: 'gate' }
];

interface TacticalAPI {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  ground: THREE.Object3D;
  focus: (x: number, z: number, dist?: number) => void;
  panel: HTMLElement;
}

export function setupTacticalOperations(api: TacticalAPI) {
  const tacticalGroup = new THREE.Group();
  tacticalGroup.name = 'TacticalOperationsLayer';
  api.scene.add(tacticalGroup);

  // Subgroups
  const dutyMarkersGroup = new THREE.Group();
  const cctvConesGroup = new THREE.Group();
  const fireRadiusGroup = new THREE.Group();
  const vhfMeshGroup = new THREE.Group();
  const antiDroneGroup = new THREE.Group();
  const presetObjectsGroup = new THREE.Group();

  tacticalGroup.add(dutyMarkersGroup);
  tacticalGroup.add(cctvConesGroup);
  tacticalGroup.add(fireRadiusGroup);
  tacticalGroup.add(vhfMeshGroup);
  tacticalGroup.add(antiDroneGroup);
  tacticalGroup.add(presetObjectsGroup);

  let activeRoster: DutyPoint[] = [...DEFAULT_ROSTER];
  let selectedDutyId: string | null = null;
  let activePreset: 'normal' | 'vvip' | 'evening_rush' | 'green_corridor' = 'normal';

  // 1. Build Duty Roster 3D Markers
  function buildDutyMarkers() {
    dutyMarkersGroup.clear();
    activeRoster.forEach(dp => {
      const g = new THREE.Group();
      g.position.set(dp.x, 0, dp.z);

      // Base pedestal
      const pedMat = new THREE.MeshStandardMaterial({
        color: dp.category === 'control' ? '#1565c0' : dp.category === 'medical' ? '#d32f2f' : '#f57c00',
        metalness: 0.3,
        roughness: 0.4
      });
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 0.6, 16), pedMat);
      ped.position.y = 0.3;
      ped.receiveShadow = true;
      g.add(ped);

      // Glowing beacon post
      const postMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 });
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.5, 8), postMat);
      post.position.y = 2.05;
      g.add(post);

      // Top Police Crest Sphere
      const sphereMat = new THREE.MeshStandardMaterial({
        color: '#ffea00',
        emissive: dp.category === 'control' ? '#2196f3' : '#ff9800',
        emissiveIntensity: 0.5,
        roughness: 0.2
      });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 16), sphereMat);
      sphere.position.y = 4.2;
      g.add(sphere);

      // Billboard Canvas Sprite
      const canvas = document.createElement('canvas');
      canvas.width = 384;
      canvas.height = 110;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(10, 24, 40, 0.92)';
      ctx.roundRect ? ctx.roundRect(4, 4, 376, 102, 12) : ctx.rect(4, 4, 376, 102);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = dp.category === 'control' ? '#64b5f6' : dp.category === 'medical' ? '#ef5350' : '#ffd54f';
      ctx.stroke();

      ctx.fillStyle = '#ffeb3b';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText(`👮 ${dp.name}`, 16, 36);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText(`${dp.officer} (${dp.rank})`, 16, 66);

      ctx.fillStyle = '#90caf9';
      ctx.font = '15px system-ui, sans-serif';
      ctx.fillText(`Force: ${dp.strength} Staff · ${dp.shift.split(' ')[0]}`, 16, 92);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const spriteMat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(0, 6.2, 0);
      sprite.scale.set(16, 4.6, 1);
      g.add(sprite);

      g.userData = {
        isDutyPoint: true,
        dutyId: dp.id,
        dutyData: dp
      };
      dutyMarkersGroup.add(g);
    });
  }

  // 2. Build CCTV Cones (Frustums)
  const CCTV_POSTS = [
    { name: 'CCTV 1 - Gate 1 VIP', x: -215, y: 12, z: -80, target: [-190, 0, -85], fov: 45, range: 45 },
    { name: 'CCTV 2 - Main Pandal Stage', x: -45, y: 16, z: 25, target: [-45, 0, 65], fov: 60, range: 60 },
    { name: 'CCTV 3 - Langar Hall 1 Entry', x: 110, y: 11, z: -60, target: [130, 0, -80], fov: 50, range: 40 },
    { name: 'CCTV 4 - FOB 1 Overpass', x: -85, y: 14, z: -125, target: [-75, 0, -135], fov: 50, range: 45 },
    { name: 'CCTV 5 - P1 Parking Entrance', x: -150, y: 12, z: 110, target: [-170, 0, 130], fov: 55, range: 50 },
    { name: 'CCTV 6 - Police Control Room', x: 40, y: 14, z: -35, target: [20, 0, -20], fov: 65, range: 55 },
    { name: 'CCTV 7 - Railway Halt Crossing', x: 200, y: 12, z: -115, target: [220, 0, -125], fov: 55, range: 50 },
    { name: 'CCTV 8 - Gate 4 Public Queue', x: -115, y: 12, z: 150, target: [-125, 0, 165], fov: 50, range: 45 }
  ];

  function buildCCTVCones() {
    cctvConesGroup.clear();
    CCTV_POSTS.forEach((cctv, i) => {
      const g = new THREE.Group();
      g.position.set(cctv.x, cctv.y, cctv.z);

      // Camera Pole
      const poleGeo = new THREE.CylinderGeometry(0.2, 0.3, cctv.y, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: '#78909c', roughness: 0.4 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(0, -cctv.y / 2, 0);
      g.add(pole);

      // Camera housing
      const camHousing = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.6, 1.4),
        new THREE.MeshStandardMaterial({ color: '#eceff1', roughness: 0.2 })
      );
      camHousing.position.set(0, 0, 0);
      g.add(camHousing);

      // Lens with red blinking LED
      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.3, 12),
        new THREE.MeshBasicMaterial({ color: '#263238' })
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0, 0, 0.7);
      g.add(lens);

      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshBasicMaterial({ color: '#ff1744' })
      );
      led.position.set(0.3, 0.2, 0.7);
      g.add(led);

      // Direction vector towards ground target
      const targetVec = new THREE.Vector3(...cctv.target);
      const originVec = new THREE.Vector3(cctv.x, cctv.y, cctv.z);
      const dir = targetVec.clone().sub(originVec).normalize();
      const dist = originVec.distanceTo(targetVec);

      // Semi-transparent Conical Frustum Mesh
      const coneGeo = new THREE.ConeGeometry(dist * Math.tan((cctv.fov * Math.PI) / 360), dist, 16, 1, true);
      coneGeo.translate(0, -dist / 2, 0);
      coneGeo.rotateX(-Math.PI / 2);

      const coneMat = new THREE.MeshBasicMaterial({
        color: '#00e5ff',
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      coneMesh.lookAt(dir);
      g.add(coneMesh);

      // Ground Coverage Oval Decal
      const groundDecal = new THREE.Mesh(
        new THREE.RingGeometry(0.5, dist * 0.45, 24),
        new THREE.MeshBasicMaterial({
          color: '#00e5ff',
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      groundDecal.rotation.x = -Math.PI / 2;
      groundDecal.position.set(cctv.target[0] - cctv.x, -cctv.y + 0.1, cctv.target[2] - cctv.z);
      g.add(groundDecal);

      cctvConesGroup.add(g);
    });
  }

  // 3. Fire Hydrant & Water Hose Radius (30m & 60m)
  const FIRE_STATIONS = [
    { name: 'Fire Tender 1 - Main Pandal West', x: -80, z: 45 },
    { name: 'Fire Tender 2 - Langar Hall 1', x: 100, z: -50 },
    { name: 'Fire Tender 3 - Gate 1 VIP Sector', x: -190, z: -70 },
    { name: 'Water Tanker Hub - P1 Parking', x: -140, z: 100 },
    { name: 'Emergency Fire Post - Ganaur Side', x: 190, z: -100 }
  ];

  function buildFireRadii() {
    fireRadiusGroup.clear();
    FIRE_STATIONS.forEach(fs => {
      const g = new THREE.Group();
      g.position.set(fs.x, 0.15, fs.z);

      // 30m Immediate Hose reach
      const ring30 = new THREE.Mesh(
        new THREE.RingGeometry(29.4, 30.2, 48),
        new THREE.MeshBasicMaterial({
          color: '#00e676',
          transparent: true,
          opacity: 0.65,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      ring30.rotation.x = -Math.PI / 2;
      g.add(ring30);

      // 60m Extended Relay Reach
      const ring60 = new THREE.Mesh(
        new THREE.RingGeometry(59.2, 60.2, 64),
        new THREE.MeshBasicMaterial({
          color: '#ff9100',
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      ring60.rotation.x = -Math.PI / 2;
      g.add(ring60);

      // Center Fire Hydrant Mesh
      const hyd = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.45, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: '#d50000', roughness: 0.3 })
      );
      hyd.position.y = 0.7;
      g.add(hyd);

      fireRadiusGroup.add(g);
    });
  }

  // 4. VHF/TETRA Wireless Repeaters & VIP Anti-Drone Bubble
  function buildTacticalComms() {
    vhfMeshGroup.clear();
    antiDroneGroup.clear();

    // VHF Repeater Towers (Tower 1: Police Chowki, Tower 2: Pandal Roof)
    const TOWERS = [
      { name: 'VHF Master Tower 1', x: 40, y: 0, z: -40, height: 28 },
      { name: 'VHF Relay Tower 2', x: -45, y: 0, z: 110, height: 24 }
    ];

    TOWERS.forEach(t => {
      const g = new THREE.Group();
      g.position.set(t.x, 0, t.z);

      // Lattice Tower Mesh
      const tower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 1.5, t.height, 4, 6, true),
        new THREE.MeshStandardMaterial({ color: '#ff3d00', wireframe: true })
      );
      tower.position.y = t.height / 2;
      g.add(tower);

      // RF Signal Expanding Rings (Simulated with concentric rings)
      for (let r = 20; r <= 100; r += 20) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(r - 0.4, r + 0.4, 48),
          new THREE.MeshBasicMaterial({
            color: '#2979ff',
            transparent: true,
            opacity: Math.max(0.08, 0.4 - r * 0.003),
            side: THREE.DoubleSide,
            depthWrite: false
          })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.2;
        g.add(ring);
      }
      vhfMeshGroup.add(g);
    });

    // VVIP Anti-Drone Protective Geodesic Dome over Main Stage
    const domeGeo = new THREE.SphereGeometry(45, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshBasicMaterial({
      color: '#e040fb',
      wireframe: true,
      transparent: true,
      opacity: 0.28,
      depthWrite: false
    });
    const antiDroneDome = new THREE.Mesh(domeGeo, domeMat);
    antiDroneDome.position.set(-45, 0, 58);
    antiDroneGroup.add(antiDroneDome);

    // Helipad Obstacle Clearance Surface (OLS) Funnel (Near Gate 1)
    const olsGeo = new THREE.ConeGeometry(35, 70, 16, 1, true);
    olsGeo.translate(0, 35, 0);
    olsGeo.rotateX(Math.PI / 2.3);
    const olsMat = new THREE.MeshBasicMaterial({
      color: '#00e676',
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    });
    const olsMesh = new THREE.Mesh(olsGeo, olsMat);
    olsMesh.position.set(-220, 0, -120);
    antiDroneGroup.add(olsMesh);
  }

  // 5. Quick Deployment Presets
  function applyPreset(presetName: 'normal' | 'vvip' | 'evening_rush' | 'green_corridor') {
    activePreset = presetName;
    presetObjectsGroup.clear();

    const banner = document.querySelector('#tacticalPresetBanner') as HTMLElement;

    if (presetName === 'vvip') {
      if (banner) {
        banner.style.display = 'block';
        banner.style.background = 'linear-gradient(90deg, #b71c1c, #d32f2f)';
        banner.innerHTML = '🚨 <b>VVIP MOVEMENT PROTOCOL ACTIVE</b>: Route Sterilized · Heavy Barricades Up · Cavalcade Deployed';
      }

      // Spawn VVIP Cavalcade along VIP Road
      const suvMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.2, metalness: 0.8 });
      const convoyPositions = [
        { x: -180, z: -85, type: 'Pilot PCR (Gypsy)' },
        { x: -160, z: -85, type: 'VVIP Armored SUV 1' },
        { x: -140, z: -85, type: 'VVIP Armored SUV 2' },
        { x: -120, z: -85, type: 'Escort Commando Van' }
      ];

      convoyPositions.forEach((pos, idx) => {
        const car = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 5), suvMat);
        car.position.set(pos.x, 0.8, pos.z);
        car.rotation.y = Math.PI / 2;

        // Rooftop flasher
        const flasher = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.25, 0.4),
          new THREE.MeshBasicMaterial({ color: idx % 2 === 0 ? '#d50000' : '#2979ff' })
        );
        flasher.position.y = 0.95;
        car.add(flasher);
        presetObjectsGroup.add(car);
      });

      // Red carpet sterilized path ribbon
      const ribbonGeo = new THREE.PlaneGeometry(160, 6);
      const ribbonMat = new THREE.MeshBasicMaterial({
        color: '#ff1744',
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbon.rotation.x = -Math.PI / 2;
      ribbon.position.set(-110, 0.08, -85);
      presetObjectsGroup.add(ribbon);

    } else if (presetName === 'evening_rush') {
      if (banner) {
        banner.style.display = 'block';
        banner.style.background = 'linear-gradient(90deg, #e65100, #f57c00)';
        banner.innerHTML = '⚠️ <b>PEAK EVENING RUSH PROTOCOL ACTIVE</b>: Traffic Diversions ON · One-Way Cones Active';
      }

      // Add 25 reflective orange traffic cones along NH-44 & Gates
      const coneGeo = new THREE.ConeGeometry(0.35, 1.1, 12);
      const coneMat = new THREE.MeshStandardMaterial({ color: '#ff6d00', roughness: 0.3 });
      for (let x = -250; x <= 250; x += 20) {
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.set(x, 0.55, -145);
        presetObjectsGroup.add(cone);
      }
    } else if (presetName === 'green_corridor') {
      if (banner) {
        banner.style.display = 'block';
        banner.style.background = 'linear-gradient(90deg, #1b5e20, #2e7d32)';
        banner.innerHTML = '🚑 <b>EMERGENCY GREEN CORRIDOR ACTIVE</b>: Hospital to Highway Preempted · Barricades Cleared';
      }

      // Glowing Green Road Path from Medical to Highway
      const greenGeo = new THREE.PlaneGeometry(14, 180);
      const greenMat = new THREE.MeshBasicMaterial({
        color: '#00e676',
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide
      });
      const greenRibbon = new THREE.Mesh(greenGeo, greenMat);
      greenRibbon.rotation.x = -Math.PI / 2;
      greenRibbon.position.set(-60, 0.08, -50);
      presetObjectsGroup.add(greenRibbon);

      // Flashing Ambulance Model
      const amb = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 2, 5.2),
        new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 })
      );
      amb.position.set(-60, 1, -40);
      const ambFlasher = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.3, 0.4),
        new THREE.MeshBasicMaterial({ color: '#d50000' })
      );
      ambFlasher.position.y = 1.15;
      amb.add(ambFlasher);
      presetObjectsGroup.add(amb);
    } else {
      if (banner) {
        banner.style.display = 'none';
      }
    }
  }

  // 6. CSV Export & Import for Duty Roster
  function exportRosterCSV() {
    const headers = ['ID', 'Post Name', 'Location', 'Officer Name', 'Rank', 'Badge ID', 'Mobile Number', 'Shift', 'Staff Strength', 'Reporting Officer', 'X Coordinate', 'Z Coordinate'];
    const rows = activeRoster.map(r => [
      r.id,
      `"${r.name}"`,
      `"${r.locationName}"`,
      `"${r.officer}"`,
      `"${r.rank}"`,
      `"${r.badge}"`,
      `"${r.phone}"`,
      `"${r.shift}"`,
      r.strength,
      `"${r.reporting}"`,
      r.x,
      r.z
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', '78th_Samagam_Police_Duty_Roster.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function importRosterCSV(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      if (!text) return;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) return;
      const newRoster: DutyPoint[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 10) {
          newRoster.push({
            id: cols[0] || `dp_${i}`,
            name: cols[1] || 'Duty Post',
            locationName: cols[2] || '',
            officer: cols[3] || 'Officer',
            rank: cols[4] || 'SI',
            badge: cols[5] || '',
            phone: cols[6] || '',
            shift: cols[7] || 'Shift 1',
            strength: Number(cols[8]) || 10,
            reporting: cols[9] || '',
            x: Number(cols[10]) || 0,
            z: Number(cols[11]) || 0,
            category: 'gate'
          });
        }
      }
      if (newRoster.length > 0) {
        activeRoster = newRoster;
        buildDutyMarkers();
        renderRosterList();
        alert(`Successfully imported ${newRoster.length} duty points from CSV!`);
      }
    };
    reader.readAsText(file);
  }

  // 7. Sidebar Panel HTML & Event Handlers
  function renderUI() {
    api.panel.innerHTML = `
      <div id="tacticalPresetBanner" style="display:none;padding:10px;margin-bottom:12px;border-radius:6px;font-size:12px;color:#fff;text-shadow:0 1px 2px #000;"></div>

      <h2>Quick Deployment Presets</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px;">
        <button id="btnPresetNormal" style="padding:8px 4px;font-size:11px;background:#1b3850;color:#c9e2f5;border:1px solid #3d6485;border-radius:6px;cursor:pointer;">Standard Day</button>
        <button id="btnPresetVVIP" style="padding:8px 4px;font-size:11px;background:#b71c1c;color:#fff;border:1px solid #ff5252;border-radius:6px;cursor:pointer;font-weight:bold;">🚨 VVIP Protocol</button>
        <button id="btnPresetRush" style="padding:8px 4px;font-size:11px;background:#e65100;color:#fff;border:1px solid #ff9800;border-radius:6px;cursor:pointer;font-weight:bold;">⚠️ Evening Rush</button>
        <button id="btnPresetGreen" style="padding:8px 4px;font-size:11px;background:#1b5e20;color:#fff;border:1px solid #4caf50;border-radius:6px;cursor:pointer;font-weight:bold;">🚑 Green Corridor</button>
      </div>

      <h2>Coverage & Tactical Overlays</h2>
      <label><input id="chkDutyMarkers" type="checkbox" class="check" checked> Police Duty Morchas & Badges</label>
      <label><input id="chkCCTVCones" type="checkbox" class="check" checked> CCTV Frustums & Ground FOV</label>
      <label><input id="chkFireRings" type="checkbox" class="check" checked> Fire Hydrant 30m / 60m Reach</label>
      <label><input id="chkVHFRepeaters" type="checkbox" class="check" checked> VHF Mesh & VVIP Anti-Drone Dome</label>

      <h2>Duty Point Roster (${activeRoster.length} Morchas)</h2>
      <div style="display:flex;gap:6px;margin-bottom:8px;">
        <button id="btnExportCSV" style="flex:1;padding:6px;font-size:11px;background:#0d47a1;color:#fff;border:1px solid #42a5f5;border-radius:4px;cursor:pointer;">📥 Export CSV</button>
        <label style="flex:1;padding:6px;font-size:11px;background:#2e7d32;color:#fff;border:1px solid #81c784;border-radius:4px;cursor:pointer;text-align:center;">
          📤 Import CSV
          <input id="inputCSV" type="file" accept=".csv" style="display:none;">
        </label>
      </div>

      <div id="dutyListContainer" style="max-height:220px;overflow-y:auto;border:1px solid #23415c;border-radius:6px;padding:4px;background:#0a1827;"></div>

      <div id="dutyDetailCard" style="display:none;margin-top:12px;padding:12px;background:#12283d;border:1px solid #448aff;border-radius:8px;">
        <h3 id="cardTitle" style="margin:0 0 6px;color:#ffeb3b;font-size:14px;"></h3>
        <p id="cardLocation" style="margin:0 0 6px;font-size:11px;color:#90caf9;"></p>
        <div style="font-size:12px;line-height:1.6;color:#e1f5fe;">
          <div><b>Incharge:</b> <span id="cardOfficer"></span></div>
          <div><b>Rank / Badge:</b> <span id="cardRankBadge"></span></div>
          <div><b>Contact:</b> <a id="cardPhone" href="#" style="color:#69f0ae;text-decoration:none;"></a></div>
          <div><b>Shift:</b> <span id="cardShift"></span></div>
          <div><b>Strength:</b> <span id="cardStrength"></span> personnel</div>
          <div><b>Reporting To:</b> <span id="cardReporting"></span></div>
        </div>
        <div style="display:flex;gap:6px;margin-top:10px;">
          <button id="btnCardFocus" style="flex:1;padding:6px;font-size:11px;background:#1976d2;color:#fff;border:none;border-radius:4px;cursor:pointer;">🎯 Focus Camera</button>
          <button id="btnCardClose" style="padding:6px 10px;font-size:11px;background:#37474f;color:#fff;border:none;border-radius:4px;cursor:pointer;">✕</button>
        </div>
      </div>
    `;

    // Wire Presets
    document.querySelector('#btnPresetNormal')?.addEventListener('click', () => applyPreset('normal'));
    document.querySelector('#btnPresetVVIP')?.addEventListener('click', () => applyPreset('vvip'));
    document.querySelector('#btnPresetRush')?.addEventListener('click', () => applyPreset('evening_rush'));
    document.querySelector('#btnPresetGreen')?.addEventListener('click', () => applyPreset('green_corridor'));

    // Wire Checkboxes
    document.querySelector('#chkDutyMarkers')?.addEventListener('change', e => {
      dutyMarkersGroup.visible = (e.target as HTMLInputElement).checked;
    });
    document.querySelector('#chkCCTVCones')?.addEventListener('change', e => {
      cctvConesGroup.visible = (e.target as HTMLInputElement).checked;
    });
    document.querySelector('#chkFireRings')?.addEventListener('change', e => {
      fireRadiusGroup.visible = (e.target as HTMLInputElement).checked;
    });
    document.querySelector('#chkVHFRepeaters')?.addEventListener('change', e => {
      vhfMeshGroup.visible = (e.target as HTMLInputElement).checked;
      antiDroneGroup.visible = (e.target as HTMLInputElement).checked;
    });

    // Wire CSV Buttons
    document.querySelector('#btnExportCSV')?.addEventListener('click', exportRosterCSV);
    document.querySelector('#inputCSV')?.addEventListener('change', e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) importRosterCSV(file);
    });

    // Wire Card Close & Focus
    document.querySelector('#btnCardClose')?.addEventListener('click', () => {
      const card = document.querySelector('#dutyDetailCard') as HTMLElement;
      if (card) card.style.display = 'none';
      selectedDutyId = null;
    });

    document.querySelector('#btnCardFocus')?.addEventListener('click', () => {
      const dp = activeRoster.find(r => r.id === selectedDutyId);
      if (dp) {
        api.focus(dp.x, dp.z, 30);
      }
    });

    renderRosterList();
  }

  function renderRosterList() {
    const list = document.querySelector('#dutyListContainer');
    if (!list) return;
    list.innerHTML = '';
    activeRoster.forEach(dp => {
      const item = document.createElement('div');
      item.style.cssText = `padding:6px 8px;margin-bottom:4px;background:#14293d;border-left:3px solid ${dp.category === 'control' ? '#2196f3' : dp.category === 'medical' ? '#f44336' : '#ff9800'};border-radius:4px;cursor:pointer;font-size:11px;`;
      item.innerHTML = `
        <div style="font-weight:bold;color:#ffeb3b;">${dp.name}</div>
        <div style="color:#b0bec5;">${dp.officer} · Force: ${dp.strength}</div>
      `;
      item.onclick = () => showDutyCard(dp);
      list.appendChild(item);
    });
  }

  function showDutyCard(dp: DutyPoint) {
    selectedDutyId = dp.id;
    const card = document.querySelector('#dutyDetailCard') as HTMLElement;
    if (!card) return;
    card.style.display = 'block';
    (document.querySelector('#cardTitle') as HTMLElement).textContent = `👮 ${dp.name}`;
    (document.querySelector('#cardLocation') as HTMLElement).textContent = `📍 ${dp.locationName}`;
    (document.querySelector('#cardOfficer') as HTMLElement).textContent = dp.officer;
    (document.querySelector('#cardRankBadge') as HTMLElement).textContent = `${dp.rank} (${dp.badge})`;
    const phoneEl = document.querySelector('#cardPhone') as HTMLAnchorElement;
    phoneEl.textContent = dp.phone;
    phoneEl.href = `tel:${dp.phone}`;
    (document.querySelector('#cardShift') as HTMLElement).textContent = dp.shift;
    (document.querySelector('#cardStrength') as HTMLElement).textContent = String(dp.strength);
    (document.querySelector('#cardReporting') as HTMLElement).textContent = dp.reporting;
    api.focus(dp.x, dp.z, 40);
  }

  // Canvas Raycaster for direct clicking duty markers
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  api.renderer.domElement.addEventListener('pointerup', e => {
    mouse.set((e.offsetX / api.renderer.domElement.clientWidth) * 2 - 1, -(e.offsetY / api.renderer.domElement.clientHeight) * 2 + 1);
    ray.setFromCamera(mouse, api.camera);
    const hits = ray.intersectObjects(dutyMarkersGroup.children, true);
    if (hits.length > 0) {
      let cur: THREE.Object3D | null = hits[0].object;
      while (cur && !cur.userData?.isDutyPoint) cur = cur.parent;
      if (cur && cur.userData?.dutyData) {
        showDutyCard(cur.userData.dutyData);
      }
    }
  });

  // Initial Builds
  buildDutyMarkers();
  buildCCTVCones();
  buildFireRadii();
  buildTacticalComms();
  renderUI();

  return {
    getRoster: () => activeRoster,
    applyPreset,
    showDutyCard,
    toggleOverlays: (type: 'cctv' | 'duty' | 'fire' | 'comms', state: boolean) => {
      if (type === 'cctv') cctvConesGroup.visible = state;
      if (type === 'duty') dutyMarkersGroup.visible = state;
      if (type === 'fire') fireRadiusGroup.visible = state;
      if (type === 'comms') {
        vhfMeshGroup.visible = state;
        antiDroneGroup.visible = state;
      }
    }
  };
}
