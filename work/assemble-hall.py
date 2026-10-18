from pathlib import Path
root=Path('work/hall-release');s=(root/'template.html').read_text(encoding='utf8');bundle=(root/'bundle.js').read_text(encoding='utf8').replace('</script','<\\/script');Path('outputs/e-bandobast-hall.html').write_text(s.replace('</body>','<script>'+bundle+'</script></body>'),encoding='utf8')
