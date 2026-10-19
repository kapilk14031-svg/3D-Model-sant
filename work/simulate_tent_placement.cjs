const fs = require('fs');

// World coordinate mapper from venue.js
function pt(u, v, y = 0) {
  return { x: (u - 0.5) * 600, y, z: (v - 0.5) * 450 };
}

// Distance from point (px, pz) to line segment (x1, z1) - (x2, z2)
function distToSegment(px, pz, x1, z1, x2, z2) {
  const l2 = (x2 - x1) ** 2 + (z2 - z1) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, pz - z1);
  let t = ((px - x1) * (x2 - x1) + (pz - z1) * (z2 - z1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), pz - (z1 + t * (z2 - z1)));
}

// Main internal roads from venue.js
const roads = [
  [[.16,.81],[.163,.49],[.16,.3],[.4,.23],[.56,.18]],
  [[.16,.49],[.23,.48],[.4,.23]],
  [[.23,.48],[.32,.6],[.35,.6],[.35,.755]],
  [[.397,.72],[.397,.418],[.56,.418],[.56,.18]],
  [[.56,.418],[.56,.21],[.75,.21]],
  [[.59,.68],[.59,.515],[.66,.43],[.72,.31],[.77,.31],[.81,.61]],
  [[.35,.525],[.54,.525]],
  [[.495,.7],[.495,.42]],
  [[.56,.18],[.58,.1],[.77,.09]],
  [[.75,.1],[.77,.21],[.81,.4],[.81,.61]],
  // Highway NH-44
  [[.05,.75],[.95,.75]],
  [[.05,.72],[.95,.72]],
  // Railway line
  [[.05,.08],[.95,.08]]
];

// Extra roads from venue.js
const extraRoads = [
  [[.3,.418],[.396,.418]],
  [[.3,.525],[.396,.525]],
  [[.465,.497],[.465,.312],[.492,.312]],
  [[.492,.312],[.492,.2]],
  [[.77,.199],[.75,.204],[.718,.238],[.718,.292],[.768,.321],[.8,.297]],
  [[.18,.64],[.245,.64],[.245,.69],[.166,.69]],
  [[.576,.51],[.677,.519],[.684,.54],[.684,.635],[.672,.652]],
  [[.57,.103],[.78,.094]]
];

const allRoads = [...roads, ...extraRoads].map(r => r.map(([u, v]) => pt(u, v)));

// Existing major buildings / structures to exclude
const exclusions = [
  // Grand Main Pandal
  { x: (0.428 - 0.5) * 600, z: (0.63 - 0.5) * 450, w: 55, d: 110 },
  // VIP Entrance plaza / red carpet
  { x: (0.428 - 0.5) * 600, z: (0.71 - 0.5) * 450, w: 25, d: 35 },
  // Langar Ground B (west)
  { x: (0.376 - 0.5) * 600, z: (0.466 - 0.5) * 450, w: 28, d: 52 },
  // Langar Ground C (central)
  { x: (0.504 - 0.5) * 600, z: (0.361 - 0.5) * 450, w: 28, d: 52 },
  // Langar Ground D (north)
  { x: (0.538 - 0.5) * 600, z: (0.247 - 0.5) * 450, w: 28, d: 52 },
  // Langar Gate 2
  { x: (0.517 - 0.5) * 600, z: (0.602 - 0.5) * 450, w: 28, d: 38 },
  // Exhibition
  { x: (0.426 - 0.5) * 600, z: (0.535 - 0.5) * 450, w: 42, d: 18 },
  // P2 buses & cars parking
  { x: (0.321 - 0.5) * 600, z: (0.572 - 0.5) * 450, w: 35, d: 30 },
  // VIP I-parking (Gate 1)
  { x: (0.375 - 0.5) * 600, z: (0.723 - 0.5) * 450, w: 30, d: 35 },
  // Police chowki
  { x: (0.539 - 0.5) * 600, z: (0.676 - 0.5) * 450, w: 20, d: 20 },
  // Petrol pump
  { x: (0.506 - 0.5) * 600, z: (0.678 - 0.5) * 450, w: 15, d: 18 },
  // Railway station
  { x: (0.75 - 0.5) * 600, z: (0.12 - 0.5) * 450, w: 35, d: 20 }
];

function isBlocked(x, z, radius = 2.8) {
  // Check roads
  for (const r of allRoads) {
    for (let i = 1; i < r.length; i++) {
      const d = distToSegment(x, z, r[i - 1].x, r[i - 1].z, r[i].x, r[i].z);
      if (d < 4.8 + radius) return true; // Keep road clear + curb margin
    }
  }
  // Check exclusions
  for (const ex of exclusions) {
    if (Math.abs(x - ex.x) < ex.w / 2 + radius && Math.abs(z - ex.z) < ex.d / 2 + radius) {
      return true;
    }
  }
  return false;
}

