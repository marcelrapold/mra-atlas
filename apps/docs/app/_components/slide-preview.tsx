'use client';
import type {SceneNode} from '../../../../packages/brands/src/slide-scene.mjs';
import type {CSSProperties} from 'react';
import { slideScene } from '../../../../packages/brands/src/slide-scene.mjs';
// Mirrors packages/presentation/src/render.mjs: 1 pt = 100/960 cqw on a 13.333 in slide.
const pt=(v:number)=>`${v/960*100}cqw`;
const rgba=(hex:string,opacity=1)=>opacity>=1?hex:`rgb(${[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(' ')} / ${opacity})`;
export function SlidePreview({id,deck}:{id:string;deck:Record<string,any>}) {
 const scene=slideScene(id,deck),bg=scene.background,cm=(v:number)=>`${v/scene.width*100}cqw`,pct=(v:number,of:number)=>`${v/of*100}%`;
 const canvas:CSSProperties={aspectRatio:`${scene.width}/${scene.height}`,fontFamily:deck.typography.family,...(bg?{backgroundColor:bg.color,backgroundImage:bg.path?`url(/${bg.path})`:undefined,backgroundSize:'cover',backgroundPosition:'center'}:{})};
 return <div className="slide-frame"><div className="slide-canvas" role="img" aria-label={`${deck.slides.find((s:any)=>s.id===id)?.titel??id}, illustrative Beispieldaten`} style={canvas}>
 {bg?.graphics?.map((g,i)=><img key={`g${i}`} src={`/${g.path}`} alt="" style={{position:'absolute',left:pct(g.x,scene.width),top:pct(g.y,scene.height),width:pct(g.w,scene.width),height:pct(g.h,scene.height),opacity:g.opacity}}/>)}
 {scene.nodes.map((n,i)=>{
 const style:CSSProperties={position:'absolute',left:pct(n.x,scene.width),top:pct(n.y,scene.height),width:pct(n.w,scene.width),height:pct(n.h,scene.height),background:n.fill&&rgba(n.fill,n.opacity),color:n.color,fontSize:`${(n.pt??11)/960*100}cqw`,fontWeight:n.bold?deck.deck?.type.headingWeight??deck.typography.headingWeight:deck.typography.bodyWeight,lineHeight:1.2,whiteSpace:'pre-line',overflow:'hidden',textAlign:n.align,borderRadius:n.radius?cm(n.radius):n.shape==='ellipse'?'50%':n.shape==='roundRect'?'999px':undefined};
 if(n.stroke)style.border=`${pt(n.strokePt??.75)} solid ${rgba(n.stroke,n.strokeOpacity)}`;
 if(n.glow)style.boxShadow=`0 0 ${pt(n.glow.blurPt)} ${rgba(n.glow.color,n.glow.opacity)}`;
 if(n.face)style.fontFamily=`"${n.face}", ${deck.typography.family}`;
 if(n.caps){style.textTransform='uppercase';style.letterSpacing=`${n.trackingEm}em`;}
 if(n.kind==='chart'||n.kind==='linechart')return <div key={i} style={style}><ChartScene node={n}/></div>;
 if(n.kind==='brand'&&n.path)return <img key={i} src={`/${n.path}`} alt="" style={{...style,objectFit:'contain'}}/>;
 return <div key={i} style={style}>{n.text}{n.punctuation&&<span style={{color:n.punctuation.color,fontSize:`${n.punctuation.scale}em`}}>{n.punctuation.glyph}</span>}</div>;
 })}</div></div>;
}

function ChartScene({node}:{node:SceneNode}){
 const series=node.series??[],max=Math.max(...series.flatMap(s=>s.values),1),count=series[0]?.values.length??1,axis=node.axisColor??'currentColor';
 return <svg viewBox="0 0 600 240" width="100%" height="100%" role="img" aria-label="Vergleich mit illustrativen Beispieldaten" style={node.font?{fontFamily:`"${node.font}"`}:undefined}><title>Illustrative Vergleichsdaten</title>{series.map((s,j)=>node.kind==='linechart'?<g key={s.name}><polyline points={s.values.map((v,i)=>`${20+i*490/(count-1)},${190-v/max*155}`).join(' ')} fill="none" stroke={s.color} strokeWidth="3"/><text x="515" y={190-s.values.at(-1)!/max*155} fill={s.color} fontSize="13">{s.name}</text></g>:<g key={s.name}>{s.values.map((v,i)=><g key={i}><rect x={25+i*185+j*65} y={180-v/max*145} width="52" height={v/max*145} fill={s.color}/><text x={51+i*185+j*65} y={172-v/max*145} fill={node.valueColor??s.color} fontSize="14" textAnchor="middle">{v.toFixed(2).replace('.',',')}</text></g>)}<text x={160+j*220} y="237" fill={node.axisColor??s.color} fontSize="13">{s.name}</text></g>)}{node.kind==='chart'&&node.labels?.map((label,i)=><text key={label} x={82+i*185} y="205" fontSize="14" textAnchor="middle" fill={axis}>{label}</text>)}</svg>;
}
