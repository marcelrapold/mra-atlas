'use client';

// RadioX: Vollbild (components/radiox/radiox-view.tsx, Styles tv/radiox.css) und RadioX auf der Bühne
// (components/stage/radio-panel.tsx, Styles tv/stage.css). Markup und Klassen wie im Produkt, Daten neutral.
// Die reinen Hilfen aus lib/radiox-view.ts (Vibe-Wort, Radar, Abstimmung) stehen hier als lokale Kopie.
// Nicht nachgebaut: <audio>, Polling, Fernbedienung und Ton (statische Ansichten).
import type {ReactNode} from 'react';
import {Activity, ChevronLeft, ChevronRight, Dna, Heart, Newspaper, Pause, Play, Radio, Users, Volume2, VolumeX, Vote} from 'lucide-react';
import '../../../../../brands/rapold/edgeportal/tv/stage.css';
import '../../../../../brands/rapold/edgeportal/tv/screen-nav.css';
import '../../../../../brands/rapold/edgeportal/tv/radiox.css';
import {AEON, AETHRA, Stage, css, placeholder, type ViewEntry} from './shared';

const area = 'RadioX';
/** Dunkle RadioX-Wortmarke aus dem Brand-Paket brands/radiox (öffentlich unter /brands/radiox/assets/). */
const WORDMARK = '/brands/radiox/assets/logos/wordmark-dark.svg';

type Axes = {energy: number; danceability: number; valence: number; acousticness: number; instrumentalness: number; tempo: number};
type Track = {id: string; title: string; artist: string; genre?: string; cover?: string | null; listeners?: number; introducedBy?: string; lovers?: string; score?: string};
type Ballot = {state: 'waiting' | 'open' | 'locked' | 'aired' | 'superseded'; reason: 'ballot' | 'tie_break' | 'no_votes' | null; total: number; winner: string;
  candidates: {id: string; title: string; artist: string; cover: string | null; votes: number}[]};
type Stream = 'aus' | 'verbindet' | 'live' | 'blockiert' | 'fehler';
/** Ein Stand der Vollbild-Ansicht; «loading» heisst: noch keine Antwort (data null), shows kommen dann aus der vorigen Antwort. */
type Rx = {
  status: 'live' | 'stale' | 'unavailable' | 'loading'; show: string; shows?: {id: string; name: string}[];
  name?: string; playlist?: string; host?: {name: string; role: string; accent?: string} | null;
  playing?: Track | null; progress?: [number, string, string]; next?: Track | null; recent?: Track[];
  moderation?: string; lyrics?: [string, string, string]; fact?: string; newsTime?: string; news?: string[];
  dna?: {track: Axes | null; room: Axes | null; profiles: number} | null; ballot?: Ballot | null;
  studio?: {value: string; label: string}[]; origin?: string[]; weather?: {temperature: string; description: string} | null;
  stream?: {on?: boolean; state?: Stream; ducked?: boolean}; mode?: 'home' | 'overlay'; calm?: boolean; hint?: string;
};

// ---------- Kopie der reinen Hilfen aus lib/radiox-view.ts ----------
const DNA_AXES = [['energy', 'Energie'], ['danceability', 'Tanzbarkeit'], ['valence', 'Stimmung'],
  ['acousticness', 'Akustik'], ['instrumentalness', 'Instrumental'], ['tempo', 'Tempo']] as const;
function dnaVibe(a: Axes): string {
  const high = (v: number) => v >= 0.65, mid = (v: number) => v >= 0.4 && v < 0.65, low = (v: number) => v < 0.4;
  const {energy: e, danceability: d, valence: v, acousticness: ac, instrumentalness: inst, tempo: t} = a;
  if (high(e) && high(d) && high(v)) return 'Peak-Time Euphoria';
  if (high(e) && high(d) && low(v)) return 'Dark Dancefloor';
  if (high(inst) && (mid(e) || low(e)) && low(v)) return 'After-Hours Focus';
  if (high(ac) && (low(e) || mid(e))) return 'Acoustic Late Night';
  if (high(v) && mid(e) && low(inst)) return 'Sunny Daytime';
  if (high(t) && high(e) && low(inst)) return 'Cardio Cruise';
  if (low(e) && (mid(v) || high(v))) return 'Chill Curate';
  return 'Mixed Vibe';
}
function dnaView(dna: NonNullable<Rx['dna']>) {
  const room = dna.room && dna.profiles > 0 ? dna.room : null;
  const primary = dna.track ?? room;
  if (!primary) return null;
  return {primary, kind: dna.track ? 'track' as const : 'room' as const, room: dna.track ? room : null, profiles: dna.profiles, vibe: dnaVibe(dna.track ?? dna.room ?? primary)};
}
const round = (value: number) => Math.round(value * 10) / 10;
function radarPoints(axes: Axes, cx: number, cy: number, r: number): string {
  return DNA_AXES.map(([key], i) => {
    const angle = ((-90 + i * 60) * Math.PI) / 180, value = Math.min(1, Math.max(0, axes[key]));
    return `${round(cx + Math.cos(angle) * r * value)},${round(cy + Math.sin(angle) * r * value)}`;
  }).join(' ');
}
const voteUrl = (show: string) => show === 'radiox-top' || !/^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/.test(show) ? 'https://radiox.cloud/live' : `https://radiox.cloud/live/${show}`;
const voteShare = (votes: number, total: number) => (total > 0 ? Math.min(1, Math.max(0, votes / total)) : 0);
function ballotView(ballot: Ballot) {
  const top = Math.max(0, ...ballot.candidates.map(c => c.votes));
  const leaders = ballot.candidates.filter(c => c.votes === top);
  const open = ballot.state === 'open' || ballot.state === 'waiting';
  const lead = open ? (top > 0 && leaders.length === 1 ? leaders[0].id : '') : ballot.winner;
  const state = {waiting: 'gleich offen', open: 'offen', locked: 'entschieden', aired: 'gewählt', superseded: 'vorbei'}[ballot.state];
  const votes = `${ballot.total} ${ballot.total === 1 ? 'Stimme' : 'Stimmen'}`;
  const note = !open && ballot.reason === 'no_votes' ? 'Ohne Stimmen wählt RadioX'
    : !open && ballot.reason === 'tie_break' ? 'Gleichstand · RadioX entscheidet'
      : open && top > 0 && leaders.length > 1 ? `${votes} · Gleichstand` : votes;
  return {lead, state, note};
}

