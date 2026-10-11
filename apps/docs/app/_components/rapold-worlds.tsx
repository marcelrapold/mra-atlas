'use client';

import {useEffect, useRef, useState, type CSSProperties, type RefObject} from 'react';
import {ArrowUpRight, BookOpen, Check, ChevronRight, Download, Layers, MessageSquare, Monitor, Pause, Play, Radio, Sparkles} from 'lucide-react';
import identity from '../../../../brands/rapold/identity.json';
import worlds from '../../../../brands/rapold/worlds.json';
import {useActiveBrand} from './framework-shell';

type World = typeof worlds.products[number];
type Layer = {id: string; label: string; kind: string; path?: string; opacity?: number; depth?: number; blend?: string};
type Props = {productId: string; onProductChange: (id: string) => void; wordmarkTreatment: 'cut' | 'spectrum'; onWordmarkChange: (value: 'cut' | 'spectrum') => void};
const base = worlds.publicBase;
const pulseColors: Record<string, string> = {brand: '#0072ce', pink: '#f472b6', sky: '#38bdf8', yellow: '#fde047'};

function useMotionState(stage: RefObject<HTMLDivElement | null>) {
  const [reduced, setReduced] = useState(true);
  const [forcedColors, setForcedColors] = useState(false);
  const [visible, setVisible] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastPreference = window.matchMedia('(forced-colors: active)');
    const updatePreference = () => setReduced(preference.matches);
    const updateContrast = () => setForcedColors(contrastPreference.matches);
    const updateVisibility = () => setVisible(document.visibilityState === 'visible');
    updatePreference(); updateContrast(); updateVisibility();
    preference.addEventListener('change', updatePreference);
    contrastPreference.addEventListener('change', updateContrast);
    document.addEventListener('visibilitychange', updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {rootMargin: '120px', threshold: 0.01});
    if (stage.current) observer.observe(stage.current);
    return () => {preference.removeEventListener('change', updatePreference); contrastPreference.removeEventListener('change', updateContrast); document.removeEventListener('visibilitychange', updateVisibility); observer.disconnect();};
  }, [stage]);
  return {reduced, forcedColors, canRun: !reduced && !forcedColors && visible && onScreen};
}

function useParallax(stage: RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    const element = stage.current;
    const finePointer = window.matchMedia('(pointer: fine)');
    if (!element || !active) return;
    let frame = 0;
    const current = {x: 0, y: 0};
    const target = {x: 0, y: 0};
    const draw = () => {
      current.x += (target.x - current.x) * worlds.motion.parallaxLerp;
      current.y += (target.y - current.y) * worlds.motion.parallaxLerp;
      element.style.setProperty('--rw-pointer-x', String(current.x));
      element.style.setProperty('--rw-pointer-y', String(current.y));
      frame = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.0005 ? requestAnimationFrame(draw) : 0;
    };
    const wake = () => {if (!frame) frame = requestAnimationFrame(draw);};
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType === 'touch') return;
      const rect = element.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
      wake();
    };
    const reset = () => {target.x = 0; target.y = 0; wake();};
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', reset);
    finePointer.addEventListener('change', reset);
    return () => {cancelAnimationFrame(frame); element.removeEventListener('pointermove', move); element.removeEventListener('pointerleave', reset); finePointer.removeEventListener('change', reset); element.style.removeProperty('--rw-pointer-x'); element.style.removeProperty('--rw-pointer-y');};
  }, [stage, active]);
}

function FabricNetwork({active}: {active: boolean}) {
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {if (active) svg.current?.unpauseAnimations(); else svg.current?.pauseAnimations();}, [active]);
  return <svg ref={svg} className="rw-network" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    {worlds.fabricNetwork.edges.map(edge => {
      const a = worlds.fabricNetwork.nodes[edge.from];
      const b = worlds.fabricNetwork.nodes[edge.to];
      const pulse = edge.pulse;
      return <g key={`${edge.from}-${edge.to}`}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}/>
        {pulse && <circle className="rw-pulse" r="2.2" fill={pulseColors[pulse.color]} opacity="0">
          <animateMotion path={`M${a.x},${a.y} L${b.x},${b.y}`} dur={`${pulse.duration}s`} begin={`${pulse.delay}s`} repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;.9;.9;0" keyTimes="0;.15;.8;1" dur={`${pulse.duration}s`} begin={`${pulse.delay}s`} repeatCount="indefinite"/>
        </circle>}
      </g>;
    })}
    {worlds.fabricNetwork.nodes.map((node, index) => <circle key={index} className="rw-node" cx={node.x} cy={node.y} r={node.radius}/>)}
  </svg>;
}

