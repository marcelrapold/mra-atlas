import {atlasContent} from './atlas-slide-content.mjs';
import {deckStage} from './deck-stage.mjs';
// One geometry model for the HTML reference and editable slide exports. Units: cm / pt.
export function slideScene(id, deck) {
 const S=deckStage(deck,id),c=S?.c??deck.colors, g=deck.layout, nodes=[];
 const rect=(x,y,w,h,fill)=>nodes.push({kind:'rect',x,y,w,h,fill});
 const text=(value,x,y,w,h,pt=10.5,color=c.text,bold=false)=>nodes.push(S?S.text({kind:'text',text:value,x,y,w,h,pt,color,bold}):{kind:'text',text:value,x,y,w,h,pt,color,bold});
 const title=deck.slides.find(s=>s.id===id)?.titel??id;
 if(S){
  // Deck contract: the surface carries the slide (fill, backdrop, supergraphic); titles go large.
  const cover=id==='cover-foto'||id==='foto-schluss',D=S.displayPt;
  if(cover){
   text(id==='cover-foto'?'MANAGEMENT-BRIEFING':'ABSCHLUSS',g.randLR,6.1,26,.6,11,c.primary,true);
   nodes.push(S.title({kind:'text',text:id==='cover-foto'?'Projektübersicht':'Fragen und nächste Schritte',x:g.randLR,y:6.9,w:28,h:4.6,pt:D,color:c.text,bold:true},true));
   text(id==='cover-foto'?'Musterinhalt · illustrative Beispieldaten':'Kontakt · Verantwortliche Person',g.randLR,11.7,26,1.2,16,c['text-secondary']);
   if(!S.background.path)text('Bildslot · eigenes Motiv gemäss Brand-Vorgaben',g.randLR,16.6,28,.8,11,c['text-muted']);
  } else if(id==='kapitel-trenner') {
   nodes.push(S.title({kind:'text',text:'01',x:g.randLR,y:3.6,w:12,h:3.6,pt:Math.round(D*1.4),color:c.primary,bold:true},'plain'));
   nodes.push(S.title({kind:'text',text:'Projektstand und Entscheidungen',x:g.randLR,y:8,w:28,h:4.6,pt:D,color:c.text,bold:true},true));
  } else {
   nodes.push(S.title({kind:'text',text:title,x:g.titel.x,y:g.titel.y,w:g.titel.w,h:g.titel.h,pt:30,color:c.text,bold:true}));
   text('Illustrative Beispieldaten · keine Aussagen über ein reales Projekt',g.lead.x,g.lead.y,g.lead.w,g.lead.h1zeilig,11.5,c['text-secondary']);
   nodes.push(S.rule(g.fusslinie.y));text('01',g.foliennummer.x,g.foliennummer.y,1.49,.85,10,c.text,true);text('Quelle: Framework-Beispieldaten · durch Projektbelege ersetzen',g.quellzeile.x,g.quellzeile.y,30.23,.635,8,c['text-muted']);
   const content=atlasContent(id,deck);
   if(content) nodes.push(...content); else if(id==='agenda')['Ausgangslage','Ziele und Evidenz','Umsetzung','Entscheidungen'].forEach((v,i)=>{text(String(i+1).padStart(2,'0'),.93,4.4+i*2.6,2,1.6,24,c.primary,true);text(v,4,4.4+i*2.6,27,1.6,24,c.text,true);});
  }
  if(S.logo)nodes.push(S.logo);
  return {width:33.867,height:19.05,background:S.background,nodes};
 }

 rect(0,0,33.867,19.05,c.surface);
 if(id==='cover-foto'||id==='foto-schluss') {
  // The slot is explicit: consumers supply licensed photography; no invented brand imagery.
  rect(0,0,33.867,17.524,c.primary);text(id==='cover-foto'?'Projektübersicht':'Fragen und nächste Schritte',.93,1.2,26,3,30,c['on-color'],true);
  text(id==='cover-foto'?'Management-Briefing · Musterinhalt':'Kontakt · Verantwortliche Person',.93,4.1,26,2,24,c['on-color']);
  text('Bildslot · eigenes Motiv gemäss Brand-Vorgaben',.93,14.6,28,1.5,11,c['on-color']);
 } else if(id==='kapitel-trenner') {
  rect(0,0,33.867,17.524,c.primary);text('01',.93,2,8,2,26,c['on-color'],true);text('Projektstand und Entscheidungen',.93,7,27,4,30,c['on-color'],true);
 } else {
  text(title,g.titel.x,g.titel.y,g.titel.w,g.titel.h,30,c.text,true);
  text('Illustrative Beispieldaten · keine Aussagen über ein reales Projekt',g.lead.x,g.lead.y,g.lead.w,g.lead.h1zeilig,11.5,c['text-secondary']);
  rect(0,g.fusslinie.y,33.867,.079,c.primary);text('01',g.foliennummer.x,g.foliennummer.y,1.49,.85,10,c.text,true);text('Quelle: Framework-Beispieldaten · durch Projektbelege ersetzen',g.quellzeile.x,g.quellzeile.y,30.23,.635,8,c['text-muted']);
  const content=atlasContent(id,deck);
  if(content) nodes.push(...content); else switch(id) {
   case 'agenda': ['Ausgangslage','Ziele und Evidenz','Umsetzung','Entscheidungen'].forEach((v,i)=>{text(String(i+1).padStart(2,'0'),.93,4.4+i*2.6,2,1.6,24,c.primary,true);text(v,4,4.4+i*2.6,27,1.6,24,c.text,true);});break;

  }
 }
 nodes.push({kind:'brand',x:29.905,y:.414,w:3.405,h:1.68,text:deck.brand.id==='neutral'?'Framework':deck.brand.id,color:['cover-foto','foto-schluss','kapitel-trenner'].includes(id)?c['on-color']:c.primary});
 return {width:33.867,height:19.05,nodes};
}
