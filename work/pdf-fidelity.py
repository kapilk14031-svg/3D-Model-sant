from pathlib import Path
import base64,re,json
p=Path('outputs/e-bandobast-3d.html');s=p.read_text(encoding='utf8')
a=s.index('for(let r=0;r<5;r++)for(let j=0;j<5;j++)');b=s.index('// Covered pandal',a)
s=s[:a]+'''// Site footprints traced schematically from the scan; no measured heights.
function footprint(points,h,color){let shape=new THREE.Shape();points.forEach((p,i)=>{let q=pt(...p);i?shape.lineTo(q.x,-q.z):shape.moveTo(q.x,-q.z)});shape.closePath();let geo=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false});let o=new THREE.Mesh(geo,mat(color));o.rotation.x=-Math.PI/2;o.castShadow=o.receiveShadow=true;structures.add(o)}
footprint([[.405,.26],[.465,.26],[.465,.298],[.477,.298],[.477,.35],[.465,.35],[.465,.4],[.407,.4]],3,'#c1b99c');
footprint([[.572,.216],[.627,.216],[.627,.28],[.65,.28],[.65,.31],[.665,.31],[.665,.375],[.645,.375],[.645,.39],[.62,.39],[.62,.372],[.60,.372],[.60,.35],[.572,.35]],4,'#bfb8a5');
footprint([[.576,.355],[.6,.355],[.6,.29],[.613,.29],[.613,.34],[.628,.34],[.628,.415],[.61,.415],[.61,.405],[.575,.405]],3,'#c8bdab');
footprint([[.34,.348],[.405,.348],[.405,.376],[.39,.376],[.39,.412],[.36,.412],[.36,.39],[.34,.39]],2.5,'#c6bda6');
footprint([[.46,.13],[.53,.13],[.53,.193],[.475,.193],[.475,.205],[.462,.205],[.462,.195]],4,'#c9bdab');
''' +s[b:]
# remove duplicate wrong P2 bus area: retained but accurate sub-zones added.
features=[
('P1 Light vehicles / car parking',.223,.659,.045,.049,1,'#bab29b'),('P1 Heavy vehicles',.207,.744,.071,.11,1,'#a6a18f'),
('P2 Buses & cars / daily commuters',.321,.572,.045,.044,1,'#c1b99e'),('P2 Two wheelers',.375,.626,.035,.027,1,'#b8b49e'),('P2 Parking',.375,.669,.034,.045,1,'#b8b49e'),('Invited guests / VIP I-parking (Gate 1)',.375,.723,.034,.064,1,'#b1baa0'),
('P3 Light & heavy vehicle parking',.624,.162,.079,.081,1,'#b9b29f'),('P4 Light vehicles / sewadars / daily commuters / saints from abroad',.635,.589,.089,.066,1,'#c1b49f'),('P5 Daily commuters / local bus stop near foot over bridge',.423,.824,.07,.026,1,'#c3bca8'),
('Exhibition',.426,.535,.058,.018,3,'#dac6a2'),('S/D Office',.376,.49,.035,.033,3,'#c8beaa'),('Toilets — P2',.32,.529,.07,.009,2,'#b9c7bf'),('Toilets — railway alighting',.373,.532,.034,.009,2,'#b9c7bf'),('Railway station & ISBT vehicles alighting',.373,.565,.034,.061,1,'#c4b9a3'),
('D Parking (scan label)',.478,.555,.022,.025,1,'#bfb39a'),('SC Parking — north',.478,.583,.022,.027,1,'#a1b8a0'),('SC Parking — south',.478,.614,.022,.028,1,'#a1b8a0'),('Invited / VIP I-parking (Gate 2)',.477,.657,.028,.043,1,'#a6baa0'),('Waste land',.478,.69,.024,.02,1,'#9eaa86'),
('Langar — Gate 2',.517,.602,.032,.062,4,'#d2c4a9'),('Langar — central',.504,.361,.031,.099,4,'#d2c4a9'),('Langar — north',.538,.247,.025,.096,4,'#d2c4a9'),('Langar — west',.376,.466,.034,.097,3,'#d2c4a9'),
('Toilets — east 1',.548,.605,.008,.061,2,'#b8c4bc'),('Toilets — east 2',.575,.605,.009,.061,2,'#b8c4bc'),('Sewadal residence',.562,.607,.019,.063,4,'#c4b9a1'),('Petrol pump',.506,.678,.012,.027,3,'#e1d1b6'),('Adjoining plot (scan label unclear)',.52,.679,.013,.027,1,'#b9b296'),('Police chowki',.539,.676,.025,.034,3,'#c6c0ab'),
('Karishna Polymer (as printed)',.621,.632,.051,.057,4,'#b6b2a3'),('SNCF Nursery (as printed)',.721,.471,.035,.014,1,'#7d9c6b'),('Alighting — east gate',.594,.464,.029,.037,1,'#c4b9a3')]
extras=r'''
// PDF fidelity additions. Coordinates normalized to the original scan.
const pdfFeatures=FEATURES;
const detailGroup=new THREE.Group();scene.add(detailGroup);
for(let [name,u,v,w,d,h,color] of pdfFeatures){let q=pt(u,v);box(q.x,h/2+.1,q.z,w*600,h,d*450,mat(color),detailGroup);if(h>1.5){box(q.x,h+.2,q.z,w*600+.3,.3,d*450+.3,concrete,detailGroup)} }
// The scanned pandal continues south to a rounded boundary.
road([[.397,.665],[.397,.712],[.408,.724],[.455,.706],[.456,.54]],.5,.5,concrete);
// Internal roads missing from the earlier model.
const extraRoads=[[[.465,.54],[.465,.665],[.492,.665]],[[.492,.54],[.492,.636],[.58,.636]],[[.492,.418],[.58,.418],[.58,.478],[.604,.48]],[[.3,.418],[.396,.418]],[[.3,.525],[.396,.525]],[[.465,.497],[.465,.312],[.492,.312]],[[.492,.312],[.492,.2]],[[.77,.199],[.75,.204],[.718,.238],[.718,.292],[.768,.321],[.8,.297]],[[.18,.64],[.245,.64],[.245,.69],[.166,.69]],[[.576,.51],[.677,.519],[.684,.54],[.684,.635],[.672,.652]],[[.57,.103],[.78,.094]]];extraRoads.forEach(r=>road(r,3.5,.2));
// Boundary wall segments follow the visible outlines; breaks remain at gates.
for(let r of [[ [.303,.413],[.303,.34],[.339,.34] ],[[.35,.34],[.406,.34],[.406,.302],[.465,.302]],[[.502,.498],[.568,.498]],[[.658,.36],[.672,.36],[.672,.327]],[[.62,.49],[.703,.5],[.703,.609]]]){for(let i=1;i<r.length;i++){beam(pt(...r[i-1],1.1),pt(...r[i],1.1),.35,2.2,mat('#b6ad96'))}}
// Second underpass indicated at the Delhi end.
let uq=pt(.18,.84);for(let dx of [-4,4])box(uq.x+dx,2.5,uq.z,1.2,5,14,concrete,detailGroup);box(uq.x,5.2,uq.z,10,1,14,concrete,detailGroup);sign('DELHI-SIDE UNDERPASS',.18,.84,12);
// Foot over bridge near local bus stop P5: position schematic.
let fq=pt(.386,.779);box(fq.x,6,fq.z,2.8,.5,20,concrete,detailGroup);for(let dz of [-9,9]){box(fq.x,3,fq.z+dz,.5,6,.5,concrete,detailGroup);for(let k=0;k<10;k++)box(fq.x+2+k*.65,.3+k*.55,fq.z+dz,1,.3,2,concrete,detailGroup)}sign('FOOT OVER BRIDGE / LOCAL BUS STOP',.41,.80,16);
sign('PANCHI GUJRAN',.105,.57,10);sign('VILLAGE BHODWAL MAJRI',.85,.22,10);sign('VILLAGE PATTI KALYANA',.78,.55,10);sign('TO GANAUR',.128,.29,8);sign('TO DELHI',.07,.877,8);sign('TO AMBALA',.87,.61,8);sign('RAILWAY TO DELHI',.24,.17,8);
// Route families use the color coding printed in the scan. Lines are schematic centerlines.
const flows=new THREE.Group();scene.add(flows);
function flow(points,color){for(let i=1;i<points.length;i++){let a=pt(...points[i-1],.55),b=pt(...points[i],.55),delta=b.clone().sub(a),len=delta.length();for(let t=3;t<len;t+=13){let arrow=new THREE.ArrowHelper(delta.clone().normalize(),a.clone().addScaledVector(delta,t/len),4.5,color,1.8,1.3);flows.add(arrow)}}}
flow([[.07,.863],[.35,.763],[.35,.608],[.31,.608],[.23,.49],[.165,.49],[.165,.79]],'#c76ca1');
flow([[.87,.619],[.70,.673],[.60,.706],[.50,.737],[.36,.783]],'#3887b7');
flow([[.35,.742],[.395,.53],[.398,.418],[.556,.418],[.557,.204],[.59,.18],[.65,.175]],'#3887b7');
flow([[.81,.608],[.703,.649],[.69,.62],[.69,.561],[.64,.55],[.60,.52],[.62,.49]],'#cb797a');
flow([[.35,.758],[.376,.71],[.376,.678]],'#399b6d');flow([[.495,.707],[.495,.65],[.477,.65]],'#399b6d');
const legendRows=[['#c76ca1','Delhi: outstation vehicles / P1'],['#c76ca1','Delhi: sewadars, daily commuters & chartered buses / P2'],['#3887b7','Ambala: outstation vehicles / P3'],['#3887b7','Ambala: sewadars & daily up/down commuters / P4'],['#cb797a','Saints from abroad / P4'],['#399b6d','SC parking'],['#399b6d','Invited guests / VIP I-parking']];
let labels=new THREE.Group();scene.add(labels); // Source-feature labels use sprites and a searchable index.
let index=document.createElement('section');index.innerHTML='<h2>PDF landmarks / jump to</h2><input id="searchPdf" placeholder="Search parking, langar, toilets…"><select id="pdfIndex" size="7" style="height:150px"></select><label><input id="flowToggle" class="check" type="checkbox" checked> PDF route arrows</label><label><input id="pdfOverlay" class="check" type="checkbox"> Original scan on ground</label><button id="sourceButton">View original drawing</button><h2>PDF traffic legend</h2>'+legendRows.map(([c,t])=>'<p class="note" style="margin:7px 0"><span style="color:'+c+'">➜</span> '+t+'</p>').join('')+'<p class="note">Road labels in PDF: R-2 90\u2032; 60\u2032 wide; 44\u2032 wide; government road. The drawing does not provide a surveyed scale. Route arrows here are schematic; consult the original scan for each turn.</p>';document.querySelector('aside').prepend(index);
function populate(q=''){let sel=$('#pdfIndex');sel.innerHTML='';pdfFeatures.forEach((f,i)=>{if(f[0].toLowerCase().includes(q.toLowerCase())){let o=document.createElement('option');o.value=i;o.textContent=f[0];sel.append(o)}})}populate();$('#searchPdf').oninput=e=>populate(e.target.value);$('#pdfIndex').onchange=e=>{let f=pdfFeatures[+e.target.value];smoothView(angle,.65,110,(f[1]-.5)*600,(f[2]-.5)*450);$('#status').textContent=f[0]};$('#flowToggle').onchange=e=>flows.visible=e.target.checked;
const sourceImage='data:image/png;base64,SCANBASE64';let sourceTex=new THREE.TextureLoader().load(sourceImage);sourceTex.colorSpace=THREE.SRGBColorSpace;let overlay=mesh(new THREE.PlaneGeometry(600,450),new THREE.MeshBasicMaterial({map:sourceTex,transparent:true,opacity:.85,depthWrite:false}),0,.65,0);overlay.rotation.x=-Math.PI/2;overlay.visible=false;overlay.castShadow=false;$('#pdfOverlay').onchange=e=>overlay.visible=e.target.checked;
let modal=document.createElement('div');modal.style.cssText='display:none;position:fixed;inset:0;background:#06111af5;z-index:20;overflow:auto;padding:45px 20px';modal.innerHTML='<button style="position:fixed;right:20px;top:4px;width:140px" id="closeSource">Close drawing</button><img style="width:100%;height:auto" src="'+sourceImage+'">';document.body.append(modal);$('#sourceButton').onclick=()=>modal.style.display='block';$('#closeSource').onclick=()=>modal.style.display='none';
// Facility labels remain available by focusing an index item, avoiding overlap in full-site view.
let focusLabel=null;$('#pdfIndex').addEventListener('change',e=>{if(focusLabel)scene.remove(focusLabel);let f=pdfFeatures[+e.target.value];let before=scene.children.length;sign(f[0],f[1],f[2],f[5]+9);focusLabel=scene.children[before]});
'''.replace('FEATURES',json.dumps(features)).replace('SCANBASE64',base64.b64encode(Path('work/scan-1.png').read_bytes()).decode())
# insert after animate() initialization so controls exist
s=s.replace('rebuild();resize();animate();','rebuild();resize();animate();\n'+extras)
s=s.replace('Units approximate metres.','Arbitrary model units; no verified survey scale.')
s=s.replace('Source: scanned traffic route plan. Positions are approximate; dimensions, heights and deployment counts require site verification.','Source: scanned traffic route plan. PDF facilities and route categories indexed below. Footprints traced approximately; heights and police deployment are illustrative.')
p.write_text(s,encoding='utf8')
Path('outputs/pdf-landmark-register.json').write_text(json.dumps({'source':'Adobe Scan 17 Oct 2026.pdf','note':'Normalized scan coordinates; heights illustrative; no verified scale','features':[dict(zip(['name','x','y','width','depth','illustrativeHeight','color'],f)) for f in features]},indent=2),encoding='utf8')
print('Added',len(features),'PDF features, source overlay, legend, missing roads and crossings')