type Particle = {x: number; y: number; radius: number; alpha: number; hue: number; vx: number; vy: number; phase: number; step: number};
function LearnParticles({active, stage}: {active: boolean; stage: RefObject<HTMLDivElement | null>}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const wakeRef = useRef<(() => void) | null>(null);
  useEffect(() => {activeRef.current = active; wakeRef.current?.();}, [active]);
  useEffect(() => {
    const element = canvas.current;
    const surface = stage.current;
    const context = element?.getContext('2d');
    if (!element || !surface || !context) return;
    let width = 0; let height = 0; let frame = 0; let previous = 0;
    let particles: Particle[] = [];
    const target = {x: 0, y: 0}; const pointer = {x: 0, y: 0};
    const finePointer = window.matchMedia('(pointer: fine)');
    const draw = (time: number) => {
      frame = 0;
      const moving = activeRef.current;
      const step = moving && previous ? Math.min((time - previous) / (1000 / 60), 2) : 0;
      previous = moving ? time : 0;
      pointer.x += ((moving ? target.x : 0) - pointer.x) * .055;
      pointer.y += ((moving ? target.y : 0) - pointer.y) * .055;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';
      for (const particle of particles) {
        if (moving) {
          particle.x = (particle.x + particle.vx * step + width) % width;
          particle.y = (particle.y + particle.vy * step + height) % height;
          particle.phase += particle.step * step;
        }
        const twinkle = moving ? .62 + .38 * Math.sin(particle.phase) : .86;
        context.beginPath();
        context.fillStyle = `hsl(${particle.hue} 92% 70% / ${particle.alpha * twinkle})`;
        context.shadowColor = `hsl(${particle.hue} 96% 64%)`;
        context.shadowBlur = 7 + particle.radius * 4;
        context.arc(particle.x + pointer.x * particle.radius * 7, particle.y + pointer.y * particle.radius * 7, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
      context.shadowBlur = 0;
      for (let i = 0; i < particles.length; i += 1) for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i]; const b = particles[j];
        if (a.x < width * .45 || b.x < width * .45) continue;
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance >= 112) continue;
        context.beginPath(); context.lineWidth = .55;
        context.strokeStyle = `hsl(252 88% 72% / ${(1 - distance / 112) * .045})`;
        context.moveTo(a.x + pointer.x * a.radius * 5, a.y + pointer.y * a.radius * 5);
        context.lineTo(b.x + pointer.x * b.radius * 5, b.y + pointer.y * b.radius * 5); context.stroke();
      }
      if (moving) frame = requestAnimationFrame(draw);
    };
    const wake = () => {cancelAnimationFrame(frame); previous = 0; frame = requestAnimationFrame(draw);};
    wakeRef.current = wake;
    const resize = () => {
      const rect = surface.getBoundingClientRect();
      width = Math.max(1, rect.width); height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(width * dpr); element.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      let seed = 1909;
      const random = () => {seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296;};
      particles = Array.from({length: width < 640 ? 24 : 58}, () => ({x: (random() < .72 ? .42 + random() * .58 : random()) * width, y: random() * height, radius: .7 + random() * 1.55, alpha: .24 + random() * .52, hue: random() < .86 ? 252 : 187, vx: -.055 + random() * .125, vy: -.17 + random() * .125, phase: random() * Math.PI * 2, step: .006 + random() * .008}));
      wake();
    };
    const move = (event: PointerEvent) => {
      if (!activeRef.current || !finePointer.matches || event.pointerType === 'touch') return;
      const rect = surface.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      target.y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    };
    const leave = () => {target.x = 0; target.y = 0;};
    const observer = new ResizeObserver(resize); observer.observe(surface);
    surface.addEventListener('pointermove', move); surface.addEventListener('pointerleave', leave);
    resize();
    return () => {cancelAnimationFrame(frame); wakeRef.current = null; observer.disconnect(); surface.removeEventListener('pointermove', move); surface.removeEventListener('pointerleave', leave);};
  }, [stage]);
  return <canvas ref={canvas} className="rw-particles" aria-hidden="true"/>;
}

