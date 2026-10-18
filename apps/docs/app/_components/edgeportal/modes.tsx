'use client';

// Bühne: Ansichten. Nachbau aus mra-edgeportal @ e46563c: components/stage/stage-view.tsx (Terminals, Fokus, Stack,
// Lade-, Leer- und Fehlerzustände), agent-card.tsx, terminal-pane.tsx, hermes-stack.tsx (mit lib/hermes-stack.ts) und
// argus-view.tsx. Markup und Klassen folgen dem Produkt, die Styles kommen aus den Kopien in brands/rapold/edgeportal/tv.
// Alle Daten sind neutrale Beispiele; die Terminalzeilen sind erfunden und nutzen die ANSI-Farben aus lib/ansi.ts nur als Farbe.
import type {ReactNode} from 'react';
import {Footprints, Shield} from 'lucide-react';
import '../../../../../brands/rapold/edgeportal/tv/argus.css';
import '../../../../../brands/rapold/edgeportal/tv/stage.css';
import '../../../../../brands/rapold/edgeportal/tv/hermes-stack.css';
import {AEON, AETHRA, MORE_AGENTS, LEVEL, AgentCard, Avatar, RadioPanel, Stage, StateChip, css, placeholder, signet, type DemoAgent, type ViewEntry} from './shared';

const AREA = 'Bühne: Ansichten';
const [VELA, ORIN, LYRA, KAEL] = MORE_AGENTS as [DemoAgent, DemoAgent, DemoAgent, DemoAgent];

/* ---------- Terminal (terminal-pane.tsx) ---------- */

/** DEFAULT-Palette aus lib/ansi.ts. Hermes kann sie je Marke überschreiben; Atlas zeigt die Grundwerte. */
const ANSI = {
  black: '#6E7A8A', red: '#FB7185', green: '#34D399', yellow: '#FBBF24', blue: '#38B8FF', magenta: '#A28AFF',
  cyan: '#42D6EC', white: '#EDF5FF', brightBlack: '#6B7C95', brightRed: '#DE9CB0', brightGreen: '#5DDCBD',
  brightYellow: '#DECF71', brightBlue: '#5FCBFF', brightMagenta: '#A4ADFF', brightCyan: '#66DEF3', brightWhite: '#F8FBFF',
};
type AnsiName = keyof typeof ANSI;
type Run = {text: string; fg?: AnsiName; bold?: boolean; dim?: boolean};
type Pane = {lines: Run[][]; width: number};
const TONE: Record<string, AnsiName> = {k: 'brightBlack', r: 'red', g: 'green', y: 'yellow', b: 'blue', m: 'magenta', c: 'cyan', w: 'brightWhite'};

/** Eine erfundene Terminalzeile in Kurzschrift: «[g]grün[/] normal», [*] fett, [~] gedimmt, [/] zurück. */
function line(source: string): Run[] {
  const runs: Run[] = [];
  let fg: AnsiName | undefined, bold = false, dim = false;
  for (const part of source.split(/(\[[krgybmcw*~\/]\])/)) {
    const tag = /^\[([krgybmcw*~\/])\]$/.exec(part)?.[1];
    if (tag === '/') { fg = undefined; bold = false; dim = false; }
    else if (tag === '*') bold = true;
    else if (tag === '~') dim = true;
    else if (tag) fg = TONE[tag];
    else if (part) runs.push({text: part, fg, bold, dim});
  }
  return runs;
}
const pane = (width: number, lines: string[]): Pane => ({width, lines: lines.map(line)});