/** Platzhalter für den QR «Mitwählen»: Muster mit Suchmarken, bewusst nicht scanbar. Das Produkt erzeugt den Code lokal mit dem Paket qrcode, das Atlas nicht hat. */
const QR = (() => {
  const n = 25;
  let seed = 0x2f6b4e1d, path = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    let on = ((seed >>> 0) & 1) === 0;
    if ((x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)) {
      const fx = x < 8 ? x : x - (n - 7), fy = y < 8 ? y : y - (n - 7), d = Math.max(Math.abs(fx - 3), Math.abs(fy - 3));
      on = d === 3 || d <= 1;
    } else if (x === 6 || y === 6) on = (x + y) % 2 === 0;
    if (on) path += `M${x} ${y}h1v1h-1z`;
  }
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 27 27" shape-rendering="crispEdges"><rect x="-1" y="-1" width="27" height="27" fill="#cbd5e1"/><path d="${path}" fill="#050505"/></svg>`);
})();

// ---------- Vollbild-Bausteine (radiox-view.tsx) ----------
function Cover({src, large}: {src?: string | null; large?: boolean}) {
  return <div className={large ? 'rx-cover rx-cover-large' : 'rx-cover'}>{src ? <img src={src} alt=""/> : <Radio aria-hidden="true"/>}</div>;
}

const RADAR = {w: 360, h: 204, cx: 180, cy: 100, r: 70, label: 84};
const hexagon = (scale: number) => radarPoints({energy: scale, danceability: scale, valence: scale, acousticness: scale, instrumentalness: scale, tempo: scale}, RADAR.cx, RADAR.cy, RADAR.r);

function DnaCard({dna}: {dna: NonNullable<ReturnType<typeof dnaView>>}) {
  const legend = dna.kind === 'track' ? 'Dieser Track' : `Hörer-Schnitt · ${dna.profiles} ${dna.profiles === 1 ? 'Profil' : 'Profile'}`;
  return <aside className="rx-dna" aria-label="Klang-DNA">
    <span className="rx-eyebrow"><Dna aria-hidden="true"/>Klang-DNA</span>
    <strong className="rx-vibe" lang="en">{dna.vibe}</strong>
    <svg viewBox={`0 0 ${RADAR.w} ${RADAR.h}`} role="img" aria-label={`${legend}: ${DNA_AXES.map(([key, label]) => `${label} ${Math.round(dna.primary[key] * 100)}`).join(', ')}`}>
      <polygon className="rx-radar-grid" points={hexagon(1)}/>
      <polygon className="rx-radar-grid rx-radar-mid" points={hexagon(0.5)}/>
      {DNA_AXES.map(([key], i) => {
        const angle = ((-90 + i * 60) * Math.PI) / 180;
        return <line key={key} className="rx-radar-grid" x1={RADAR.cx} y1={RADAR.cy} x2={round(RADAR.cx + Math.cos(angle) * RADAR.r)} y2={round(RADAR.cy + Math.sin(angle) * RADAR.r)}/>;
      })}
      {dna.room ? <polygon className="rx-radar-room" points={radarPoints(dna.room, RADAR.cx, RADAR.cy, RADAR.r)}/> : null}
      <polygon className="rx-radar-track" points={radarPoints(dna.primary, RADAR.cx, RADAR.cy, RADAR.r)}/>
      {DNA_AXES.map(([key, label], i) => {
        const angle = ((-90 + i * 60) * Math.PI) / 180, cos = Math.cos(angle), sin = Math.sin(angle);
        return <text key={key} x={round(RADAR.cx + cos * RADAR.label)} y={round(RADAR.cy + sin * RADAR.label + (sin < -0.9 ? -2 : sin > 0.9 ? 12 : 5))}
          textAnchor={Math.abs(cos) < 0.1 ? 'middle' : cos > 0 ? 'start' : 'end'}>{label}</text>;
      })}
    </svg>
    <p className="rx-dna-legend">
      <span><i className="rx-key-track" aria-hidden="true"/>{legend}</span>
      {dna.room ? <span><i className="rx-key-room" aria-hidden="true"/>Raum · {dna.profiles} {dna.profiles === 1 ? 'Profil' : 'Profile'}</span> : null}
    </p>
  </aside>;
}