function WorldArtwork({world, hidden, active, stage}: {world: World; hidden: Set<string>; active: boolean; stage: RefObject<HTMLDivElement | null>}) {
  const layers = world.layers as Layer[];
  return <div className="rw-artwork" aria-hidden="true">
    {world.id === 'fabric' && <>
      {!hidden.has('aurora') && <div className="rw-aurora"><i className="rw-halo rw-halo-a"/><i className="rw-halo rw-halo-b"/><i className="rw-halo rw-halo-c"/></div>}
      {!hidden.has('network') && <FabricNetwork active={active}/>}
      {!hidden.has('focus') && <div className="rw-focus"/>}
    </>}
    {world.id === 'learn' && <>
      <div className="rw-learn-lights"/>
      <div className="rw-learn-stack">{layers.filter(layer => layer.path && !hidden.has(layer.id)).map(layer => <img key={layer.id} className="rw-learn-layer" data-layer={layer.id} src={base + layer.path} width="1672" height="941" loading="lazy" decoding="async" alt="" style={{'--rw-layer-opacity': layer.opacity, '--rw-layer-depth': `${layer.depth}px`, mixBlendMode: layer.blend} as CSSProperties}/>)}</div>
      <div className="rw-learn-shield"/><div className="rw-learn-vignette"/>
      {!hidden.has('particles') && <LearnParticles active={active} stage={stage}/>}
    </>}
    {world.id === 'argus' && !hidden.has('folds') && <div className="rw-folds"><i/><i/></div>}
    {world.id === 'edgeportal' && !hidden.has('glow') && <div className="rw-edge-glow"/>}
    {(world.id === 'argus' || world.id === 'edgeportal') && !hidden.has('grid') && <div className="rw-grid"/>}
  </div>;
}

