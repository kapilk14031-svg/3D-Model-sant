from pathlib import Path
import re
s=Path('outputs/e-bandobast-3d.html').read_text(encoding='utf8')
scripts=re.findall(r'<script>(.*?)</script>',s,re.S)
print([(len(x),x[:70]) for x in scripts])
Path('work/r3f-build/template.html').write_text(re.sub(r'<script>.*?</script>','',s,flags=re.S),encoding='utf8')
js=max((x for x in scripts if 'const scene=new THREE.Scene()' in x),key=len)
js=js.replace('requestAnimationFrame(animate);','').replace('rebuild();resize();animate();','rebuild();resize();')
# Rendering is owned by React Three Fiber; the legacy scene code supplies the camera update.
js=js.replace('renderer.render(scene,camera)}\ncanvas.oncontextmenu','}\ncanvas.oncontextmenu')
# Preserve PNG capture and all remaining controls.
header="import * as THREE from 'three';\nimport {gsap} from 'gsap';\nexport function createVenue(){\n"
footer="\nreturn {scene,renderer,camera,canvas,update:animate,ground,resources,items,pdfFeatures,target,getView:()=>({distance,elevation,angle}),focus:(x,z,d=70)=>smoothView(angle,.35,d,x,z)};\n}\n"
Path('work/r3f-build/src/venue.js').write_text(header+js+footer,encoding='utf8')
print('Scene extracted for Fiber host')