function BallotCard({ballot, show}: {ballot: Ballot; show: string}) {
  const view = ballotView(ballot);
  const url = voteUrl(show);
  return <article className="rx-card rx-ballot" data-state={ballot.state} aria-label="Du wählst">
    <div className="rx-ballot-list">
      <span className="rx-eyebrow"><Vote aria-hidden="true"/>Du wählst<span className="rx-ballot-state">{view.state}</span><span className="rx-ballot-note">{view.note}</span></span>
      <ol>{ballot.candidates.map(c => <li key={c.id} data-lead={c.id === view.lead}>
        <span className="rx-cover">{c.cover ? <img src={c.cover} alt=""/> : <Radio aria-hidden="true"/>}</span>
        <span className="rx-ballot-name"><strong>{c.title || c.artist}</strong>{c.title ? <span className="rx-muted">{c.artist}</span> : null}</span>
        <span className="rx-ballot-bar" aria-hidden="true"><span style={{transform: `scaleX(${voteShare(c.votes, ballot.total)})`}}/></span>
        <span className="rx-ballot-votes">{c.votes}<span className="sr-only"> {c.votes === 1 ? 'Stimme' : 'Stimmen'}</span></span>
      </li>)}</ol>
    </div>
    <figure className="rx-qr">
      <img src={QR} alt={`QR-Code: ${url.replace('https://', '')}`}/>
      <figcaption><strong>Mitwählen</strong><span className="rx-muted">{url.replace('https://', '')}</span></figcaption>
    </figure>
  </article>;
}

function StreamChip({on, state, ducked}: {on: boolean; state: Stream; ducked: boolean}) {
  const label = !on ? 'Pausiert · OK spielt' : {aus: 'Pausiert', verbindet: 'verbindet …', live: ducked ? 'Live · leiser' : 'Läuft · OK pausiert',
    blockiert: 'Taste drücken für Ton', fehler: 'Stream gestört · versucht erneut'}[state];
  return <button type="button" className="rx-stream" data-state={on ? state : 'aus'} tabIndex={-1}>
    {on && state !== 'aus' ? <Pause aria-hidden="true"/> : <Play aria-hidden="true"/>}<span>{label}</span>
  </button>;
}

