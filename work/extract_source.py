import re
from pathlib import Path

venue_path = Path('work/r3f-build/src/venue.js')
text = venue_path.read_text(encoding='utf-8')

idx1 = text.find('const sourceImage=')
idx2 = text.find("';", idx1)
if idx1 == -1 or idx2 == -1:
    raise ValueError("Could not locate sourceImage in venue.js")

source_image_decl = text[idx1:idx2+2]
print(f"Extracted sourceImage successfully ({len(source_image_decl)} bytes)")

# We will write the new venue.js builder script
with open('work/source_image_tmp.js', 'w', encoding='utf-8') as f:
    f.write(source_image_decl)

print("Saved temporary source_image_tmp.js")
