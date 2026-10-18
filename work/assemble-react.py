from pathlib import Path
root = Path('work/r3f-build')
s = (root / 'template.html').read_text(encoding='utf8')
bundle = (root / 'bundle.js').read_text(encoding='utf8').replace('</script', '<\\/script')
# Replace the last </body> tag at the end of the HTML document
parts = s.rpartition('</body>')
if parts[1]:
    s = parts[0] + '<script>' + bundle + '</script></body>' + parts[2]
else:
    s = s + '<script>' + bundle + '</script>'
Path('outputs/e-bandobast-react.html').write_text(s, encoding='utf8')
print("Successfully assembled e-bandobast-react.html")
