'use client';
import {useState} from 'react';
import {Button,Input,Label,Checkbox,Lightbox} from '@rapold/framework-core';
import {Download,Plus,Trash2,Copy} from 'lucide-react';
import {renderOrgchart,toPublicData,toJsonLd,renderZustaendigkeiten,type OrgData} from '../../../../packages/brands/src/orgchart.mjs';
import {useActiveBrand} from './framework-shell';

const initial:OrgData={
 title:'Organisation und Zusammenarbeit',asOf:'September 2026',legend:'Illustrative Beispieldaten',
 direction:{name:'Geschäftsleitung',head:'Beispiel: Alex Muster'},
 departments:[
  {name:'Produkt',head:'Beispiel: Robin Muster',desc:['Strategie und Kundenbedürfnisse'],members:['Produktmanagement','Design']},
  {name:'Entwicklung',head:'Beispiel: Kim Muster',desc:['Plattform und Anwendungen'],members:['Frontend','Backend','Qualitätssicherung']},
  {name:'Betrieb',head:'Beispiel: Sam Muster',desc:['Verfügbarkeit und Service'],members:['Infrastruktur','Service Desk']},
  {name:'Unternehmensdienste',head:'Beispiel: Toni Muster',desc:['Organisation und Steuerung'],members:['Finanzen','Personal']},
 ],
};
const governance={title:'Zuständigkeiten und Arbeitsteilung',asOf:'Illustratives Modell',extern:[{name:'Auftraggeber',sub:'Ziele und Freigabe',desc:['Prioritäten und Rahmenbedingungen']},{name:'Nutzervertretung',sub:'Bedürfnisse und Feedback',desc:['Anforderungen und Abnahme']}],verbund:[{name:'Programmsteuerung',sub:'Entscheidung und Verantwortung',emphasis:true},{name:'Produktteams',sub:'Konzeption und Umsetzung'},{name:'Betrieb und Partner',sub:'Service und Weiterentwicklung'}]};
function download(data:string,name:string,type:string){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

export default function OrgchartEditor(){
 const {brand}=useActiveBrand();
 const [data,setData]=useState(initial),[selected,setSelected]=useState(0),[publicView,setPublicView]=useState(false),[monochrome,setMonochrome]=useState(true),[descriptions,setDescriptions]=useState(true),[message,setMessage]=useState('');
 // Raw textarea text per department and field, so Enter can open a new, still empty line.
 const [drafts,setDrafts]=useState<Record<string,string>>({});
 const draft=(field:'desc'|'members',list:string[])=>drafts[`${selected}:${field}`]??list.join('\n');
 const department=data.departments[selected];
 const options={primary:brand.modes.light.primary,font:brand.typography.family,monochrome,omitDesc:!descriptions,responsive:true,text:brand.modes.light.foreground};
 const visible=publicView?toPublicData(data):data;
 const svg=renderOrgchart(visible,options);
 const embedSvg=renderOrgchart(visible,{...options,omitTitle:true});
 const jsonLd=JSON.stringify(toJsonLd(visible)).replaceAll('<','\\u003c');
 const embed=`<figure style="margin:0">${embedSvg}</figure>\n<script type="application/ld+json">${jsonLd}</script>`;
 function change(field:string,value:string){if(field==='desc'||field==='members')setDrafts(previous=>({...previous,[`${selected}:${field}`]:value}));setData(previous=>({...previous,departments:previous.departments.map((d,i)=>i===selected?{...d,[field]:field==='desc'||field==='members'?value.split('\n').map(line=>line.trim()).filter(Boolean):value}:d)}));}
 async function copy(){try{await navigator.clipboard.writeText(embed);setMessage('HTML-Snippet kopiert.');}catch{setMessage('Kopieren nicht verfügbar. Das Snippet als HTML herunterladen.');}}
 return <>
  <div className="notice">Lokaler Editor mit illustrativen Daten. Vorschau und SVG-Export verwenden denselben Renderer.</div>
  <div className="org-options"><label><Checkbox checked={publicView} onCheckedChange={v=>setPublicView(v===true)}/>Ohne Personen und Team</label><label><Checkbox checked={monochrome} onCheckedChange={v=>setMonochrome(v===true)}/>Einfarbig</label><label><Checkbox checked={descriptions} onCheckedChange={v=>setDescriptions(v===true)}/>Mit Aufgaben</label></div>
  <Lightbox label="Organigramm"><div className="org-preview" dangerouslySetInnerHTML={{__html:svg}}/></Lightbox>
  <div className="download-row"><Button variant="outline" onClick={()=>download(renderOrgchart(visible,{...options,responsive:false}),'organigramm.svg','image/svg+xml')}><Download size={16}/>SVG</Button><Button variant="outline" onClick={()=>download(JSON.stringify(visible,null,2),'organigramm.json','application/json')}>Daten · JSON</Button><Button variant="outline" onClick={copy}><Copy size={16}/>HTML-Snippet</Button><Button variant="outline" onClick={()=>download(embed,'organigramm.html','text/html')}>HTML herunterladen</Button></div><p role="status">{message}</p>
  <div className="org-editor-grid">
   <section className="demo-panel org-fields"><h2>Organisation</h2><Label htmlFor="org-title">Titel</Label><Input id="org-title" maxLength={75} value={data.title} onChange={e=>setData({...data,title:e.target.value})}/><Label htmlFor="org-date">Datenstand</Label><Input id="org-date" maxLength={45} value={data.asOf} onChange={e=>setData({...data,asOf:e.target.value})}/><Label htmlFor="org-direction">Oberste Einheit</Label><Input id="org-direction" maxLength={30} value={data.direction.name} onChange={e=>setData({...data,direction:{...data.direction,name:e.target.value}})}/><Label htmlFor="org-head">Leitung</Label><Input id="org-head" maxLength={36} value={data.direction.head} onChange={e=>setData({...data,direction:{...data.direction,head:e.target.value}})}/></section>
   <section className="demo-panel org-fields"><h2>Abteilungen</h2><label htmlFor="org-department">Einheit bearbeiten</label><select id="org-department" value={selected} onChange={e=>setSelected(Number(e.target.value))}>{data.departments.map((d,i)=><option key={i} value={i}>{d.name||`Abteilung ${i+1}`}</option>)}</select><Label htmlFor="dept-name">Bezeichnung</Label><Input id="dept-name" maxLength={32} value={department.name} onChange={e=>change('name',e.target.value)}/><Label htmlFor="dept-head">Leitung</Label><Input id="dept-head" maxLength={36} value={department.head} onChange={e=>change('head',e.target.value)}/><Label htmlFor="dept-desc">Aufgaben · eine pro Zeile</Label><textarea id="dept-desc" className="code-editor" value={draft('desc',department.desc)} onChange={e=>change('desc',e.target.value)}/><Label htmlFor="dept-team">Team · ein Eintrag pro Zeile</Label><textarea id="dept-team" className="code-editor" value={draft('members',department.members)} onChange={e=>change('members',e.target.value)}/><div className="demo-row"><Button disabled={data.departments.length>=8} onClick={()=>{setSelected(data.departments.length);setData({...data,departments:[...data.departments,{name:'Neue Abteilung',head:'',desc:[],members:[]}]});}}><Plus size={16}/>Abteilung</Button><Button variant="outline" disabled={data.departments.length<=1} onClick={()=>{setData({...data,departments:data.departments.filter((_,i)=>i!==selected)});setSelected(Math.max(0,selected-1));}}><Trash2 size={16}/>Entfernen</Button></div></section>
  </div>
  <section className="doc-section"><h2>Zuständigkeiten</h2><p>Eine zweite Struktur zeigt externe Beteiligte, Steuerung, Umsetzung und Betrieb. Die Beziehungen werden aus strukturierten Daten gerendert.</p><Lightbox label="Zuständigkeiten"><div className="org-preview governance-preview" dangerouslySetInnerHTML={{__html:renderZustaendigkeiten(governance,options)}}/></Lightbox><div className="download-row"><Button variant="outline" onClick={()=>download(renderZustaendigkeiten(governance,{...options,responsive:false}),'zustaendigkeiten.svg','image/svg+xml')}>SVG herunterladen</Button></div></section>
  <section className="doc-section"><h2>Einbetten und aktualisieren</h2><p>Das HTML enthält das Diagramm mit lesbarem Text und die Organisation als JSON-LD. Die Auswahl «Ohne Personen und Team» gilt auch für alle Exporte. Das Snippet ist eine statische Fassung; nach Änderungen erneut exportieren. Das Diagramm verwendet die helle Brand-Darstellung als portable Dokumentfläche.</p></section>
 </>;
}
