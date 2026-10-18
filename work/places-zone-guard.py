from pathlib import Path
p=Path('work/places-release/src/venue.js');s=p.read_text(encoding='utf8');old="      if(bigPandal&&!bigPandal.isInside()){\n        let pHit=";new="      if(bigPandal&&!bigPandal.isInside()&&!deployment.isDrawingZone()){\n        let pHit=";assert old in s;s=s.replace(old,new);p.write_text(s,encoding='utf8')