const AEON_LINES = [
  '[k]~/projekt[/] [b]›[/] Wochenbericht aus den Notizen erstellen',
  '[c]●[/] Lese die Notizen der Woche',
  '[k]  └ notizen/montag.md … notizen/sonntag.md · 12 Dateien[/]',
  '[c]●[/] Ordne Termine, Entscheide und offene Punkte',
  '[k]  └ 9 Termine · 4 Entscheide · 6 offene Punkte[/]',
  '[c]●[/] Schreibe berichte/woche-42.md',
  '[g]  ✓ Entwurf gespeichert · 1240 Wörter[/]',
  '',
  '[k]~/projekt[/] [b]›[/] npm test',
  '[k]> projekt@1.4.0 test[/]',
  '[k]> node --test[/]',
  '',
  '[g]✔[/] bericht › gliedert nach Wochentag [k](3 ms)[/]',
  '[g]✔[/] bericht › fasst offene Punkte zusammen [k](2 ms)[/]',
  '[g]✔[/] bericht › verlinkt jede Quelle [k](4 ms)[/]',
  '[g]✔[/] termine › erkennt Überschneidungen [k](6 ms)[/]',
  '[g]✔[/] termine › sortiert nach Beginn [k](1 ms)[/]',
  '[g]✔[/] notizen › überspringt leere Dateien [k](1 ms)[/]',
  '[b]ℹ[/] tests 6',
  '[b]ℹ[/] pass 6',
  '[b]ℹ[/] fail 0',
  '[b]ℹ[/] duration_ms 214',
  '',
  '[c]●[/] Tests grün. Sortiere offene Punkte nach Dringlichkeit',
  '[y]  ◆ 2 Punkte brauchen diese Woche eine Entscheidung[/]',
  '[k]  └ 4 Punkte können warten[/]',
  '[c]●[/] Aktualisiere berichte/woche-42.md',
  '[g]  ✓ Gespeichert[/]',
  '',
  '[k]~/projekt[/] [b]›[/] [*]▍[/]',
];
const AETHRA_LINES = [
  '[k]~/kalender[/] [m]›[/] Termine der nächsten Woche abgleichen',
  '[c]●[/] Lese kalender/naechste-woche.ics',
  '[k]  └ 14 Einträge · 2 Überschneidungen[/]',
  '[y]◆[/] Dienstag 10:00 · Planung und Werkstatt überschneiden sich',
  '[c]●[/] Prüfe freie Zeiten am Dienstag',
  '[k]  └ frei: 08:00–09:30 · 13:30–17:00[/]',
  '[c]●[/] Vorschlag: Werkstatt auf 14:00 verschieben',
  '[y]◆[/] Donnerstag 16:00 · zwei Termine am selben Ort',
  '[c]●[/] Zusammenlegen möglich, beide 30 min',
  '[c]●[/] Entwerfe Antworten in entwuerfe/',
  '[g]  ✓ entwuerfe/dienstag.md[/]',
  '[g]  ✓ entwuerfe/donnerstag.md[/]',
  '',
  '[k]~/kalender[/] [m]›[/] kalender pruefen --woche 43',
  '[g]✔[/] keine Überschneidung nach Vorschlag',
  '[g]✔[/] alle Termine mit Ort [k](14 von 14)[/]',
  '[y]![/] 1 Termin ohne Dauer · Freitag 09:00',
  '',
  '[c]●[/] Ergänze Dauer: 60 min [k](Standard)[/]',
  '[g]  ✓ kalender/naechste-woche.ics aktualisiert[/]',
  '[y]?[/] Verschiebung am Dienstag bestätigen? [~][k]Antwort im Leitstand[/]',
  '',
  '[k]~/kalender[/] [m]›[/] [*]▍[/]',
];
const VELA_LINES = [
  '[k]~/recherche[/] [g]›[/] Quellen für den Gerätevergleich sammeln',
  '[c]●[/] Suche in drei Katalogen',
  '[k]  └ 41 Treffer · 12 passend[/]',
  '[c]●[/] Lese Datenblätter',
  '[k]  └ 8 von 12 gelesen[/]',
  '[c]●[/] Lege Tabelle an: vergleich/geraete.csv',
  '[g]  ✓ 8 Zeilen · 6 Spalten[/]',
  '[r]✖[/] datenblatt-09.pdf nicht lesbar [k](leere Datei)[/]',
  '[c]●[/] Überspringe und lese weiter …',
];
const CHECKS = ['bericht › gliedert nach Wochentag', 'bericht › fasst offene Punkte zusammen', 'bericht › verlinkt jede Quelle',
  'bericht › nennt Entscheide mit Datum', 'bericht › kürzt lange Notizen', 'bericht › hält die Reihenfolge ein', 'termine › erkennt Überschneidungen',
  'termine › sortiert nach Beginn', 'termine › rechnet Dauer in Minuten', 'termine › übernimmt den Ort', 'notizen › überspringt leere Dateien',
  'notizen › liest Überschriften', 'notizen › erkennt Aufgabenlisten', 'notizen › trennt Absätze', 'export › schreibt Markdown',
  'export › setzt das Datum in den Titel', 'export › überschreibt nur mit Rückfrage', 'export › legt den Ordner an'];
const AEON_LONG = [
  ...AEON_LINES.slice(0, 8),
  '[k]~/projekt[/] [b]›[/] npm run check',
  '[k]> projekt@1.4.0 check[/]',
  '[k]> npm run lint && npm test[/]',
  '',
  '[k]> projekt@1.4.0 lint[/]',
  '[g]✔[/] 23 Dateien geprüft, keine Befunde',
  '',
  '[k]> projekt@1.4.0 test[/]',
  '[k]> node --test[/]',
  '',
  ...CHECKS.map((name, index) => `[g]✔[/] ${name} [k](${1 + (index * 7) % 9} ms)[/]`),
  '[b]ℹ[/] tests 18',
  '[b]ℹ[/] suites 4',
  '[b]ℹ[/] pass 18',
  '[b]ℹ[/] fail 0',
  '[b]ℹ[/] duration_ms 388',
  '',
  ...AEON_LINES.slice(22),
];
const PANES: Record<string, Pane | null> = {aeon: pane(96, AEON_LINES), aethra: pane(96, AETHRA_LINES), vela: pane(80, VELA_LINES), orin: null};

/** Read-only terminal picture of one agent (tmux pane snapshot), as terminal-pane.tsx renders it. */
function TerminalPane({pane, rows = 16, size = 'normal', name, columns: shared}: {pane: Pane | null; rows?: number; size?: 'klein' | 'normal' | 'gross'; name?: string; columns?: number}) {
  const label = name ? `Terminal von ${name}, nur lesen` : 'Terminal, nur lesen';
  if (!pane) return <div className="stage-terminal stage-terminal-empty" role="region" aria-label={label}><span>Terminalbild wird geladen …</span></div>;
  const lines = [...pane.lines];
  while (lines.length && !lines[lines.length - 1].some(run => run.text.trim())) lines.pop();
  const shown = lines.slice(-rows);
  const widest = Math.max(0, ...shown.map(runs => runs.reduce((length, run) => length + run.text.length, 0)));
  const columns = Math.max(20, Math.min(240, Math.max(pane.width || widest || 80, shared ?? 0)));
  const offset = lines.length - shown.length;
  return <div className={`stage-terminal size-${size}`} style={css({'--cols': columns})} role="region" aria-label={label}>
    <pre>{shown.map((runs, index) => <div className="stage-terminal-line" key={offset + index}>
      {runs.map((run, i) => <span key={i} style={{color: run.fg && ANSI[run.fg], fontWeight: run.bold ? 650 : undefined, opacity: run.dim ? 0.8 : undefined}}>{run.text}</span>)}
      {'\n'}
    </div>)}</pre>
  </div>;
}

/** Agent grid of stage-view.tsx with optional terminal pictures (16 rows on the stage, 48 in the terminal view). */
function Grid({agents, view = 'buehne', poster = true, conversation = false, terminals = false, size = 'normal'}: {
  agents: DemoAgent[]; view?: 'buehne' | 'terminal'; poster?: boolean; conversation?: boolean; terminals?: boolean; size?: 'klein' | 'normal' | 'gross';
}) {
  // tmux panes differ in width; the widest one sets one font size for all cards.
  const columns = Math.max(0, ...agents.map(agent => PANES[agent.id]?.width ?? 0)) || undefined;
  return <div className={`stage-agents view-${view}`} data-count={Math.min(6, Math.max(1, agents.length))} style={css({'--count': Math.max(1, agents.length)})}>
    {agents.map(agent => <AgentCard key={agent.id} agent={agent} poster={poster} compact={view === 'terminal'} conversation={conversation && view !== 'terminal'}
      terminal={terminals || view === 'terminal' ? <TerminalPane pane={PANES[agent.id] ?? null} rows={view === 'terminal' ? 48 : 16} size={size} name={agent.name} columns={columns}/> : undefined}/>)}
  </div>;
}

