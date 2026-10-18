'use client';

// Gemeinsame Bausteine für den EdgePortal-Nachbau. Markup und Klassen folgen dem Produkt
// (mra-edgeportal: components/stage/stage-view.tsx, agent-card.tsx, radio-panel.tsx), die Styles
// kommen als Kopie aus brands/rapold/edgeportal/tv/*.css. Alle Daten sind neutrale Beispiele.
import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import {EyeOff, Radio, ScanFace, Volume2, VolumeX} from 'lucide-react';
import identity from '../../../../../brands/rapold/identity.json';
import ci from '../../../../../brands/rapold/edgeportal/edgeportal.json';

export type Level = 'bereit' | 'arbeitet' | 'frage' | 'dialog' | 'haengt' | 'aus';
export type Autonomy = 'fragt' | 'meldet' | 'voll';
export type DemoAgent = {
  id: string; name: string; color: string; role: string; level: Level; since?: string;
  model?: string; fallback?: string; autonomy?: Autonomy; lock?: string; title?: string;
  approval?: string; bubble?: string; speaking?: boolean;
};
/** One reproduced TV view: area and id follow the catalogue in edgeportal.json (tv.catalog). */
export type ViewEntry = {id: string; area: string; title: string; caption: string; node: ReactNode; wide?: boolean; tv?: {width: number; height: number}};

const base = identity.publicBase;
export const signet = (id: string) => base + (identity.products.find(product => product.id === id)?.variants.dark ?? '');
export const css = (vars: Record<string, string | number>) => vars as CSSProperties;
export const LEVEL = Object.fromEntries(ci.tv.states.agent.map(state => [state.id, state])) as unknown as Record<Level, {word: string; shape: string}>;

/** Platzhalter-Porträt: eine Büste in Agentfarbe. Die echten Kino-Porträts gehören zum Agents-System und sind nicht Teil von Atlas. */
export const portrait = (color: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><defs><radialGradient id="g" cx="50%" cy="34%" r="70%"><stop offset="0" stop-color="#142741"/><stop offset="1" stop-color="#02060F"/></radialGradient><linearGradient id="r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${color}" stop-opacity=".05"/><stop offset="1" stop-color="${color}" stop-opacity=".7"/></linearGradient></defs><rect width="600" height="800" fill="url(#g)"/><path d="M300 150c-72 0-122 60-122 146 0 66 31 121 72 144v40c-96 20-178 76-206 168v152h512V648c-28-92-110-148-206-168v-40c41-23 72-78 72-144 0-86-50-146-122-146z" fill="#0B1528" stroke="url(#r)" stroke-width="5"/><path d="M214 278c26-18 60-26 86-26s60 8 86 26" fill="none" stroke="${color}" stroke-opacity=".45" stroke-width="10" stroke-linecap="round"/></svg>`);

/** Platzhalter für Bilder ohne Quelle in Atlas (Cover, Kamerabild, Szene): ruhige Fläche mit Beschriftung. */
export const placeholder = (label: string, tone = '#142741') => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tone}"/><stop offset="1" stop-color="#02060F"/></linearGradient></defs><rect width="1600" height="900" fill="url(#p)"/><text x="800" y="470" text-anchor="middle" font-family="Geist Mono, monospace" font-size="44" letter-spacing="8" fill="#9AADC7">${label.toUpperCase()}</text></svg>`);

export const AEON: DemoAgent = {id: 'aeon', name: 'ÆON', color: '#009DFF', role: 'AI-Operator', level: 'bereit', since: 'seit 4 h 20 min', model: 'gemma4 31b', fallback: 'Einstellung', autonomy: 'voll'};
export const AETHRA: DemoAgent = {id: 'aethra', name: 'ÆTHRA', color: '#7C5CFF', role: 'AI-Operatorin', level: 'bereit', since: 'seit 4 h 15 min', model: 'gemma4 31b', fallback: 'Einstellung', autonomy: 'voll'};
/** Weitere Beispiel-Agents für Ansichten mit 3 bis 6 Agents. */
export const MORE_AGENTS: DemoAgent[] = [
  {id: 'vela', name: 'VELA', color: '#34D399', role: 'Recherche', level: 'arbeitet', since: 'seit 8 min', model: 'qwen3 32b', autonomy: 'meldet'},
  {id: 'orin', name: 'ORIN', color: '#FBBF24', role: 'Betrieb', level: 'bereit', since: 'seit 1 h 2 min', model: 'gemma4 31b', autonomy: 'fragt'},
  {id: 'lyra', name: 'LYRA', color: '#A8EDFF', role: 'Schreiben', level: 'aus', model: 'gemma4 31b', autonomy: 'fragt'},
  {id: 'kael', name: 'KAEL', color: '#FB7185', role: 'Sicherheit', level: 'haengt', since: 'seit 6 min', model: 'qwen3 32b', autonomy: 'meldet'},
];

