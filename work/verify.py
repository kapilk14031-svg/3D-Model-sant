from pathlib import Path
import re
h=Path('outputs/e-bandobast-3d.html').read_text(encoding='utf8')
Path('work/check.js').write_text(re.search(r'<script>(.*?)</script>',h,re.S).group(1),encoding='utf8')
blocks=[('Pandal',.399,.541,.058,.18,28),('Railway_station',.519,.067,.087,.029,13),('P1',.201,.633,.044,.05,4),('P2',.28,.532,.06,.05,4),('P3',.58,.12,.082,.08,4),('P4',.597,.564,.077,.05,4)]
lines=['# Schematic model from scanned traffic plan. Arbitrary units; heights assumed.'];n=0
def box(name,x,y,w,h,z):
 global n
 lines.append('o '+name)
 for a,b,c in [(x,y,0),(x+w,y,0),(x+w,y+h,0),(x,y+h,0),(x,y,z),(x+w,y,z),(x+w,y+h,z),(x,y+h,z)]:lines.append(f'v {a:.3f} {b:.3f} {c:.3f}')
 for face in [(1,4,3,2),(1,2,6,5),(2,3,7,6),(3,4,8,7),(4,1,5,8),(5,6,7,8)]:lines.append('f '+' '.join(str(i+n) for i in face))
 n+=8
box('Plan_extent',0,0,1800,1354,-2)
for name,x,y,w,h,z in blocks:box(name,x*1800,y*1354,w*1800,h*1354,z)
for name,x,y in [('Gate_1_example_team',.357,.748),('Gate_2_example_team',.493,.695),('Gate_3_example_team',.578,.677),('Example_barricade',.346,.72),('Example_traffic_post',.166,.491),('Example_medical_point',.459,.664)]:box(name,x*1800,y*1354,24 if 'barricade' in name else 8,8,18)
Path('outputs/e-bandobast-model.obj').write_text('\n'.join(lines))
print(f'OBJ verified: {n} vertices, {len([s for s in lines if s.startswith("f ")])} faces')
