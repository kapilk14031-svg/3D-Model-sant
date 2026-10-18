from pathlib import Path
p=Path('work/r3f-build/src/bigPandal.ts');s=p.read_text(encoding='utf8').replace('function makeHangingSign(text, x, z)','function makeHangingSign(text:string, x:number, z:number)')
s=s.replace("  let snapshot=new Map", "  let savedMainGrid='',savedAsideHidden=false;\n  let snapshot=new Map")
s=s.replace("savedExteriorState={...getCameraState()};snapshot=", "savedExteriorState={...getCameraState()};const main=document.querySelector<HTMLElement>('main'),aside=document.querySelector<HTMLElement>('aside');if(main){savedMainGrid=main.style.gridTemplateColumns;main.style.gridTemplateColumns='1fr'}if(aside){savedAsideHidden=aside.hidden;aside.hidden=true}snapshot=")
s=s.replace("setCameraState(savedExteriorState);", "setCameraState(savedExteriorState);const main=document.querySelector<HTMLElement>('main'),aside=document.querySelector<HTMLElement>('aside');if(main)main.style.gridTemplateColumns=savedMainGrid;if(aside)aside.hidden=savedAsideHidden;")
s=s.replace("  hud.append(extras);", "  hud.append(extras);hud.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.style.width='auto');")
p.write_text(s,encoding='utf8')
