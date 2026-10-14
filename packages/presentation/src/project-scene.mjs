// Data-driven slide recipes. This module contains no example project facts and no I/O.
import {deckStage} from '../../brands/src/deck-stage.mjs';
export function chNumber(value){
 if(typeof value!=='number')return String(value);
 const [integer,decimal]=String(value).split('.');
 return integer.replace('-','−').replace(/\B(?=(\d{3})+(?!\d))/g,"'")+(decimal?','+decimal:'');
}
const chDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)?value.split('-').reverse().join('.'):value;
const claimLabel={fact:'BELEGT',inference:'EINORDNUNG','open-question':'ZU KLÄREN'};
const resolutionLabel={decision:'ENTSCHEID',assignment:'AUFTRAG','open-question':'ZU KLÄREN'};
export function projectScene(slide,theme,index=0){
 const S=deckStage(theme,slide.type),c=S?.c??theme.colors,g=theme.layout,R=g.randLR,Y=g.inhalt.yStart,W=g.nutzbreite,nodes=[],content=slide.content??{},claims=slide.claims??[],metrics=slide.metrics??[],sources=slide.sources??[];
 const rect=(x,y,w,h,fill,shape='rect',lit=false)=>nodes.push(...S?S.rect({kind:'rect',x,y,w,h,fill,shape},{glow:lit}):[{kind:'rect',x,y,w,h,fill,shape}]);
 const text=(value,x,y,w,h,pt=10.5,color=c.text,bold=false,align='left')=>{if(value!==undefined&&value!=='')nodes.push(S?S.text({kind:'text',text:String(value),x,y,w,h,pt,color,bold,align}):{kind:'text',text:String(value),x,y,w,h,pt,color,bold,align});};
 const heading=(value,x,y,w,h,pt,color,display)=>nodes.push(S.title({kind:'text',text:String(value),x,y,w,h,pt,color,bold:true,align:'left'},display));
 const col=(name,i)=>{const a=g.columns[name];return {x:a.xPositionen[i],w:Array.isArray(a.spaltenW)?a.spaltenW[i]:a.spaltenW};};
 const columns=(count)=>count===1?[{x:R,w:W}]:Array.from({length:count},(_,i)=>col({2:'zweiGleich',3:'drei',4:'vier',5:'fuenf'}[count],i));
 const line=(x,y,w)=>rect(x,y,w,.03,c.border);
 const card=(x,y,w,h,title,body,highlight=false)=>{rect(x,y,w,h,highlight?c['surface-info']:c['surface-neutral']);text(title,x+.66,y+.51,w-1.32,1.15,13,c.text,true);text(body,x+.66,y+1.9,w-1.32,h-2.15,10.5,c['text-secondary']);};
 const takeaway=(y=14.7)=>{rect(R,y,W,2.45,c['surface-info']);text(slide.resolution?resolutionLabel[slide.resolution.kind]:'Einordnung',R+.66,y+.3,W-1.32,.6,11,c.text,true);text(slide.resolution?resolutionText(slide.resolution):slide.takeaway,R+.66,y+1,W-1.32,1.2,11,c['text-secondary']);};
 const metricValue=m=>`${chNumber(m.value)} ${m.unit}`;
 const comparison=m=>`${m.comparisonPeriod}: ${chNumber(m.comparison)} ${m.unit}`;
 const chart=(x,y,w,h)=>nodes.push((S?S.chart:v=>v)({kind:'chart',x,y,w,h,labels:metrics.map(m=>m.label),series:[{name:metrics[0].comparisonPeriod,values:metrics.map(m=>m.comparison),color:c['chart-previous']},{name:metrics[0].period,values:metrics.map(m=>m.value),color:c.primary}]}));
 const sourceBody=s=>`${s.path}\nCommit ${s.commit.slice(0,7)}\nAbruf ${chDate(s.retrievedAt)}`;
 const resolutionText=r=>`${r.text}${r.owner?'\nVerantwortung: '+r.owner:''}${r.dueDate?' · Termin: '+chDate(r.dueDate):''}`;
 if(!S)rect(0,0,33.867,19.05,c.surface);
 if(S&&['cover-foto','foto-schluss'].includes(slide.type)){
  // Supplied photography fills the slide; a scrim in the surface colour carries the text.
  nodes.push({kind:'image',x:0,y:0,w:33.867,h:19.05,path:content.image.path,alt:content.image.alt,fit:'cover'});
  nodes.push({kind:'rect',x:0,y:0,w:28.7,h:6.8,fill:S.surface.fill,shape:'rect',opacity:.72});
  heading(slide.title,R,1,26,2.8,30,c.text);
  text(content.subtitle,R,4.2,26,1.8,20,c['text-secondary']);
 }else if(S&&slide.type==='kapitel-trenner'){
  heading(slide.title,R,3.62,28,4.6,S.displayPt,c.text,true);
 }else if(['cover-foto','foto-schluss'].includes(slide.type)){
  nodes.push({kind:'image',x:0,y:0,w:33.867,h:17.524,path:content.image.path,alt:content.image.alt,fit:'cover'});
  // A solid text area keeps contrast predictable for arbitrary supplied photography.
  rect(0,0,28.7,6.8,c.primary);
  text(slide.title,R,1,26,2.8,30,c['on-color'],true);
  text(content.subtitle,R,4.2,26,1.8,20,c['on-color']);
 }else if(slide.type==='kapitel-trenner'){
  rect(0,0,33.867,17.524,c.primary);text(slide.title,R,3.62,28,4,30,c['on-color'],true);
 }else{
  if(S)heading(slide.title,g.titel.x,g.titel.y,g.titel.w,g.titel.h,30,c.text);else text(slide.title,g.titel.x,g.titel.y,g.titel.w,g.titel.h,30,c.text,true);
  if(slide.lead)text(`${slide.lead.period} · ${slide.lead.source}`,g.lead.x,g.lead.y,g.lead.w,g.lead.h1zeilig,11.5,c['text-secondary']);
  if(S)nodes.push(S.rule(g.fusslinie.y));else rect(0,g.fusslinie.y,33.867,.079,c.primary);
  text(String(index+1).padStart(2,'0'),g.foliennummer.x,g.foliennummer.y,1.49,.85,10,c.text,true);
  const refs=sources.map(s=>s.id).join(', '),footer=sources.length?`Quellen: ${refs.length>90?sources.length+' Belege, siehe Quellenmanifest':refs} · Abruf ${chDate(sources[0].retrievedAt)}`:'';
  text(footer,g.quellzeile.x,g.quellzeile.y,g.quellzeile.w,g.quellzeile.h,8,c['text-muted']);
  switch(slide.type){
   case 'agenda':slide.items.forEach((item,i)=>{text(String(i+1).padStart(2,'0'),R,Y+i*2.5,2,1.6,24,c.primary,true);text(item,4,Y+i*2.5,28,1.7,24,c.text,true);});break;
   case 'management-summary':claims.forEach((claim,i)=>{const y=Y+i*1.98;if(i)line(R,y-.2,W);text(claimLabel[claim.kind],R,y,3.7,.9,9,c['text-muted'],true);text(claim.title,5.4,y,12.1,1.6,13,c.text,true);text(claim.text,18.6,y,14.3,1.65,10.5,c['text-secondary']);});takeaway();break;
   case 'karten-steckbrief':columns(sources.length).forEach(({x,w},i)=>card(x,Y,w,8.9,sources[i].label??sources[i].id,sourceBody(sources[i]),i===0));takeaway();break;
   case 'zwei-grosskarten':columns(2).forEach(({x,w},i)=>{const a=claims[i];card(x,Y,w,9.75,a.title,a.text,i===0);text(claimLabel[a.kind],x+.66,Y+8,w-1.32,.65,9,c['text-muted'],true);});takeaway();break;
   case 'modul-karten-mit-chart':columns(3).forEach(({x,w},i)=>card(x,Y,w,4.5,claims[i].title,claims[i].text));chart(R,9.4,18.8,7.4);card(20.45,9.4,12.497,7.4,'Einordnung',slide.takeaway,true);break;
   case 'phasen-karten-gate':columns(4).forEach(({x,w},i)=>card(x,Y,w,6.65,claims[i].title,claims[i].text));rect(R,11.52,W,5.6,c['surface-info']);text('Abnahmekriterien',R+.66,12,W-1.32,.7,13,c.text,true);content.gates.forEach((gate,i)=>text(`${i+1}. ${gate}`,R+.66,13+i*.85,W-1.32,.8));break;
   case 'quellen-grid':sources.forEach((s,i)=>{const block=Math.floor(i/2),x=R+(block%3)*10.8,y=Y+Math.floor(block/3)*5.3+(i%2)*2.45;if(i%2===0)rect(x,y,10.41,5,c['surface-neutral']);text(s.label??s.id,x+.5,y+.3,9.4,.6,10,c.text,true);text(sourceBody(s),x+.5,y+1,9.4,1.4,8.5,c['text-secondary']);});takeaway(15);break;
   case 'kpi-board':columns(metrics.length).forEach(({x,w},i)=>{const m=metrics[i];rect(x,Y,w,3.65,c['surface-info'],'rect',i===0);text(metricValue(m),x+.45,Y+.3,w-.9,1.1,25,c.primary,true);text(m.label,x+.45,Y+1.6,w-.9,.75);text(comparison(m),x+.45,Y+2.6,w-.9,.8,9,c['text-secondary']);});if(content.chart){chart(R,9,18.8,7.4);card(20.45,9,12.497,7.4,'Einordnung',slide.takeaway);}else card(R,9,W,6,'Einordnung',slide.takeaway);break;
   case 'kpi-timeline':columns(metrics.length).forEach(({x,w},i)=>{rect(x,Y,w,4.4,c['surface-info'],'rect',i===0);text(metricValue(metrics[i]),x+.5,Y+.5,w-1,1.4,25,c.primary,true);text(metrics[i].label,x+.5,Y+2,w-1,.8);text(comparison(metrics[i]),x+.5,Y+3,w-1,.9,9,c['text-secondary']);});line(2,12.1,29.7);content.timeline.forEach((t,i)=>{const x=2.6+i*28/(content.timeline.length-1),color=t.kind==='current'?c.signal:t.kind==='past'?c['chart-previous']:c.primary;rect(x-.24,11.875,.48,.48,color,'ellipse');text(t.date,x-2,10.7,4,.8,11,color,true,'center');text(t.label,x-2,12.7,4,1.25,9.5,c['text-secondary'],false,'center');});takeaway();break;
   case 'textbox-tabelle':case 'split-tabelle':{
    const split=slide.type==='split-tabelle',tableY=split&&content.chart?10.1:Y;
    if(split&&content.chart)chart(R,Y,18.796,5.6);
    const w=split?18.796:22.4,cols=[{x:R,w:w*.38,a:'left'},{x:R+w*.4,w:w*.27,a:'right'},{x:R+w*.7,w:w*.3,a:'right'}];
    ['KENNZAHL / EINHEIT','VERGLEICH','AKTUELL'].forEach((v,i)=>text(v,cols[i].x,tableY,cols[i].w,.5,8.5,c['text-muted'],true,cols[i].a));line(R,tableY+.65,w);
    const pitch=1.5;
    metrics.forEach((m,i)=>{const y=tableY+.95+i*pitch;text(m.label,cols[0].x,y,cols[0].w,.6,11,c.text,true);text(m.unit,cols[0].x,y+.62,cols[0].w,.45,8,c['text-muted']);text(chNumber(m.comparison),cols[1].x,y,cols[1].w,.6,11,c['text-secondary'],false,'right');text(chNumber(m.value),cols[2].x,y,cols[2].w,.6,11,c.text,true,'right');});
    const panelX=split?20.45:24.6,panelW=split?12.497:8.33;card(panelX,Y,panelW,8.8,'Einordnung',slide.takeaway,true);text(`Aktuell: ${metrics[0].period}\nVergleich: ${metrics[0].comparisonPeriod}`,panelX+.66,Y+9.5,panelW-1.32,2.6,9.5,c['text-secondary']);break;
   }
   case 'drei-schritt-beweis':columns(3).forEach(({x,w},i)=>{const a=claims[i];rect(x,Y,w,8.7,i===2?c['surface-info']:c['surface-neutral']);text(`${i+1} · ${a.title}`,x+.66,Y+.51,w-1.32,1.4,13,c.text,true);text(a.value,x+.66,Y+2.1,w-1.32,1.4,26,i===0?c.signal:c.text,true);text(a.text,x+.66,Y+(a.value?4:2.5),w-1.32,4,10.5,c['text-secondary']);});takeaway();break;
   case 'shape-balkendiagramm':{
    const max=Math.max(...metrics.map(m=>m.value),1),pitch=Math.min(1.12,10/metrics.length);
    metrics.forEach((m,i)=>{const y=Y+i*pitch,w=m.value/max*17;text(m.label,R,y,6,.55,10.5,c.text,false,'right');rect(7.5,y+.08,w,.4,i===0?c.primary:c['chart-previous']);text(metricValue(m),7.8+w,y,7.5,.6,10,c.text,true);text(comparison(m),7.5,y+.54,24,.42,8,c['text-muted']);});takeaway();break;
   }
   case 'vollbild-grafik':{
    const x=7.2,cw=25.2/content.columns.length;content.columns.forEach((label,i)=>text(label,x+i*cw,Y,cw,.7,9,c['text-secondary'],false,'center'));content.rows.forEach((row,i)=>{const y=Y+1.5+i*2.2;rect(R,y-.2,W,1.8,c['surface-neutral']);text(row.label,R+.4,y+.3,5.4,1,11,c.text,true);rect(x+row.start*cw,y+.25,row.span*cw,1,c.primary);});takeaway();break;
   }
   case 'entscheid-register':{
    const rows=[{title:slide.resolution.text,text:resolutionText({...slide.resolution,text:''}).trim(),label:resolutionLabel[slide.resolution.kind]},...claims.map(a=>({...a,label:claimLabel[a.kind]}))];rows.forEach((r,i)=>{const y=Y+i*2.6;if(i)line(R,y-.3,W);text(r.label,R,y,4.7,.7,9,c['text-muted'],true);text(r.title,6.2,y,26,1.2,13,c.text,true);text(r.text,6.2,y+1.3,26,1,10.5,c['text-secondary']);});takeaway();break;
   }
   default:throw new Error(`Unsupported project recipe: ${slide.type}`);
  }
 }
 if(S){if(S.logo)nodes.push(S.logo);return {width:33.867,height:19.05,background:S.background,nodes};}
 nodes.push({kind:'brand',...g.logo,text:theme.brand.id==='neutral'?'Framework':theme.brand.id,color:c.primary});
 return {width:33.867,height:19.05,nodes};
}