/** RadioX-Vollbild wie RadioXView: Kopf, Läuft jetzt (mit Klang-DNA), Karten, Studio live, Fusszeile, Hinweis. */
function RadioXView({d}: {d: Rx}) {
  const data = d.status === 'loading' ? null : d;
  const status = d.status;
  const track = data?.playing ?? null;
  const shows = d.shows ?? [];
  const dna = data?.dna ? dnaView(data.dna) : null;
  const ballot = data?.ballot && data.ballot.candidates.length ? data.ballot : null;
  const studio = data?.studio ?? [];
  const origin = data?.moderation ? data.origin ?? [] : [];
  const studioListeners = studio.some(item => item.label === 'Hörer jetzt');
  const stream = {on: true, state: 'live' as Stream, ducked: false, ...d.stream};
  return <section className="rx-view" data-mode={d.mode ?? 'home'} data-state={status} data-motion={d.calm ? 'calm' : 'full'} data-preview="false"
    aria-label={`RadioX ${data?.name ?? ''}`} style={css({'--rx-host': data?.host?.accent || '#a78bfa'})}>
    <div className="rx-wash" aria-hidden="true"/>
    <header className="rx-head">
      <img className="rx-wordmark" src={WORDMARK} alt="RadioX"/>
      <div className="rx-show">
        <span className="rx-eyebrow">Sender</span>
        <strong>{data?.name ?? shows.find(s => s.id === d.show)?.name ?? 'RadioX'}</strong>
        {data?.playlist ? <span className="rx-muted">{data.playlist}</span> : null}
      </div>
      {data?.host ? <div className="rx-host" aria-label={`On Air: ${data.host.name}`}>
        <span className="rx-avatar rx-avatar-letter" aria-hidden="true">{data.host.name.slice(0, 1)}</span>
        <div><span className="rx-eyebrow">On Air</span><strong>{data.host.name}</strong>{data.host.role ? <span className="rx-muted">{data.host.role}</span> : null}</div>
      </div> : null}
      <div className="rx-head-end">
        {status === 'live' && track ? <span className="rx-live"><span className="rx-live-dot" aria-hidden="true"/>Live</span> : null}
        {status === 'stale' ? <span className="rx-badge">Stand von vorhin</span> : null}
        {!studioListeners && track?.listeners ? <span className="rx-muted rx-listeners"><Users aria-hidden="true"/>{track.listeners}<span className="sr-only"> hören zu</span></span> : null}
        {data?.weather ? <span className="rx-weather" aria-label={`Zürich ${data.weather.temperature} ${data.weather.description}`}>
          <span className="rx-muted">Zürich</span><strong>{data.weather.temperature}</strong>{data.weather.description ? <span className="rx-muted">{data.weather.description}</span> : null}
        </span> : null}
        <time className="rx-clock" dateTime="2026-10-18T21:18:00+02:00">21:18</time>
      </div>
    </header>

    <div className="rx-main" data-dna={Boolean(dna)}>
      <Cover src={track?.cover} large/>
      <div className="rx-now">
        <span className="rx-eyebrow rx-accent">{status === 'unavailable' ? 'Verbindung' : 'Läuft jetzt'}{track?.genre ? ` · ${track.genre}` : ''}</span>
        <h1 className="rx-title">{status === 'loading' ? 'RadioX verbindet …' : status === 'unavailable' ? 'RadioX gerade nicht erreichbar' : track?.title || 'Gleich geht\'s weiter'}</h1>
        {track?.artist ? <p className="rx-artist">{track.artist}</p> : null}
        {status === 'unavailable' ? <p className="rx-muted">EdgePortal fragt weiter nach und zeigt RadioX, sobald die Daten wieder kommen.</p> : null}
        {track && data?.progress ? <div className="rx-progress" aria-hidden="true">
          <span className="rx-progress-bar"><span style={{transform: `scaleX(${data.progress[0]})`}}/></span><small>{data.progress[1]}</small><small>{data.progress[2]}</small>
        </div> : null}
        {track?.introducedBy || track?.lovers || track?.score ? <p className="rx-pulse">
          {track.introducedBy ? <span>eingebracht von <strong>{track.introducedBy}</strong></span> : null}
          {track.lovers ? <span className="rx-hearts"><Heart aria-hidden="true"/>{track.lovers}<span className="sr-only"> Herzen</span></span> : null}
          {track.score ? <span>Score <strong>{track.score}</strong></span> : null}
        </p> : null}
        {data?.moderation ? <blockquote className="rx-onair"><span className="rx-eyebrow">Im Wortlaut · {data.host?.name ?? 'Moderation'}</span><p>{data.moderation}</p></blockquote>
          : track && data?.lyrics ? <figure className="rx-lyrics" aria-label="Songtext">
            <p className="rx-lyric-side">{data.lyrics[0]}</p><p className="rx-lyric-now">{data.lyrics[1]}</p><p className="rx-lyric-side">{data.lyrics[2]}</p>
          </figure>
            : data?.fact ? <blockquote className="rx-onair"><span className="rx-eyebrow">Gut zu wissen</span><p>{data.fact}</p></blockquote> : null}
      </div>
      {dna ? <DnaCard dna={dna}/> : null}
    </div>

    <div className="rx-cards" data-ballot={Boolean(ballot)}>
      <article className="rx-card rx-next">
        <span className="rx-eyebrow">Danach</span>
        {data?.next ? <div className="rx-row"><Cover src={data.next.cover}/><div><strong>{data.next.title}</strong><span className="rx-muted">{data.next.artist}</span></div></div>
          : <p className="rx-muted">Wird gerade gewählt</p>}
      </article>
      {ballot ? <BallotCard ballot={ballot} show={d.show}/> : null}
      <article className="rx-card rx-news">
        <span className="rx-eyebrow"><Newspaper aria-hidden="true"/>News{data?.newsTime ? ` ${data.newsTime}` : ''}</span>
        {data?.news?.length ? <ul>{data.news.slice(0, 2).map(title => <li key={title}>{title}</li>)}</ul>
          : <p className="rx-muted">{data?.newsTime ? 'Meldungen werden vorbereitet' : 'Keine geplanten Meldungen'}</p>}
      </article>
    </div>

    {studio.length || origin.length ? <div className="rx-studio" role="group" aria-label="Studio live">
      <span className="rx-eyebrow"><Activity aria-hidden="true"/>Studio live</span>
      {studio.map(item => <span className="rx-stat" key={item.label}><strong>{item.value}</strong> {item.label}</span>)}
      {origin.length ? <span className="rx-origin"><span className="rx-eyebrow">Moderation</span>{origin.join(' · ')}</span> : null}
    </div> : null}
    <footer className="rx-foot">
      <div className="rx-recent" aria-label="Zuletzt gespielt">
        <span className="rx-eyebrow">Zuletzt</span>
        {(data?.recent ?? []).slice(0, 3).map(t => <span className="rx-recent-item" key={t.id}><Cover src={t.cover}/>
          <span><strong>{t.title}</strong><span className="rx-muted">{t.artist}</span></span></span>)}
      </div>
      <div className="rx-controls">
        {shows.length > 1 ? <div className="rx-shows" role="group" aria-label="Sender">
          <ChevronLeft aria-hidden="true"/>
          {shows.map(s => <button type="button" key={s.id} aria-pressed={s.id === d.show} tabIndex={-1}>{s.name}</button>)}
          <ChevronRight aria-hidden="true"/>
        </div> : null}
        <StreamChip on={stream.on} state={stream.state} ducked={stream.ducked}/>
      </div>
    </footer>
    {d.hint ? <div className="rx-hint" role="status">{d.hint}</div> : null}
  </section>;
}