/** Virtueller TV in Originalauflösung (Standard 3840 × 2160), als Ganzes auf die Rahmenbreite verkleinert. */
export function TvFrame({label, width = 3840, height = 2160, children}: {label: string; width?: number; height?: number; children: ReactNode}) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(600 / width);
  // Viele virtuelle 4K-TVs auf einer Seite: jeder rendert erst, wenn er in die Nähe des Sichtfelds kommt.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const resize = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / width));
    const near = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setShown(true); near.disconnect(); } }, {rootMargin: '800px 0px'});
    resize.observe(element); near.observe(element);
    return () => { resize.disconnect(); near.disconnect(); };
  }, [width]);
  return <div className="ep-tv-frame" ref={frame} role="img" aria-label={label} style={{aspectRatio: `${width} / ${height}`}}>
    {shown && <div className="ep-tv-screen" style={{width, height, transform: `scale(${scale})`}}>{children}</div>}
  </div>;
}

export function ViewFigure({view}: {view: ViewEntry}) {
  const portrait = (view.tv?.height ?? 0) > (view.tv?.width ?? 1);
  return <figure className={`ep-ci-figure${view.wide ? ' ep-ci-wide' : ''}${portrait ? ' ep-ci-portrait' : ''}`} id={`ep-view-${view.id}`}>
    <TvFrame label={view.title} width={view.tv?.width} height={view.tv?.height}>{view.node}</TvFrame>
    <figcaption><strong>{view.title}</strong> · {view.caption}</figcaption>
  </figure>;
}

export function StateChip({agent}: {agent: DemoAgent}) {
  return <span className="stage-state" data-level={agent.level}>
    <span className="stage-state-form" aria-hidden="true">{LEVEL[agent.level].shape}</span><span>{LEVEL[agent.level].word}</span>
    {agent.since && <span className="stage-state-since">{agent.since}</span>}
  </span>;
}

export function Avatar({agent, poster = false}: {agent: DemoAgent; poster?: boolean}) {
  return <div className={`stage-avatar${poster ? ' is-poster' : ''}`} data-level={agent.level} data-speaking={agent.speaking ? 'true' : 'false'} data-kind="kino" style={css({'--agent': agent.color})}>
    <span className="stage-avatar-ring" aria-hidden="true"/>
    <div className="stage-avatar-media"><div className="stage-avatar-layer is-top"><img src={portrait(agent.color)} alt=""/></div></div>
    {agent.speaking && <span className="stage-avatar-voice"><span className="stage-avatar-bars" aria-hidden="true"><i/><i/><i/><i/><i/></span>spricht</span>}
  </div>;
}

export function AgentIdLines({agent}: {agent: DemoAgent}) {
  return <>
    {agent.model && <div className="stage-model"><span className="stage-model-name">{agent.model}</span>{agent.fallback && <span className="stage-model-fallback">Ersatz<span> · {agent.fallback}</span></span>}</div>}
    <p>{agent.role}</p>
    <StateChip agent={agent}/>
    {agent.autonomy && <div className="stage-autonomy" data-level={agent.autonomy}><span className="stage-autonomy-level" aria-hidden="true">{agent.autonomy}</span>{agent.lock && <span className="stage-autonomy-lock" aria-hidden="true">{agent.lock}</span>}</div>}
    {agent.title && <p className="stage-agent-title">{agent.title}</p>}
  </>;
}