/* ---------- Detail lines of the focus view and the stack (agent-card.tsx) ---------- */

const AUTONOMY_HINT = {fragt: 'fragt vor jedem Schritt mit Wirkung', meldet: 'handelt und meldet heikle Schritte', voll: 'handelt selbständig innerhalb der Regeln'};

/** AgentModelLine with `detail`: short name, quiet «Ersatz», throughput and cost in mono. */
function ModelLine({agent, detail}: {agent: DemoAgent; detail?: string}) {
  if (!agent.model) return null;
  return <div className="stage-model" data-fallback={agent.fallback ? 'true' : 'false'} aria-label={[`Modell ${agent.model}`, agent.fallback ? `Ersatz: ${agent.fallback}` : ''].filter(Boolean).join(', ')}>
    <span className="stage-model-name">{agent.model}</span>
    {agent.fallback && <span className="stage-model-fallback">Ersatz<span> · {agent.fallback}</span></span>}
    {detail && <span className="stage-model-detail">{detail}</span>}
  </div>;
}

/** AgentAutonomyLine with `detail`: level word, lock and today's cost against the budget. */
function AutonomyLine({agent, cost}: {agent: DemoAgent; cost?: string}) {
  if (!agent.autonomy) return null;
  return <div className="stage-autonomy" data-level={agent.autonomy} aria-label={[`Autonomie: ${agent.autonomy}, ${AUTONOMY_HINT[agent.autonomy]}`, agent.lock, cost].filter(Boolean).join(', ')}>
    <span className="stage-autonomy-level" aria-hidden="true">{agent.autonomy}</span>
    {agent.lock && <span className="stage-autonomy-lock" aria-hidden="true">{agent.lock}</span>}
    {cost && <span className="stage-autonomy-cost" aria-hidden="true">{cost}</span>}
  </div>;
}

function Approval({text}: {text?: string}) {
  if (!text) return null;
  return <div className="stage-approval" role="status"><span className="stage-approval-form" aria-hidden="true">◆</span>
    <p><strong>braucht dich: {text}</strong><span className="stage-approval-hint">Antworten im Leitstand</span></p></div>;
}

/* ---------- Fokus (stage-view.tsx, view «fokus») ---------- */

type Message = {from: 'agent' | 'human' | 'other'; text: string};
const HISTORY: Message[] = [
  {from: 'human', text: 'Kannst du die Notizen der Woche zu einem kurzen Bericht zusammenfassen?'},
  {from: 'agent', text: 'Mache ich. Ich lese die zwölf Notizen und gliedere nach Terminen, Entscheiden und offenen Punkten.'},
  {from: 'other', text: 'Erinnerung: Der Bericht soll bis Freitag fertig sein.'},
  {from: 'agent', text: 'Der Entwurf liegt in berichte/woche-42.md. Sechs Punkte sind noch offen, die Liste steht am Ende.'},
  {from: 'human', text: 'Danke. Bitte die offenen Punkte nach Dringlichkeit sortieren.'},
  {from: 'agent', text: 'Sortiert. Zwei Punkte brauchen diese Woche eine Entscheidung, die übrigen vier können warten.'},
];

function Focus({focus, others = [], poster = true, history, terminal, summary, detail, cost}: {
  focus: DemoAgent; others?: DemoAgent[]; poster?: boolean; history?: Message[]; terminal?: Pane | null; summary?: string; detail?: string; cost?: string;
}) {
  return <div className="stage-focus" style={css({'--agent': focus.color})} data-others={others.length > 0 ? 'true' : 'false'}>
    <div className={`stage-focus-hero${poster ? ' is-poster' : ''}`} data-level={focus.level} data-speaking={focus.speaking ? 'true' : 'false'}>
      <Avatar agent={focus} poster={poster}/>
      <div className="stage-focus-id">
        <h2>{focus.name}</h2><ModelLine agent={focus} detail={detail}/><p>{focus.role}</p>
        <StateChip agent={focus}/>
        <AutonomyLine agent={focus} cost={cost}/>
        {focus.title && <p className="stage-agent-title">{focus.title}</p>}
        <Approval text={focus.approval}/>
      </div>
    </div>
    <div className="stage-focus-body">
      {history && <ol className="stage-history" aria-label="Verlauf">{history.slice(-6).map((message, index) => <li key={index} data-from={message.from}><p>{message.text}</p></li>)}</ol>}
      {terminal !== undefined && <TerminalPane pane={terminal} rows={60} name={focus.name}/>}
      {!history && terminal === undefined && <div className="stage-focus-quiet"><span className="stage-eyebrow">{focus.name}</span><p>{summary || LEVEL[focus.level].word}</p></div>}
    </div>
    {others.length > 0 && <div className="stage-focus-others">{others.map(agent => <div key={agent.id} className="stage-mini" style={css({'--agent': agent.color})} data-level={agent.level}>
      <Avatar agent={agent}/>
      <div><strong>{agent.name}</strong><StateChip agent={agent}/></div>
    </div>)}</div>}
  </div>;
}

/* ---------- Hermes-Stack (hermes-stack.tsx, lib/hermes-stack.ts) ---------- */

type TaskState = 'angenommen' | 'laeuft' | 'blockiert' | 'fertig' | 'fehlgeschlagen' | 'abgebrochen';
type Task = {id: string; title: string | null; state: TaskState; source: 'kanban' | 'sitzung'; current: boolean; approvals?: boolean};
type StackAgent = DemoAgent & {tasks?: Task[] | null; locked?: 'budget' | 'notbremse'; detail?: string};
type LaneMode = 'fliesst' | 'wartet' | 'ruht' | 'haengt' | 'aus';
type LayerId = 'du' | 'agents' | 'auftraege' | 'leitplanken' | 'fabric';
type Lane = {mode: LaneMode; stopAt: LayerId | null; period: number};