function WorldInterface({world, mode, glitch}: {world: World; mode: 'light' | 'dark'; glitch: boolean}) {
  const product = identity.products.find(item => item.id === world.id)!;
  return <div className="rw-interface">
    <div className="rw-world-header"><div className="rw-brand-row"><img src={base + product.variants[mode]} alt="" width="32" height="32"/><span>{product.name}</span></div><span className="rw-example-badge">Gestaltungsbeispiel</span></div>
    {world.id === 'fabric' && <div className="rw-hero-grid rw-fabric-layout">
      <div className="rw-hero-copy"><img className="rw-hero-signet" src={base + product.variants[mode]} alt="" width="104" height="104"/><h3 className="rapold-wordmark">AI Fabric</h3><p className="rw-headline">Ein Raum für<br/>alle Modelle.</p><p className="rw-description">Werkzeuge, Ideen und Wissen. Verbunden durch eine Oberfläche, die Raum zum Denken lässt.</p><div className="rw-tag-row"><span>Verbinden</span><span>Entwickeln</span><span>Verstehen</span></div></div>
      <div className="rw-fabric-cards"><div className="rw-glass-card rw-main-card"><div className="rw-card-kicker"><Sparkles size={18} aria-hidden="true"/><span>Dein Werkzeugkasten</span></div><h4>Was möchtest du<br/>heute weiterdenken?</h4><p>Ein ruhiger Ausgangspunkt.<br/>Viele mögliche Verbindungen.</p><div className="rw-prompt-example"><MessageSquare size={18} aria-hidden="true"/><span>Aus einer Idee wird ein Anfang.</span></div></div><div className="rw-feature-row"><div className="rw-glass-card rw-feature-card"><Layers size={22} aria-hidden="true"/><strong>Perspektiven</strong><span>Modelle zusammenbringen</span></div><div className="rw-glass-card rw-feature-card"><BookOpen size={22} aria-hidden="true"/><strong>Kontext</strong><span>Wissen weiterentwickeln</span></div></div></div>
    </div>}
    {world.id === 'learn' && <div className="rw-hero-grid rw-learn-layout" data-glitch={glitch}>
      <div className="rw-hero-copy"><img className="rw-hero-signet" src={base + product.variants[mode]} alt="" width="104" height="104"/><h3 className="rapold-wordmark">ÆON Learn</h3><p className="rw-headline">Wissen wird<br/>Verbindung.</p><p className="rw-description">Entdecken, ausprobieren und verstehen. Eine Lernwelt mit Tiefe und einer klaren Richtung.</p><div className="rw-tag-row"><span>KI verstehen</span><span>Praxis erleben</span><span>Weiterdenken</span></div></div>
      <div className="rw-terminal-wrap"><div className="rw-terminal"><div className="rw-terminal-header"><span className="rw-terminal-dots" aria-hidden="true"><i/><i/><i/></span><span>learn / knowledge.system</span><span>DEMO</span></div><div className="rw-terminal-body"><p><span>$</span> aeon learn --connect</p><p className="rw-terminal-comment"># Beispieltranskript</p><p><b>01</b> Neugier als Ausgangspunkt</p><p><b>02</b> Wissen in Kontext setzen</p><p><b>03</b> Ideen praktisch erproben</p><p><b>04</b> Erkenntnisse verbinden</p><p className="rw-terminal-result"><Check size={15} aria-hidden="true"/> Bereit für die nächste Frage.</p><p><span>$</span> <i className="rw-cursor" aria-hidden="true"/></p></div></div><p className="rw-demo-note">Fiktives Transkript · keine Befehlsausführung</p></div>
    </div>}
    {world.id === 'argus' && <div className="rw-argus-layout"><div className="rw-argus-heading"><div><p className="rw-card-kicker">Fokus. Überblick. Klarheit.</p><h3 className="rapold-wordmark">Argus</h3></div><img src={base + product.variants[mode]} width="132" height="132" alt=""/></div><div className="rw-dashboard"><div className="rw-dashboard-heading"><h4>Alles im Blick</h4><span>Beispieldaten</span></div><div className="rw-stat-grid"><div><span>Bereiche</span><strong>04</strong><small>Eine gemeinsame Ansicht</small></div><div><span>Hinweise</span><strong>02</strong><small>Mit klarer Priorität</small></div><div><span>Ansichten</span><strong>08</strong><small>Fokus nach Bedarf</small></div></div><div className="rw-example-list"><div><span className="rw-status-dot"/><span><strong>Übersicht</strong><small>Klare Struktur für jeden Bereich</small></span><span className="rw-state-label"><Check size={14} aria-hidden="true"/>Bereit</span></div><div><span className="rw-status-dot rw-status-note"/><span><strong>Perspektive</strong><small>Ein Hinweis im richtigen Kontext</small></span><span className="rw-state-label"><Radio size={14} aria-hidden="true"/>Hinweis</span></div></div></div><p className="rw-demo-note">CI-Anwendungsbeispiel · keine Verbindung zu Argus-Daten</p></div>}
    {world.id === 'edgeportal' && <div className="rw-edge-layout"><div className="rw-edge-intro"><h3 className="rapold-wordmark">EdgePortal</h3><p>Deine Räume. Gemeinsam verbunden.</p></div><div className="rw-edge-app"><div className="rw-edge-bar"><div className="rw-brand-row"><img src={base + product.variants[mode]} width="28" height="28" alt=""/><strong>EdgePortal</strong></div><span>Beispiel-Workspace</span></div><div className="rw-edge-body"><div className="rw-edge-nav" role="group" aria-label="Beispielnavigation"><span className="rw-edge-current"><Monitor size={17} aria-hidden="true"/>Übersicht</span><span><Layers size={17} aria-hidden="true"/>Screens</span><span><Radio size={17} aria-hidden="true"/>Sitzungen</span></div><div className="rw-edge-main"><div className="rw-dashboard-heading"><h4>Dein Workspace</h4><span>Beispieldaten</span></div><div className="rw-screen-grid">{['Fokus', 'Zusammenarbeit', 'Überblick'].map((label, index) => <div className="rw-screen-card" key={label}><div className="rw-screen-art" data-screen={index}><img src={base + product.variants[mode]} width="50" height="50" alt=""/></div><strong>{label}</strong><span>Screen 0{index + 1}</span></div>)}</div><div className="rw-session-row"><span><strong>Gemeinsamer Raum</strong><small>Beispiel für eine Sitzung</small></span><span className="rw-state-label"><Check size={14} aria-hidden="true"/>Vorbereitet</span></div></div></div></div><p className="rw-demo-note">Oberflächenbeispiel · Screens und Sitzungen sind fiktiv</p></div>}
    <div className="rw-world-footer"><span>Raumfalten / {world.title}</span><span>Rapold Design</span></div>
  </div>;
}

