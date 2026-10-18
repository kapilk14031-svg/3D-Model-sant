import React, {useEffect, useRef, useState} from 'react';
import {createRoot as createReactRoot} from 'react-dom/client';
import {createRoot as createFiberRoot, useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {createVenue} from './venue.js';

type Venue=ReturnType<typeof createVenue>;
type AssetRecord={id:number;name:string;object:THREE.Group;baseHeight:number};
let currentVenue:Venue|null=null;
function FrameBridge({venue}:{venue:Venue}){useFrame(()=>venue.update());return null;}
function saveBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}

function App(){
 const [venue,setVenue]=useState<Venue|null>(null);
 const [message,setMessage]=useState('Ready');
 const [assets,setAssets]=useState<AssetRecord[]>([]);
 const [chosen,setChosen]=useState<number|null>(null);
 const [height,setHeight]=useState(3);
 const [busy,setBusy]=useState(false);
 const [progress,setProgress]=useState(0);
 const [placing,setPlacing]=useState(false);
 const [drawerOpen,setDrawerOpen]=useState(false);

 const placingRef=useRef(false);
 const chosenRef=useRef<number|null>(null);
 const assetsRef=useRef<AssetRecord[]>([]);
 const input=useRef<HTMLInputElement>(null);

 useEffect(()=>{
  let stopped=false;
  let dispose:(()=>void)|undefined;
  (async()=>{
   try{
    const v=createVenue();
    currentVenue=v;
    const root=createFiberRoot(v.canvas);
    await root.configure({
      gl:v.renderer,camera:v.camera,scene:v.scene,shadows:true,frameloop:'always',
      dpr:Math.min(devicePixelRatio,2),
      size:{width:v.canvas.parentElement!.clientWidth,height:v.canvas.parentElement!.clientHeight,top:0,left:0}
    });
    if(stopped)return;
    root.render(<FrameBridge venue={v}/>);
    (window as any).__bandobast={venue:v,root};
    const obs=new ResizeObserver(()=>{
      root.configure({
        gl:v.renderer,camera:v.camera,scene:v.scene,shadows:true,frameloop:'always',
        dpr:Math.min(devicePixelRatio,2),
        size:{width:v.canvas.parentElement!.clientWidth,height:v.canvas.parentElement!.clientHeight,top:0,left:0}
      });
    });
    obs.observe(v.canvas.parentElement!);
    const ray=new THREE.Raycaster();
    const point=new THREE.Vector2();
    const click=(e:PointerEvent)=>{
      if(!placingRef.current)return;
      const asset=assetsRef.current.find(a=>a.id===chosenRef.current);
      if(!asset)return;
      point.set(e.offsetX/v.canvas.clientWidth*2-1,-e.offsetY/v.canvas.clientHeight*2+1);
      ray.setFromCamera(point,v.camera);
      const hit=ray.intersectObject(v.ground)[0];
      if(hit&&Math.abs(hit.point.x)<300&&Math.abs(hit.point.z)<225){
        asset.object.position.set(hit.point.x,0,hit.point.z);
        placingRef.current=false;
        setPlacing(false);
        setMessage('Asset placed on ground.');
      }
    };
    v.canvas.addEventListener('pointerup',click);
    dispose=()=>{
      obs.disconnect();
      v.canvas.removeEventListener('pointerup',click);
      root.unmount();
    };
    setVenue(v);
    setMessage('3D Scene Ready');
   }catch(error){
    setMessage('Could not start 3D viewer: '+String(error));
   }
  })();
  return()=>{stopped=true;dispose?.();};
 },[]);

 function updateAssets(next:AssetRecord[]){assetsRef.current=next;setAssets(next);}

 async function importAsset(file:File){
  if(!venue)return;
  setBusy(true);
  setMessage('Reading GLB model…');
  try{
   const data=await file.arrayBuffer();
   const dv=new DataView(data);
   if(dv.getUint32(0,true)!==0x46546c67)throw Error('Choose a valid GLB file');
   const jsonLen=dv.getUint32(12,true);
   const manifest=JSON.parse(new TextDecoder().decode(new Uint8Array(data,20,jsonLen)));
   if([...(manifest.buffers||[]),...(manifest.images||[])].some((x:{uri?:string})=>x.uri&&!x.uri.startsWith('data:')))throw Error('Use a self-contained GLB with embedded textures');
   const gltf=await new GLTFLoader().parseAsync(data,'');
   const g=new THREE.Group();
   g.name=file.name;
   g.add(gltf.scene);
   let bounds=new THREE.Box3().setFromObject(g),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
   if(!Number.isFinite(size.y)||size.y<=0)throw Error('Asset has no usable height');
   gltf.scene.position.sub(new THREE.Vector3(center.x,bounds.min.y,center.z));
   g.scale.setScalar(height/size.y);
   g.position.copy(venue.target);
   g.position.y=0;
   g.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;}});
   venue.scene.add(g);
   const a={id:Date.now(),name:file.name,object:g,baseHeight:size.y};
   updateAssets([...assetsRef.current,a]);
   setChosen(a.id);
   chosenRef.current=a.id;
   setMessage('Imported. Click “Place on Map” then click ground.');
  }catch(error){
   setMessage('Import failed: '+String(error));
  }finally{
   setBusy(false);
  }
 }

 async function exportGLB(){
  if(!venue)return;
  setBusy(true);
  setProgress(15);
  setMessage('Collecting 3D geometries…');
  try{
   await new Promise(r=>setTimeout(r,150));
   venue.scene.updateMatrixWorld(true);
   setProgress(40);
   const group=new THREE.Group();
   group.name='E-Bandobast_Schematic';
   const patch=new THREE.Mesh(new THREE.PlaneGeometry(600,450),new THREE.MeshStandardMaterial({color:'#556638',roughness:.95}));
   patch.rotation.x=-Math.PI/2;
   patch.position.y=-.15;
   group.add(patch);
   venue.scene.traverse(o=>{
     if(!(o instanceof THREE.Mesh)||o===venue.ground||o.name==='skyDome'||o.name==='scanMesh'||(o.geometry?.type==='SphereGeometry'&&(o.geometry as any).parameters?.radius>500))return;
     let visible=true;
     for(let p:THREE.Object3D|null=o;p;p=p.parent)if(!p.visible)visible=false;
     if(!visible||o.material instanceof THREE.MeshBasicMaterial&&o.material.transparent)return;
     let matToUse:any=o.material;
     if(o.material&&!(o.material instanceof Array)&&(o.material as any).map&&!(o.material as any).map.image){
       matToUse=new THREE.MeshStandardMaterial({color:(o.material as any).color||'#888888',roughness:.85});
     }
     const clone=new THREE.Mesh(o.geometry,matToUse);
     clone.name=o.name||'site-object';
     clone.matrixAutoUpdate=false;
     clone.matrix.copy(o.matrixWorld);
     group.add(clone);
   });
   setProgress(75);
   setMessage('Compiling binary GLB archive…');
   group.userData={
     source:'Adobe Scan 17 Oct 2026.pdf',
     accuracy:'Schematic geometry; unsurveyed scale and illustrative heights',
     framework:'React + TypeScript + React Three Fiber + Three.js',
     features:venue.pdfFeatures.length
   };
   const result=await new GLTFExporter().parseAsync(group,{binary:true,onlyVisible:true});
   if(!(result instanceof ArrayBuffer))throw Error('Unexpected export format');
   setProgress(100);
   saveBlob(new Blob([result],{type:'model/gltf-binary'}),'e-bandobast-scene.glb');
   setMessage('GLB exported successfully.');
  }catch(error){
   setMessage('Export failed: '+String(error));
  }finally{
   setBusy(false);
   setTimeout(()=>setProgress(0),2000);
  }
 }

 const selected=assets.find(a=>a.id===chosen);

 return (
  <div data-hall-hide="true">
   {/* Collapsed Drawer Pill Button */}
   {!drawerOpen && (
    <button
      onClick={()=>setDrawerOpen(true)}
      style={{
        position:'absolute',
        top:14,
        right:14,
        zIndex:50,
        background:'rgba(17,28,46,0.92)',
        border:'1px solid #1e293b',
        borderRadius:20,
        padding:'8px 14px',
        color:'#38bdf8',
        fontSize:12,
        fontWeight:600,
        display:'flex',
        alignItems:'center',
        gap:8,
        cursor:'pointer',
        boxShadow:'0 4px 15px rgba(0,0,0,0.4)',
        backdropFilter:'blur(8px)'
      }}
    >
      <span>📦 3D Models & Assets</span>
      <span style={{background:'#0284c7',color:'#fff',padding:'1px 6px',borderRadius:10,fontSize:10}}>
        {assets.length}
      </span>
    </button>
   )}

   {/* Expanded Drawer (Slide-out from Right Edge) */}
   {drawerOpen && (
    <div
      style={{
        position:'absolute',
        top:0,
        right:0,
        width:320,
        height:'100%',
        background:'rgba(17,28,46,0.96)',
        borderLeft:'1px solid #1e293b',
        boxShadow:'-8px 0 25px rgba(0,0,0,0.5)',
        zIndex:100,
        display:'flex',
        flexDirection:'column',
        padding:16,
        gap:12,
        backdropFilter:'blur(12px)',
        overflowY:'auto',
        color:'#e2e8f0',
        fontFamily:'system-ui'
      }}
    >
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #1e293b',paddingBottom:10}}>
        <div>
          <b style={{fontSize:14,color:'#fff'}}>📦 3D Models & Assets</b>
          <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>Scene glTF Archive & Custom Props</div>
        </div>
        <button
          onClick={()=>setDrawerOpen(false)}
          style={{
            width:28,
            height:28,
            borderRadius:'50%',
            border:'none',
            background:'rgba(255,255,255,0.08)',
            color:'#94a3b8',
            cursor:'pointer',
            fontSize:13,
            display:'flex',
            alignItems:'center',
            justifyContent:'center'
          }}
        >
          ✕
        </button>
      </div>

      {/* Asset Count & Status Card */}
      <div style={{background:'#16243a',border:'1px solid #1e293b',borderRadius:8,padding:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <span style={{fontSize:11,color:'#94a3b8'}}>Custom Imported:</span>
          <b style={{fontSize:13,color:'#38bdf8',marginLeft:6}}>{assets.length} models</b>
        </div>
        <div>
          <span style={{fontSize:11,color:'#94a3b8'}}>Landmark Nodes:</span>
          <b style={{fontSize:13,color:'#22c55e',marginLeft:6}}>42 units</b>
        </div>
      </div>

      {/* Export Section */}
      <div style={{background:'#16243a',border:'1px solid #1e293b',borderRadius:8,padding:12,display:'flex',flexDirection:'column',gap:8}}>
        <b style={{fontSize:12,color:'#fff'}}>Export 3D Venue Scene</b>
        <div style={{fontSize:11,color:'#94a3b8',lineHeight:1.4}}>
          <div><b>Format:</b> glTF 2.0 Binary (.glb)</div>
          <div><b>Est. Size:</b> ~4.8 MB (Geometry & Textures)</div>
        </div>
        {progress > 0 && (
          <div style={{width:'100%',background:'#0f172a',borderRadius:4,height:6,overflow:'hidden',margin:'4px 0'}}>
            <div style={{width:`${progress}%`,background:'#38bdf8',height:'100%',transition:'width 0.2s'}}/>
          </div>
        )}
        <button
          disabled={!venue||busy}
          onClick={exportGLB}
          style={{
            background:'#0284c7',
            borderColor:'#38bdf8',
            color:'#fff',
            fontWeight:600,
            padding:'8px 12px',
            borderRadius:6
          }}
        >
          {busy ? `Exporting (${progress}%)…` : '⬇ Download Scene GLB'}
        </button>
      </div>

      {/* Import Section */}
      <div style={{background:'#16243a',border:'1px solid #1e293b',borderRadius:8,padding:12,display:'flex',flexDirection:'column',gap:8}}>
        <b style={{fontSize:12,color:'#fff'}}>Import Custom GLB Model</b>
        <p style={{fontSize:11,color:'#94a3b8',lineHeight:1.4}}>
          Import 3D models from Blender, Meshy or Tripo. Scale and position anywhere on the site.
        </p>
        <input
          ref={input}
          type="file"
          accept=".glb"
          style={{display:'none'}}
          onChange={e=>{
            let f=e.target.files?.[0];
            if(f)importAsset(f);
            e.target.value='';
          }}
        />
        <button
          disabled={busy||!venue}
          onClick={()=>input.current?.click()}
          style={{background:'#1e293b',borderColor:'#334155',color:'#e2e8f0',padding:'8px 12px'}}
        >
          📁 Select .GLB File
        </button>

        {assets.length > 0 && (
          <>
            <label style={{fontSize:11,color:'#94a3b8',marginTop:4}}>
              Model Height Scale: {height}m
              <input
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={height}
                onChange={e=>{
                  let h=Number(e.target.value)||1;
                  setHeight(h);
                  if(selected)selected.object.scale.setScalar(h/selected.baseHeight);
                }}
              />
            </label>
            <select
              value={chosen??''}
              onChange={e=>{
                const id=Number(e.target.value);
                setChosen(id);
                chosenRef.current=id;
                const a=assets.find(a=>a.id===id);
                if(a)setHeight(a.object.scale.y*a.baseHeight);
              }}
            >
              <option value="">Select Imported Asset</option>
              {assets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <div style={{display:'flex',gap:6}}>
              <button
                disabled={!selected}
                onClick={()=>{
                  placingRef.current=true;
                  setPlacing(true);
                  setMessage('Click inside venue ground to place');
                }}
                style={{flex:1,background:placing?'#f59e0b':'#1e293b',color:placing?'#000':'#fff'}}
              >
                {placing?'Click ground…':'📍 Place'}
              </button>
              <button
                disabled={!selected}
                onClick={()=>{if(selected)selected.object.rotation.y+=Math.PI/12;}}
                style={{flex:1}}
              >
                ↶ 15°
              </button>
              <button
                disabled={!selected}
                onClick={()=>{if(selected)venue?.focus(selected.object.position.x,selected.object.position.z,35);}}
                style={{flex:1}}
              >
                🎯 Focus
              </button>
            </div>
            <button
              disabled={!selected}
              onClick={()=>{
                if(selected){
                  venue?.scene.remove(selected.object);
                  updateAssets(assets.filter(a=>a.id!==selected.id));
                  setChosen(null);
                  chosenRef.current=null;
                  setMessage('Asset removed');
                }
              }}
              style={{background:'rgba(239,68,68,0.15)',borderColor:'#ef4444',color:'#fca5a5',padding:'6px'}}
            >
              🗑 Remove Asset
            </button>
          </>
        )}
      </div>

      <div style={{fontSize:11,color:'#64748b',marginTop:'auto',lineHeight:1.4,paddingTop:10,borderTop:'1px solid #1e293b'}}>
        Status: <span style={{color:'#38bdf8'}}>{message}</span>
      </div>
    </div>
   )}
  </div>
 );
}

const host=document.createElement('div');
document.querySelector('#viewport')!.append(host);
createReactRoot(host).render(<App/>);
