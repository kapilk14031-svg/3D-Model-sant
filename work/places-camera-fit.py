from pathlib import Path
p=Path('work/places-release/src/facilityExplorer.ts');s=p.read_text(encoding='utf8')
s=s.replace('map:tx,toneMapped:false','map:tx,toneMapped:false,depthTest:false')
s=s.replace("roofToggle.disabled=roofs.children.length===0;api.setCamera({angle:-.35,elevation:.65,distance:112,x:0,z:0});", "roofToggle.disabled=roofs.children.length===0;peopleToggle.disabled=people.children.length===0;vehicleToggle.disabled=vehicles.children.length===0;const distance=({toilets:70,office:80,police:80,residence:94,exhibition:100,fuel:95,gate:100} as Partial<Record<Family,number>>)[p.family]??112;api.setCamera({angle:-.35,elevation:.65,distance,x:0,z:0});const hint=document.querySelector('#hint');if(hint)hint.textContent='Individual 3D model · drag to orbit · wheel to zoom · Esc returns to the venue';")
s=s.replace("if(saved)api.setCamera(saved);api.canvas.style.cursor='default';nav=null", "if(saved)api.setCamera(saved);const hint=document.querySelector('#hint');if(hint)hint.textContent='Click labelled places to explore · Drag resources to move · Drag ground to orbit';api.canvas.style.cursor='default';nav=null")
p.write_text(s,encoding='utf8')
