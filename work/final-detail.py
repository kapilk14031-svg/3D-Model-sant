from pathlib import Path
p=Path('outputs/e-bandobast-3d.html');s=p.read_text(encoding='utf8')
s=s.replace('fineLabels.visible=false;populate();','fineLabels.visible=true;globalThis.pdfFineLabels=fineLabels;populate();')
s=s.replace('id="fineLabelsToggle" type="checkbox" class="check"','id="fineLabelsToggle" type="checkbox" class="check" checked')
s=s.replace('renderer.render(scene,camera)}\ncanvas.oncontextmenu',"if(globalThis.pdfFineLabels)globalThis.pdfFineLabels.children.forEach(o=>{o.visible=distance<250||/P1 |P2 |P3 |P4 |SC Parking|Langar|Exhibition|Police chowki/.test(o.userData.feature[0])});renderer.render(scene,camera)}\ncanvas.oncontextmenu")
# Source-case ambiguity stays explicit.
s=s.replace('Adjoining plot (scan label unclear)','Adjoining plot (small text unclear)')
p.write_text(s,encoding='utf8')
