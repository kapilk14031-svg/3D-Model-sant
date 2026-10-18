from pathlib import Path
r=Path('work/places-release');template=(r/'template.html').read_text(encoding='utf8');js=(r/'bundle.js').read_text(encoding='utf8').replace('</script','<\\/script');Path('outputs/e-bandobast-all-places.html').write_text(template.replace('</body>','<script>'+js+'</script></body>'),encoding='utf8')
