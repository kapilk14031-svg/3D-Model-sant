from pathlib import Path
p=Path('src/main.tsx');s=p.read_text(encoding="utf8");s=s.replace('root.render(<FrameBridge venue={v}/>);',"root.render(<FrameBridge venue={v}/>);(window as any).__bandobast={venue:v,root};")
p.write_text(s,encoding="utf8")