/** Agent card as on the stage: poster (cinematic portrait) or circle; compact for the terminal view. */
export function AgentCard({agent, poster = true, compact = false, conversation = false, terminal}: {agent: DemoAgent; poster?: boolean; compact?: boolean; conversation?: boolean; terminal?: ReactNode}) {
  const waiting = agent.level === 'frage' || agent.level === 'dialog';
  const isPoster = poster && !compact;
  const bubble = conversation ? agent.bubble : undefined;
  return <article className={`stage-agent${isPoster ? ' is-poster' : ''}`} data-level={agent.level} data-speaking={agent.speaking ? 'true' : 'false'} data-compact={compact ? 'true' : 'false'} style={css({'--agent': agent.color})}>
    <div className="stage-agent-head">
      <Avatar agent={agent} poster={isPoster}/>
      <div className="stage-agent-id"><h2>{agent.name}</h2><AgentIdLines agent={agent}/></div>
    </div>
    {agent.approval && <div className="stage-approval" role="status"><span className="stage-approval-form" aria-hidden="true">◆</span><p><strong>braucht dich: {agent.approval}</strong><span className="stage-approval-hint">Antworten im Leitstand</span></p></div>}
    {waiting && !agent.approval && !bubble && <p className="stage-agent-flag" data-level={agent.level}>{agent.level === 'dialog' ? 'Braucht dich' : 'Frage an dich'}</p>}
    {bubble && <blockquote className="stage-bubble" data-waiting={waiting && !agent.approval ? 'true' : 'false'}>
      {waiting && !agent.approval && <span className="stage-bubble-kicker">{agent.level === 'dialog' ? 'Braucht dich' : 'Frage an dich'}</span>}<p>{bubble}</p></blockquote>}
    {terminal}
  </article>;
}

export type RadioProps = {placement?: 'leiste' | 'karte'; state?: 'live' | 'loading' | 'unavailable' | 'stale'; title?: string; artist?: string; stream?: {state: string; text: string}; cover?: string};
export function RadioPanel({placement = 'leiste', state = 'live', title = 'Midnight Signal (Extended Mix)', artist = 'Glass Harbour', stream = {state: 'aus', text: 'Stream auf dem Screen'}, cover}: RadioProps) {
  const heading = state === 'loading' ? 'RadioX verbindet …' : state === 'unavailable' ? 'RadioX gerade nicht erreichbar' : title;
  const playing = state === 'live' || state === 'stale';
  return <section className={`stage-radio placement-${placement}`} data-state={state} aria-label="RadioX">
    <div className="stage-radio-cover">{cover ? <img src={cover} alt=""/> : <Radio aria-hidden="true"/>}</div>
    <div className="stage-radio-main">
      <div className="stage-radio-kicker"><span className="stage-eyebrow">RadioX · 2026</span>{state === 'live' && <span className="stage-live"><span className="stage-live-dot" aria-hidden="true"/>Live</span>}</div>
      <h3>{heading}</h3>
      {playing && <p className="stage-radio-artist">{artist}</p>}
      {playing && <div className="stage-radio-progress" aria-hidden="true"><span style={{transform: 'scaleX(.9)'}}/><small>3:54</small><small>4:20</small></div>}
      <div className="stage-radio-meta">
        {playing && <span>Danach: <strong>Northern Lights</strong> · Tidewater</span>}
        {playing && <span>On Air: <strong>ÆON</strong></span>}
        {state === 'stale' && <span>Stand von vorhin</span>}
      </div>
    </div>
    <div className="stage-radio-stream" data-state={stream.state} title="Stream">{stream.state === 'aus' ? <VolumeX aria-hidden="true"/> : <Volume2 aria-hidden="true"/>}<span>{stream.text}</span>{stream.state === 'blockiert' && <button type="button" tabIndex={-1}>Ton an</button>}</div>
  </section>;
}

export type StageProps = {
  agents?: DemoAgent[];
  /** Replaces the agent grid (Fokus, Terminals, Stack, empty states). */
  body?: ReactNode;
  view?: 'buehne' | 'terminal';
  poster?: boolean;
  conversation?: boolean;
  radio?: 'leiste' | 'karte' | 'aus' | 'vollbild';
  radioPanel?: ReactNode;
  ambience?: 'aurora' | 'ruhig' | 'kino' | 'aus';
  scene?: string;
  eyebrow?: string;
  title?: string;
  attention?: DemoAgent[];
  offline?: boolean;
  voice?: boolean;
  soundOff?: string;
  clock?: boolean;
  brake?: string;
  agentsOn?: boolean;
  /** Presence dock content (badges); guest shows the privacy chip. */
  guest?: boolean;
  presence?: ReactNode;
  camera?: boolean;
  autopilot?: {dim?: number; shift?: number; slow?: boolean; speaking?: boolean};
  motion?: 'full' | 'reduced';
  lowPower?: boolean;
  argus?: ReactNode;
  children?: ReactNode;
};

