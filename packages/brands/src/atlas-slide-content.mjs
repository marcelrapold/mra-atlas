// Content recipes for the Atlas sample decks. Coordinates retain the measured recipe.
// All numbers and project names here are illustrative demonstration data.
import {deckStage} from './deck-stage.mjs';
// Swiss grouping with a fixed ASCII apostrophe: ICU versions differ between the
// typographic and the straight form, and decks must be identical on every machine.
const ch=n=>n.toLocaleString('de-CH').replace(/’/g,"'");
export function atlasContent(id,deck){
 const S=deckStage(deck,id),c=S?.c??deck.colors,g=deck.layout,R=g.randLR,Y=g.inhalt.yStart,W=g.nutzbreite,P=g.shapes.karte.paddingL,T=g.shapes.karte.paddingT,n=[];
 const rect=(x,y,w,h,fill,shape='rect',lit=false)=>n.push(...S?S.rect({kind:'rect',x,y,w,h,fill,shape},{glow:lit}):[{kind:'rect',x,y,w,h,fill,shape}]);
 const text=(value,x,y,w,h,pt=10.5,color=c['text-secondary'],bold=false,align='left')=>n.push(S?S.text({kind:'text',text:value,x,y,w,h,pt,color,bold,align}):{kind:'text',text:value,x,y,w,h,pt,color,bold,align});
 const line=(x,y,w)=>rect(x,y,w,g.shapes.hairline.h,c.border);
 const col=(name,i)=>{const r=g.columns[name];return [r.xPositionen[i],Array.isArray(r.spaltenW)?r.spaltenW[i]:r.spaltenW];};
 const card=(x,y,w,h,heading,body,fill=c['surface-neutral'])=>{rect(x,y,w,h,fill);text(heading,x+P,y+(h<3?.3:T),w-2*P,h<3?.55:.85,h<3?11:13,c.text,true);if(body)text(body,x+P,y+(h<3?.94:1.7),w-2*P,h<3?.7:h-2,10.5,c['text-secondary']);};
 const chip=(x,y,value)=>{rect(x,y,.56,.56,c.primary,'ellipse');text(String(value),x,y+.05,.56,.44,8.5,c['on-color'],true,'center');};
 const pill=(x,y,value,fill=c.primary)=>{rect(x,y,2.4,.6,fill,deck.shape.cornerRadiusPx<=4?'rect':'roundRect');text(value,x+.1,y+.09,2.2,.4,8,c['on-color'],true,'center');};
 const bars=(rows,x,y,w,labelWidth=4.9)=>{const max=Math.max(...rows.map(r=>r[1]));rows.forEach(([label,value,color],i)=>{const by=y+i*1.15,bw=(w-labelWidth-3)*value/max;text(label,x,by-.1,labelWidth-.2,.65,10.5,c.text,false,'right');rect(x+labelWidth,by,bw,.44,color);text(ch(value),x+labelWidth+bw+.18,by-.1,3,.65,10,c['text-secondary'],true);});};
 const comparison=(x,y,w,h)=>n.push((S?S.chart:v=>v)({kind:'chart',x,y,w,h,labels:['Nutzung','Personen','Aufrufe'],series:[{name:'Vorperiode',values:[5.24,2.89,15.74],color:c['chart-previous']},{name:'Aktuell',values:[5.01,2.76,14.68],color:c.primary}]}));
 switch(id){
 case 'management-summary':{
  const rows=[[c.primary,'Geliefert','Ein Baustein ist produktiv','Die Funktion steht den Nutzenden zur Verfügung.'],[c.success,'Verbessert','Ein Messwert hat sich erholt','Vergleich und Zeitraum machen die Änderung prüfbar.'],[c.warning,'Zu klären','Eine Abhängigkeit ist offen','Die zuständige Person klärt die Voraussetzung.'],[c['chart-2'],'Unterwegs','Die nächste Etappe ist terminiert','Der nächste Liefertermin steht im Projektplan.'],[c.danger,'Risiko','Eine Frist braucht einen Entscheid','Der Entscheid bestimmt den weiteren Ablauf.']];
  rows.forEach(([color,label,title,body],i)=>{const y=Y+i*1.98;if(i)line(R,y-.3,W);rect(R,y+.1,.19,1.47,color);text(label,R+.6,y,3.6,.5,9.5,color,true);text(title,R+4.5,y,12.5,.7,13,c.text,true);text(body,R+17.6,y,14.4,1.4);});card(R,Y+10,32,2.6,'Woran heute entschieden wird','Entscheid E1: Frist     Auftrag A1: Verantwortung     Offen O1: Rückfrage',c['surface-info']);break;
 }
 case 'karten-steckbrief':{
  ['Projektquelle','Unabhängige Gegenprobe','Betriebsquelle'].forEach((name,i)=>{const[x,w]=col('drei',i);card(x,Y,w,6.1,name,'',i===0?c['surface-info']:c['surface-neutral']);['Rolle','Schnittstelle','Messpunkt'].forEach((label,j)=>{const y=Y+1.7+j*1.35;text(label.toUpperCase(),x+P,y,w-2*P,.42,8,c['text-muted'],true);text(['Fachliche Evidenz','Versionierte API','Dokumentierter Abruf'][j],x+P,y+.42,w-2*P,.7);});});
  card(R,11.2,W,1.9,'Steht fest','Ein belegter Befund bildet die gemeinsame Ausgangslage.',c['surface-info']);card(R,13.5,W,1.9,'Noch zu klären','Fehlende Angaben werden mit Verantwortung nachgeführt.');break;
 }
 case 'zwei-grosskarten':{
  for(let i=0;i<2;i++){const[x,w]=col('zweiGleich',i);card(x,Y,w,12.6,i?'Das Ziel, gedeutet':'Die Ausgangslage, belegt','',i?c['surface-neutral']:c['surface-info']);const pairs=i?[['Fähigkeit','Ein abgestimmter Ablauf'],['Erfolgskriterium','Ein messbarer Effekt'],['Voraussetzung','Schulung und Betriebsübergabe'],['Unsicherheit','Übergangsbetrieb bleibt zu prüfen']]:[['Verfahren heute','Drei getrennte Abläufe'],['Aufwand pro Fall','40 Minuten · Beispiel'],['Fehlerquote','4,8 % · Beispiel'],['Datenstand','Abrufdatum und Beleg']];pairs.forEach(([a,b],j)=>{text(a.toUpperCase(),x+P,Y+1.8+j*1.65,w-2*P,.45,8,c['text-muted'],true);text(b,x+P,Y+2.3+j*1.65,w-2*P,.8,11,c.text);});text(i?'Ziel und Annahmen sind ausdrücklich als Deutung gekennzeichnet.':'Alle Werte sind Beispieldaten, durch Projektbelege zu ersetzen.',x+P,Y+9.8,w-2*P,1.8,10.5,c['text-secondary'],true);}break;
 }
 case 'modul-karten-mit-chart':{
  const rows=[['M1',8412,c.primary],['M2',5204,c['chart-2']],['M3',1874,c.warning]];
  rows.forEach(([name,,color],i)=>{const[x,w]=col('drei',i);card(x,Y,w,3.6,'Modul '+name,'Ein Satz zum Zweck des Moduls.');pill(x+w-P-2.4,Y+T,String(name),color);});text('Nutzung pro Monat',R,8.67,18.8,.65,12.5,c.text,true);bars(rows,R,9.57,18.8);card(20.45,8.67,12.497,5.6,'Einordnung','Modul M1 trägt den grössten Anteil. Die Balken zitieren die Farben der Modulkennzeichnung.',c['surface-info']);break;
 }
 case 'phasen-karten-gate':{
  ['Vorbereiten','Aufbauen','Erproben','Betreiben'].forEach((name,i)=>{const[x,w]=col('vier',i);card(x,Y,w,6.65,`Q${i+1} · ${name}`,'Ergebnis der Phase\nVerantwortung\nDokumentierter Termin',i===3?c['surface-info']:c['surface-neutral']);});rect(R,Y+7.25,W,5.2,c['surface-info']);text('Das Gate vor Q4',R+P,Y+7.7,28,.7,13,c.primary,true);['Der Probelauf erreicht das vereinbarte Erfolgskriterium.','Die Betriebsübergabe ist dokumentiert und abgenommen.','Ein Rückweg ist beschrieben, falls die Abnahme scheitert.'].forEach((v,i)=>{chip(R+P,Y+8.45+i*.88,i+1);text(v,R+P+.95,Y+8.47+i*.88,W-2*P-1.2,.65);});break;
 }
 case 'quellen-grid':{
  for(let i=0;i<6;i++){const x=R+i%3*10.8,y=Y+Math.floor(i/3)*5.55;rect(x,y,10.41,5.2,c['surface-neutral']);for(let j=0;j<2;j++){text(`Quelle ${i+1}.${j+1}`,x+P,y+T+j*1.85,9.1,.5,9.5,c.text,true);text('System-ID · Zeitraum · Abrufdatum',x+P,y+T+.5+j*1.85,9.1,.5,8.5);text('Repository / Commit / Dateipfad',x+P,y+T+1+j*1.85,9.1,.5,8.5,c.primary);}}rect(R,15.57,W,1.02,c['surface-info']);text('Alle Belege sind versioniert und auf die jeweiligen Aussagen zurückführbar.',R+P,15.81,W-2*P,.6,10.5,c.text,true);break;
 }
 case 'kpi-board':{
  const kpis=[['5,01 Mio.','Nutzung','−4,4 %'],['2,76 Mio.','Personen','−4,5 %'],['14,68 Mio.','Aufrufe','−6,7 %'],['2,93','Tiefe','−2,4 %'],['50,7 %','Absprung','+1,6 pp']];
  kpis.forEach(([value,label,delta],i)=>{const[x,w]=col('fuenf',i);rect(x,Y,w,3.45,c['surface-info'],'rect',i===0);text(value,x+.45,Y+.25,w-.9,1.35,25,c.primary,true);text(label,x+.45,Y+1.75,w-.9,.6,10.5);text(delta+' ggü. Vorperiode',x+.45,Y+2.48,w-.9,.6,9,c['text-secondary'],true);});text('Periodenvergleich in Millionen',R,8.45,18.8,.7,12.5,c.text,true);comparison(R,9.5,18.796,6.8);card(20.45,8.45,12.497,7.95,'Einordnung','Die Kacheln stehen über dem Detailchart. Jede Kennzahl trägt einen Vergleichsanker. Die Deutung bleibt räumlich von der Evidenz getrennt.');break;
 }
 case 'kpi-timeline':{
  ['24','18','7','170'].forEach((value,i)=>{const[x,w]=col('vier',i);rect(x,Y,w,3.61,i===1?c.primary:c['surface-info'],'rect',i===1);text(value,x+P,Y+T,w-2*P,1.5,40,i===1?c['on-color']:c.primary,true);text(['Module','Typen','Layouts','Belege'][i],x+P,Y+T+1.85,w-2*P,.7,10.5,i===1?c['on-color']:c.text);});rect(1.95,Y+8.6,29.97,.09,c.border);['Jan','Mär','Mai','Jul','Heute','Okt','Dez'].forEach((label,i)=>{const x=2.6+i*4.65,dm=i===4?.66:.48,color=i===4?c.signal:i<4?c['chart-previous']:c.primary;rect(x-dm/2,Y+8.645-dm/2,dm,dm,color,'ellipse');text(label,x-1.9,Y+7.55,3.8,.6,11.5,i===4?c.signal:c.text,true,'center');text(i===4?'Review':`Etappe ${i+1}`,x-1.9,Y+9.25,3.8,.6,9.5,c['text-muted'],false,'center');});break;
 }
 case 'textbox-tabelle':{
  const cols=[['KENNZAHL',R,7.6,'left'],['VORPERIODE',9,4.2,'right'],['AKTUELL',13.6,4.2,'right'],['ÄNDERUNG',18.2,5.2,'right']];cols.forEach(([t,x,w,a])=>text(t,x,Y,w,.5,8.5,c['text-muted'],true,a));line(R,Y+.55,22.4);const rows=[['Nutzung',5240000,5010000],['Personen',2890000,2760000],['Aufrufe',15740000,14680000],['Anfragen',812204,848551]];rows.forEach(([label,prev,now],i)=>{const y=Y+.8+i*1.17;if(i===2)rect(R-.3,y-.2,23,1.02,c['surface-info']);text(label,R,y,7.6,.65,11,c.text,i===2);text(ch(prev),9,y,4.2,.65,11,c['text-secondary'],false,'right');text(ch(now),13.6,y,4.2,.65,11,c.text,true,'right');text(((now/prev-1)*100).toFixed(1).replace('.',',').replace('-','−')+' %',18.2,y,5.2,.65,11,c['text-secondary'],true,'right');});line(R,Y+5.55,22.4);text('Total',R,Y+5.8,7.6,.65,11,c.text,true);[1,2].forEach((col,i)=>text(ch(rows.reduce((s,r)=>s+r[col],0)),9+i*4.6,Y+5.8,4.2,.65,11,c.text,true,'right'));card(24.6,Y,8.33,7.2,'Zahlen einordnen','Werte rechtsbündig. Veränderung neutral, echte Alarme separat. Exakte Werte und Vergleichsperiode bleiben sichtbar.',c['surface-info']);break;
 }
 case 'split-tabelle':{
  const rows=[['Bereich A',1912040,c.primary],['Bereich B',1204118,c['chart-2']],['Bereich C',641775,c.warning],['Übrige',310445,c['chart-previous']]];text('Bereiche nach Nutzung',R,Y,18.8,.65,12.5,c.text,true);bars(rows,R,Y+1.05,18.8);const y=Y+6.4;[['BEREICH',R,6.5],['AUFRUFE',8.4,4.6],['ANTEIL',13.6,4.4]].forEach(([label,x,w])=>text(label,x,y,w,.5,8.5,c['text-muted'],true,x===R?'left':'right'));line(R,y+.55,18);const sum=rows.reduce((s,r)=>s+r[1],0);rows.forEach(([label,v],i)=>{const ry=y+.8+i*1.17;text(label,R,ry,6.5,.65,11,c.text);text(ch(v),8.4,ry,4.6,.65,11,c.text,true,'right');text((v/sum*100).toFixed(1).replace('.',',')+' %',13.6,ry,4.4,.65,11,c['text-secondary'],false,'right');});card(20.45,Y,12.497,6,'Der Bereich mit dem grössten Anteil','Die Aussage bezieht sich auf die Evidenz links. Keine zusätzlichen unbelegten Zahlen in der Einordnung.',c['surface-info']);card(20.45,Y+6.5,12.497,5.4,'Noch zu klären','Messlücken, Sondereffekte und Vergleichsbrüche bleiben sichtbar.');break;
 }
 case 'drei-schritt-beweis':{
  const values=[['Die Meldung','+312 %','Die ursprünglich gemeldete Zahl.'],['Die Ursache','Zählweise','Ein Messwechsel erklärt den Sondereffekt.'],['Die geprüfte Zahl','+4,6 %','Bereinigter Wert mit Rechenweg im Anhang.']];values.forEach(([label,value,body],i)=>{const[x,w]=col('drei',i);rect(x,Y,w,5.3,i===2?c['surface-info']:c['surface-neutral']);chip(x+P,Y+T,i+1);text(label,x+P+.95,Y+T+.06,w-2*P-1,.65,9,c['text-muted'],true);text(value,x+P,Y+T+1,w-2*P,1.3,26,i===0?c.signal:c.text,true);text(body,x+P,Y+T+2.35,w-2*P,1.8,10);});text('Verlauf mit und ohne Sondereffekt',R,Y+6.2,18.8,.65,12.5,c.text,true);n.push((S?S.chart:v=>v)({kind:'linechart',labels:['Jan','Feb','Mär','Apr','Mai','Jun','Jul'],x:R,y:Y+7.2,w:17.5,h:4.5,series:[{name:'gemeldet',values:[0,.15,.28,.42,2.65,.95,.8],color:c.primary},{name:'bereinigt',values:[0,.12,.25,.38,.52,.63,.72],color:c['chart-previous']}]}));card(20.45,Y+7.1,12.497,4.6,'Unabhängige Gegenproben','Zweite Quelle, konsistente Messung und explizite Restunsicherheit.');break;
 }
 case 'shape-balkendiagramm':bars([['Bereich A',82,c.primary],['Bereich B',64,c['chart-previous']],['Bereich C',51,c['chart-2']],['Bereich D',38,c.warning],['Bereich E',24,c['chart-previous']]],R,Y+1,W,7);card(R,12.3,W,3.6,'Einordnung','Werte stehen am Balkenende, Kategorien teilen dieselbe Nulllinie.',c['surface-info']);break;
 case 'vollbild-grafik':{
  text('Roadmap aus strukturierten Beispieldaten',R,Y,32,.8,13,c.text,true);const x=6.5,y=6.4,cw=2.1;Array.from({length:12},(_,i)=>text(String(i+1).padStart(2,'0'),x+i*cw,5.5,cw,.7,9,c['text-secondary'],false,'center'));[['Analyse',0,3],['Konzeption',2,4],['Umsetzung',5,5],['Betrieb',9,3]].forEach(([name,start,length],i)=>{const yy=y+i*2.1;rect(R,yy-.2,W,1.7,c['surface-neutral']);text(name,R+.3,yy+.2,5,.7,11,c.text,true);rect(x+start*cw,yy+.2,length*cw,1,c.primary);});rect(x+6*cw,5.8,.04,9.6,c.signal);text('Heute',x+6*cw-1,15.8,2,.7,10,c.signal,true,'center');break;
 }
 case 'entscheid-register':{
  const rows=[['E1','ENTSCHEID','Die nächste Phase freigeben','Begründung, Wirkung und Tragweite des Beschlusses.'],['A1','AUFTRAG','Die Abhängigkeit klären','Verantwortung und Termin sind ausdrücklich festgehalten.'],['A2','AUFTRAG','Die Betriebsübergabe vorbereiten','Abnahmekriterien bilden die Grundlage der Übergabe.'],['O1','ZU KLÄREN','Die offene Frage beantworten','Fehlender Beleg wird sichtbar nachgeführt.']];rows.forEach(([ref,badge,title,body],i)=>{const y=Y+i*2.65;if(i)line(R,y-.3,W);text(ref,R,y,1.5,.6,11,c['text-muted'],true);pill(2.9,y,badge,i===0?c.danger:c.warning);text(title,6.2,y,26,.7,12.5,c.text,true);text(body,6.2,y+.95,26,.85,10);});break;
 }
 default:return null;
 }
 return n;
}
