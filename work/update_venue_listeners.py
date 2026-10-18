with open('work/r3f-build/src/venue.js', 'r', encoding='utf-8') as f:
    code = f.read()

target = "if($('#layerFarmland'))$('#layerFarmland').onchange=e=>{if(farmlandGroup)farmlandGroup.visible=e.target.checked;};"

replacement = """if($('#layerFarmland'))$('#layerFarmland').onchange=e=>{if(farmlandGroup)farmlandGroup.visible=e.target.checked;};
if($('#layerSatToggle'))$('#layerSatToggle').onchange=e=>{
  if(e.target.checked){
    ground.material = satMaterial;
    if(farmlandGroup) farmlandGroup.visible = false;
    const fCheck = document.getElementById('layerFarmland');
    if(fCheck) fCheck.checked = false;
  } else {
    ground.material = procGrassMaterial;
    if(farmlandGroup) farmlandGroup.visible = true;
    const fCheck = document.getElementById('layerFarmland');
    if(fCheck) fCheck.checked = true;
  }
};
if($('#satOpacity'))$('#satOpacity').oninput=e=>{
  const op = +e.target.value / 100;
  satMaterial.opacity = op;
  satMaterial.transparent = op < 0.99;
  const sov = document.getElementById('satOpacityVal');
  if(sov) sov.textContent = e.target.value + '%';
};"""

if target in code:
    code = code.replace(target, replacement, 1)
    with open('work/r3f-build/src/venue.js', 'w', encoding='utf-8') as f:
        f.write(code)
    print('Successfully wired layerSatToggle and satOpacity listeners in venue.js!')
else:
    print('Target not found in venue.js')