// ---------- RadioX auf der Bühne (radio-panel.tsx) ----------
type PanelState = 'live' | 'loading' | 'unavailable' | 'stale';
/** Leiste oder Karte wie RadioPanel, mit Hörerzahl und allen Texten der Stream-Pille. elsewhere: die RadioX-Ansicht über dem Inhalt hat den Ton. */
function StageRadio({placement = 'leiste', state = 'live', pill = 'live', ducked = false, remoteOff = false, elsewhere = false}: {
  placement?: 'leiste' | 'karte'; state?: PanelState; pill?: Stream; ducked?: boolean; remoteOff?: boolean; elsewhere?: boolean;
}) {
  // Ausfall: der Adapter liefert playlist "", speaker, playing und next null (src/radiox.mjs unavailable).
  const data = state === 'loading' ? null : state === 'unavailable' ? {playlist: '', playing: null, next: null, speaker: null}
    : {playlist: 'Abendrotation', playing: NOW, next: NEXT, speaker: HOST};
  const playing = data?.playing;
  const streamState: Stream = elsewhere ? 'aus' : pill;
  const label = elsewhere ? 'spielt im RadioX-Vollbild'
    : {aus: remoteOff ? 'pausiert · ⏯' : 'ohne Ton', verbindet: 'verbindet', live: ducked ? 'Live · leiser' : 'Live', blockiert: 'Taste drücken für Ton', fehler: 'Stream gestört'}[streamState];
  return <section className={`stage-radio placement-${placement}`} data-state={state} aria-label="RadioX">
    <div className="stage-radio-cover">{playing?.cover ? <img src={playing.cover} alt=""/> : <Radio aria-hidden="true"/>}</div>
    <div className="stage-radio-main">
      <div className="stage-radio-kicker">
        <span className="stage-eyebrow">RadioX · {data?.playlist || 'RadioX Top'}</span>
        {state === 'live' ? <span className="stage-live"><span className="stage-live-dot" aria-hidden="true"/>Live</span> : null}
        {playing?.listeners ? <span className="stage-radio-listeners"><Users aria-hidden="true"/>{playing.listeners}<span className="sr-only"> hören zu</span></span> : null}
      </div>
      <h3>{!data ? 'RadioX verbindet …' : state === 'unavailable' ? 'RadioX gerade nicht erreichbar' : playing?.title || 'Gleich geht\'s weiter'}</h3>
      {playing?.artist ? <p className="stage-radio-artist">{playing.artist}</p> : null}
      {playing ? <div className="stage-radio-progress" aria-hidden="true"><span style={{transform: 'scaleX(.62)'}}/><small>2:41</small><small>4:20</small></div> : null}
      <div className="stage-radio-meta">
        {data?.next ? <span>Danach: <strong>{data.next.title}</strong>{data.next.artist ? ` · ${data.next.artist}` : ''}</span> : null}
        {data?.speaker ? <span>On Air: <strong>{data.speaker.name}</strong></span> : null}
        {state === 'stale' ? <span>Stand von vorhin</span> : null}
      </div>
    </div>
    <div className="stage-radio-stream" data-state={streamState} title="Stream">
      {streamState === 'aus' ? <VolumeX aria-hidden="true"/> : <Volume2 aria-hidden="true"/>}<span>{label}</span>
      {streamState === 'blockiert' ? <button type="button" tabIndex={-1}>Ton an</button> : null}
    </div>
  </section>;
}

// ---------- Beispieldaten (neutral, erfunden) ----------
const NOW: Track = {id: 't1', title: 'Midnight Signal (Extended Mix)', artist: 'Glass Harbour', genre: 'Electronic', cover: placeholder('Cover', '#0E3A4A'), listeners: 128};
const NEXT: Track = {id: 't2', title: 'Northern Lights', artist: 'Tidewater', cover: placeholder('Cover', '#2A1F4A')};
const RECENT: Track[] = [
  {id: 't3', title: 'Quiet Orbit', artist: 'Sola Drift', cover: placeholder('Cover', '#123047')},
  {id: 't4', title: 'Paper Satellites', artist: 'Lumen Field', cover: placeholder('Cover', '#3A2440')},
  {id: 't5', title: 'Low Tide', artist: 'The Harbour Set', cover: placeholder('Cover', '#1D3A2E')},
];
const SHOWS = [{id: 'radiox-top', name: 'RadioX Top'}, {id: 'nachtschicht', name: 'Nachtschicht'}, {id: 'morgenlicht', name: 'Morgenlicht'}];
const HOST = {name: 'ÆON', role: 'KI-Moderator'};
const BASE: Rx = {status: 'live', show: 'radiox-top', shows: SHOWS, name: 'RadioX Top', playlist: 'Abendrotation', host: HOST,
  playing: NOW, progress: [.62, '2:41', '4:20'], next: NEXT, recent: RECENT, newsTime: 'um 22:00',
  news: ['Neue Velowege im Quartier eröffnet', 'Am Wochenende bleibt es sonnig und mild'], weather: {temperature: '14°', description: 'leicht bewölkt'}};