const LAYERS: {id: LayerId; label: string}[] = [
  {id: 'du', label: 'Du'}, {id: 'agents', label: 'Agents'}, {id: 'auftraege', label: 'Aufträge'}, {id: 'leitplanken', label: 'Leitplanken'}, {id: 'fabric', label: 'AI Fabric'},
];
const layerCentre = (id: LayerId) => (LAYERS.findIndex(layer => layer.id === id) + 0.5) / LAYERS.length;
const TASK_TEXT: Record<TaskState, {word: string; form: string; tone: string}> = {
  angenommen: {word: 'angenommen', form: '○', tone: 'bereit'}, laeuft: {word: 'läuft', form: '●', tone: 'arbeitet'},
  blockiert: {word: 'blockiert', form: '◆', tone: 'frage'}, fehlgeschlagen: {word: 'fehlgeschlagen', form: '‼', tone: 'haengt'},
  fertig: {word: 'fertig', form: '✓', tone: 'bereit'}, abgebrochen: {word: 'abgebrochen', form: '■', tone: 'aus'},
};
const AUTONOMY_TEXT = {fragt: 'fragt immer', meldet: 'handelt, meldet danach', voll: 'volle Autonomie'};
const OPEN: TaskState[] = ['laeuft', 'blockiert', 'fehlgeschlagen', 'angenommen'];

function laneOf(agent: StackAgent, emergency: boolean): Lane {
  if (emergency || agent.level === 'aus' || agent.locked) return {mode: 'aus', stopAt: null, period: 0};
  if (agent.approval) return {mode: 'wartet', stopAt: 'leitplanken', period: 2.4};
  if (agent.level === 'frage' || agent.level === 'dialog') return {mode: 'wartet', stopAt: 'agents', period: 2.4};
  if (agent.level === 'haengt') return {mode: 'haengt', stopAt: 'auftraege', period: 0};
  if (agent.level === 'arbeitet') return {mode: 'fliesst', stopAt: null, period: 2.8};
  return {mode: 'ruht', stopAt: null, period: 11};
}
function tasksToShow(tasks: Task[] | null | undefined, max = 2): Task[] {
  if (!tasks) return [];
  const open = tasks.filter(task => OPEN.includes(task.state)).sort((a, b) => Number(b.current) - Number(a.current) || OPEN.indexOf(a.state) - OPEN.indexOf(b.state));
  return open.length ? open.slice(0, max) : tasks.filter(task => !OPEN.includes(task.state)).slice(0, 1);
}
const taskLabel = (task: Task) => task.title || (task.source === 'kanban' ? 'Kanban-Auftrag' : 'Auftrag ohne Karte');

/** Background net of the Fabric: fixed pseudo-random nodes and edges (lib/hermes-stack.ts ambientNet). */
function ambientNet(count = 22, width = 1600, height = 900, seed = 1909) {
  let s = seed >>> 0;
  const r = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  const nodes = Array.from({length: count}, () => ({x: Math.round(r() * width), y: Math.round(r() * height)}));
  const edges: [number, number][] = [];
  nodes.forEach((n, i) => {
    nodes.map((m, j) => ({j, d: Math.hypot(m.x - n.x, m.y - n.y)})).filter(o => o.j !== i)
      .sort((a, b) => a.d - b.d).slice(0, 2)
      .forEach(({j}) => { if (!edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) edges.push([i, j]); });
  });
  return {nodes, edges, width, height};
}
const NET = ambientNet();

