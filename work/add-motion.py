from pathlib import Path
p=Path('outputs/e-bandobast-3d.html');s=p.read_text(encoding='utf8');gs=Path('work/gsap.min.js').read_text(encoding='utf8');s=s.replace('<script>\nconst $=', '<script>'+gs+'</script><script>\nconst $=',1)
s=s.replace("$('#iso').onclick=()=>{distance=480;elevation=.85;angle=-.25;target.set(0,0,25)};$('#top').onclick=()=>{elevation=1.55;angle=0;distance=510}","function smoothView(a,e,d,x=0,z=25){tour=false;let state={a:angle,e:elevation,d:distance,x:target.x,z:target.z};gsap.to(state,{a,e,d,x,z,duration:1.5,ease:'power2.inOut',onUpdate:()=>{angle=state.a;elevation=state.e;distance=state.d;target.set(state.x,0,state.z)}})}$('#iso').onclick=()=>smoothView(-.25,.85,480);$('#top').onclick=()=>smoothView(0,1.55,510)")
s=s.replace("low.onclick=()=>{target.set(0,2,80);distance=90;elevation=.12;angle=-.4}","low.onclick=()=>smoothView(-.4,.12,90,0,80)")
p.write_text(s,encoding='utf8');print('Three.js + GSAP bundled offline')
