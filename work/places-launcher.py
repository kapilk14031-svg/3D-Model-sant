from pathlib import Path
p=Path('work/places-release/src/facilityExplorer.ts');s=p.read_text(encoding='utf8');needle='function renderList(){'
insert="""const browse=node('button','Browse all '+catalog.length+' labelled places');browse.id='browse-place-models';browse.dataset.hallHide='true';browse.style.cssText='position:absolute;bottom:20px;right:18px;width:auto;padding:10px 14px;background:#1d6467;border-color:#6fb5ad;z-index:5';browse.onclick=()=>{document.querySelectorAll<HTMLButtonElement>('.panel-tabs button').forEach(b=>{if(b.textContent==='View')b.click()});catalogPanel.scrollIntoView({block:'start'});search.focus()};api.canvas.parentElement!.append(browse);
 """
s=s.replace(needle,insert+needle);p.write_text(s,encoding='utf8')