function AmbientNet({colors, active}: {colors: string[]; active: number}) {
  const palette = colors.length ? colors : ['var(--accent)'];
  const pulses = NET.edges.filter((_, k) => k % (active ? 2 : 3) === 0);
  return <svg className="hstack-net" viewBox={`0 0 ${NET.width} ${NET.height}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g className="hstack-net-edges">{NET.edges.map(([a, b]) => <line key={`${a}-${b}`} x1={NET.nodes[a].x} y1={NET.nodes[a].y} x2={NET.nodes[b].x} y2={NET.nodes[b].y}/>)}</g>
    <g className="hstack-net-nodes">{NET.nodes.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r={i % 5 ? 1.6 : 2.6}/>)}</g>
    <g>{pulses.map(([a, b], k) => {
      const dur = (active ? 4 : 7) + ((k * 2.3) % 6);
      const begin = (k * 1.7) % 9;
      return <circle key={`${a}-${b}-${active ? 1 : 0}`} r="2.4" fill={k % 3 === 2 ? 'var(--accent)' : palette[k % palette.length]} opacity="0">
        <animateMotion dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" path={`M ${NET.nodes[a].x} ${NET.nodes[a].y} L ${NET.nodes[b].x} ${NET.nodes[b].y}`}/>
        <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.15;0.8;1" dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite"/>
      </circle>;
    })}</g>
  </svg>;
}

function LaneView({lane, color, column}: {lane: Lane; color: string; column: number}) {
  const stop = lane.stopAt ? layerCentre(lane.stopAt) : null;
  return <div className="hstack-lane" data-mode={lane.mode} aria-hidden="true" style={css({gridColumn: column, '--agent': color, '--period': `${lane.period}s`, '--stop': stop ?? 0})}>
    <span className="hstack-lane-line"/>
    {LAYERS.filter(layer => layer.id !== 'du').map(layer => <span key={layer.id} className="hstack-node" style={css({'--at': layerCentre(layer.id)})} data-stop={lane.stopAt === layer.id ? 'true' : 'false'}/>)}
    {lane.mode === 'aus' ? null : lane.mode === 'fliesst' ? <>
      {[0, 1, 2].map(k => <i key={`d${k}`} className="hstack-pulse is-down" style={css({'--k': k})}/>)}
      {[0, 1].map(k => <i key={`u${k}`} className="hstack-pulse is-up" style={css({'--k': k})}/>)}
    </> : lane.mode === 'ruht' ? <i className="hstack-pulse is-down is-slow" style={css({'--k': 0})}/> : <i className="hstack-pulse is-hold"/>}
  </div>;
}

function AgentColumn({agent, column, lane}: {agent: StackAgent; column: number; lane: Lane}) {
  const tasks = tasksToShow(agent.tasks);
  const cell = (row: number) => ({role: 'listitem', className: 'hstack-cell', 'data-lane': lane.mode, style: css({gridColumn: column, gridRow: row + 1, '--row': row, '--agent': agent.color})});
  return <>
    <div {...cell(1)} data-level={agent.level} data-stop={lane.stopAt === 'agents' ? 'true' : 'false'}>
      <div className="hstack-avatar"><Avatar agent={agent}/></div>
      <div className="hstack-id"><strong>{agent.name}</strong><StateChip agent={agent}/></div>
    </div>
    <div {...cell(2)} data-stop={lane.stopAt === 'auftraege' ? 'true' : 'false'}>
      {agent.tasks === undefined || agent.tasks === null ? <span className="hstack-quiet">Hermes meldet keine Aufträge</span>
        : !tasks.length ? <span className="hstack-quiet">kein offener Auftrag</span>
          : <ul className="hstack-tasks">{tasks.map(task => <li key={task.id} data-level={TASK_TEXT[task.state].tone} data-current={task.current ? 'true' : 'false'}>
            <span className="hstack-task-state"><span aria-hidden="true">{TASK_TEXT[task.state].form}</span>{TASK_TEXT[task.state].word}</span>
            <span className="hstack-task-title">{taskLabel(task)}</span>
            {task.approvals && <span className="hstack-task-key" title="Freigaben gelten für diesen Auftrag">Freigaben</span>}
          </li>)}</ul>}
    </div>
    <div {...cell(3)} data-stop={lane.stopAt === 'leitplanken' ? 'true' : 'false'}>
      {agent.autonomy ? <span className="hstack-guard" data-level={agent.autonomy}>{AUTONOMY_TEXT[agent.autonomy]}</span> : <span className="hstack-quiet">Autonomie unbekannt</span>}
      {agent.approval && <span className="stage-state" data-level="dialog"><span aria-hidden="true">◆</span>Freigabe offen</span>}
      {agent.locked === 'budget' && <span className="stage-state" data-level="haengt"><span aria-hidden="true">‼</span>Budget erreicht</span>}
    </div>
    <div {...cell(4)}>{agent.model ? <ModelLine agent={agent} detail={agent.detail}/> : <span className="hstack-quiet">noch keine Antwort</span>}</div>
  </>;
}

function HermesStack({agents, emergency = false, brand = 'Agents'}: {agents: StackAgent[]; emergency?: boolean; brand?: string}) {
  const lanes = Object.fromEntries(agents.map(agent => [agent.id, laneOf(agent, emergency)])) as Record<string, Lane>;
  const flowing = agents.filter(agent => lanes[agent.id].mode === 'fliesst').length;
  return <div className="hstack" data-emergency={emergency ? 'true' : 'false'} data-flowing={flowing > 0 ? 'true' : 'false'} style={css({'--count': Math.max(1, agents.length)})}>
    <AmbientNet colors={agents.map(agent => agent.color)} active={flowing}/>
    <div className="hstack-grid" role="list" aria-label="Hermes-Stack">
      {LAYERS.map((layer, row) => <div key={layer.id} className="hstack-plate" data-layer={layer.id} aria-hidden="true" style={css({gridRow: row + 1, '--row': row})}/>)}
      {LAYERS.map((layer, row) => <span key={layer.id} className="hstack-label" style={css({gridRow: row + 1, '--row': row})}>
        <span className="stage-eyebrow">{String(row + 1).padStart(2, '0')}</span>{layer.label}
      </span>)}
      {agents.map((agent, col) => <LaneView key={agent.id} lane={lanes[agent.id]} color={agent.color} column={col + 2}/>)}
      <div className="hstack-cell is-wide" role="listitem" style={css({gridRow: 1, '--row': 0})}>
        <img className="signet" src={signet('edgeportal')} width={28} height={28} alt=""/>
        <span><strong>Du</strong> <span className="hstack-quiet">über EdgePortal, Leitstand und Chat</span></span>
      </div>
      {agents.map((agent, col) => <AgentColumn key={agent.id} agent={agent} column={col + 2} lane={lanes[agent.id]}/>)}
    </div>
    <p className="hstack-foot stage-eyebrow">Hermes-Stack · live{brand && brand !== 'AI Fabric' ? ` · ${brand}` : ''}</p>
  </div>;
}

/* ---------- Loading, empty and error states (stage-view.tsx agentsBlock) ---------- */

type EmptyKind = 'laden' | 'nicht-verbunden' | 'fehler' | 'keine-auswahl';
function Empty({kind}: {kind: EmptyKind}) {
  if (kind === 'laden') return <div className="stage-empty" data-kind="loading" role="status">
    <span className="stage-spinner" aria-hidden="true"/><span className="stage-eyebrow">Agents</span><h2>Agents verbinden …</h2>
  </div>;
  if (kind === 'keine-auswahl') return <div className="stage-empty" data-kind="empty" role="status">
    <span className="stage-eyebrow">Agents</span><h2>Keine Agents ausgewählt</h2>
    <p>In der Steuerung unter «Agents» mindestens einen Agent für diesen Screen auswählen.</p>
  </div>;
  const notConfigured = kind === 'nicht-verbunden';
  return <div className="stage-empty" data-kind={notConfigured ? 'empty' : 'error'} role={notConfigured ? 'status' : 'alert'}>
    <img className="signet" src={signet('edgeportal')} width={48} height={48} alt=""/>
    <span className="stage-eyebrow">{notConfigured ? 'Agents' : 'Verbindung'}</span>
    <h2>{notConfigured ? 'Agents noch nicht verbunden' : 'Agents gerade nicht erreichbar'}</h2>
    <p>{notConfigured ? 'Den Hermes-Wand-Zugang für EdgePortal einrichten, dann erscheinen die Agents hier.' : 'EdgePortal fragt weiter nach und zeigt die Agents, sobald Hermes wieder antwortet.'}</p>
  </div>;
}

/* ---------- Argus on the stage (argus-view.tsx, compact: no event list) ---------- */

type ArgusState = 'pruefen' | 'nicht-verbunden' | 'nicht-erreichbar' | 'keine-kamera' | 'laden' | 'kein-bild' | 'veraltet' | 'bewegung' | 'ruhig';
function ArgusPanel({state}: {state: ArgusState}) {
  if (state === 'pruefen') return <div className="argus-panel"><p className="argus-note">Argus wird geprüft …</p></div>;
  if (state === 'nicht-verbunden' || state === 'nicht-erreichbar') return <div className="argus-panel argus-empty">
    <span className="argus-orbit" aria-hidden="true"><Shield size={56}/></span>
    <h3>{state === 'nicht-verbunden' ? 'Noch nicht verbunden' : 'Argus gerade nicht erreichbar'}</h3>
    {/* Unreachable shows the server message; «Argus nicht erreichbar» is its fallback (src/argus.mjs). */}
    <p>{state === 'nicht-verbunden' ? 'Der Argus-Dienstzugang für EdgePortal ist noch nicht eingerichtet.' : 'Argus nicht erreichbar'}</p>
  </div>;
  const camera = state === 'keine-kamera' ? null : {online: state !== 'kein-bild', motion: state === 'bewegung', since: state === 'bewegung' ? '21:16' : '20:52', known: state !== 'kein-bild'};
  // ArgusFrame: the latest still, swapped only after the new picture exists; stale when a later refresh failed.
  const url = state === 'bewegung' || state === 'ruhig' || state === 'veraltet' ? placeholder('Kamerabild') : null;
  const failed = state === 'kein-bild' || state === 'veraltet';
  return <div className="argus-panel" data-motion={camera?.motion ? 'true' : 'false'}>
    {camera ? <div className="argus-frame" data-failed={failed && !url ? 'true' : 'false'}>
      {url ? <img src={url} alt="Kamerabild kamera-1"/> : <span>{failed ? 'Kein Kamerabild' : 'Kamerabild wird geladen …'}</span>}
      {url && failed ? <em>Bild veraltet</em> : null}
    </div> : <div className="argus-frame"><span>Keine Kamera online</span></div>}
    <div className="argus-meta">
      <span className="argus-cam"><span className="argus-dot" data-on={camera ? String(camera.online) : undefined}/>{camera ? 'Gerät A · Kamera 1' : 'keine Kamera'}</span>
      {camera?.known && <span className="argus-motion" data-on={camera.motion ? 'true' : 'false'}><Footprints aria-hidden="true"/>{camera.motion ? 'Bewegung' : 'ruhig'} seit {camera.since}</span>}
    </div>
  </div>;
}
const argus = (state: ArgusState) => <section className="stage-argus" aria-label="Kamera"><ArgusPanel state={state}/></section>;

/* ---------- Example agents for the views ---------- */

const WORKING: DemoAgent = {...AEON, level: 'arbeitet', since: 'seit 12 min', fallback: undefined, title: 'Wochenbericht',
  bubble: 'Stellt den Wochenbericht aus zwölf Notizen zusammen. Die Tests sind grün.'};
const ASKING: DemoAgent = {...AETHRA, level: 'frage', since: 'seit 2 min', fallback: undefined, autonomy: 'meldet', title: 'Termine nächste Woche',
  bubble: 'Soll ich die Werkstatt am Dienstag auf 14:00 verschieben?'};
const APPROVING: DemoAgent = {...AETHRA, level: 'dialog', since: 'seit 3 min', autonomy: 'meldet', title: 'Termine nächste Woche', approval: 'Termin am Dienstag auf 14:00 verschieben'};
const SPEAKING: DemoAgent = {...AETHRA, speaking: true, since: 'gerade eben', fallback: undefined};
const COST = '1.20 / 20.00 CHF heute';

const STACK_HOME: StackAgent[] = [
  {...WORKING, autonomy: 'voll', detail: '38 tok/s', tasks: [
    {id: 't1', title: 'Wochenbericht erstellen', state: 'laeuft', source: 'kanban', current: true, approvals: true},
    {id: 't2', title: 'Notizen ordnen', state: 'angenommen', source: 'kanban', current: false}]},
  {...APPROVING, detail: '24 tok/s', tasks: [{id: 't3', title: 'Termine abgleichen', state: 'blockiert', source: 'kanban', current: true}]},
  {...ORIN, detail: '31 tok/s', tasks: []},
];
const STACK_STATES: StackAgent[] = [
  STACK_HOME[0], STACK_HOME[1],
  {...VELA, level: 'frage', since: 'seit 1 min', autonomy: 'fragt', detail: '41 tok/s · 0.002 USD', tasks: [{id: 't4', title: 'Quellen sammeln', state: 'fertig', source: 'kanban', current: false}]},
  {...KAEL, tasks: [{id: 't5', title: null, state: 'fehlgeschlagen', source: 'kanban', current: true}]},
  {...ORIN, model: undefined, autonomy: undefined, tasks: null},
  {...LYRA, level: 'bereit', since: 'seit 2 h 5 min', autonomy: 'meldet', lock: 'gesperrt: Budget', locked: 'budget', tasks: [{id: 't6', title: 'Entwurf kürzen', state: 'abgebrochen', source: 'sitzung', current: false}]},
];
const STACK_BRAKE: StackAgent[] = [
  {...AEON, fallback: undefined, lock: 'gesperrt: Notbremse', locked: 'notbremse', tasks: [{id: 't1', title: 'Wochenbericht erstellen', state: 'angenommen', source: 'kanban', current: true}]},
  {...AETHRA, fallback: undefined, lock: 'gesperrt: Notbremse', locked: 'notbremse', tasks: [{id: 't3', title: 'Termine abgleichen', state: 'angenommen', source: 'kanban', current: true}]},
];

const quiet = 'Termine der nächsten Woche sind abgeglichen. Zwei Überschneidungen gelöst, nichts offen.';
const node = (body: ReactNode, props: Parameters<typeof Stage>[0] = {}) => <Stage {...props} body={body}/>;

export const modesViews: ViewEntry[] = [
  // Terminals
  {id: 'modes-terminals', area: AREA, title: 'Terminals', wide: true,
    caption: 'Ansicht «Terminals»: kompakte Karten mit Terminalbild (letzte 48 Zeilen), alle in einer Schriftgrösse nach dem breitesten Pane.',
    node: node(<Grid agents={[WORKING, {...AETHRA, fallback: undefined}]} view="terminal"/>, {agents: [AEON, AETHRA]})},
  {id: 'modes-terminals-vier', area: AREA, title: 'Terminals',
    caption: 'Vier Agents in «Terminals» stehen in zwei Spalten; ein Pane ohne Antwort zeigt «Terminalbild wird geladen …».',
    node: node(<Grid agents={[WORKING, {...AETHRA, fallback: undefined}, VELA, ORIN]} view="terminal"/>, {agents: [AEON, AETHRA]})},
  {id: 'modes-terminals-gross', area: AREA, title: 'Terminals',
    caption: 'Terminal-Schrift «Gross» in der Steuerung: grössere Zeichen, lange Zeilen brechen um.',
    node: node(<Grid agents={[WORKING, {...AETHRA, fallback: undefined}]} view="terminal" size="gross"/>, {agents: [AEON, AETHRA]})},
  {id: 'modes-buehne-terminal', area: AREA, title: 'Bühne',
    caption: '«Terminalbild» und «Letzte Antwort und Verlauf» an (Werkseinstellung): Poster mit Sprechblase und 16 Terminalzeilen.',
    node: node(<Grid agents={[WORKING, ASKING]} conversation terminals/>, {agents: [AEON, AETHRA], attention: [ASKING]})},

  // Fokus
  {id: 'modes-fokus', area: AREA, title: 'Fokus', wide: true,
    caption: 'Ansicht «Fokus» mit Verlauf: der Fokus-Agent als Poster, die letzten sechs Nachrichten, die übrigen Agents als Pillen.',
    node: node(<Focus focus={WORKING} others={[ASKING]} history={HISTORY} detail="38 tok/s · 0.002 USD" cost={COST}/>, {agents: [AEON, AETHRA], attention: [ASKING]})},
  {id: 'modes-fokus-kreis', area: AREA, title: 'Fokus',
    caption: 'Fokus ohne Kino-Porträt und mit Terminalbild und Verlauf aus: Kreis-Avatar und die Zusammenfassung von Hermes.',
    node: node(<Focus focus={{...AETHRA, fallback: undefined}} poster={false} summary={quiet}/>, {agents: [AETHRA]})},
  {id: 'modes-fokus-terminal', area: AREA, title: 'Fokus',
    caption: 'Fokus mit Terminalbild: bis 60 Zeilen des Fokus-Agents, die anderen Agents als Pillen, eine davon spricht.',
    node: node(<Focus focus={WORKING} others={[SPEAKING, VELA, ORIN]} terminal={pane(110, AEON_LONG)} detail="38 tok/s" cost={COST}/>, {agents: [AEON, AETHRA]})},
  {id: 'modes-fokus-freigabe', area: AREA, title: 'Fokus',
    caption: 'Fokus-Agent mit offener Freigabe: Tonrahmen und «braucht dich» im Porträt, Verlauf und Terminalbild darunter.',
    node: node(<Focus focus={APPROVING} others={[{...AEON, fallback: undefined}]} history={HISTORY.slice(0, 3)} terminal={PANES.aethra} detail="24 tok/s" cost="Kosten unbekannt · Budget 20.00 CHF"/>, {agents: [AETHRA, AEON], attention: [APPROVING]})},
  {id: 'modes-fokus-hochformat', area: AREA, title: 'Fokus', tv: {width: 2160, height: 3840},
    caption: 'Fokus auf einem Hochformat-Screen: Porträt, Verlauf und Pillen stehen untereinander.',
    node: node(<Focus focus={WORKING} others={[ASKING]} history={HISTORY} detail="38 tok/s" cost={COST}/>, {agents: [AEON, AETHRA], attention: [ASKING]})},

  // Stack
  {id: 'modes-stack', area: AREA, title: 'Stack', wide: true,
    caption: 'Ansicht «Stack»: fünf Schichten, eine Bahn je Agent; sie fliesst, solange er arbeitet, und hält an den Leitplanken bei offener Freigabe.',
    node: node(<HermesStack agents={STACK_HOME}/>, {agents: [AEON, AETHRA], attention: [APPROVING]})},
  {id: 'modes-stack-zustaende', area: AREA, title: 'Stack', wide: true,
    caption: 'Alle Bahnen und Auftragszustände: fliesst, wartet, ruht, hängt, aus; Budget erreicht, ohne Aufträge, ohne Autonomie, ohne Antwort.',
    node: node(<HermesStack agents={STACK_STATES}/>, {agents: [AEON, AETHRA], attention: [STACK_STATES[1], STACK_STATES[2]]})},
  {id: 'modes-stack-notbremse', area: AREA, title: 'Stack',
    caption: 'Notbremse gezogen: das Band der Bühne erscheint, jede Bahn steht still und färbt sich rot.',
    node: node(<HermesStack agents={STACK_BRAKE} emergency/>, {agents: [AEON, AETHRA], brake: 'Notbremse gezogen'})},
  {id: 'modes-stack-hochformat', area: AREA, title: 'Stack', tv: {width: 2160, height: 3840},
    caption: 'Stack auf einem Hochformat-Screen: schmalere Schichten, ohne Freigabe-Marke an den Aufträgen.',
    node: node(<HermesStack agents={STACK_HOME}/>, {agents: [AEON, AETHRA], attention: [APPROVING]})},

  // Agent counts, circles, aspect ratios
  {id: 'modes-agents-1', area: AREA, title: 'Bühne', caption: 'Ein sichtbarer Agent: eine Karte über die ganze Breite, grösserer Name.',
    node: <Stage agents={[AEON]}/>},
  {id: 'modes-agents-3', area: AREA, title: 'Bühne', caption: 'Drei sichtbare Agents: drei Spalten.',
    node: <Stage agents={[AEON, AETHRA, VELA]}/>},
  {id: 'modes-agents-4', area: AREA, title: 'Bühne', caption: 'Vier sichtbare Agents: vier Spalten auf 16:9.',
    node: <Stage agents={[AEON, AETHRA, VELA, ORIN]}/>},
  {id: 'modes-agents-5', area: AREA, title: 'Bühne', caption: 'Fünf sichtbare Agents: drei Spalten, zwei Reihen.',
    node: <Stage agents={[AEON, AETHRA, VELA, ORIN, LYRA]}/>},
  {id: 'modes-agents-6', area: AREA, title: 'Bühne', caption: 'Sechs sichtbare Agents: drei Spalten, zwei Reihen.',
    node: <Stage agents={[AEON, AETHRA, ...MORE_AGENTS]}/>},
  {id: 'modes-kreis', area: AREA, title: 'Bühne', caption: 'Avatare ohne Kino-Porträt: Kreis statt Poster, mit «Letzte Antwort und Verlauf» als Sprechblase.',
    node: <Stage agents={[WORKING, ASKING]} poster={false} conversation attention={[ASKING]}/>},
  {id: 'modes-hochformat', area: AREA, title: 'Bühne', tv: {width: 2160, height: 3840},
    caption: 'Hochformat-Screen: zwei Spalten, der erste von drei Agents über die ganze Breite, RadioX als Leiste unten.',
    node: <Stage agents={[AEON, AETHRA, VELA]}/>},
  {id: 'modes-ultrawide', area: AREA, title: 'Bühne', wide: true, tv: {width: 5120, height: 2160},
    caption: 'Ultrabreiter Screen (21:9 und breiter): fünf Agents in einer Reihe, RadioX rückt an die Seite.',
    node: <Stage agents={[AEON, AETHRA, VELA, ORIN, LYRA]}/>},

  // Loading, empty and error
  {id: 'modes-leer-laden', area: AREA, title: 'Agents verbinden …', caption: 'Bevor die erste Antwort von EdgePortal da ist.',
    node: node(<Empty kind="laden"/>, {agents: [], eyebrow: 'EdgePortal Bühne', radioPanel: <RadioPanel state="loading"/>})},
  {id: 'modes-leer-nicht-verbunden', area: AREA, title: 'Agents noch nicht verbunden', caption: 'EdgePortal hat keinen Hermes-Wand-Zugang eingerichtet.',
    node: node(<Empty kind="nicht-verbunden"/>, {agents: [], eyebrow: 'EdgePortal Bühne'})},
  {id: 'modes-leer-fehler', area: AREA, title: 'Agents gerade nicht erreichbar', caption: 'Hermes antwortet nicht; ein Ausfall sieht nie leer aus.',
    node: node(<Empty kind="fehler"/>, {agents: [], eyebrow: 'EdgePortal Bühne'})},
  {id: 'modes-leer-keine-auswahl', area: AREA, title: 'Keine Agents ausgewählt', caption: 'Hermes antwortet, aber für diesen Screen ist kein Agent ausgewählt.',
    node: node(<Empty kind="keine-auswahl"/>, {agents: []})},

  // Argus camera on the stage
  {id: 'modes-argus-bewegung', area: AREA, title: 'Kamera', wide: true,
    caption: 'Argus in der Steuerung an: Kamerabild neben der RadioX-Leiste; bei Bewegung ein Rahmen in Warnfarbe und «Bewegung seit …».',
    node: <Stage argus={argus('bewegung')}/>},
  {id: 'modes-argus-ruhig', area: AREA, title: 'Kamera', caption: 'RadioX als Karte: die Kamera steht unter RadioX in der Seitenspalte, ohne Bewegung «ruhig seit …».',
    node: <Stage radio="karte" argus={argus('ruhig')}/>},
  {id: 'modes-argus-pruefen', area: AREA, title: 'Argus wird geprüft …', caption: 'Bevor EdgePortal Argus-Daten liefert; RadioX aus, die Kamera in der Seitenspalte.',
    node: <Stage radio="aus" camera={false} argus={argus('pruefen')}/>},
  {id: 'modes-argus-nicht-verbunden', area: AREA, title: 'Noch nicht verbunden', caption: 'Der Argus-Dienstzugang für EdgePortal fehlt.',
    node: <Stage radio="aus" camera={false} argus={argus('nicht-verbunden')}/>},
  {id: 'modes-argus-nicht-erreichbar', area: AREA, title: 'Argus gerade nicht erreichbar', caption: 'Argus antwortet nicht; der Text ist die Meldung des Servers.',
    node: <Stage radio="aus" camera={false} argus={argus('nicht-erreichbar')}/>},
  {id: 'modes-argus-keine-kamera', area: AREA, title: 'Keine Kamera online', caption: 'Argus antwortet, aber keine Kamera ist online.',
    node: <Stage radio="aus" argus={argus('keine-kamera')}/>},
  {id: 'modes-argus-laden', area: AREA, title: 'Kamerabild wird geladen …', caption: 'Bis das erste Standbild der Kamera da ist.',
    node: <Stage radio="aus" argus={argus('laden')}/>},
  {id: 'modes-argus-kein-bild', area: AREA, title: 'Kein Kamerabild', caption: 'Das Standbild liess sich nicht laden und es gibt noch kein früheres.',
    node: <Stage radio="aus" argus={argus('kein-bild')}/>},
  {id: 'modes-argus-veraltet', area: AREA, title: 'Bild veraltet', caption: 'Ein späteres Standbild schlug fehl: das letzte bleibt stehen, mit Marke «Bild veraltet».',
    node: <Stage radio="aus" argus={argus('veraltet')}/>},
];
