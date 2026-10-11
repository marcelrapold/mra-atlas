#!/usr/bin/env node
/** Portable Rapold product worlds. Generates no logo exports and copies no private app code. */
import {readFile, writeFile, mkdir, readdir, rm} from 'node:fs/promises';
import {dirname, join, resolve, posix} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import JSZip from 'jszip';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const canonicalRoot = join(repositoryRoot, 'brands/rapold');
const publicRoot = join(repositoryRoot, 'apps/docs/public/brands/rapold');
const zipDate = new Date('2000-01-01T00:00:00.000Z');
const publicBaseTag = '<base href="/brands/rapold/product-worlds/">';
const expectedProducts = ['fabric', 'learn', 'argus', 'edgeportal'];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const jsonForHtml = value => JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));

function safePath(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9._/-]+$/.test(value) || value.startsWith('/') || value.split('/').some(p => !p || p === '.' || p === '..') || posix.normalize(value) !== value) {
    throw new Error(`Unsafe product-world path: ${String(value)}`);
  }
  return value;
}

function mimeFor(path) {
  if (/\/(?:LICENSE|NOTICE)$/.test(path)) return 'text/plain';
  const ext = path.split('.').at(-1).toLowerCase();
  const mime = {css:'text/css', js:'text/javascript', html:'text/html', json:'application/json', md:'text/markdown', txt:'text/plain', svg:'image/svg+xml', webp:'image/webp', png:'image/png', woff2:'font/woff2', zip:'application/zip'}[ext];
  if (!mime) throw new Error(`Unsupported product-world file type: ${path}`);
  return mime;
}

async function walk(relative) {
  const paths = [];
  for (const entry of await readdir(join(canonicalRoot, safePath(relative)), {withFileTypes:true})) {
    const path = safePath(posix.join(relative, entry.name));
    if (entry.isDirectory()) paths.push(...await walk(path));
    else if (entry.isFile()) paths.push(path);
    else throw new Error(`Only regular source files may be packaged: ${path}`);
  }
  return paths.sort();
}

