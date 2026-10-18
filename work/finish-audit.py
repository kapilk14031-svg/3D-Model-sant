from pathlib import Path
p=Path('outputs/e-bandobast-3d.html');s=p.read_text(encoding='utf8');s=s.replace('label{font-size:12px;', 'label{display:block;line-height:1.6;margin:5px 0;font-size:12px;')
s=s.replace('</script></body>',"scene.traverse(o=>{if(o.isSprite&&o.material){o.material.toneMapped=false;if(o.material.map){o.material.map.colorSpace=THREE.SRGBColorSpace;o.material.map.needsUpdate=true}}});\n</script></body>")
p.write_text(s,encoding='utf8')
print('Final UI spacing and label colour correction applied')