// Define the Residential Accommodation Sectors according to the Blueprint:
// Dimensions of each tent in world units: width ~ 4.2m, depth ~ 5.6m
// In (u, v): 1 unit in u = 600m, 1 unit in v = 450m
// So 4.2m in u = 0.0070, 5.6m in v = 0.0124
const stepU = 0.0075; // 4.5m pitch (4.0m tent + 0.5m gap)
const stepV = 0.0145; // 6.5m pitch (5.6m tent + 0.9m walkway)

const sectors = [
  // 1. Ground B - South (Patna, Bihar, Bareilly, Allahabad, Gwalior)
  { name: 'Ground-B South', u1: 0.185, u2: 0.365, v1: 0.490, v2: 0.585, zone: 'B-South', color: '#f6f3eb' },
  // 2. Ground B - Mid (Kanpur, Lucknow, Mussoorie, around Langar B)
  { name: 'Ground-B Mid', u1: 0.185, u2: 0.365, v1: 0.375, v2: 0.485, zone: 'B-Mid', color: '#f2ece0' },
  // 3. Ground B - North (along diagonal boundary road)
  { name: 'Ground-B North', u1: 0.220, u2: 0.380, v1: 0.260, v2: 0.370, zone: 'B-North', color: '#ede5d5' },

  // 4. Ground C - West (Residential blocks west of Langar C)
  { name: 'Ground-C West', u1: 0.395, u2: 0.475, v1: 0.415, v2: 0.520, zone: 'C-West', color: '#f5f1ea' },
  // 5. Ground C - East (Delhi Zone 39, Sri Ganganagar Zone 17)
  { name: 'Ground-C East', u1: 0.495, u2: 0.565, v1: 0.415, v2: 0.520, zone: 'C-East', color: '#f7f4ed' },
  // 6. Ground C - North (between Langar C and Ground D road)
  { name: 'Ground-C North', u1: 0.410, u2: 0.550, v1: 0.375, v2: 0.410, zone: 'C-North', color: '#f3ece2' },

  // 7. Ground D - South (Punjab, Firozepur, Bhatinda, south of Langar D)
  { name: 'Ground-D South', u1: 0.435, u2: 0.575, v1: 0.275, v2: 0.365, zone: 'D-South', color: '#ede6d8' },
  // 8. Ground D - North (Pathankot, Patiala, north of Langar D)
  { name: 'Ground-D North', u1: 0.445, u2: 0.575, v1: 0.195, v2: 0.270, zone: 'D-North', color: '#eae1d0' },

  // 9. East Sector / P4 (Odisha, Nepal, Abroad Saints, Sewadal)
  { name: 'East P4 Sector', u1: 0.575, u2: 0.675, v1: 0.410, v2: 0.585, zone: 'East-P4', color: '#f4ede2' },

  // 10. Top-Right P3 Grid (Light Vehicles Car Parking & Accommodation)
  { name: 'P3 Grid', u1: 0.680, u2: 0.775, v1: 0.080, v2: 0.205, zone: 'P3', color: '#f1ebd9' },

  // 11. West Alighting & P1 transit camps
  { name: 'West Alighting', u1: 0.175, u2: 0.245, v1: 0.600, v2: 0.735, zone: 'West', color: '#ede5d4' }
];

let placedTents = [];
let sectorCounts = {};

for (const sec of sectors) {
  let count = 0;
  for (let u = sec.u1; u <= sec.u2; u += stepU) {
    for (let v = sec.v1; v <= sec.v2; v += stepV) {
      // Add regular aisle walkways every 5 tents across and every 6 tents down
      const uIndex = Math.round((u - sec.u1) / stepU);
      const vIndex = Math.round((v - sec.v1) / stepV);
      if (uIndex % 6 === 5) continue; // North-South walkway
      if (vIndex % 5 === 4) continue; // East-West walkway

      const p = pt(u, v);
      if (!isBlocked(p.x, p.z, 2.2)) {
        placedTents.push({
          x: p.x,
          z: p.z,
          u,
          v,
          zone: sec.zone,
          sector: sec.name,
          color: sec.color
        });
        count++;
      }
    }
  }
  sectorCounts[sec.name] = count;
}

console.log('Total Tents Placed:', placedTents.length);
console.log('Counts per sector:', JSON.stringify(sectorCounts, null, 2));
