import re

with open('work/google_sat_datauri_enhanced.txt', 'r', encoding='ascii') as f:
    enhanced_uri = f.read().strip()

with open('work/r3f-build/src/venue.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the previous satellite uri
pos1 = code.find("const googleSatelliteUri = '")
if pos1 != -1:
    pos2 = code.find("';", pos1)
    code = code[:pos1] + f"const googleSatelliteUri = '{enhanced_uri}';" + code[pos2+2:]
    print('Updated googleSatelliteUri to enhanced texture!')

# Update Sky/Atmosphere colors:
code = code.replace("scene.background=new THREE.Color('#c5dbe9');", "scene.background=new THREE.Color('#0b1728');")
code = code.replace("scene.fog=new THREE.Fog('#c5dbe9',650,2250);", "scene.fog=new THREE.Fog('#0b1728',800,2800);")

# Update Lighting for richer daylight:
code = code.replace("const hemiLight=new THREE.HemisphereLight('#c2dff5','#4a4032',1.15);", "const hemiLight=new THREE.HemisphereLight('#dceaf5','#3d3326',1.25);")
code = code.replace("const sun=new THREE.DirectionalLight('#fff4de',2.75);", "const sun=new THREE.DirectionalLight('#fff9eb',2.95);")

# Update Asphalt road color for high contrast:
code = code.replace("color:'#323638',roughness:.92", "color:'#1c1f21',roughness:.85")

# Update Curbs to bright safety paint:
code = code.replace("color:'#b8b4aa',roughness:.85", "color:'#e2ded2',roughness:.75")

# Update Pandal roof fabric to clean architectural ivory:
code = code.replace("ctx.fillStyle='#f0eae0';", "ctx.fillStyle='#fbf9f4';")

with open('work/r3f-build/src/venue.js', 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated venue.js with enhanced visual aesthetics!')
