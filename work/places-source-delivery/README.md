# E-Bandobast 3D viewer

React 18 + TypeScript + React Three Fiber 8 + Three.js + GSAP.

## Build

Use Node.js 20 or later with pnpm:

```
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
```

Open index.html in a WebGL-capable browser. The compiled viewer runs offline.

## Features

- 64 labelled entries open separate, category-specific conceptual 3D views.
- Click visible labels / corresponding areas, or use Browse all labelled places and the searchable model catalog.
- Parking, gates, langar, toilets, offices, police post, residence, fuel, nursery, exhibition, industrial, alighting, railway, flyover, footbridge, roads, village, boundary and open-area model categories.
- Each place has camera controls, optional roof/people/vehicles, Back/Escape and individual GLB export.
- Click the main pandal to enter its dedicated conceptual hall interior.
- Stage, screens, audience seating, central/cross aisles, roof trusses, exit markers and media desk.
- Hall camera presets, roof cutaway, audience toggle, stage-width adjustment and lighting modes.
- Exit button or Escape returns to the exterior with the deployment unchanged.
- Dedicated hall GLB export expands repeated instances for compatible editing.
- 42 searchable source features; all 11 printed traffic legend entries.
- Original scan overlay and reference drawing.
- Officer names, ranks, mobile, shift, reporting officer and notes.
- Custom coloured sector polygons, automatic/manual resource assignment and sector totals.
- Direct resource dragging, 15-degree or numeric rotation, JSON v3 save/load with legacy imports.
- Police-resource placement, quantities, PNG and OBJ exports.
- Orbit, pan, street-level camera and fly-around.
- Detailed standalone GLB import, placement, rotation, scaling and scene GLB export.
- Physically based procedural materials, shadows and daylight controls.

Expand the top-right asset panel with + to import a self-contained GLB. Export the scene to preserve imported assets. Deployment JSON stores the resource markers, not binary assets.

## Accuracy and limitations

All individual facility layouts are illustrative concepts based on the label category. Repeated facility categories share model templates. The supplied traffic PDF does not specify internal floor plans or equipment placements. Direction labels open route context models; uncertain labels open generic site-area contexts.

The hall interior is an illustrative design. The PDF does not specify an interior layout, measured stage dimensions, seating capacity or approved exit layout. Audience figures are examples, not a capacity calculation.

The site layout is traced approximately from the supplied scanned PDF. Coordinates and heights are schematic, not survey measurements. Surface colors, structures, vehicles, vegetation and police models are illustrative procedural geometry. Source route colors are preserved as annotations. Small unclear source labels are explicitly marked uncertain. The model is not photorealistic or a surveyed digital twin.

No Meshy, Tripo, Blender automation, backend API, GIS, georeferencing or live deployment integration is connected. The GLB can be edited in Blender or replaced with externally generated, licensed assets using the asset import panel.

## Architecture

src/main.tsx: typed React/Fiber host, GLB import/export, asset editor.
src/venue.js: retained procedural venue and source-data UI.
src/bigPandal.ts: separate hall concept, seating batching, entry/exit isolation and GLB export.
src/facilityExplorer.ts: labelled-place catalog, map label and area picking, categorized models, navigation and GLB export.
src/plan.ts: validated plan schema, migration, polygon assignment and sector totals.
src/deployment.ts: duty-record editor, sector overlays and drag/rotation controls.
build.cjs: esbuild bundling with Node filesystem resolution for this environment.
template.html: standalone UI shell.

The scene data embeds the user-supplied scan. Treat exported files according to your data-sharing requirements.