function validateSources(worlds, identity, provenance) {
  if (worlds.brandId !== 'rapold' || worlds.publicBase !== '/brands/rapold/' || worlds.identity !== 'identity.json') throw new Error('Invalid product-world catalog.');
  if (JSON.stringify(worlds.products?.map(p => p.id)) !== JSON.stringify(expectedProducts)) throw new Error('The portable kit needs exactly the four declared product worlds.');
  for (const world of worlds.products) {
    if (!identity.products.some(p => p.id === world.id)) throw new Error(`Unknown product-world signet: ${world.id}`);
    if (!['original-adapted', 'approved-ci-application'].includes(world.sourceKind)) throw new Error(`Unclear source scope: ${world.id}`);
    if (!world.sourceNote || !world.layers?.length) throw new Error(`Incomplete product-world documentation: ${world.id}`);
    if (world.sourceUrl && !/^https:\/\/(?:ai|learn)\.rapold\.io\//.test(world.sourceUrl)) throw new Error(`Unexpected public reference: ${world.id}`);
    for (const layer of world.layers) if (layer.path && !safePath(layer.path).startsWith('assets/worlds/')) throw new Error(`Layer is outside the world asset tree: ${layer.path}`);
  }
  const net = worlds.fabricNetwork;
  if (net.width !== 1600 || net.height !== 900 || net.nodes?.length !== 26 || net.edges?.length !== 33) throw new Error('The documented AI network geometry is incomplete.');
  for (const point of net.nodes) if (![point.x, point.y, point.radius].every(Number.isFinite) || point.x < 0 || point.x > net.width || point.y < 0 || point.y > net.height || point.radius <= 0) throw new Error('Invalid network node.');
  for (const edge of net.edges) {
    if (![edge.from, edge.to].every(index => Number.isInteger(index) && index >= 0 && index < net.nodes.length)) throw new Error('Invalid network edge.');
    if (edge.pulse && (!Number.isFinite(edge.pulse.duration) || edge.pulse.duration <= 0 || !Number.isFinite(edge.pulse.delay) || !worlds.products[0].palette[edge.pulse.color])) throw new Error('Invalid network pulse.');
  }
  if (identity.fonts.families.map(f => f.family).join('|') !== 'Geist|Geist Mono') throw new Error('The common Rapold typography must be retained.');
  if (provenance.assets?.length !== 4 || provenance.assets.some(asset => asset.modified !== false)) throw new Error('The four original Learn layers must remain unmodified.');
}

function networkMarkup(worlds) {
  const net = worlds.fabricNetwork;
  const palette = worlds.products.find(world => world.id === 'fabric').palette;
  const pathFor = edge => `M${net.nodes[edge.from].x} ${net.nodes[edge.from].y}L${net.nodes[edge.to].x} ${net.nodes[edge.to].y}`;
  return `<svg class="rw-network" viewBox="0 0 ${net.width} ${net.height}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <g class="rw-network-lines" fill="none" stroke="${escapeHtml(palette.brand)}" stroke-width="1" stroke-opacity=".07">${net.edges.map(edge => `<line x1="${net.nodes[edge.from].x}" y1="${net.nodes[edge.from].y}" x2="${net.nodes[edge.to].x}" y2="${net.nodes[edge.to].y}"/>`).join('')}</g>
    <g class="rw-network-nodes" fill="${escapeHtml(palette.brand)}" fill-opacity=".18">${net.nodes.map(point => `<circle class="rw-node" cx="${point.x}" cy="${point.y}" r="${point.radius}"/>`).join('')}</g>
    <g class="rw-pulses">${net.edges.filter(edge => edge.pulse).map(edge => `<circle class="rw-pulse" r="2.2" fill="${escapeHtml(palette[edge.pulse.color])}" opacity="0"><animateMotion path="${pathFor(edge)}" dur="${edge.pulse.duration}s" begin="${edge.pulse.delay}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.9;.9;0" keyTimes="0;.15;.8;1" dur="${edge.pulse.duration}s" begin="${edge.pulse.delay}s" repeatCount="indefinite"/></circle>`).join('')}</g>
  </svg>`;
}

function artworkMarkup(world, worlds) {
  if (world.id === 'fabric') return `<div class="rw-aurora" data-rw-layer="aurora"><i class="rw-halo rw-halo-a"></i><i class="rw-halo rw-halo-b"></i><i class="rw-halo rw-halo-c"></i></div><div class="rw-network-wrap" data-rw-layer="network">${networkMarkup(worlds)}</div><div class="rw-focus" data-rw-layer="focus"></div>`;
  if (world.id === 'learn') return `<div class="rw-learn-lights"></div><div class="rw-learn-stack">${world.layers.map(layer => `<img class="rw-learn-layer" data-layer="${escapeHtml(layer.id)}" data-rw-layer="${escapeHtml(layer.id)}" src="./${safePath(layer.path)}" width="1672" height="941" alt="" decoding="async" style="--rw-layer-opacity:${layer.opacity};--rw-layer-depth:${layer.depth}px;mix-blend-mode:${escapeHtml(layer.blend)}">`).join('')}</div><div class="rw-learn-shield"></div><div class="rw-learn-vignette"></div><canvas class="rw-particles" data-rw-layer="particles" aria-hidden="true"></canvas>`;
  if (world.id === 'argus') return '<div class="rw-folds" data-rw-layer="folds"><i></i><i></i></div><div class="rw-grid" data-rw-layer="grid"></div>';
  return '<div class="rw-edge-glow" data-rw-layer="glow"></div><div class="rw-grid" data-rw-layer="grid"></div>';
}

const terminalTranscript = [
  '$ aeon learn — Beispiel',
  '',
  '✓ Wissensraum vorbereitet',
  '✓ Verbindungen sichtbar gemacht',
  '✓ Nächsten Lernschritt gefunden',
  '',
  'Fragen → Verstehen → Anwenden',
  '',
  'Bereit für eine neue Perspektive.',
].join('\n');

function previewMarkup(world) {
  if (world.id === 'fabric') return `<div class="rw-kit-glass rw-kit-access"><span class="rw-kit-eyebrow">Oberflächenmuster</span><h3>Ein klarer Einstieg.</h3><p>Glas hält den Inhalt zusammen. Das Signalnetz schafft Raum.</p><div class="rw-kit-surface-row"><span>Agenten</span><span class="rw-kit-status">Verbunden</span></div><div class="rw-kit-surface-row"><span>Workflows</span><span class="rw-kit-status">Bereit</span></div><div class="rw-kit-surface-row"><span>Wissen</span><span class="rw-kit-status">Im Kontext</span></div><p class="rw-kit-caption">Gestaltungsbeispiel ohne Anmeldung oder echte Betriebsdaten.</p></div>`;
  if (world.id === 'learn') return `<div class="rw-kit-terminal"><div class="rw-kit-terminal-bar"><span class="rw-kit-terminal-dots" aria-hidden="true">● ● ●</span><span>ÆON · Lernraum</span></div><div class="rw-kit-terminal-body"><pre>${escapeHtml(terminalTranscript)}</pre><span class="rw-kit-terminal-cursor" aria-hidden="true">▌</span></div><div class="rw-kit-terminal-footer">Demotranskript · keine echte Ausführung</div></div>`;
  if (world.id === 'argus') return `<div class="rw-kit-dashboard"><div class="rw-kit-panel"><span class="rw-kit-eyebrow">Beispieldaten</span><h3>Alles Wesentliche im Blick.</h3><div class="rw-kit-metrics"><div><strong>24</strong><span>Signale</span></div><div><strong>03</strong><span>Bereiche</span></div><div><strong>01</strong><span>Hinweis</span></div></div></div><div class="rw-kit-panel rw-kit-surface-row"><span><b>●</b> Verbindung A</span><span>Bereit</span></div><div class="rw-kit-panel rw-kit-surface-row"><span><b>◇</b> Verbindung B</span><span>Prüfen</span></div></div>`;
  return `<div class="rw-kit-workspace"><div class="rw-kit-workspace-header"><strong>Arbeitsraum</strong><span class="rw-kit-caption">Beispiel</span></div><div class="rw-kit-workspace-body"><div class="rw-kit-workspace-rail" aria-label="Beispielbereiche"><span>Übersicht</span><span>Screens</span><span>Sitzungen</span></div><div class="rw-kit-screens"><div><span class="rw-kit-screen-icon" aria-hidden="true"></span><strong>Screen A</strong><small>Bereit</small></div><div><span class="rw-kit-screen-icon" aria-hidden="true"></span><strong>Screen B</strong><small>Bereit</small></div></div></div><div class="rw-kit-workspace-footer">Zwei Screens · ein gemeinsamer Kontext · Beispieldaten</div></div>`;
}

function productMarkup(world, worlds, identity) {
  const product = identity.products.find(p => p.id === world.id);
  const defaultMode = world.id === 'fabric' ? 'light' : 'dark';
  const layers = [...world.layers, ...(world.id === 'learn' ? [{id:'particles', label:'Sternfeld'}] : [])];
  const variants = [['dark','Für dunkle Flächen'], ['light','Für helle Flächen'], ['mono-white','Weiss'], ['mono-black','Schwarz'], ['current-color','currentColor']];
  return `<article class="rw-kit-world" id="world-${world.id}" data-rw-world="${world.id}" aria-labelledby="world-${world.id}-title">
    <header class="rw-kit-section-heading"><div><p class="rw-kit-eyebrow">${escapeHtml(world.sourceLabel)}</p><h2 id="world-${world.id}-title">${escapeHtml(world.label)} <span>${escapeHtml(world.title)}</span></h2></div><a href="#world-${world.id}-details">Ebenen &amp; Verwendung ↓</a></header>
    <div class="rapold-world-viewport"><div class="rapold-world-stage" data-world="${world.id}" data-world-mode="${defaultMode}" data-default-mode="${defaultMode}" data-running="false" data-wordmark="cut">
      <div class="rw-artwork" aria-hidden="true">${artworkMarkup(world, worlds)}</div>
      <div class="rw-interface rw-kit-interface"><div class="rw-kit-intro"><div class="rw-kit-product-brand"><img class="rw-kit-signet" data-rw-logo data-light-src="./${safePath(product.variants.light)}" data-dark-src="./${safePath(product.variants.dark)}" src="./${safePath(product.variants[defaultMode])}" width="72" height="72" alt=""><p class="rapold-wordmark">${escapeHtml(world.label)}</p></div><p class="rw-kit-world-title">${escapeHtml(world.title)}</p><p class="rw-kit-world-description">${escapeHtml(world.description)}</p><div class="rw-kit-mini-features">${world.rules.map(rule => `<p>${escapeHtml(rule)}</p>`).join('')}</div></div>${previewMarkup(world)}</div>
    </div></div>
    <div class="rw-kit-world-meta" id="world-${world.id}-details"><p>${escapeHtml(world.sourceNote)}${world.sourceUrl ? ` <a href="${escapeHtml(world.sourceUrl)}" target="_blank" rel="noopener noreferrer">Öffentliche Referenz ↗</a>` : ''}</p>
      <fieldset class="rw-kit-layer-controls" data-rw-controls hidden><legend>Dekorative Ebenen</legend>${layers.map(layer => `<label><input type="checkbox" data-rw-toggle="${world.id}:${layer.id}" checked> ${escapeHtml(layer.label)}</label>`).join('')}</fieldset>
      <details><summary>Signets als SVG &amp; Integration</summary><p>Die Signets sind Vektoren ohne Schrift. Der Produktname bleibt editierbarer HTML-Text in Geist.</p><div class="rw-kit-downloads">${variants.map(([variant,label]) => `<a href="./${safePath(product.variants[variant])}" download="${world.id}-${variant}.svg">${escapeHtml(label)} · SVG</a>`).join('')}</div><p><code>currentColor</code> erbt die Textfarbe beim Einfügen als Inline-SVG. Eine SVG-Datei in einem <code>img</code>-Element erbt diese Farbe nicht.</p><pre><code>${escapeHtml(`<section class="rapold-world-stage" data-world="${world.id}"\n  data-world-mode="${defaultMode}" data-running="false" data-wordmark="cut">\n  <div class="rw-artwork" aria-hidden="true">…</div>\n  <div class="rw-interface">…</div>\n</section>`)}</code></pre><p>Die vollständigen Ebenen und das ausführbare Verhalten stehen in dieser HTML-Datei und in <a href="./kit.js" download>kit.js</a>. Die <a href="./README.md">Anleitung</a> beschreibt Dateipfade und Zustände.</p></details>
    </div>
  </article>`;
}

function makeHtml(worlds, identity) {
  return `<!doctype html>
<html lang="de-CH" data-brand="rapold" data-mode="light">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>Rapold · Produktwelten</title><meta name="description" content="Vier Rapold-Produktwelten mit lokalen Assets, Geist, originalen Learn-Ebenen und steuerbarer Bewegung."><link rel="stylesheet" href="./assets/fonts/fonts.css"><link rel="stylesheet" href="./wordmarks.css"><link rel="stylesheet" href="./worlds.css"><link rel="stylesheet" href="./kit.css"><script src="./kit.js" defer></script></head>
<body class="rw-kit"><a class="rw-kit-skip" href="#worlds">Zu den Produktwelten</a><main id="main" class="rw-kit-main">
  <header class="rw-kit-header"><p class="rw-kit-eyebrow">Rapold · Raumfalten</p><h1>Eine Identität.<br>Vier eigene Welten.</h1><p>Signets, Wortmarken, Oberflächen und Bewegung als direkt verwendbares HTML-Kit. Alle Dateien liegen lokal bei.</p><nav class="rw-kit-file-links" aria-label="Kit-Dateien"><a href="./README.md">Anleitung</a><a href="./worlds.json" download>Weltenvertrag · JSON</a><a href="./kit-manifest.json" download>Dateiliste &amp; SHA-256</a><a href="./sources/world-provenance.json" download>Herkunft</a></nav></header>
  <div class="rw-kit-toolbar" data-rw-controls hidden aria-label="Darstellung der Produktwelten"><label>Produktwelt<select id="rw-kit-product"><option value="all">Alle vier</option>${worlds.products.map(world => `<option value="${world.id}">${escapeHtml(world.label)}</option>`).join('')}</select></label><label>Darstellung<select id="rw-kit-mode"><option value="product">Produktstandard</option><option value="light">Hell</option><option value="dark">Dunkel</option></select></label><label>Wortmarke<select id="rw-kit-wordmark"><option value="cut">Facetten</option><option value="spectrum">Spektrum</option></select></label><div class="rw-kit-motion-control"><span>Bewegung</span><button id="rw-kit-motion" type="button" aria-pressed="false" aria-describedby="rw-kit-motion-help">Bewegung pausieren</button></div><p id="rw-kit-motion-help">Die Systempräferenz für reduzierte Bewegung hat Vorrang. Ausserhalb des sichtbaren Bereichs und in inaktiven Tabs pausieren die Effekte.</p></div>
  <p id="rw-kit-status" class="rw-kit-sr" role="status" aria-live="polite" aria-atomic="true"></p><noscript><p class="rw-kit-notice">Alle vier Welten und ihre Downloads sind ohne JavaScript sichtbar. Bewegung ist pausiert; die Darstellungs- und Ebenenwahl benötigt JavaScript.</p></noscript>
  <div id="worlds">${worlds.products.map(world => productMarkup(world, worlds, identity)).join('\n')}</div>
  <footer class="rw-kit-footer"><h2>Herkunft &amp; Rechte</h2><p>AI Fabric: selbstständig implementierte öffentliche Gestaltungsmuster. ÆON Learn: vier unveränderte Original-Layer mit <a href="./assets/worlds/learn/LICENSE">Apache-2.0-Lizenz</a> und <a href="./assets/worlds/learn/NOTICE">Herkunftshinweis</a>. Argus und EdgePortal: CI-Anwendungsbeispiele.</p><p>Geist und Geist Mono liegen unter der <a href="./assets/fonts/OFL.txt">SIL Open Font License 1.1</a> bei. Die gemeinsame Typografie und neue Signets sind eine bewusste Weiterentwicklung. Dieser Export erteilt keine pauschale Lizenz an Produktnamen, Marken oder fremdem App-Code.</p><p><a href="./worlds.css" download>worlds.css</a> · <a href="./wordmarks.css" download>wordmarks.css</a> · <a href="./kit.css" download>kit.css</a> · <a href="./kit.js" download>kit.js</a></p></footer>
</main><script type="application/json" id="rw-kit-data">${jsonForHtml({worlds, terminalTranscript})}</script></body></html>\n`;
}

const kitCss = `/* Portable preview chrome. Product atmosphere is defined in the unchanged worlds.css. */
:root{font-family:Geist,system-ui,sans-serif;font-synthesis:none;color-scheme:light;--rw-kit-bg:#f4f7fb;--rw-kit-fg:#142039;--rw-kit-muted:#4b5b73;--rw-kit-panel:#fff;--rw-kit-border:#c9d6e6;--rw-kit-link:#0066b3}
*{box-sizing:border-box}body{margin:0}button,input,select{font:inherit}button,a,select,input{touch-action:manipulation}button,select,input{accent-color:#0066b3}a{color:var(--rw-kit-link);text-underline-offset:.22em}a:hover{text-decoration-thickness:2px}button{cursor:pointer}button:disabled{cursor:default}img{max-width:100%}[hidden]{display:none!important}:focus-visible{outline:3px solid var(--rw-kit-link);outline-offset:4px}pre,code{font-family:'Geist Mono',monospace}pre{white-space:pre-wrap;overflow-wrap:anywhere}h1,h2,h3,p{margin-top:0}.rw-kit{background:var(--rw-kit-bg);color:var(--rw-kit-fg);line-height:1.55}.rw-kit-main{max-width:1460px;margin:auto;padding:clamp(16px,4vw,56px)}.rw-kit-header{max-width:850px;padding:30px 0 28px}.rw-kit-eyebrow{font-family:'Geist Mono',monospace;font-size:12px;font-weight:600;letter-spacing:.075em;text-transform:uppercase}.rw-kit-header h1{font-size:clamp(38px,6vw,76px);letter-spacing:-.058em;line-height:1.04;margin:18px 0 24px}.rw-kit-header>p:last-of-type{max-width:66ch;color:var(--rw-kit-muted);font-size:18px}.rw-kit-file-links,.rw-kit-downloads{display:flex;flex-wrap:wrap;gap:8px 20px}.rw-kit-file-links a,.rw-kit-downloads a{display:inline-flex;align-items:center;min-height:44px}.rw-kit-toolbar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;padding:22px;border:1px solid var(--rw-kit-border);border-radius:16px;background:var(--rw-kit-panel);margin:10px 0 54px}.rw-kit-toolbar label,.rw-kit-motion-control{display:grid;gap:7px;align-content:start;font-size:13px;font-weight:600}.rw-kit-toolbar select,.rw-kit-toolbar button{width:100%;min-height:46px;padding:10px;border:1px solid var(--rw-kit-border);border-radius:8px;color:var(--rw-kit-fg);background:var(--rw-kit-panel)}.rw-kit-toolbar button[aria-pressed=true]{background:var(--rw-kit-fg);color:var(--rw-kit-panel)}.rw-kit-toolbar button:disabled{opacity:.72}.rw-kit-toolbar>p{grid-column:1/-1;margin:0;font-size:12px;color:var(--rw-kit-muted)}.rw-kit-world{margin:0 0 76px;scroll-margin-top:24px}.rw-kit-section-heading{display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:12px 24px;margin-bottom:18px}.rw-kit-section-heading p{margin-bottom:6px;color:var(--rw-kit-muted)}.rw-kit-section-heading h2{margin:0;font-size:clamp(24px,3.3vw,38px);letter-spacing:-.04em;line-height:1.15}.rw-kit-section-heading h2 span{display:block;font-weight:450;font-size:16px;letter-spacing:0;color:var(--rw-kit-muted);margin-top:8px}.rw-kit-section-heading>a{min-height:44px;display:inline-flex;align-items:center;font-size:14px}.rw-kit .rapold-world-stage{min-height:560px;border-radius:24px}.rw-kit .rw-kit-interface{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.92fr);align-items:center;gap:clamp(24px,4vw,70px);padding:clamp(24px,4vw,60px);min-height:560px}.rw-kit-intro,.rw-kit-interface>*{min-width:0}.rw-kit-product-brand{display:flex;align-items:center;gap:14px;margin-bottom:26px}.rw-kit-signet{width:68px;height:68px;flex:none}.rw-kit-product-brand .rapold-wordmark{font-size:clamp(28px,3.4vw,44px);margin:0;padding-bottom:.09em;overflow-wrap:anywhere}.rw-kit-world-title{font-size:clamp(27px,3vw,43px);line-height:1.13;font-weight:650;letter-spacing:-.04em;margin-bottom:20px}.rw-kit-world-description{max-width:54ch;font-size:15px;line-height:1.7}.rw-kit-mini-features{display:grid;gap:8px;margin-top:25px}.rw-kit-mini-features p{font-size:12px;padding-left:16px;position:relative;margin:0;max-width:58ch}.rw-kit-mini-features p:before{content:'';position:absolute;left:0;top:.7em;width:4px;height:4px;border-radius:50%;background:currentColor}.rw-kit-glass{background:hsl(var(--rw-card,0 0% 100%)/.85);backdrop-filter:blur(24px);border:1px solid hsl(var(--rw-border,214.3 31.8% 91.4%)/.8);border-radius:24px;box-shadow:0 20px 40px -26px #06142c80;padding:clamp(20px,3vw,34px)}.rw-kit-glass h3,.rw-kit-panel h3{font-size:26px;letter-spacing:-.035em;line-height:1.16;margin:14px 0}.rw-kit-glass>p{font-size:14px}.rw-kit-surface-row{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.rw-kit-access .rw-kit-surface-row{padding:15px 0;border-top:1px solid hsl(var(--rw-border,214.3 31.8% 91.4%)/.7);font-size:14px}.rw-kit-status{font-family:'Geist Mono',monospace;font-size:11px;border:1px solid currentColor;border-radius:999px;padding:3px 8px}.rw-kit-caption{font-size:11px!important;margin:14px 0 0;opacity:.78}.rw-kit-panel{padding:24px;background:var(--rw-kit-local-card,#0b182ce8);border:1px solid var(--rw-kit-local-border,#284361);border-radius:14px}.rw-kit-dashboard{display:grid;gap:14px}.rw-kit-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:30px}.rw-kit-metrics div{display:grid;gap:5px}.rw-kit-metrics strong{font-family:'Geist Mono',monospace;font-size:32px;line-height:1}.rw-kit-metrics span{font-size:11px;opacity:.75}.rw-kit-workspace{border:1px solid var(--rw-kit-local-border,#284361);background:var(--rw-kit-local-card,#0b182ce8);border-radius:18px;overflow:hidden;box-shadow:0 20px 50px -30px #02091699}.rw-kit-workspace-header{padding:20px 22px;display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid var(--rw-kit-local-border,#284361)}.rw-kit-workspace-header .rw-kit-caption{margin:0}.rw-kit-workspace-body{display:grid;grid-template-columns:100px minmax(0,1fr);min-height:205px}.rw-kit-workspace-rail{padding:22px 14px;display:grid;align-content:start;gap:16px;background:var(--rw-kit-local-subtle,#101f36);font-size:11px}.rw-kit-screens{padding:24px 18px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.rw-kit-screens>div{display:grid;justify-items:center;align-content:center;gap:10px;text-align:center;font-size:11px}.rw-kit-screens small{font-size:10px;opacity:.8}.rw-kit-screen-icon{width:62px;max-width:100%;height:40px;border:1px solid currentColor;border-radius:5px;background:linear-gradient(153deg,#009dff33 48%,#a8edff11 48.5%)}.rw-kit-workspace-footer{padding:13px 18px;border-top:1px solid var(--rw-kit-local-border,#284361);font-size:10px;opacity:.8}.rw-kit-terminal{position:relative;overflow:hidden;border-radius:14px;background:#0b0918f2;color:#eee9ff;border:1px solid hsl(248 88% 74%/.3);box-shadow:0 0 60px -12px hsl(248 88% 74%/.45);animation:rw-kit-terminal-glow 5s ease-in-out infinite}.rw-kit-terminal:before,.rw-kit-terminal:after{position:absolute;inset:0;content:'';pointer-events:none;z-index:1}.rw-kit-terminal:before{background:repeating-linear-gradient(0deg,transparent,transparent 2px,hsl(248 88% 74%) 2px,hsl(248 88% 74%) 3px);opacity:.07}.rw-kit-terminal:after{background:radial-gradient(ellipse at center,transparent 55%,#05030f8c)}.rw-kit-terminal-bar{display:flex;gap:18px;align-items:center;padding:14px 18px;border-bottom:1px solid hsl(248 88% 74%/.2);font-family:'Geist Mono',monospace;font-size:10px}.rw-kit-terminal-dots{letter-spacing:3px;color:#b7a9f9}.rw-kit-terminal-body{padding:22px 20px;min-height:290px;font-family:'Geist Mono',monospace;font-size:12px;line-height:20px}.rw-kit-terminal-body pre{font:inherit;margin:0;display:inline}.rw-kit-terminal-cursor{color:#b7a9f9;animation:rw-kit-cursor 1.1s steps(1,end) infinite}.rw-kit-terminal-footer{padding:12px 18px;font-family:'Geist Mono',monospace;font-size:9px;border-top:1px solid hsl(248 88% 74%/.2);color:#c1b6e7}.rw-kit-world-meta{padding:20px 2px 0;max-width:1100px}.rw-kit-world-meta>p{color:var(--rw-kit-muted);font-size:14px;max-width:95ch}.rw-kit-layer-controls{border:0;padding:0;margin:20px 0;display:flex;flex-wrap:wrap;gap:8px 20px}.rw-kit-layer-controls legend{font-size:13px;font-weight:600;margin-bottom:8px}.rw-kit-layer-controls label{display:inline-flex;align-items:center;gap:7px;min-height:44px;font-size:13px;cursor:pointer}.rw-kit-layer-controls input{width:18px;height:18px}.rw-kit-world-meta details{border-top:1px solid var(--rw-kit-border);padding:12px 0}.rw-kit-world-meta summary{padding:10px 0;min-height:44px;cursor:pointer;font-size:14px;font-weight:600}.rw-kit-world-meta details p,.rw-kit-world-meta details a{font-size:13px}.rw-kit-world-meta details pre{padding:20px;background:var(--rw-kit-panel);border:1px solid var(--rw-kit-border);border-radius:10px;font-size:12px}.rw-kit-footer{border-top:1px solid var(--rw-kit-border);padding-top:32px;max-width:90ch;color:var(--rw-kit-muted);font-size:13px}.rw-kit-footer h2{font-size:22px;color:var(--rw-kit-fg)}.rw-kit-notice{padding:18px;border:1px solid var(--rw-kit-border);border-radius:12px;background:var(--rw-kit-panel)}.rw-kit-sr{position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}.rw-kit-skip{position:fixed;top:8px;left:8px;transform:translateY(-180%);padding:14px 20px;background:var(--rw-kit-panel);z-index:100}.rw-kit-skip:focus{transform:none}.rw-network-wrap{position:absolute;inset:0}.rw-network-wrap>.rw-network{width:100%;height:100%}.rapold-world-stage[data-world-mode=dark] .rw-network-lines{stroke-opacity:.1}.rapold-world-stage[data-world-mode=light]{--rw-kit-local-card:#ffffffe8;--rw-kit-local-border:#b8d0e4;--rw-kit-local-subtle:#eaf2fa}.rapold-world-stage[data-world-mode=dark]{--rw-kit-local-card:#0b182ce8;--rw-kit-local-border:#284361;--rw-kit-local-subtle:#101f36}.rapold-world-stage[data-world-mode=dark] .rw-kit-glass{background:hsl(222.2 84% 4.9%/.85);border-color:hsl(217.2 32.6% 17.5%/.8)}.rapold-world-stage[data-world-mode=dark] .rw-kit-access .rw-kit-surface-row{border-color:hsl(217.2 32.6% 17.5%/.8)}.rapold-world-stage[data-running=false] .rw-pulses{visibility:hidden}.rapold-world-stage[data-running=false] .rw-kit-terminal,.rapold-world-stage[data-running=false] .rw-kit-terminal-cursor{animation-play-state:paused}
.rw-kit .rapold-world-stage .rw-kit-glass{background:rgb(var(--rw-card-rgb)/.85);border-color:var(--rw-border)}
.rw-kit .rapold-world-stage .rw-kit-access .rw-kit-surface-row{border-color:color-mix(in srgb,var(--rw-border) 70%,transparent)}
.rw-kit .rapold-world-stage[data-world=fabric] .rw-kit-intro{padding:24px;border:1px solid var(--rw-border);border-radius:18px;background:rgb(var(--rw-card-rgb)/.90);box-shadow:var(--rw-shadow)}
.rw-kit .rw-kit-world-title{margin:0 0 20px}.rw-kit .rw-kit-glass h3,.rw-kit .rw-kit-panel h3{margin:14px 0}.rw-kit .rw-kit-caption{margin-top:14px}
.rw-kit-terminal{isolation:isolate}.rw-kit-terminal-bar,.rw-kit-terminal-body,.rw-kit-terminal-footer{position:relative;z-index:2}
.rw-kit[data-rw-ready=true] .rapold-world-stage[data-running=false] .rw-pulses{visibility:visible}
@keyframes rw-kit-terminal-glow{0%,100%{box-shadow:0 0 44px -14px hsl(248 88% 74%/.35)}50%{box-shadow:0 0 74px -10px hsl(248 88% 74%/.55)}}@keyframes rw-kit-cursor{0%,49%{opacity:1}50%,100%{opacity:0}}
@media(max-width:900px){.rw-kit-toolbar{grid-template-columns:repeat(2,minmax(0,1fr))}.rw-kit .rw-kit-interface{grid-template-columns:minmax(0,1fr);gap:30px}.rw-kit-intro{max-width:650px}.rw-kit-product-brand{margin-bottom:22px}.rw-kit .rapold-world-stage{min-height:0}.rw-kit-workspace,.rw-kit-terminal,.rw-kit-glass,.rw-kit-dashboard{max-width:620px;width:100%}.rw-kit-mini-features{display:none}}
@media(max-width:480px){.rw-kit-main{padding:16px}.rw-kit-toolbar{padding:16px;gap:14px;grid-template-columns:minmax(0,1fr)}.rw-kit .rw-kit-interface{padding:24px 18px}.rw-kit-signet{width:52px;height:52px}.rw-kit-product-brand{gap:9px}.rw-kit-world-title{font-size:29px}.rw-kit-workspace-body{grid-template-columns:76px minmax(0,1fr)}.rw-kit-workspace-rail{padding:20px 10px;font-size:10px}.rw-kit-screens{padding:20px 10px;gap:8px}.rw-kit-glass{padding:20px}.rw-kit-terminal-body{padding:20px 14px;font-size:10px;line-height:19px}.rw-kit-world{margin-bottom:56px}}
@media(prefers-color-scheme:dark){:root{color-scheme:dark;--rw-kit-bg:#080e1a;--rw-kit-fg:#e8f0fa;--rw-kit-muted:#a5b4ca;--rw-kit-panel:#111c2c;--rw-kit-border:#354863;--rw-kit-link:#71bfff}button,input,select{accent-color:#71bfff}}
@media(prefers-reduced-motion:reduce){.rw-kit *,.rw-kit *:before,.rw-kit *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.rw-pulses{display:none!important}}
@media(forced-colors:active){.rw-artwork{display:none}.rw-kit-terminal,.rw-kit-glass,.rw-kit-panel,.rw-kit-workspace{background:Canvas;color:CanvasText;border:1px solid CanvasText;box-shadow:none}.rw-kit-terminal:before,.rw-kit-terminal:after{display:none}.rw-kit-toolbar button[aria-pressed=true]{background:Highlight;color:HighlightText}.rw-kit .rapold-world-stage{background:Canvas;color:CanvasText}}
`;

/** Browser-only, dependency-free controller. Serialized as a classic script for file:// use. */
function worldKitController() {
  'use strict';
  const root = document;
  const dataNode = root.getElementById('rw-kit-data');
  if (!dataNode) return;
  const data = JSON.parse(dataNode.textContent);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const forcedColors = window.matchMedia('(forced-colors: active)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionButton = root.getElementById('rw-kit-motion');
  const status = root.getElementById('rw-kit-status');
  let userPaused = false;
  let currentProduct = 'all';
  let frame = 0;
  let lastTime = 0;
  const stages = Array.from(root.querySelectorAll('[data-rw-world]')).map(article => {
    const element = article.querySelector('.rapold-world-stage');
    const canvas = element.querySelector('.rw-particles');
    return {article, element, canvas, context:canvas ? canvas.getContext('2d') : null, id:article.dataset.rwWorld, visible:!('IntersectionObserver' in window), active:false, target:{x:0,y:0}, pointer:{x:0,y:0}, width:1, height:1, particles:[]};
  });

  function announce(message) { if (status) status.textContent = message; }
  function setLogo(stage) {
    const logo = stage.element.querySelector('[data-rw-logo]');
    if (logo) logo.src = stage.element.dataset.worldMode === 'dark' ? logo.dataset.darkSrc : logo.dataset.lightSrc;
  }
  function setMode(mode, notify) {
    if (!['product','light','dark'].includes(mode)) return;
    stages.forEach(stage => { stage.element.dataset.worldMode = mode === 'product' ? stage.element.dataset.defaultMode : mode; setLogo(stage); });
    const select = root.getElementById('rw-kit-mode');
    if (select) select.value = mode;
    if (notify) announce(`Darstellung: ${mode === 'product' ? 'Produktstandard' : mode === 'light' ? 'Hell' : 'Dunkel'}.`);
  }
  function setWordmark(treatment, notify) {
    if (!['cut','spectrum'].includes(treatment)) return;
    stages.forEach(stage => { stage.element.dataset.wordmark = treatment; });
    const select = root.getElementById('rw-kit-wordmark');
    if (select) select.value = treatment;
    if (notify) announce(`Wortmarke: ${treatment === 'cut' ? 'Facetten' : 'Spektrum'}.`);
  }
  function setProduct(product, notify) {
    if (product !== 'all' && !stages.some(stage => stage.id === product)) return;
    currentProduct = product;
    stages.forEach(stage => { stage.article.hidden = product !== 'all' && stage.id !== product; });
    const select = root.getElementById('rw-kit-product');
    if (select) select.value = product;
    syncMotion();
    if (notify) announce(product === 'all' ? 'Alle vier Produktwelten sichtbar.' : `${data.worlds.products.find(world => world.id === product).label} sichtbar.`);
  }

  function randomFactory(seed) { return () => { seed = (Math.imul(seed,1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
  function sizeCanvas(stage) {
    if (!stage.canvas || !stage.context) return;
    const rect = stage.element.getBoundingClientRect();
    stage.width = Math.max(1, rect.width);
    stage.height = Math.max(1, rect.height);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    stage.canvas.width = Math.round(stage.width * ratio);
    stage.canvas.height = Math.round(stage.height * ratio);
    stage.context.setTransform(ratio,0,0,ratio,0,0);
    const random = randomFactory(1909);
    stage.particles = Array.from({length:stage.width < 640 ? 24 : 58}, () => ({x:random() < .72 ? .42 + random()*.58 : random(), y:random(), radius:.7+random()*1.55, alpha:.24+random()*.52, hue:random()<.86?252:187, vx:-.055+random()*.125, vy:-.17+random()*.125, phase:random()*Math.PI*2, speed:.006+random()*.008}));
    drawParticles(stage,0);
  }
  function drawParticles(stage, delta) {
    const ctx = stage.context;
    if (!ctx || stage.canvas.hidden) return;
    ctx.clearRect(0,0,stage.width,stage.height);
    ctx.globalCompositeOperation = 'lighter';
    for (let i=0;i<stage.particles.length;i++) {
      const point = stage.particles[i];
      if (delta) { point.x=(point.x+point.vx*delta/stage.width+1)%1; point.y=(point.y+point.vy*delta/stage.height+1)%1; point.phase+=point.speed*delta; }
      const x=point.x*stage.width+stage.pointer.x*point.radius*7;
      const y=point.y*stage.height+stage.pointer.y*point.radius*7;
      for (let j=i+1;j<stage.particles.length;j++) {
        const other=stage.particles[j];
        if (point.x<.45||other.x<.45) continue;
        const ox=other.x*stage.width+stage.pointer.x*other.radius*5;
        const oy=other.y*stage.height+stage.pointer.y*other.radius*5;
        const distance=Math.hypot(ox-x,oy-y);
        if (distance>112) continue;
        ctx.shadowBlur=0;ctx.strokeStyle=`hsla(252,88%,72%,${(1-distance/112)*.045})`;ctx.lineWidth=.55;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ox,oy);ctx.stroke();
      }
      const twinkle=reduced.matches||forcedColors.matches ? .86 : .62+.38*Math.sin(point.phase);
      ctx.fillStyle=`hsla(${point.hue},92%,70%,${point.alpha*twinkle})`;
      ctx.shadowColor=`hsl(${point.hue},96%,64%)`;ctx.shadowBlur=7+point.radius*4;
      ctx.beginPath();ctx.arc(x,y,point.radius,0,Math.PI*2);ctx.fill();
    }
    ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over';
  }
  function schedule() {
    if (!frame && stages.some(stage => stage.active && stage.id==='learn')) frame=window.requestAnimationFrame(tick);
  }
  function tick(time) {
    frame=0;
    const elapsed=lastTime?Math.min(time-lastTime,64):16.667;
    lastTime=time;
    for (const stage of stages) if (stage.active && stage.id==='learn') {
      const smoothing=1-Math.pow(1-.075,elapsed/16.667);
      stage.pointer.x+=(stage.target.x-stage.pointer.x)*smoothing;
      stage.pointer.y+=(stage.target.y-stage.pointer.y)*smoothing;
      stage.element.style.setProperty('--rw-pointer-x',String(stage.pointer.x));
      stage.element.style.setProperty('--rw-pointer-y',String(stage.pointer.y));
      drawParticles(stage,elapsed/16.667);
    }
    schedule();
  }
  function syncMotion() {
    const staticPreference=reduced.matches||forcedColors.matches;
    const permitted=!userPaused&&!staticPreference&&!root.hidden;
    for (const stage of stages) {
      stage.active=permitted&&stage.visible&&!stage.article.hidden;
      stage.element.dataset.running=String(stage.active);
      stage.element.querySelectorAll('svg.rw-network').forEach(svg => {
        if (stage.active && typeof svg.unpauseAnimations==='function') svg.unpauseAnimations();
        else if (typeof svg.pauseAnimations==='function') svg.pauseAnimations();
      });
      if (staticPreference) {
        stage.target={x:0,y:0};stage.pointer={x:0,y:0};
        stage.element.style.setProperty('--rw-pointer-x','0');stage.element.style.setProperty('--rw-pointer-y','0');
        drawParticles(stage,0);
      }
    }
    if (motionButton) {
      motionButton.disabled=staticPreference;
      motionButton.setAttribute('aria-pressed',String(userPaused||staticPreference));
      motionButton.textContent=forcedColors.matches?'Kontrastmodus aktiv':reduced.matches?'Reduzierte Bewegung aktiv':userPaused?'Bewegung fortsetzen':'Bewegung pausieren';
    }
    if (!stages.some(stage => stage.active&&stage.id==='learn')) {if(frame)window.cancelAnimationFrame(frame);frame=0;lastTime=0;}
    schedule();
  }
  function setMotion(running, notify) {userPaused=!running;syncMotion();if(notify)announce(reduced.matches||forcedColors.matches?'Die Systempräferenz hält die Ansicht statisch.':userPaused?'Bewegung pausiert.':'Bewegung wird im sichtbaren Bereich fortgesetzt.');}

  for (const stage of stages) {
    setLogo(stage);
    sizeCanvas(stage);
    stage.element.addEventListener('pointermove',event => {
      if (!stage.active||!finePointer.matches||event.pointerType==='touch'||stage.id!=='learn') return;
      const rect=stage.element.getBoundingClientRect();
      stage.target={x:Math.max(-1,Math.min(1,(event.clientX-rect.left)/Math.max(1,rect.width)*2-1)),y:Math.max(-1,Math.min(1,(event.clientY-rect.top)/Math.max(1,rect.height)*2-1))};
    },{passive:true});
    stage.element.addEventListener('pointerleave',()=>{stage.target={x:0,y:0};},{passive:true});
  }
  if ('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries => {entries.forEach(entry => {const stage=stages.find(item=>item.element===entry.target);if(stage)stage.visible=entry.isIntersecting;});syncMotion();},{rootMargin:'120px'});
    stages.forEach(stage => observer.observe(stage.element));
  }
  if ('ResizeObserver' in window) {const resize=new ResizeObserver(entries=>{entries.forEach(entry=>{const stage=stages.find(item=>item.element===entry.target);if(stage)sizeCanvas(stage);});});stages.filter(stage=>stage.canvas).forEach(stage=>resize.observe(stage.element));}
  else window.addEventListener('resize',()=>stages.forEach(sizeCanvas),{passive:true});
  root.querySelectorAll('[data-rw-toggle]').forEach(input=>input.addEventListener('change',()=>{
    const [world,layer]=input.dataset.rwToggle.split(':');
    const stage=stages.find(item=>item.id===world);
    if (!stage) return;
    stage.element.querySelectorAll('[data-rw-layer]').forEach(element=>{if(element.dataset.rwLayer===layer)element.hidden=!input.checked;});
    if(stage.canvas&&!stage.canvas.hidden)drawParticles(stage,0);
  }));
  root.getElementById('rw-kit-mode')?.addEventListener('change',event=>setMode(event.target.value,true));
  root.getElementById('rw-kit-wordmark')?.addEventListener('change',event=>setWordmark(event.target.value,true));
  root.getElementById('rw-kit-product')?.addEventListener('change',event=>setProduct(event.target.value,true));
  motionButton?.addEventListener('click',()=>setMotion(userPaused,true));
  root.addEventListener('visibilitychange',syncMotion);
  const preferenceChanged=()=>{if(!finePointer.matches)stages.forEach(stage=>{stage.target={x:0,y:0};});syncMotion();};
  if(reduced.addEventListener)reduced.addEventListener('change',preferenceChanged);else reduced.addListener(preferenceChanged);
  if(forcedColors.addEventListener)forcedColors.addEventListener('change',preferenceChanged);else forcedColors.addListener(preferenceChanged);
  if(finePointer.addEventListener)finePointer.addEventListener('change',preferenceChanged);else finePointer.addListener(preferenceChanged);
  root.querySelectorAll('[data-rw-controls]').forEach(element=>{element.hidden=false;});
  root.body.dataset.rwReady='true';
  syncMotion();
  window.RapoldWorlds=Object.freeze({setMode:mode=>setMode(mode,false),setWordmark:treatment=>setWordmark(treatment,false),setProduct:product=>setProduct(product,false),setMotion:running=>setMotion(Boolean(running),false),getState:()=>({product:currentProduct,paused:userPaused,reducedMotion:reduced.matches,forcedColors:forcedColors.matches,worlds:stages.map(stage=>({id:stage.id,visible:!stage.article.hidden,running:stage.active,mode:stage.element.dataset.worldMode,wordmark:stage.element.dataset.wordmark}))})});
}

function makeReadme(worlds, identity) {
  return `# Rapold Produktwelten · HTML-Kit

ZIP vollständig entpacken und **index.html** öffnen. Alle vier Beispiele, Schriften,
Bilder, Signets, CSS- und JavaScript-Dateien liegen lokal bei. Für die Vorschau ist
kein Server, Build, Paketmanager, Konto oder Netzwerkabruf erforderlich. Externe
Links dienen nur dem bewusst gewählten Besuch der Quellen.

## Enthalten

- AI Fabric: unabhängig implementierte Aurora, deterministisches SVG-Netz und Glas.
- ÆON Learn: vier unveränderte Original-Hero-Layer, Partikel, Parallaxe und Terminal.
- Argus und EdgePortal: Anwendungen der freigegebenen Raumfalten-CI mit Beispieldaten.
- ${identity.products.length * Object.keys(identity.variants).length} unveränderte Signetmaster ohne Schrift; Produktnamen als HTML-Text.
- Geist und Geist Mono lokal als variable WOFF2 (100–900), samt Lizenzdateien.
- Helle/dunkle Darstellung, Facetten/Spektrum, Ebenenwahl und Bewegungssteuerung.

Dieses Kit erweitert die separate Logo-Palette mit 208 Exporten und 27 Ressourcen.
Es enthält keine zusätzlichen PNG-/ICO-/PPTX-/PDF-Exporte und keine vollständige
Kopie einer Produktapp. Seine Dateizahlen stehen separat in kit-manifest.json.

## Integration

1. Die benötigten Ordner und Dateien zusammen kopieren; relative Pfade erhalten.
2. assets/fonts/fonts.css, wordmarks.css und worlds.css laden.
3. Das vollständige .rapold-world-stage-Element des gewünschten Beispiels aus
   index.html verwenden. Das Artwork ist aria-hidden; Inhalte stehen separat in
   .rw-interface. kit.css liefert die eigenständigen Musteroberflächen und die
   Vorschau-Bedienelemente. Die Klassen des Produkt-Hintergrunds beginnen mit rw-.
4. Für die portable Steuerung die Hülle [data-rw-world], den JSON-Block rw-kit-data
   und kit.js erhalten. Wer einen eigenen Controller verwendet, setzt die unten
   genannten Zustände direkt und pausiert CSS, SVG und Canvas gemeinsam.

Produkt: data-world="fabric|learn|argus|edgeportal"
Darstellung: data-world-mode="light|dark"
Wortmarke: data-wordmark="cut|spectrum"
Bewegung: data-running="true|false"
Parallaxe: --rw-pointer-x und --rw-pointer-y (normierte Werte; Tiefe aus worlds.json)

kit.js ist ein klassisches, eigenständig implementiertes Skript ohne Import/fetch.
Es stellt window.RapoldWorlds mit setMode('product'|'light'|'dark'),
setWordmark('cut'|'spectrum'), setProduct('all'|Produkt-ID), setMotion(boolean)
und getState() bereit. Die Regler verwenden dieselbe API.

## Bewegung und Bedienung

Die Betriebssystempräferenz prefers-reduced-motion hat Vorrang. Bei reduzierter
Bewegung bleiben Partikel statisch. Das Terminal zeigt immer den vollständigen Text.
Die Pausentaste hält CSS, SMIL-SVG und den Canvas-Takt an. Verdeckte oder
ausserhalb des Viewports liegende Beispiele pausieren ebenfalls. Parallaxe läuft
nur mit einem feinen Zeiger. Keine Information ist allein in Bewegung enthalten.
Die Canvas-Geschwindigkeit verwendet verstrichene Zeit; der Sternensample ist im
Kit deterministisch, damit die Referenz reproduzierbar bleibt.

Ohne JavaScript bleiben alle Welten, Texte und Dateilinks sichtbar. Bewegung ist
pausiert und die nicht verfügbaren Steuerelemente werden nicht eingeblendet.
Das Terminal ist ein statisches Demotranskript ohne reale Ausführung. Sein Text
liegt vor den dekorativen Scanlines und der Vignette, um gut lesbar zu bleiben.
Automatisches Tippen und wiederkehrende Glitch-Bursts werden bewusst ausgelassen.
Der interaktive Glitch-Test der React-Referenz ist kein Bestandteil dieses Kits.

## Signets und Wortmarken

Alle SVG-Dateien unter assets/logos sind unveränderte freigegebene Zeichen ohne
Schrift. dark/light benennt den vorgesehenen Hintergrund. currentColor muss als
Inline-SVG eingesetzt werden, um die umgebende CSS-Farbe zu erben. Die Facetten-
und Spektrum-Schrift ist kein Bestandteil der Logo-SVGs. Alle Namen bleiben
editierbar; die neue gemeinsame Schrift ist Geist/Geist Mono.

## Herkunft, Abweichungen und Rechte

${worlds.products.map(world => `### ${world.label}\n\n${world.sourceNote}\n\nStatus: ${world.sourceKind}.${world.sourceUrl ? ` Öffentliche Referenz: ${world.sourceUrl}` : ''}\n`).join('\n')}
Gepinnte Quellen und SHA-256 stehen in sources/world-provenance.json. Die vier
Learn-Bilddateien sind unverändert; assets/worlds/learn/LICENSE enthält Apache-2.0,
NOTICE den ergänzten Herkunftshinweis. Die ursprüngliche Learn-Typografie war
Inter/JetBrains Mono. Die Rapold-Fassung verwendet bewusst Geist/Geist Mono und
die neuen Raumfaltenzeichen. AI Fabric verwendet Geist bereits im Original.

Die AI-Gestaltung ist eigenständig aus den belegten öffentlich sichtbaren Werten
implementiert. Private App-, Auth-, Backend- oder Betriebskonfiguration wurde
nicht kopiert. Keine offene Lizenz am privaten AI-Repository wird behauptet.

Geist-Dateien: assets/fonts/OFL.txt, LICENSE.txt und AUTHORS.txt. Die Übernahme
erteilt keine neue allgemeine Lizenz an Marken, Namen oder fremdem App-Code.
Dieses Kit behauptet keine vollständige visuelle oder funktionale App-Parität.

## Integrität und Neubau

kit-manifest.json listet jede Nutzdatei mit MIME, Bytezahl und SHA-256; das Manifest
selbst ist zur Vermeidung einer zyklischen Prüfsumme aus seiner Liste ausgenommen.
Die ZIP-Zeitstempel sind fest auf 2000-01-01 UTC gesetzt. Identische Quellen erzeugen
identische Kit-Bytes. Der öffentliche worlds-manifest.json erfasst zusätzlich
die öffentlichen Kopien und das vollständige ZIP.

Die auf der Website ausgelieferte index.html enthält vor den Stylesheets eine
statische Base-URL /brands/rapold/product-worlds/. So funktionieren Ressourcen
auch nach einer Hosting-Weiterleitung von index.html auf eine URL ohne Endung.
Nur dieser Base-Tag unterscheidet die Webfassung von der relativen ZIP-index.html.
Alle übrigen Kit-Dateien sind bytegleich. Für Offline-Verwendung das ZIP entpacken;
der Base-Tag gehört nicht in eine lokale Dateikopie.

Im Quellrepository: node scripts/build-product-worlds.mjs. Der normale Vertrags-
Build ruft diesen Schritt über build-brand-assets.mjs auf. Die Produktionsprüfung
erfolgt separat mit node scripts/check-product-worlds.mjs gegen apps/docs/out.
Ein grüner Dateicheck ersetzt keine visuelle Browser- oder Screenreader-Abnahme.
`;
}

async function performBuild() {
  const [worldBytes, identityBytes, provenanceBytes] = await Promise.all(['worlds.json', 'identity.json', 'sources/world-provenance.json'].map(path => readFile(join(canonicalRoot,path))));
  const worlds = JSON.parse(worldBytes);
  const identity = JSON.parse(identityBytes);
  const provenance = JSON.parse(provenanceBytes);
  validateSources(worlds,identity,provenance);
  const sharedPaths = new Set(['identity.json', identity.fonts.stylesheet, ...identity.fonts.families.map(font=>font.path), ...identity.fonts.licenseFiles, identity.fonts.validation, ...identity.products.flatMap(product=>Object.values(product.variants))]);
  const sourcePaths = [...new Set([...sharedPaths, 'worlds.json', 'worlds.css', 'wordmarks.css', 'sources/world-provenance.json', ...await walk('assets/worlds')])].sort();
  const sourceFiles = new Map();
  for (const path of sourcePaths) sourceFiles.set(safePath(path), await readFile(join(canonicalRoot,path)));
  sourceFiles.set('world-provenance.json',provenanceBytes);
  const sourceOrigin = path => 'brands/rapold/' + (path === 'world-provenance.json' ? 'sources/world-provenance.json' : path);
  for (const asset of provenance.assets) {
    if (!asset.path.startsWith('brands/rapold/')) throw new Error('Provenance asset path is outside Rapold.');
    const bytes = sourceFiles.get(asset.path.slice('brands/rapold/'.length));
    if (!bytes || bytes.length !== asset.bytes || digest(bytes) !== asset.sha256) throw new Error(`Original Learn bytes changed: ${asset.path}`);
  }
  for (const layer of worlds.products.find(world=>world.id==='learn').layers) if (!sourceFiles.has(layer.path)) throw new Error(`Missing original hero layer: ${layer.path}`);

  const files = [];
  const emit = async (path, bytes, category, sourcePath) => {
    safePath(path);
    const data = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes,'utf8');
    await mkdir(dirname(join(publicRoot,path)),{recursive:true});
    await writeFile(join(publicRoot,path),data);
    const entry = {path, url:worlds.publicBase+path, mime:mimeFor(path), bytes:data.length, sha256:digest(data), category, ...(sourcePath?{sourcePath}:{})};
    files.push(entry);
    return entry;
  };
  for (const [path,bytes] of sourceFiles) await emit(path,bytes,sharedPaths.has(path)?'shared-source':'world-source',sourceOrigin(path));

  const kitFiles = new Map(sourceFiles);
  kitFiles.set('index.html',Buffer.from(makeHtml(worlds,identity)));
  kitFiles.set('kit.css',Buffer.from(kitCss));
  kitFiles.set('kit.js',Buffer.from(`/* Rapold product worlds: independent portable controller. */\n(${worldKitController.toString()})();\n`));
  kitFiles.set('README.md',Buffer.from(makeReadme(worlds,identity)));
  const kitEntries = [...kitFiles].map(([path,bytes])=>({path,mime:mimeFor(path),bytes:bytes.length,sha256:digest(bytes),...(sourceFiles.has(path)?{sourcePath:sourceOrigin(path)}:{})})).sort((a,b)=>a.path.localeCompare(b.path));
  const kitManifest = {
    schemaVersion:1, brandId:'rapold', version:worlds.version, basePath:'./', entrypoint:'index.html',
    scope:'Four portable product-world examples; separate from the 208 logo exports and 27 shared resources.',
    products:worlds.products.map(({id,label,sourceKind,sourceNote})=>({id,label,sourceKind,sourceNote})),
    implementation:{runtime:'standalone-classic-script',typography:'Geist / Geist Mono',motion:['css-aurora','svg-network-pulses','canvas-particles','fine-pointer-parallax','terminal-glow-and-cursor'],terminal:'complete-static-example',omitted:['automatic typing','recurring glitch','React-only manual glitch control'],parity:'Shared artwork and CSS; portable preview interfaces, not a complete app clone.'},
    files:kitEntries, summary:{products:4,payloadFiles:kitEntries.length,archiveFiles:kitEntries.length+1,payloadBytes:kitEntries.reduce((sum,file)=>sum+file.bytes,0)},
    excludes:['kit-manifest.json is not self-hashed.'],
  };
  kitFiles.set('kit-manifest.json',Buffer.from(JSON.stringify(kitManifest,null,2)+'\n'));
  // This subtree is exclusively generated. Remove old kit payloads after every
  // required canonical source has been loaded, before writing the new package.
  await rm(join(publicRoot,'product-worlds'),{recursive:true,force:true});
  const zip = new JSZip();
  for (const [path,bytes] of [...kitFiles].sort(([a],[b])=>a.localeCompare(b))) {
    zip.file(path,bytes,{date:zipDate,createFolders:false});
    const servedBytes=path==='index.html'?Buffer.from(bytes.toString('utf8').replace('<head>','<head>'+publicBaseTag)):bytes;
    await emit('product-worlds/'+path,servedBytes,'kit-file',sourceFiles.has(path)?sourceOrigin(path):undefined);
  }
  const zipBytes = await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE',compressionOptions:{level:6},platform:'UNIX'});
  const bundle = await emit('rapold-product-worlds.zip',zipBytes,'bundle');
  files.sort((a,b)=>a.path.localeCompare(b.path));
  const manifest = {
    schemaVersion:1, brandId:'rapold', version:worlds.version, basePath:worlds.publicBase,
    scope:'Product-world assets and a portable HTML kit. Counts are independent of assets-manifest.json; shared logo/font files also appear there.',
    entrypoint:worlds.publicBase+'product-worlds/index.html', pathConvention:'path is relative to basePath; url is the absolute public path.',
    products:worlds.products.map(({id,label,sourceKind,sourceNote})=>({id,label,sourceKind,sourceNote})),
    source:{worlds:'brands/rapold/worlds.json',worldsSha256:digest(worldBytes),provenance:'brands/rapold/sources/world-provenance.json',provenanceSha256:digest(provenanceBytes)},
    files, bundle:{...bundle,fileCount:kitFiles.size,entrypoint:'index.html'},
    transport:{publicHtml:'product-worlds/index.html',archiveHtml:'index.html',publicBaseHref:'/brands/rapold/product-worlds/',difference:'The served HTML adds exactly one static base element before resource links. Remove that element to obtain the byte-identical offline HTML. All other kit files are byte-identical.',differingFiles:['index.html']},
    summary:{products:4,publicFiles:files.length,worldSourceFiles:files.filter(file=>file.category==='world-source').length,sharedSourceFiles:files.filter(file=>file.category==='shared-source').length,originalArtworkFiles:provenance.assets.length,kitFiles:kitFiles.size,bundles:1,bytes:files.reduce((sum,file)=>sum+file.bytes,0)},
    excludes:['worlds-manifest.json is not self-hashed.','The separate assets-manifest.json retains its existing 208 exports and 27 resources.'],
  };
  await writeFile(join(publicRoot,'worlds-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(`Generated Rapold product worlds: 4 worlds, ${provenance.assets.length} original layers, ${kitFiles.size} kit files, one standalone ZIP.`);
  return manifest;
}

let activeBuild;
export function buildProductWorlds() {
  if (!activeBuild) activeBuild=performBuild().finally(()=>{activeBuild=undefined;});
  return activeBuild;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildProductWorlds();
