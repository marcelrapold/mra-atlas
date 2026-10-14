'use client';
import {useRef,useState} from 'react';
import {Button,Field,FieldLabel,Textarea} from '@rapold/framework-core';
import {mermaidPalette} from '../../../../packages/brands/src/mermaid-theme.mjs';
import {useActiveBrand} from './framework-shell';
import {mermaidExamples} from './mermaid-examples';
import MermaidDiagram from './mermaid-diagram';

export default function MermaidShowcase() {
  const {brand,mode}=useActiveBrand();
  const examples=mermaidExamples(brand);
  const initial='flowchart LR\n  Auftrag[Projektauftrag] --> Analyse[Belegte Aussagen]\n  Analyse --> Entscheid[Entscheidung]\n  Entscheid --> Umsetzung[Umsetzung]';
  const [draft,setDraft]=useState(initial),[rendered,setRendered]=useState(initial),[selected,setSelected]=useState('');
  const editor=useRef<HTMLTextAreaElement>(null);
  const edit=(id:string)=>{
    const example=examples.find(item=>item.id===id);if(!example)return;
    setSelected(id);setDraft(example.code);setRendered(example.code);
    editor.current?.focus({preventScroll:true});
    document.getElementById('editor')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  };
  return <>
    <nav className="page-anchors" aria-label="Auf dieser Seite">{examples.map(e=><a href={`#${e.id}`} key={e.id}>{e.title}</a>)}<a href="#editor">Editor</a><a href="#verwendung">Verwendung</a></nav>
    <p className="muted">Alle Beispiele werden automatisch gerendert. Öffne ein Diagramm per Klick im Vollbild. Brand und Darstellung oben steuern Farben und Schrift gemeinsam.</p>
    {examples.map(e=><section className="doc-section" id={e.id} key={e.id}><h2>{e.title}</h2><p>{e.description}</p><MermaidDiagram code={e.code} label={e.title} filename={e.id} onEdit={()=>edit(e.id)}/></section>)}
    <section className="doc-section" id="editor"><h2>Eigene Diagramme</h2><p>Ein Beispiel übernehmen oder eigenen Mermaid-Code eingeben. «Diagramm rendern» übernimmt deine Änderungen in die Vorschau.</p>
      <div className="mermaid-editor-controls"><label htmlFor="mermaid-example">Beispiel</label><select id="mermaid-example" value={selected} onChange={e=>edit(e.target.value)}><option value="">Eigene Definition</option>{examples.map(e=><option value={e.id} key={e.id}>{e.title}</option>)}</select></div>
      <Field className="mt-3"><FieldLabel>Diagrammdefinition</FieldLabel><Textarea ref={editor} className="font-mono" value={draft} spellCheck={false} onChange={e=>{setDraft(e.target.value);setSelected('');}}/></Field>
      <div className="demo-row"><Button disabled={!draft.trim()} onClick={()=>setRendered(draft)}>Diagramm rendern</Button><span className="muted" role="status">{draft!==rendered?'Änderungen noch nicht gerendert.':`${brand.name} · ${mode==='dark'?'Dunkel':'Hell'}`}</span></div>
      <MermaidDiagram code={rendered} label="Eigenes Diagramm" filename="diagramm"/>
    </section>
    <section className="doc-section" id="verwendung"><h2>Verwendung</h2><p>Das Basis-Theme steuert Knoten und Kanten, Sequenzen, Notizen, Kategorien und Torten separat. Die SVG-Vermessung und das sichtbare Diagramm verwenden dieselbe geladene Schrift.</p>
      <pre><code>{`await document.fonts.ready;
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'base',
  look: 'classic',
  fontFamily,
  themeVariables: mermaidTheme(brand, mode, fontFamily),
  themeCSS: mermaidThemeCSS(brand, mode),
  flowchart: { wrappingWidth: 260, padding: 10 }
});
const { svg } = await mermaid.render(id, code, container);`}</code></pre>
      <p>Bei mehreren Diagrammen laufen Initialisierung und Rendern nacheinander. Dadurch überschreibt ein Brand-Wechsel keine laufende Vermessung. Der Messcontainer bleibt vermessbar und erbt die aktive Schrift.</p>
      <h3>Kategorienpalette · {brand.name}</h3><p>Zwölf Flächen mit weissen Beschriftungen und mindestens 4,5:1 Textkontrast. Die Werte bleiben in beiden Darstellungen gleich; Flächen, Linien und Begleittexte wechseln mit dem Modus.</p>
      <div className="mermaid-palette">{mermaidPalette(brand).map((color,i)=><div key={i}><span style={{background:color,color:'#fff'}}>{i+1}</span><code>{color}</code></div>)}</div>
      <div className="data-table"><table><thead><tr><th>Diagrammtyp</th><th>Stand</th></tr></thead><tbody>{[['Flowchart','Vollständig thematisiert · zwei Beispiele'],['Sequence','Akteure, Signale, Schleifen und Notizen · Beispiel'],['Timeline','Zwölf Kategorien · Beispiel'],['Pie','Zwölf Segmente, Werte und Legende · Beispiel'],['Journey / GitGraph','Paletten vorbereitet; noch keine eigene Abnahme'],['Weitere Mermaid-Typen','Im Editor verfügbar; keine vollständige Brand-Abnahme']].map(([type,status])=><tr key={type}><td>{type}</td><td>{status}</td></tr>)}</tbody></table></div>
      <div className="download-row"><a href={`/brands/${brand.id}/mermaid.${mode}.json`}>Theme als JSON</a><a href="/contracts/mermaid.md">Verwendungsregeln</a><a href="https://github.com/marcelrapold/mra-atlas/blob/main/packages/brands/src/mermaid-theme.mjs">Theme-Quelle</a></div>
    </section>
  </>;
}
