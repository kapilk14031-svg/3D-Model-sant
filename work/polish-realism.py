from pathlib import Path
p=Path('outputs/e-bandobast-3d.html');s=p.read_text(encoding='utf8');Path('work/before-realism-polish.html').write_text(s,encoding='utf8')
s=s.replace("new THREE.HemisphereLight('#e5f1ff','#81735b',2)","new THREE.HemisphereLight('#d8e8f5','#70664e',.85)")
s=s.replace("new THREE.DirectionalLight('#fff1da',3.3)","new THREE.DirectionalLight('#fff0d8',2.1)")
s=s.replace('renderer.toneMappingExposure=1.15','renderer.toneMappingExposure=.85')
s=s.replace("scene.fog=new THREE.Fog('#b7d3de',500,1300)","scene.fog=new THREE.Fog('#b7d3de',750,1900)")
s=s.replace('sun.shadow.bias=-.0004','sun.shadow.bias=-.00012;sun.shadow.normalBias=.12;sun.shadow.radius=3')
s=s.replace("tex.repeat.set(30,30);","tex.repeat.set(38,38);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();")
s=s.replace("'#89916b'","'#727b53'").replace("'#929a73'","'#7d855e'").replace("'#78835d'","'#626e47'")
s=s.replace("structures.add(o)}\nfootprint", "structures.add(o);decorateFootprint(points,h,o)}\nfootprint",1)
# Improve vehicle shapes while retaining exact placements.
s=s.replace("for(let x of [-w*.33,w*.33])box(x,1,l/2+.02,.35,.25,.06,mat('#ffffd3'),g)}", """for(let x of [-w*.33,w*.33]){box(x,1,l/2+.02,.35,.25,.06,mat('#fff4b5'),g);box(x,.9,-l/2-.03,.3,.2,.06,mat('#9f342c'),g)}box(0,.7,l/2+.05,w*.8,.16,.1,mat('#8b9497',.3),g);box(0,.7,-l/2-.05,w*.8,.16,.1,mat('#8b9497',.3),g);for(let x of [-w/2,w/2]){box(x,1.9,0,.1,.95,.12,mat(color),g);box(x,1.7,l*.3,.28,.13,.25,rubber,g)}if(bus){for(let k=0;k<6;k++)for(let side of [-1,1])box(side*(w*.445),1.9,-l*.22+k*l*.085,.06,.65,.46,glass,g);box(0,1.5,l*.1,w+.02,.13,l*.8,mat('#c2aa65'),g)}}""")
# Give flat source facility footprints low, nonfloating surfaces with no tall parking platforms.
s=s.replace("let hh=flat?.08:h;box(q.x,hh/2+.1", "let hh=flat?.04:h;box(q.x,hh/2+.02")
s=s.replace("mat(flat?'#c9c4b4':color)","mat(flat?'#a79c83':color)")
# Fix exposure-reset control overriding the new lighting.
s=s.replace("drawing?1:1.15","drawing?.95:.85")
# Source layer opacity should be intentionally lower than realistic objects.
s=s.replace("opacity:.85,depthWrite:false","opacity:.78,depthWrite:false")
polish=r'''
// Material and scene polish: color-managed textures, wall detail, restrained lighting.
function decorateFootprint(points,h,obj){let wm=mat('#486271',.26),frame=mat('#d0c6ad'),base=mat('#887d69');for(let i=0;i<points.length;i++){let a=pt(...points[i]),b=pt(...points[(i+1)%points.length]),v=b.clone().sub(a),len=v.length();if(len<2)continue;v.normalize();let area=points.reduce((sum,p,k)=>{let q=points[(k+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1]},0),n=new THREE.Vector3(v.z,0,-v.x).multiplyScalar(area>0?1:-1);let ledge=beam(a.clone().setY(.4),b.clone().setY(.4),.25,.8,base);scene.remove(ledge);structures.add(ledge);let roof=beam(a.clone().setY(h+.15),b.clone().setY(h+.15),.35,.3,frame);scene.remove(roof);structures.add(roof);for(let t=1.8;t<len-1;t+=3.4){let q=a.clone().addScaledVector(v,t).addScaledVector(n,.05);let ww=box(q.x,Math.min(2,h*.6),q.z,1.3,Math.min(1.2,h*.34),.07,wm,structures);ww.rotation.y=Math.atan2(-v.z,v.x);let sill=box(q.x,Math.min(2,h*.6)-.69,q.z,1.5,.1,.16,frame,structures);sill.rotation.y=ww.rotation.y}}}
function noiseTexture(base,spread,repeat){let c=document.createElement('canvas');c.width=c.height=256;let ct=c.getContext('2d'),im=ct.createImageData(256,256);let col=new THREE.Color(base);for(let i=0;i<im.data.length;i+=4){let n=(rand()-.5)*spread;im.data[i]=Math.max(0,Math.min(255,col.r*255+n));im.data[i+1]=Math.max(0,Math.min(255,col.g*255+n));im.data[i+2]=Math.max(0,Math.min(255,col.b*255+n));im.data[i+3]=255}ct.putImageData(im,0,0);let t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t}
// Shared neutral textures multiply the existing physically based colors.
asphalt.map=noiseTexture('#d3d3d3',45,6);asphalt.roughness=.98;asphalt.needsUpdate=true;concrete.map=noiseTexture('#dedbd3',22,3);concrete.roughness=.94;concrete.needsUpdate=true;
// Remove the empty, oversized rectangular P2 pad outside the triangular source area.
for(let o of [...detailGroup.children]){if(!o.isMesh)continue;let u=o.position.x/600+.5,v=o.position.z/450+.5;if(Math.abs(u-.321)<.001&&Math.abs(v-.572)<.001){detailGroup.remove(o)}}
// Source-shaped triangular parking ground, flush with the terrain.
let parkShape=new THREE.Shape();[[.269,.535],[.353,.535],[.353,.601],[.319,.601]].forEach((p,i)=>{let q=pt(...p);i?parkShape.lineTo(q.x,-q.z):parkShape.moveTo(q.x,-q.z)});parkShape.closePath();let triangle=mesh(new THREE.ShapeGeometry(parkShape),mat('#aa9d80'),0,.08,0,detailGroup);triangle.rotation.x=-Math.PI/2;
// Source triangle is now visible; retain one vehicle row without overlapping the boundary.
// Alternating safety faces on the flyover parapets and reflective roadside posts.
for(let i=0;i<24;i++){let u=.485+i*.0062,v=.728-i*.00198,q=pt(u,v,10.8);let rail=box(q.x,10.8,q.z+3.8,1.8,.55,.12,mat(i%2?'#d3b851':'#323a3c'));rail.rotation.y=.24;}
// Foreground objects support a useful closer inspection of the entry points.
for(let [u,v] of [[.357,.748],[.493,.695],[.578,.677]]){let q=pt(u,v);for(let dx of [-5,5]){let g=new THREE.Group();g.position.set(q.x+dx,0,q.z+2);scene.add(g);let cone=mesh(new THREE.ConeGeometry(.35,1.1,12),mat('#d17a36'),0,.55,0,g);box(0,.08,0,.8,.16,.8,rubber,g);cyl(0,.65,0,.23,.16,white,g)}}
// Keep sky and saturation consistent when switching color styles.
let styleHandler=$('#colorStyle').onchange;$('#colorStyle').onchange=e=>{styleHandler(e);renderer.toneMappingExposure=e.target.value==='drawing'?.95:.85;scene.fog.color.copy(scene.background)};
// Label collision reduction in close-up: source labels are optional, focus remains visible.
const allSignSprites=scene.children.filter(o=>o.isSprite);for(let sp of allSignSprites){sp.material.depthTest=true;sp.scale.multiplyScalar(.72)}
let realism=document.createElement('section');realism.innerHTML='<h2>Lighting & display</h2><label>Daylight brightness<input id="brightness" type="range" min="55" max="115" value="85"></label><label><input id="signsToggle" class="check" type="checkbox" checked> Large location sign labels</label><p class="note">Close-up: drag to orbit, right-drag to pan, wheel to zoom. Reference colours apply to routes; surface materials are illustrative.</p>';audit.after(realism);$('#brightness').oninput=e=>renderer.toneMappingExposure=+e.target.value/100;$('#signsToggle').onchange=e=>allSignSprites.forEach(o=>o.visible=e.target.checked);
'''
s=s.replace('</script></body>',polish+'</script></body>')
p.write_text(s,encoding='utf8');print('Material, geometry, lighting and label polish applied')
