'use client';
import Script from 'next/script';
import {useEffect,useRef,useState} from 'react';
import {Button} from '@rapold/framework-core';
import {semanticTokens} from '@rapold/framework-brands';
import {useActiveBrand} from './framework-shell';

interface Chart {setOption(option:object):void;resize():void;dispose():void;renderToSVGString():string}
interface Engine {init(element:HTMLElement,theme:unknown,options:{renderer:string}):Chart}
const categories=['Produkt','Entwicklung','Betrieb','Dienste'];
const values=[42,68,51,29];
const periods=['Jan','Feb','Mär','Apr','Mai','Jun'];
const trend=[24,31,28,42,49,56];
const activities=['Planung','Umsetzung','Prüfung','Service'];
const matrix=[[12,24,6,2],[8,32,19,9],[4,12,10,25],[15,3,5,6]];
const definitions=[{id:'bar',title:'Kategorien vergleichen',subtitle:'Abgeschlossene Aufgaben je Bereich'},{id:'donut',title:'Anteile einordnen',subtitle:'Verteilung derselben 190 Aufgaben'},{id:'line',title:'Entwicklung verfolgen',subtitle:'Abgeschlossene Aufgaben pro Monat'},{id:'heatmap',title:'Zusammenhänge erkennen',subtitle:'Bereiche und Tätigkeiten im Vergleich'}];

function ChartPanel({kind,ready,loadError}:{kind:string;ready:boolean;loadError:boolean}){
 const ref=useRef<HTMLDivElement>(null),instance=useRef<Chart|null>(null);
 const {brand,mode}=useActiveBrand();const [error,setError]=useState('');
 useEffect(()=>{
  const engine=(window as Window&{echarts?:Engine}).echarts;
  if(!ready||loadError||!ref.current)return;
  if(typeof engine?.init!=='function'){setError('Diagrammbibliothek nicht verfügbar. Die Werte stehen unten als Tabelle.');return;}
  const colors=semanticTokens(brand,mode);
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const palette=[colors.primary,colors['chart-2'],colors['chart-3'],colors['chart-4']];
  const axis={axisLine:{lineStyle:{color:colors.border}},axisLabel:{color:colors.foreground,fontSize:12},splitLine:{lineStyle:{color:colors.border}}};
  const base={animation:!motion.matches,backgroundColor:colors.card,color:palette,textStyle:{color:colors.foreground,fontFamily:brand.typography.family},aria:{enabled:true,decal:{show:true}},tooltip:{trigger:kind==='donut'?'item':'axis',backgroundColor:colors.card,textStyle:{color:colors.foreground},borderColor:colors.border},grid:{left:56,right:24,top:30,bottom:46}};
  let option:object;
  if(kind==='donut')option={...base,legend:{bottom:0,textStyle:{color:colors.foreground,fontSize:12}},series:[{type:'pie',radius:['38%','64%'],center:['50%','43%'],label:{show:true,color:colors.foreground,formatter:'{d}%'},data:categories.map((name,i)=>({name,value:values[i]}))}]};
  else if(kind==='heatmap')option={...base,tooltip:{...base.tooltip,trigger:'item'},grid:{left:92,right:20,top:24,bottom:100},xAxis:{...axis,type:'category',data:activities},yAxis:{...axis,type:'category',data:categories},visualMap:{min:0,max:32,calculable:true,orient:'horizontal',left:'center',bottom:10,inRange:{color:[colors.muted,colors.primary]},textStyle:{color:colors.foreground}},series:[{type:'heatmap',data:matrix.flatMap((row,y)=>row.map((value,x)=>[x,y,value])),label:{show:true,formatter:(p:{value:number[]})=>String(p.value[2]),color:colors.foreground,backgroundColor:colors.card,padding:[2,5],borderRadius:2}}]};
  else option={...base,xAxis:{...axis,type:'category',data:kind==='bar'?categories:periods},yAxis:{...axis,type:'value',min:0},series:[{type:kind==='bar'?'bar':'line',data:kind==='bar'?values:trend,smooth:false,label:{show:true,position:'top',color:colors.foreground},itemStyle:{color:colors.primary},lineStyle:{width:3},areaStyle:kind==='line'?{opacity:0.08}:undefined}]};
  let chart:Chart;
  try{chart=engine.init(ref.current,null,{renderer:'svg'});instance.current=chart;chart.setOption(option);setError('');}catch{instance.current?.dispose();instance.current=null;setError('Diagramm konnte nicht dargestellt werden. Die Werte stehen unten als Tabelle.');return;}
  const resize=new ResizeObserver(()=>chart.resize());resize.observe(ref.current);
  const change=()=>chart.setOption({animation:!motion.matches});motion.addEventListener('change',change);
  return()=>{resize.disconnect();motion.removeEventListener('change',change);chart.dispose();instance.current=null;};
 },[kind,ready,loadError,brand,mode]);
 function exportSvg(){const chart=instance.current;if(!chart)return;const url=URL.createObjectURL(new Blob([chart.renderToSVGString()],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download=`${brand.id}-${kind}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 const definition=definitions.find(d=>d.id===kind)!;
 const rows=kind==='heatmap'?matrix.map((row,i)=>[categories[i],...row]):(kind==='line'?periods:categories).map((name,i)=>[name,kind==='line'?trend[i]:values[i]]);
 const headers=kind==='heatmap'?['Bereich',...activities]:[kind==='line'?'Monat':'Bereich','Aufgaben'];
 const unavailable=loadError||!!error;
 return <section className="demo-panel"><h2>{definition.title}</h2><p>{definition.subtitle}</p><div ref={ref} className="echart" hidden={loadError} role="img" aria-hidden={unavailable||undefined} aria-label={`${definition.title}. Werte in der zugehörigen Datentabelle.`}/>{!ready&&!loadError&&<p role="status">Diagramm wird geladen …</p>}{loadError?<p>Diagramm nicht verfügbar. Die Datentabelle enthält alle Werte.</p>:error&&<p role="alert">{error}</p>}<div className="demo-row"><Button variant="outline" disabled={!ready||unavailable} onClick={exportSvg}>SVG exportieren</Button></div><details open={unavailable||undefined}><summary>Datentabelle anzeigen</summary><div className="data-table"><table><caption className="sr-only">{definition.subtitle} · Illustrative Beispieldaten</caption><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((value,j)=>j===0?<th scope="row" key={j}>{value}</th>:<td key={j}>{value}</td>)}</tr>)}</tbody></table></div></details></section>;
}

export default function EChartsShowcase(){
 const [ready,setReady]=useState(false),[error,setError]=useState(false);
 return <><Script src="/vendor/echarts-6.0.0.min.js" onReady={()=>{const available=typeof (window as Window&{echarts?:Engine}).echarts?.init==='function';setReady(available);setError(!available);}} onError={()=>{setReady(false);setError(true);}}/><div className="notice">Apache ECharts · lokale SVG-Darstellung mit Brand-Tokens, Datenansicht und Export. Alle Werte sind illustrative Beispieldaten.</div>{error&&<p role="alert">Die Diagrammbibliothek konnte nicht geladen werden. Die Datentabellen bleiben verfügbar.</p>}<div className="demo-grid">{definitions.map(d=><ChartPanel key={d.id} kind={d.id} ready={ready} loadError={error}/>)}</div><div className="download-row"><a href="/vendor/echarts-LICENSE.txt">Apache-Lizenz</a><a href="/vendor/echarts-NOTICE.txt">Herkunft</a></div></>;
}