const MODERATION = 'Das war Quiet Orbit von Sola Drift. Gleich kommt Northern Lights, ihr habt mitgewählt. Danke fürs Zuhören.';
const LYRICS: [string, string, string] = ['Lights along the harbour line', 'Every signal finds its way', 'Hold on until the morning'];
const TRACK_DNA: Axes = {energy: .78, danceability: .72, valence: .7, acousticness: .12, instrumentalness: .35, tempo: .66};
const ROOM_DNA: Axes = {energy: .32, danceability: .45, valence: .58, acousticness: .5, instrumentalness: .3, tempo: .4};
const ballot = (state: Ballot['state'], votes: [number, number, number], winner = '', reason: Ballot['reason'] = 'ballot'): Ballot => ({state, reason, winner,
  total: votes[0] + votes[1] + votes[2], candidates: [
    {id: 'c1', title: 'Slow Satellites', artist: 'Copper Coast', cover: placeholder('Cover', '#1B3550'), votes: votes[0]},
    {id: 'c2', title: 'Afterglow Avenue', artist: 'Velvet Static', cover: placeholder('Cover', '#3B1F45'), votes: votes[1]},
    {id: 'c3', title: 'Static Bloom', artist: 'Polar Rooms', cover: null, votes: votes[2]},
  ]});
const PULSE: Partial<Track> = {introducedBy: 'nachtfalter', lovers: '42', score: '0.87'};
const STUDIO = [{value: '1’204', label: 'Hörer jetzt'}, {value: '18', label: 'Anfragen/min'}, {value: '830 ms', label: 'Antwortzeit p50'}, {value: '2', label: 'KI-Jobs laufen'}];
const METRICS: Rx = {...BASE, playing: {...NOW, ...PULSE}, moderation: MODERATION, dna: {track: TRACK_DNA, room: ROOM_DNA, profiles: 3},
  ballot: ballot('open', [14, 9, 5]), studio: STUDIO, origin: ['Text gemma4 31b', 'Stimme ÆON (Piper) in 1.2 s']};
/** Kennzahlen ohne Studio-Zeile, für die Rundenstände von «Du wählst». */
const vote = (b: Ballot): Rx => ({...BASE, playing: {...NOW, ...PULSE}, lyrics: LYRICS, dna: {track: TRACK_DNA, room: null, profiles: 0}, ballot: b});

/** Layout «RadioX»: die Bühne ohne Agents, Hintergrund aus, RadioX im Vollbild (asRadioxLayout, RADIOX_LAYOUT_PATCH). */
const layout = (d: Rx, calm = false): ReactNode => <Stage radio="vollbild" agentsOn={false} ambience="aus" motion={calm ? 'reduced' : 'full'} lowPower={calm} radioPanel={<RadioXView d={{...d, calm}}/>}/>;
const caption = (text: string) => <div className="stage-caption" style={css({'--agent': AEON.color})} data-spoken="true" aria-hidden="true"><strong>ÆON</strong><p>{text}</p></div>;

