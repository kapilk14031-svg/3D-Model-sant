from pathlib import Path
import re
p=Path('outputs/e-bandobast-3d.html');s=p.read_text(encoding='utf8');lib=Path('work/three.min.js').read_text(encoding='utf8');js=Path('work/realistic.js').read_text(encoding='utf8');s=re.sub(r'<script>.*?</script>',lambda m:'<script>'+lib+'</script><script>'+js+'</script>',s,flags=re.S);s=s.replace('game-style site model','Detailed 3D deployment simulation');s=s.replace('background:#0a1221','background:#0a1221');p.write_text(s,encoding='utf8');print('Built offline WebGL viewer')
