from pathlib import Path
p=Path('work/r3f-build/src/venue.js');s=p.read_text(encoding='utf8')
s=s.replace("sprite.scale.set(30,4.7,1);scene.add(sprite)","sprite.scale.set(30,4.7,1);sprite.userData.label=text;scene.add(sprite)")
s=s.replace('function animate(){if(globalThis.venueTrafficTick)', 'function animate(){if(globalThis.venueTrafficTick)')
s=s.replace('});}\ncanvas.oncontextmenu','});if(globalThis.smartVenueLabels)globalThis.smartVenueLabels();}\ncanvas.oncontextmenu',1)
# The shared per-frame label policy keeps close-up text compact and nonoverlapping.
extra=r'''
globalThis.smartVenueLabels=()=>{camera.updateMatrixWorld();let candidates=[];if($('#signsToggle').checked)allSignSprites.forEach(o=>candidates.push({o,priority:/GATE|PANDAL|FLYOVER/.test(o.userData.label||'')?0:2}));else allSignSprites.forEach(o=>o.visible=false);if(fineLabels.visible)fineLabels.children.forEach(o=>candidates.push({o,priority:1}));candidates.sort((a,b)=>a.priority-b.priority||a.o.position.distanceToSquared(target)-b.o.position.distanceToSquared(target));let occupied=[],shown=0;for(let {o} of candidates){let pp=o.position.clone().project(camera),dep=o.position.distanceTo(camera.position),width=Math.min(125,Math.max(85,canvas.clientWidth*.09)),units=2*dep*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))/canvas.clientHeight;let sx=(pp.x+1)*canvas.clientWidth/2,sy=(1-pp.y)*canvas.clientHeight/2;let rect=[sx-width/2-5,sy-12,width+10,24];let overlap=occupied.some(r=>rect[0]<r[0]+r[2]&&rect[0]+rect[2]>r[0]&&rect[1]<r[1]+r[3]&&rect[1]+rect[3]>r[1]);o.visible=pp.z>-1&&pp.z<1&&sx>15&&sx<canvas.clientWidth-20&&sy>30&&sy<canvas.clientHeight-115&&!overlap&&shown<12;if(o.visible){o.scale.set(width*units,16*units,1);occupied.push(rect);shown++}}};
'''
s=s.replace('return {scene,renderer,camera,canvas,update:animate',extra+'\nreturn {scene,renderer,camera,canvas,update:animate')
p.write_text(s,encoding='utf8')
