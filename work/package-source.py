from pathlib import Path
import json,zipfile,shutil
src=Path('work/r3f-build');out=Path('work/source-delivery');out.mkdir(exist_ok=True)
(out/'src').mkdir(exist_ok=True)
for item in (src/'src').iterdir():
    if item.is_file():
        shutil.copyfile(item, out/'src'/item.name)
for name in ['template.html','tsconfig.json','build.cjs','pnpm-lock.yaml']:shutil.copyfile(src/name,out/name)
p=json.loads((src/'package.json').read_text(encoding='utf-8-sig'));p['scripts']={'build':'node build.cjs && node assemble.cjs','typecheck':'tsc --noEmit'};(out/'package.json').write_text(json.dumps(p,indent=2),encoding='utf8')
(out/'assemble.cjs').write_text("const fs=require('fs');let html=fs.readFileSync('template.html','utf8'),js=fs.readFileSync('bundle.js','utf8');fs.writeFileSync('index.html',html.replace('</body>','<script>'+js.replaceAll('</script','<\\\\/script')+'</script></body>'));console.log('Created offline index.html');",encoding='utf8')
(out/'README.md').write_text('''# E-Bandobast 3D viewer

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

The site layout is traced approximately from the supplied scanned PDF. Coordinates and heights are schematic, not survey measurements. Surface colors, structures, vehicles, vegetation and police models are illustrative procedural geometry. Source route colors are preserved as annotations. Small unclear source labels are explicitly marked uncertain. The model is not photorealistic or a surveyed digital twin.

No Meshy, Tripo, Blender automation, backend API, GIS, georeferencing or live deployment integration is connected. The GLB can be edited in Blender or replaced with externally generated, licensed assets using the asset import panel.

## Architecture

src/main.tsx: typed React/Fiber host, GLB import/export, asset editor.
src/venue.js: retained procedural venue and source-data UI.
src/plan.ts: validated plan schema, migration, polygon assignment and sector totals.
src/deployment.ts: duty-record editor, sector overlays and drag/rotation controls.
build.cjs: esbuild bundling with Node filesystem resolution for this environment.
template.html: standalone UI shell.

The scene data embeds the user-supplied scan. Treat exported files according to your data-sharing requirements.
''',encoding='utf8')
with zipfile.ZipFile('outputs/e-bandobast-react-source.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in out.rglob('*'):
  if f.is_file():z.write(f,f.relative_to(out))
print('Source package prepared')