/** The stage section with header, body and overlays, as stage-view.tsx renders it. */
export function Stage({agents = [AEON, AETHRA], body, view = 'buehne', poster = true, conversation = false, radio = 'leiste', radioPanel, ambience = 'aurora', scene,
  eyebrow = 'Agents · Home', title = 'AI Fabric', attention = [], offline = false, voice = true, soundOff, clock = true, brake, agentsOn = true,
  guest = false, presence, camera = true, autopilot, motion = 'full', lowPower = false, argus, children}: StageProps) {
  const ap = autopilot ? {'data-autopilot': 'on', ...(autopilot.dim ? {'data-ap-dim': String(autopilot.dim)} : {}), ...(autopilot.shift ? {'data-ap-shift': String(autopilot.shift)} : {}),
    ...(autopilot.slow ? {'data-ap-slow': 'true'} : {}), ...(autopilot.speaking ? {'data-ap-speaking': 'true'} : {})} : {};
  return <section className={`stage ambience-${ambience} radio-${radio === 'vollbild' ? 'vollbild' : radio}`} {...ap} data-preview="false" data-attention={attention.length ? 'true' : 'false'}
    data-lowpower={lowPower ? 'true' : 'false'} data-mode="dark" data-motion={motion} data-overscan="false" data-agents={agentsOn ? 'true' : 'false'}
    style={css({'--accent': '#38B8FF', '--agent-a': agents[0]?.color ?? '#38B8FF', '--agent-b': agents[1]?.color ?? '#38B8FF', '--overscan': 0})}>
    {ambience !== 'aus' && <div className="stage-ambience" aria-hidden="true"><span/><span/><span/></div>}
    {scene && <div className="stage-scene" aria-hidden="true"><img src={scene} alt=""/></div>}
    {radio !== 'vollbild' && <header className="stage-header">
      <div className="stage-brand">
        <img className="signet" src={signet('edgeportal')} width={48} height={48} alt=""/>
        <div><span className="stage-eyebrow">{eyebrow}</span><strong>{title}<span className="stage-glut" aria-hidden="true">◆</span></strong></div>
      </div>
      {attention.length > 0 && <div className="stage-attention" role="alert">{attention.map(agent => <span key={agent.id} data-level={agent.level} style={css({'--agent': agent.color})}>
        <span className="stage-attention-form" aria-hidden="true">{LEVEL[agent.level].shape}</span><strong>{agent.name}</strong> {agent.level === 'dialog' ? 'braucht dich' : 'hat eine Frage'}</span>)}</div>}
      <div className="stage-status">
        {offline && <span className="stage-offline" role="status">Verbindung unterbrochen · letzter Stand</span>}
        {soundOff ? <span className="stage-sound-off" role="status"><VolumeX aria-hidden="true"/>{soundOff}</span> : voice && <span className="stage-voice"><Volume2 aria-hidden="true"/>Stimme an</span>}
        {clock && <time className="stage-clock"><strong>21:18</strong><span>Sonntag, 18. Oktober</span></time>}
      </div>
    </header>}
    {brake && <div className="stage-brake" role="alert"><span className="stage-brake-form" aria-hidden="true">■</span><strong>{brake}</strong><span className="stage-brake-hint">Lösen nur im Leitstand</span></div>}
    <div className="stage-body">
      {body ?? (agentsOn && <div className={`stage-agents view-${view}`} data-count={Math.min(6, Math.max(1, agents.length))} style={css({'--count': Math.max(1, agents.length)})}>
        {agents.map(agent => <AgentCard key={agent.id} agent={agent} poster={poster} compact={view === 'terminal'} conversation={conversation}/>)}
      </div>)}
      {argus}
      {radio === 'leiste' || radio === 'karte' ? (radioPanel ?? <RadioPanel placement={radio}/>) : radio === 'vollbild' ? radioPanel : null}
    </div>
    {(guest || presence) && <div className="presence-dock" aria-label="Anwesenheit">{presence}{guest && <span className="presence-badge" data-kind="private"><EyeOff aria-hidden="true"/>Gast im Raum · Privates ausgeblendet</span>}</div>}
    {camera && <span className="presence-camera"><ScanFace aria-hidden="true"/>Kamera mit Gesichtserkennung aktiv</span>}
    {children}
  </section>;
}
