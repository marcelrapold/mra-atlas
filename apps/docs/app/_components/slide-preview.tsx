'use client';
import type {SceneNode} from '../../../../packages/brands/src/slide-scene.mjs';
import type {CSSProperties} from 'react';
import { slideScene } from '../../../../packages/brands/src/slide-scene.mjs';
export function SlidePreview({id,deck}:{id:string;deck:Record<string,any>}) {
 const scene=slideScene(id,deck);
 return <div className="slide-frame"><div className="slide-canvas" role="img" aria-label={`${deck.slides.find((s:any)=>s.id===id)?.titel??id}, illustrative Beispieldaten`} style={{aspectRatio:`${scene.width}/${scene.height}`,fontFamily:deck.typography.family}}>{scene.nodes.map((n,i)=>{
 const style:CSSProperties={position:'absolute',left:`${n.x/scene.width*100}%`,top:`${n.y/scene.height*100}%`,width:`${n.w/scene.width*100}%`,height:`${n.h/scene.height*100}%`,background:n.fill,color:n.color,fontSize:`${(n.pt??11)/960*100}cqw`,fontWeight:n.bold?deck.typography.headingWeight:deck.typography.bodyWeight,lineHeight:1.2,whiteSpace:'pre-line',overflow:'hidden',textAlign:n.align,borderRadius:n.shape==='ellipse'?'50%':n.shape==='roundRect'?'999px':undefined};
 if(n.kind==='chart'||n.kind==='linechart')return <div key={i} style={style}><ChartScene node={n}/></div>;
 return <div key={i} style={style}>{n.text}</div>;
 })}</div></div>;
}

function ChartScene({node}:{node:SceneNode}){
 const series=node.series??[],max=Math.max(...series.flatMap(s=>s.values),1),count=series[0]?.values.length??1;
 return <svg viewBox="0 0 600 240" width="100%" height="100%" role="img" aria-label="Vergleich mit illustrativen Beispieldaten"><title>Illustrative Vergleichsdaten</title>{series.map((s,j)=>node.kind==='linechart'?<g key={s.name}><polyline points={s.values.map((v,i)=>`${20+i*490/(count-1)},${190-v/max*155}`).join(' ')} fill="none" stroke={s.color} strokeWidth="3"/><text x="515" y={190-s.values.at(-1)!/max*155} fill={s.color} fontSize="13">{s.name}</text></g>:<g key={s.name}>{s.values.map((v,i)=><g key={i}><rect x={25+i*185+j*65} y={180-v/max*145} width="52" height={v/max*145} fill={s.color}/><text x={51+i*185+j*65} y={172-v/max*145} fill={s.color} fontSize="14" textAnchor="middle">{v.toFixed(2).replace('.',',')}</text></g>)}<text x={160+j*220} y="237" fill={s.color} fontSize="13">{s.name}</text></g>)}{node.kind==='chart'&&node.labels?.map((label,i)=><text key={label} x={82+i*185} y="205" fontSize="14" textAnchor="middle" fill="currentColor">{label}</text>)}</svg>;
}
