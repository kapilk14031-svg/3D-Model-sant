from pathlib import Path
p=Path('outputs/e-bandobast-3d.html')
s=p.read_text(encoding='utf8')
s=s.replace('E-Bandobast / 3D deployment planner','E-Bandobast / 3D ground simulation')
s=s.replace('scan-based planning workspace','game-style site model')
s=s.replace('<label><input id="land"','<label><input id="scanToggle" type="checkbox" class="check"> Show original scanned plan</label><label><input id="land"')
s=s.replace('Raised landmark blocks','Buildings & site structures')
s=s.replace("ctx.fillStyle='#0a1423';ctx.fillRect(0,0,W,H);","let sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#9fcee4');sky.addColorStop(1,'#e5eddc');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);")
s=s.replace('if(scan.complete)ctx.drawImage(scan,0,0,1800,1354);','if(scan.complete && $(\'#scanToggle\').checked)ctx.drawImage(scan,0,0,1800,1354);')
s=s.replace("if($('#land').checked)blocks.forEach(b=>box(...b.slice(1),'#728d9c'));","if(!$('#scanToggle').checked)scene();")
s=s.replace("['yaw','tilt','zoom','land']","['yaw','tilt','zoom','land','scanToggle']")
s=s.replace("ctx.fillStyle='#a9bbd0';ctx.font='12px system-ui';ctx.fillText('Approximate geometry · example deployment · no verified scale',20,26)","ctx.fillStyle='#163143';ctx.font='bold 12px system-ui';ctx.fillText('SCHEMATIC 3D · drag to orbit · elevations assumed',20,26)")
pos=s.index('function draw()')
scene=r'''
function route(points,width,color,z=1,dash=false){ctx.beginPath();points.forEach((p,i)=>{let q=project(p[0],p[1],z);i?ctx.lineTo(...q):ctx.moveTo(...q)});ctx.lineWidth=Math.max(1,width*scale);ctx.strokeStyle=color;ctx.lineJoin='round';ctx.lineCap='round';ctx.setLineDash(dash?[12*scale,12*scale]:[]);ctx.stroke();ctx.setLineDash([])}
function tag(t,x,y,z=4){let p=project(x,y,z);ctx.font='bold 11px system-ui';let w=ctx.measureText(t).width;ctx.fillStyle='#122d40df';ctx.fillRect(p[0]-w/2-7,p[1]-12,w+14,20);ctx.fillStyle='white';ctx.fillText(t,p[0]-w/2,p[1]+2)}
function scene(){
poly([project(0,0),project(1,0),project(1,1),project(0,1)],'#8ea978','#688363');
// Grounds and parking areas follow the scanned plan approximately.
let lots=[['P1',.17,.64,.08,.15],['P2',.28,.54,.07,.06],['P3',.58,.12,.085,.085],['P4',.593,.562,.09,.095],['P5',.36,.815,.09,.035]];
lots.forEach(([name,x,y,w,h])=>{box(x,y,w,h,1,'#b5b2a2');for(let r=0;r<4;r++)for(let j=0;j<5;j++){let a=x+.006+j*w/5,b=y+.006+r*h/4;box(a,b,.006,.012,4,['#e9e8e2','#6788aa','#a36055'][((j+r)%3)])}tag(name+' PARKING',x+w/2,y+h/2,15)});
const highway=[[.03,.88],[.18,.82],[.36,.765],[.53,.71],[.7,.66],[.88,.606]];
route(highway,42,'#c8cbbd');route(highway,34,'#414c54');route(highway,1.5,'#f3ead4',2,true);
const roads=[[[.16,.81],[.163,.49],[.16,.3],[.4,.23],[.56,.18]],[[.16,.49],[.23,.48],[.4,.23]],[[.23,.48],[.32,.6],[.35,.6],[.35,.755]],[[.397,.72],[.397,.418],[.56,.418],[.56,.18]],[[.56,.418],[.56,.21],[.75,.21]],[[.59,.68],[.59,.515],[.66,.43],[.72,.31],[.77,.31],[.81,.61]],[[.35,.525],[.54,.525]],[[.495,.7],[.495,.42]],[[.56,.18],[.58,.1],[.77,.09]],[[.75,.1],[.77,.21],[.81,.4],[.81,.61]]];
roads.forEach(r=>{route(r,18,'#c4c6b8');route(r,13,'#626d70');route(r,1,'#e1dfca',2,true)});
route([[.14,.145],[.92,.07]],7,'#635d57');route([[.14,.15],[.92,.075]],2,'#d6d3c7');for(let i=0;i<75;i++){let x=.14+i*.0104,y=.145-i*.001;route([[x,y-.004],[x,y+.008]],2,'#695b4b')}
if($('#land').checked){
// Schematic village blocks with varied heights, kept away from the model roads.
for(let r=0;r<5;r++)for(let j=0;j<5;j++){let x=.405+j*.026,y=.25+r*.029;if(j===3)continue;box(x,y,.019,.021,12+((r*7+j*11)%23),['#c4bba5','#ddd5bb','#a8b8b0'][(r+j)%3])}
for(let r=0;r<6;r++)for(let j=0;j<4;j++){let x=.59+j*.027,y=.24+r*.027;box(x,y,.019,.018,15+(j+r)%4*7,['#d2c4ad','#c1b8a1','#bac6c1'][(r+j)%3])}
blocks.filter(b=>b[0]==='Pandal'||b[0]==='Railway station').forEach(b=>{box(...b.slice(1),b[0]==='Pandal'?'#e1cead':'#bdc8c5');tag(b[0].toUpperCase(),b[1]+b[3]/2,b[2]+b[4]/2,b[5]+10)});
// Pandal roof sections.
for(let i=0;i<6;i++)box(.399,.541+i*.03,.058,.003,30,i%2?'#d19b6a':'#f2e7ce');
}
// Elevated highway segment and support piers; conceptual heights.
for(let i=0;i<5;i++){let x=.47+i*.043,y=.73-i*.014;box(x,y,.007,.012,32,'#9dabae')}
let fly=[[.445,.741],[.48,.729],[.64,.678],[.685,.665]];route(fly,28,'#a9b5b7',32);route(fly,23,'#4b5760',34);route(fly,1.5,'#ffe3a0',35,true);route([[.445,.731],[.48,.719],[.64,.668],[.685,.655]],2,'#e1e8e7',38);route([[.445,.751],[.48,.739],[.64,.688],[.685,.675]],2,'#e1e8e7',38);
tag('FLYOVER · APPROXIMATE',.565,.707,65);tag('UNDERPASS',.60,.713,4);
// Trees at the site edge.
for(let i=0;i<24;i++){let x=.21+(i%8)*.07,y=.17+Math.floor(i/8)*.023;if(x>.4&&x<.6)continue;let p=project(x,y,7),q=project(x,y,22);route([[x,y],[x,y]],3,'#755b38',7);ctx.fillStyle=['#527b4d','#608c50','#456e48'][i%3];ctx.beginPath();ctx.ellipse(q[0],q[1],9*scale,13*scale,0,0,7);ctx.fill()}
tag('GATE 1',.357,.75,8);tag('GATE 2',.495,.70,8);tag('GATE 3',.58,.68,8);tag('NATIONAL HIGHWAY',.25,.815,8);tag('RAILWAY → AMBALA',.79,.095,8);
}
'''
s=s[:pos]+scene+s[pos:]
# Add 3D body geometry to deployment symbols.
s=s.replace("let p=project(it.x,it.y),q=project(it.x,it.y,28);","if(it.type==='officer'){box(it.x-.002,it.y-.002,.004,.004,22,'#b49b65');let hd=project(it.x,it.y,29);ctx.fillStyle='#c99f79';ctx.beginPath();ctx.arc(hd[0],hd[1],4,0,7);ctx.fill()}if(it.type==='barricade')box(it.x-.008,it.y-.002,.016,.004,15,'#eab63f');let p=project(it.x,it.y),q=project(it.x,it.y,38);")
s=s.replace('project(it.x,it.y,28);return','project(it.x,it.y,38);return')
p.write_text(s,encoding='utf8')
print('Updated game-style 3D scene')
