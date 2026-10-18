from pathlib import Path
p=Path('work/hall-release/src/bigPandal.ts');s=p.read_text(encoding='utf8');pos=s.index("  hud.querySelector('#exitPandalBtn')")
s=s[:pos]+'''  const controlRow=hud.children[1] as HTMLElement;const topRow=hud.children[0] as HTMLElement;topRow.style.flexWrap='wrap';
  const controlToggle=document.createElement('button');controlToggle.id='hallControlsToggle';controlToggle.textContent='Show hall controls';controlToggle.style.cssText='width:auto;margin:0;padding:6px 10px;font-size:12px';topRow.append(controlToggle);
  let controlsOpen=false;controlRow.style.display='none';extras.style.display='none';controlToggle.onclick=()=>{controlsOpen=!controlsOpen;controlRow.style.display=controlsOpen?'flex':'none';extras.style.display=controlsOpen?'flex':'none';controlToggle.textContent=controlsOpen?'Hide hall controls':'Show hall controls'};
''' +s[pos:];p.write_text(s,encoding='utf8')