export default function RapoldWorlds({productId, onProductChange, wordmarkTreatment, onWordmarkChange}: Props) {
  const {mode} = useActiveBrand();
  const ownWorld = worlds.products.find(item => item.id === productId);
  const world = ownWorld ?? worlds.products[0];
  const selectedName = identity.products.find(item => item.id === productId)?.name;
  const stage = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [interfaceVisible, setInterfaceVisible] = useState(true);
  const [width, setWidth] = useState('wide');
  const [hiddenByProduct, setHiddenByProduct] = useState<Record<string, string[]>>({});
  const [glitch, setGlitch] = useState(false);
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const glitchFrame = useRef(0);
  const introducedProducts = useRef(new Set<string>());
  const [enteringProduct, setEnteringProduct] = useState<string | null>(null);
  const {reduced, forcedColors, canRun} = useMotionState(stage);
  const motionUnavailable = reduced || forcedColors;
  const active = canRun && !paused;
  const hidden = new Set(hiddenByProduct[world.id] ?? []);
  useParallax(stage, active && world.id === 'learn');
  useEffect(() => {
    setEnteringProduct(null);
    if (!active || introducedProducts.current.has(world.id)) return;
    introducedProducts.current.add(world.id);
    setEnteringProduct(world.id);
    const timer = setTimeout(() => setEnteringProduct(null), 950);
    return () => clearTimeout(timer);
  }, [active, world.id]);
  useEffect(() => {
    if (glitchTimer.current) clearTimeout(glitchTimer.current);
    cancelAnimationFrame(glitchFrame.current);
    setGlitch(false);
    return () => {if (glitchTimer.current) clearTimeout(glitchTimer.current); cancelAnimationFrame(glitchFrame.current);};
  }, [world.id, active]);
  const toggleLayer = (id: string) => setHiddenByProduct(current => {const values = new Set(current[world.id] ?? []); if (values.has(id)) values.delete(id); else values.add(id); return {...current, [world.id]: [...values]};});
  const previewGlitch = () => {
    if (!active) return;
    if (glitchTimer.current) clearTimeout(glitchTimer.current);
    cancelAnimationFrame(glitchFrame.current);
    setGlitch(false);
    // The effect is explicitly requested and has a finite duration.
    glitchFrame.current = requestAnimationFrame(() => {setGlitch(true); glitchTimer.current = setTimeout(() => setGlitch(false), 1250);});
  };
  const layers: Layer[] = [...world.layers];
  if (world.id === 'learn') layers.push({id: 'particles', label: 'Partikelfeld', kind: 'canvas'});

  return <section className="doc-section rapold-worlds" id="rapold-worlds" aria-labelledby="rapold-worlds-title">
    <div className="rw-section-heading"><div><p className="eyebrow">Identität trifft Atmosphäre</p><h2 id="rapold-worlds-title">Die Welt um das Zeichen.</h2><p>Die Hintergründe und Oberflächen machen jedes Produkt eigenständig. Die Zeichen und die Typografie halten die Familie zusammen.</p></div><a className="rapold-primary-action" href={base + 'rapold-product-worlds.zip'} download><Download size={18} aria-hidden="true"/>Produktwelten · ZIP</a></div>
    {!ownWorld && selectedName && <p className="notice rw-no-world">Für {selectedName} gibt es noch keine eigene Produktwelt. Die Vorschau zeigt die Welt von {world.label}; Signet, Formate und Downloads weiter unten gehören zu {selectedName}.</p>}
    <div className="rw-product-switch" role="group" aria-label="Produktwelt auswählen">{worlds.products.map(item => <button type="button" key={item.id} aria-pressed={item.id === ownWorld?.id} onClick={() => onProductChange(item.id)}>{item.label}<ChevronRight size={15} aria-hidden="true"/></button>)}</div>
    <div className="rw-toolbar"><div className="rw-treatment" role="group" aria-label="Wortmarke in der Produktwelt"><button type="button" aria-pressed={wordmarkTreatment === 'cut'} onClick={() => onWordmarkChange('cut')}>Facetten</button><button type="button" aria-pressed={wordmarkTreatment === 'spectrum'} onClick={() => onWordmarkChange('spectrum')}>Spektrum</button></div><label className="rw-width-label">Vorschaubreite<select value={width} onChange={event => setWidth(event.target.value)}><option value="wide">Verfügbarer Raum</option><option value="390">390 px</option><option value="320">320 px</option></select></label><button type="button" className="rw-motion-control" aria-pressed={paused} aria-disabled={motionUnavailable} onClick={() => {if (!motionUnavailable) setPaused(value => !value);}}>{paused || motionUnavailable ? <Play size={16} aria-hidden="true"/> : <Pause size={16} aria-hidden="true"/>}{forcedColors ? 'Kontrastmodus: statisch' : reduced ? 'Bewegung reduziert' : paused ? 'Bewegung fortsetzen' : 'Bewegung pausieren'}</button></div>
    <div className="rw-preview-well"><div className="rapold-world-viewport" data-preview-width={width}><div ref={stage} className="rapold-world-stage" data-world={world.id} data-world-mode={mode} data-running={active} data-entering={enteringProduct === world.id} data-wordmark={wordmarkTreatment} data-interface={interfaceVisible} role="region" aria-label={`${world.label} · ${mode === 'dark' ? 'dunkle' : 'helle'} Produktwelt`}>
      <WorldArtwork world={world} hidden={hidden} active={active} stage={stage}/>
      {interfaceVisible ? <WorldInterface world={world} mode={mode} glitch={glitch}/> : <div className="rw-background-label"><span>{world.label}</span><strong>{world.title}</strong><span>Hintergrund ohne Oberfläche</span></div>}
    </div></div></div>
    <div className="rw-layer-controls"><div><span className="rw-control-caption">Sichtbare Ebenen</span><div className="rw-layer-buttons" role="group" aria-label={`Hintergrundebenen für ${world.label}`}>{layers.map(layer => <button type="button" key={layer.id} aria-pressed={!hidden.has(layer.id)} onClick={() => toggleLayer(layer.id)}><span className="rw-layer-check" aria-hidden="true">{!hidden.has(layer.id) && <Check size={13}/>}</span>{layer.label}</button>)}</div></div><div className="rw-view-controls"><button type="button" aria-pressed={interfaceVisible} onClick={() => setInterfaceVisible(value => !value)}><Layers size={16} aria-hidden="true"/>{interfaceVisible ? 'Oberfläche sichtbar' : 'Oberfläche einblenden'}</button>{world.id === 'learn' && interfaceVisible && <button type="button" aria-disabled={!active} onClick={previewGlitch}><Sparkles size={16} aria-hidden="true"/>Glitch testen</button>}</div></div>
    <p className="rw-motion-note">{forcedColors ? 'Dein Kontrastmodus ist aktiv. Die dekorativen Hintergründe und Bewegungen sind ausgeschaltet.' : reduced ? 'Deine Einstellung für reduzierte Bewegung ist aktiv. Alle Inhalte bleiben statisch sichtbar.' : paused ? 'Alle Bewegungen sind pausiert. Diese Einstellung bleibt beim Produktwechsel erhalten.' : world.id === 'learn' ? 'Die Tiefe reagiert auf einen feinen Zeiger. Glitch wird nur auf Knopfdruck gezeigt; das Transkript bleibt vollständig lesbar.' : 'Langsame Bewegung liegt hinter dem Inhalt. Ausserhalb des sichtbaren Bereichs und bei verborgenem Tab wird sie angehalten.'}{width !== 'wide' && ' Die Breite gilt für diese Referenzfläche.'}</p>
    <div className="rw-details"><div><p className="eyebrow">{world.sourceLabel}</p><h3>{world.title}</h3><p>{world.description}</p><p className="rw-source-note">{world.sourceNote}</p>{world.sourceUrl && <a href={world.sourceUrl} target="_blank" rel="noreferrer">Original ansehen<ArrowUpRight size={16} aria-hidden="true"/><span className="sr-only"> (neuer Tab)</span></a>}</div><div><h3>So wird die Gestaltung eingesetzt</h3><ul>{world.rules.map(rule => <li key={rule}>{rule}</li>)}</ul><div className="rw-resource-links"><a href={base + 'product-worlds/index.html'} target="_blank" rel="noreferrer">HTML-Referenz öffnen<span className="sr-only"> (neuer Tab)</span></a><a href={base + 'worlds.json'}>Gestaltungswerte · JSON</a><a href={base + 'world-provenance.json'}>Herkunft & Lizenzen</a><a href={base + 'worlds.css'} download>Hintergrund-CSS</a></div></div></div>
  </section>;
}
