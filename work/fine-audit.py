from pathlib import Path
import re,json
p=Path('outputs/e-bandobast-3d.html');s=p.read_text(encoding='utf8');Path('work/before-detail-audit.html').write_text(s,encoding='utf8')
# Remove the original, coarse duplicate parking pads and misplaced cars.
a=s.index("for(let [name,u,v,w,d] of [['P1'");b=s.index('for(let i=0;i<16;i++)',a);s=s[:a]+s[b:]
s=s.replace("('D Parking (scan label)'", "('Parking (partly clipped label)'")
s=s.replace('D Parking (scan label)','Parking (partly clipped label)')
s=s.replace('Karishna Polymer (as printed)','Karishna Polymer (as printed)')
# Correct semantics: PDF zoning is drawn as flat ground, not elevated boxes.
s=s.replace("box(q.x,h/2+.1,q.z,w*600,h,d*450,mat(color),detailGroup);if(h>1.5)","let flat=/parking|alighting|waste|nursery|adjoining/i.test(name);let hh=flat?.08:h;box(q.x,hh/2+.1,q.z,w*600,hh,d*450,mat(flat?'#c9c4b4':color),detailGroup);if(!flat&&h>1.5)")
# Blue pavement edges and pink route lines use unlit source-reference colors.
s=s.replace("'#c76ca1'","'#ba71a0'").replace("'#3887b7'","'#3a7fa8'").replace("'#cb797a'","'#c47c83'").replace("'#399b6d'","'#458f7d'")
# Fix false long diagonal path through the centre.
s=s.replace("[[.35,.742],[.395,.53],[.398,.418],[.556,.418],[.557,.204],[.59,.18],[.65,.175]]","[[.35,.742],[.35,.612],[.397,.612],[.397,.418],[.556,.418],[.557,.204],[.59,.18],[.65,.175]]")
# Disable old broad label in favor of clean map labels.
s=s.replace("sign('PANCHI GUJRAN',.105,.57,10)","sign('VILLAGE PANCHI GUJRAN',.105,.57,10)")
# Preserve complete original 11-row reference list, rather than merging categories.
a=s.index('const legendRows=');b=s.index('let labels=',a)
s=s[:a]+'''const legendRows=[
['#ba71a0','1 · Outstation vehicles from Delhi side'],
['#ba71a0','2 · Delhi: sewadars on duty / daily commuters / chartered buses'],
['#b56e79','3 · Parking P1'],
['#3a7fa8','4 · Delhi: sewadars / daily commuters — Parking P2'],
['#3a7fa8','5 · Outstation vehicles from Ambala side'],
['#3a7fa8','6 · Ambala: sewadars on duty / daily commuters'],
['#3a7fa8','7 · Ambala outstation vehicles — Parking P3'],
['#3a7fa8','8 · Ambala: sewadars / daily up & down — Parking P4'],
['#c47c83','9 · Saints from abroad — Parking P4'],
['#458f7d','10 · Vehicles for SC parking'],
['#458f7d','11 · Invited guests / VIP I-parking']];
''' +s[b:]
# Fix road-width transcription to 60 and 44 (use plain prime).
s=s.replace('R-2 90′; 60′ wide; 44′ wide','R-2 90′; 60′ wide; 44′ wide')
extra=r'''
// Second visual audit: fine details, source colors and missing site subdivisions.
const palette={delhi:'#ba71a0',ambala:'#3a7fa8',abroad:'#c47c83',sc:'#458f7d',outline:'#303934',paper:'#dedbd0'};
function flatMaterial(color){return new THREE.MeshBasicMaterial({color,toneMapped:false})}
const sourceLines=new THREE.Group();scene.add(sourceLines);
function linePath(points,color,width=.22,y=.72,parent=sourceLines){for(let i=1;i<points.length;i++){let a=pt(...points[i-1],y),b=pt(...points[i],y);let o=beam(a,b,width,.035,flatMaterial(color));scene.remove(o);parent.add(o)}}
function rectangle(u,v,w,d,color){let ps=[[u-w/2,v-d/2],[u+w/2,v-d/2],[u+w/2,v+d/2],[u-w/2,v+d/2],[u-w/2,v-d/2]];linePath(ps,color,.25)}
// Road borders are blue in the source drawing; pavement remains asphalt.
for(let r of [...roads,...extraRoads,highway]){for(let i=1;i<r.length;i++){let a=pt(...r[i-1],.45),b=pt(...r[i],.45),v=b.clone().sub(a).normalize(),n=new THREE.Vector3(-v.z,0,v.x),half=r===highway?7.1:2.5;for(let d of [-half,half]){let o=beam(a.clone().addScaledVector(n,d),b.clone().addScaledVector(n,d),.25,.035,flatMaterial(palette.ambala));scene.remove(o);sourceLines.add(o)}}}
// Source pink internal road: gate 1 to R-2, then north via road W.
linePath([[.35,.755],[.35,.611],[.397,.611],[.397,.418],[.558,.418],[.558,.21]],palette.abroad,.65,.65);
// Actual parking subdivisions and their border colors.
for(let f of pdfFeatures){let [name,u,v,w,d]=f;if(/parking/i.test(name)){let color=/SC|VIP|Invited/i.test(name)?palette.sc:/P2|P3/.test(name)?palette.ambala:palette.abroad;rectangle(u,v,w,d,color)}}
// P2 triangular bus/car pocket follows the diagonal approach.
linePath([[.264,.528],[.359,.528],[.359,.604],[.319,.604],[.264,.528]],palette.ambala,.4);
// L-shaped P1 heavy-vehicle perimeter, aisle, bay dividers.
linePath([[.167,.69],[.218,.69],[.218,.759],[.245,.759],[.245,.793],[.167,.815],[.167,.69]],palette.outline,.4);
linePath([[.194,.691],[.194,.808]],palette.delhi,.7);
for(let row=0;row<10;row++){let v=.7+row*.010;linePath([[.17,v],[.19,v]],'#f2ecdc',.14,.26);linePath([[.199,v],[.218,v]],'#f2ecdc',.14,.26);if(row%2===0){car(.179,v+.003,'#d8d2c1',Math.PI/2,true);car(.208,v+.003,'#c2bda9',Math.PI/2,true)}}
// P3 long rows and central aisle, visible in the source scan.
linePath([[.582,.174],[.663,.174]],palette.ambala,.65);
for(let col=0;col<8;col++){let u=.618+col*.006;linePath([[u,.123],[u,.169]],palette.outline,.14,.26);linePath([[u,.179],[u,.204]],palette.outline,.14,.26);for(let row=0;row<4;row++)car(u,.13+row*.01,['#e2dfd3','#a6ada9','#b9b4a3'][row%3])}
// Place cars within the audited open parking zones.
for(let [u,v,w,d] of [[.223,.659,.04,.04],[.635,.589,.075,.047],[.375,.669,.03,.035],[.477,.657,.023,.031]])for(let r=0;r<3;r++)for(let j=0;j<4;j++)car(u-w/2+.004+j*w/4,v-d/2+.006+r*d/3,['#dbd8cc','#8e9b9c','#c5b496'][(r+j)%3]);
for(let i=0;i<5;i++)car(.307+i*.009,.565+i*.007,'#c6c1aa',-.8,true);
// Two-wheeler parking: small motorcycle geometry, separate from car rows.
for(let r=0;r<3;r++)for(let j=0;j<7;j++){let q=pt(.362+j*.0034,.617+r*.006);for(let dz of [-.4,.4]){let o=mesh(new THREE.TorusGeometry(.22,.06,5,10),rubber,q.x,.25,q.z+dz);o.rotation.y=Math.PI/2}box(q.x,.6,q.z,.3,.2,.8,mat('#454b48'));box(q.x,.8,q.z-.3,.5,.08,.12,rubber)}
// Offices, toilets and boundary openings around the SC / VIP enclosure.
pdfFeatures.push(['Offices — west of SC parking',.463,.593,.009,.094,3,'#c6c1af'],['P4 north parking pocket',.635,.528,.089,.041,.1,'#c9c4b4'],['Gate — P4 south approach',.698,.645,.012,.016,.1,'#c9c4b4'],['Gate — east alighting approach',.606,.486,.012,.014,.1,'#c9c4b4'],['Road R-2 — 90′ (as printed)',.43,.525,.1,.008,.1,'#aaa99f'],['Road — 60′ wide (as printed)',.459,.602,.008,.12,.1,'#aaa99f'],['Road — 44′ wide (as printed)',.538,.635,.086,.008,.1,'#aaa99f'],['Boundary wall — south langar',.53,.501,.06,.005,2,'#b6ad96'],['Government road — northwest',.448,.224,.12,.008,.1,'#aaa99f'],['Government road — northeast loop',.759,.303,.06,.008,.1,'#aaa99f']);
let op=pt(.463,.593);box(op.x,1.5,op.z,5.4,3,42,mat('#c6c1af'),detailGroup);for(let k=0;k<7;k++)box(op.x+2.73,1.6,op.z-18+k*6,.06,1.2,1.1,glass,detailGroup);
// Source uses two distinct green arrow forms. Retain both categories in the legend.
flows.traverse(o=>{if(o.material){o.material.toneMapped=false;o.material.depthTest=true}});
// Keep labels color-correct and unlit, with route families independent of facility appearance.
const fineLabels=new THREE.Group();scene.add(fineLabels);
function featureLabel(f){let [name,u,v]=f;let text=name.replace(' (as printed)','').replace(' (partly clipped label)',' (?)');if(text.length>42)text=text.slice(0,39)+'…';let cv=document.createElement('canvas');cv.width=640;cv.height=84;let ct=cv.getContext('2d');ct.fillStyle='rgba(248,245,231,.95)';ct.fillRect(0,0,640,84);let color=/SC|VIP|Invited/i.test(name)?palette.sc:/P2|P3/.test(name)?palette.ambala:/P1|P4/.test(name)?palette.abroad:'#3e4b45';ct.strokeStyle=color;ct.lineWidth=6;ct.strokeRect(3,3,634,78);ct.fillStyle=color;ct.font='bold 25px Arial';ct.textAlign='center';ct.fillText(text,320,51);let sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false,toneMapped:false}));sp.position.copy(pt(u,v,7));sp.scale.set(26,3.42,1);sp.userData.feature=f;fineLabels.add(sp)}pdfFeatures.forEach(featureLabel);fineLabels.visible=false;populate();
let audit=document.createElement('section');audit.innerHTML='<h2>Drawing detail layers</h2><label><input id="fineLabelsToggle" type="checkbox" class="check"> Facility names on model</label><label><input id="sourceLinesToggle" type="checkbox" class="check" checked> PDF road & parking edge colours</label><label><input id="detailToggle" type="checkbox" class="check" checked> Facilities, subdivisions & offices</label><label>View colour style<select id="colorStyle"><option value="real">Realistic + PDF route colours</option><option value="drawing">Light drawing colours</option></select></label><p class="note">Building, grass and vehicle colours are illustrative: the PDF defines route and parking-reference colours, not real surface colours. Small clipped/unreadable labels remain marked uncertain.</p>';$('#searchPdf').closest('section').after(audit);$('#fineLabelsToggle').onchange=e=>fineLabels.visible=e.target.checked;$('#sourceLinesToggle').onchange=e=>sourceLines.visible=e.target.checked;$('#detailToggle').onchange=e=>detailGroup.visible=e.target.checked;$('#colorStyle').onchange=e=>{let drawing=e.target.value==='drawing';ground.material.map=drawing?null:tex;ground.material.color.set(drawing?'#f0ede2':'#ffffff');ground.material.needsUpdate=true;scene.background.set(drawing?'#ebe9df':'#b7d3de');renderer.toneMappingExposure=drawing?1:1.15};
// Downloadable source register keeps small details reviewable.
let reg=document.createElement('button');reg.textContent='Download PDF detail register';reg.onclick=()=>download(new Blob([JSON.stringify({source:'Adobe Scan 17 Oct 2026.pdf',coordinateSystem:'normalized scan; schematic geometry',features:pdfFeatures,legend:legendRows},null,2)],{type:'application/json'}),'pdf-detail-register.json');audit.append(reg);
'''
s=s.replace('</script></body>',extra+'</script></body>')
# Prevent readout from overstating exactness.
s=s.replace('PDF facilities and route categories indexed below.','PDF facilities, subdivisions and all 11 reference entries indexed below.')
p.write_text(s,encoding='utf8');print('Fine-detail audit applied')