export const radioxViews: ViewEntry[] = [
  // ---------- Vollbild: Grundansicht und Textblock ----------
  {id: 'radiox-vollbild', area, title: 'RadioX-Vollbild', wide: true,
    caption: 'Layout «RadioX»: Cover, Titel und Fortschritt gross, Sender mit Playlist und On Air im Kopf, Danach und News, Zuletzt und Senderwahl unten.',
    node: layout(BASE)},
  {id: 'radiox-im-wortlaut', area, title: 'Im Wortlaut',
    caption: 'Während einer Ansage steht der Moderationstext unter dem Fortschritt, mit der Akzentfarbe des Hosts.',
    node: layout({...BASE, moderation: MODERATION})},
  {id: 'radiox-songtext', area, title: 'Songtext',
    caption: 'Ohne Ansage und mit synchronisierten Lyrics: die gesungene Zeile gross, die Nachbarn leise.',
    node: layout({...BASE, lyrics: LYRICS})},
  {id: 'radiox-gut-zu-wissen', area, title: 'Gut zu wissen',
    caption: 'Ohne Ansage und ohne synchronisierte Lyrics zeigt RadioX einen Fakt zum Track.',
    node: layout({...BASE, fact: 'Glass Harbour nimmt jeden Track in einem Durchgang auf, ohne Schnitt und ohne Overdubs.'})},

  // ---------- Ruhige Kennzahlen (9d9bd8b) ----------
  {id: 'radiox-kennzahlen', area, title: 'Ruhige Kennzahlen', wide: true,
    caption: 'Klang-DNA rechts, Du wählst doppelt breit, Studio live mit der Herkunft der Moderation, Puls des Titels und Wetter; jeder Block fehlt allein, wenn seine Daten fehlen.',
    node: layout(METRICS)},
  {id: 'radiox-dna-hoerer', area, title: 'Klang-DNA: Hörer-Schnitt',
    caption: 'Ohne Achsen des Tracks zeigt das Radar den Schnitt der Hörer-Profile; die Runde ist noch nicht offen («gleich offen»).',
    node: layout({...BASE, lyrics: LYRICS, dna: {track: null, room: ROOM_DNA, profiles: 3}, ballot: ballot('waiting', [0, 0, 0])})},
  {id: 'radiox-wahl-gleichstand', area, title: 'Du wählst: Gleichstand',
    caption: 'Offene Runde mit zwei Führenden: kein Kandidat hervorgehoben, Notiz «Stimmen · Gleichstand».',
    node: layout(vote(ballot('open', [11, 11, 4])))},
  {id: 'radiox-wahl-entschieden', area, title: 'Du wählst: entschieden',
    caption: 'Runde geschlossen nach Gleichstand: der Gewinner in Cyan, Notiz «Gleichstand · RadioX entscheidet».',
    node: layout(vote(ballot('locked', [12, 12, 3], 'c2', 'tie_break')))},
  {id: 'radiox-wahl-gewaehlt', area, title: 'Du wählst: gewählt',
    caption: 'Der gewählte Titel ist gelaufen: Status «gewählt», der Gewinner bleibt hervorgehoben.',
    node: layout(vote(ballot('aired', [17, 9, 6], 'c1')))},
  {id: 'radiox-wahl-vorbei', area, title: 'Du wählst: vorbei',
    caption: 'Runde ohne Stimmen abgelöst: Status «vorbei», Notiz «Ohne Stimmen wählt RadioX».',
    node: layout(vote(ballot('superseded', [0, 0, 0], 'c3', 'no_votes')))},

  // ---------- Zustände ----------
  {id: 'radiox-verbindet', area, title: 'RadioX verbindet …',
    caption: 'Erste Abfrage noch ohne Antwort: Sender «RadioX», leere Karten, der Stream verbindet.',
    node: layout({status: 'loading', show: 'radiox-top', stream: {state: 'verbindet'}})},
  {id: 'radiox-nicht-erreichbar', area, title: 'RadioX gerade nicht erreichbar',
    caption: 'Nach dem letzten Stand (bis 10 min) meldet die Ansicht den Ausfall und fragt weiter nach, nie Erfundenes.',
    node: layout({status: 'unavailable', show: 'radiox-top', shows: SHOWS, name: 'RadioX Top', stream: {state: 'fehler'}})},
  {id: 'radiox-stand-von-vorhin', area, title: 'Stand von vorhin',
    caption: 'RadioX antwortet gerade nicht: der letzte Stand bleibt mit dem Hinweis «Stand von vorhin», ohne Live-Punkt.',
    node: layout({...BASE, status: 'stale'})},
  {id: 'radiox-gleich-weiter', area, title: 'Gleich geht\'s weiter',
    caption: 'Kein Titel läuft: Platzhalter-Cover, «Danach» wird gerade gewählt, die News sind angekündigt, aber noch leer.',
    node: layout({...BASE, playing: null, next: null, news: [], recent: RECENT.slice(0, 2)})},

  // ---------- Stream-Chip und Hinweise ----------
  {id: 'radiox-pausiert', area, title: 'RadioX pausiert',
    caption: 'OK kurz pausiert: Hinweis «RadioX pausiert» für 2,6 s, der Chip zeigt «Pausiert · OK spielt».',
    node: layout({...BASE, stream: {on: false}, hint: 'RadioX pausiert'})},
  {id: 'radiox-senderwechsel', area, title: 'Sender wechseln',
    caption: '◀ ▶ wechselt den Sender im Rundlauf: Hinweis «Sender: …», die Ansicht lädt den neuen Sender, der Stream verbindet neu.',
    node: layout({status: 'loading', show: 'nachtschicht', shows: SHOWS, stream: {state: 'verbindet'}, hint: 'Sender: Nachtschicht'})},
  {id: 'radiox-ein-sender', area, title: 'Nur ein Sender verfügbar',
    caption: 'Listet RadioX nur einen Sender, fehlt die Senderwahl, und ◀ ▶ meldet «Nur ein Sender verfügbar».',
    node: layout({...BASE, shows: SHOWS.slice(0, 1), hint: 'Nur ein Sender verfügbar'})},
  {id: 'radiox-ton-blockiert', area, title: 'Taste drücken für Ton',
    caption: 'Der Browser blockiert den Ton bis zur ersten Eingabe: Chip mit rotem Rand, OK startet den Stream.',
    node: layout({...BASE, stream: {state: 'blockiert'}})},

  // ---------- Hochformat und ruhig ----------
  {id: 'radiox-hochformat', area, title: 'RadioX im Hochformat', tv: {width: 2160, height: 3840},
    caption: 'Schmal oder hochkant (bis 4:3): eine Spalte, Cover über dem Text, Klang-DNA darunter, Karten untereinander.',
    node: layout(METRICS)},
  {id: 'radiox-ruhig', area, title: 'RadioX ruhig',
    caption: 'Bei reduzierter Bewegung oder ?lowpower=1: Standbild statt Loop, kein Puls am Live-Punkt, keine Blenden.',
    node: layout({...BASE, lyrics: LYRICS}, true)},

  // ---------- Die beiden anderen Wege ins Vollbild ----------
  {id: 'radiox-szene-vollbild', area, title: 'Szene «RadioX Vollbild»',
    caption: 'Platzierung «Vollbild» auf einer Bühne: der Kopf tritt zurück, Ansagen bleiben mit Untertitel, der Stream wird darunter geduckt.',
    node: <Stage radio="vollbild" ambience="aus" body={<></>} radioPanel={<RadioXView d={{...BASE, stream: {ducked: true}}}/>}>
      {caption('Kurze Info: Die Sicherung von heute Nacht ist fertig.')}
    </Stage>},
  {id: 'radiox-uebersicht', area, title: 'RadioX über dem Inhalt',
    caption: 'Kachel «RadioX» aus der Übersicht: die Ansicht liegt über dem Inhalt, hat den Ton und bleibt offen bis Zurück.',
    node: <>
      <Stage radioPanel={<StageRadio elsewhere/>}/>
      <div className="nav-layer" data-overview="false">
        <div className="nav-radiox"><RadioXView d={{...BASE, mode: 'overlay'}}/></div>
        <button type="button" className="nav-pointer" data-shown="false" tabIndex={-1}><ChevronLeft aria-hidden="true"/>Zurück</button>
      </div>
    </>},

  // ---------- RadioX auf der Bühne ----------
  {id: 'radiox-karte', area, title: 'RadioX als Karte',
    caption: 'Platzierung «Karte»: RadioX in der Seitenspalte neben den Agents, Cover gross, Stream-Pille darunter.',
    node: <Stage radio="karte" radioPanel={<StageRadio placement="karte"/>}/>},
  {id: 'radiox-radio-aus', area, title: 'RadioX aus',
    caption: 'RadioX in der Steuerung ausgeschaltet: keine Leiste, die Agents haben die ganze Bühne.',
    node: <Stage radio="aus"/>},
  {id: 'radiox-gaeste', area, title: 'Gäste: nur Radio',
    caption: 'Szene «Gäste: nur Radio»: keine Agents, nichts Privates, RadioX wird als Karte zum Hauptbild.',
    node: <Stage agentsOn={false} voice={false} ambience="kino" radio="karte" radioPanel={<StageRadio placement="karte"/>}/>},
  {id: 'radiox-pille-ohne-ton', area, title: 'Stream: ohne Ton',
    caption: 'Stream in der Steuerung aus: Pille «ohne Ton», im Kopf «RadioX aus (Steuerung) — ⏯ für Ton».',
    node: <Stage soundOff="RadioX aus (Steuerung) — ⏯ für Ton" radioPanel={<StageRadio pill="aus"/>}/>},
  {id: 'radiox-pille-pausiert', area, title: 'Stream: pausiert',
    caption: '⏯ oder ⏸ auf der Fernbedienung pausiert RadioX vorübergehend: Pille «pausiert · ⏯».',
    node: <Stage soundOff="RadioX pausiert — ⏯" radioPanel={<StageRadio pill="aus" remoteOff/>}/>},
  {id: 'radiox-pille-verbindet', area, title: 'Stream: verbindet',
    caption: 'Der Player lädt den Stream (direkt vom Edge, Relais als Fallback): Pille «verbindet».',
    node: <Stage radioPanel={<StageRadio pill="verbindet"/>}/>},
  {id: 'radiox-pille-leiser', area, title: 'Stream: Live · leiser',
    caption: 'Solange ein Agent spricht, wird der Stream geduckt: Pille «Live · leiser».',
    node: <Stage agents={[{...AEON, speaking: true}, AETHRA]} autopilot={{speaking: true}} radioPanel={<StageRadio ducked/>}>{caption('Der Deploy ist durch. Alle Checks sind grün.')}</Stage>},
  {id: 'radiox-pille-taste', area, title: 'Stream: Taste drücken für Ton',
    caption: 'Der Browser blockiert den Ton: die erste Taste oder ein Tippen startet den Stream, daneben der Knopf «Ton an».',
    node: <Stage radioPanel={<StageRadio pill="blockiert"/>}/>},
  {id: 'radiox-pille-gestoert', area, title: 'Stream: gestört',
    caption: 'Der Stream bricht ab: Pille «Stream gestört» auf roter Fläche, der Ton-Wächter baut den Player neu auf.',
    node: <Stage radioPanel={<StageRadio pill="fehler"/>}/>},
  {id: 'radiox-pille-vollbild', area, title: 'Stream: spielt im RadioX-Vollbild',
    caption: 'Solange die RadioX-Ansicht über dem Inhalt den Ton hat, baut sich der Player der Bühne ab: genau ein Stream.',
    node: <Stage radioPanel={<StageRadio elsewhere/>}/>},
  {id: 'radiox-panel-verbindet', area, title: 'RadioX verbindet … (Bühne)',
    caption: 'Noch keine Daten von RadioX: Leiste mit Platzhalter-Cover und «RadioX verbindet …».',
    node: <Stage radioPanel={<StageRadio state="loading" pill="verbindet"/>}/>},
  {id: 'radiox-panel-nicht-erreichbar', area, title: 'RadioX nicht erreichbar (Bühne)',
    caption: 'RadioX fällt aus: Leiste mit rotem Rand und «RadioX gerade nicht erreichbar», ohne Titel und Danach.',
    node: <Stage radioPanel={<StageRadio state="unavailable"/>}/>},
  {id: 'radiox-panel-stand-von-vorhin', area, title: 'Stand von vorhin (Bühne)',
    caption: 'Keine neuen Daten: der letzte Titel bleibt, ohne Live-Marke, mit «Stand von vorhin» in Warnfarbe.',
    node: <Stage radioPanel={<StageRadio state="stale"/>}/>},
  {id: 'radiox-panel-hochformat', area, title: 'RadioX im Hochformat (Bühne)', tv: {width: 2160, height: 3840},
    caption: 'Hochformat: alles stapelt sich, die Karte wird zur Leiste unter den Agents, die Stream-Pille darunter.',
    node: <Stage radio="karte" radioPanel={<StageRadio placement="karte"/>}/>},
];
