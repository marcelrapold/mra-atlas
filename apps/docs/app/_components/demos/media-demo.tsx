'use client'

import * as React from 'react'
import { ListMusic, Plus, RotateCcw, RotateCw, Volume2 } from 'lucide-react'

import { ActivityRing, BarWaveform, RadialBars } from '@rapold/framework-core'
import { Badge } from '@rapold/framework-core'
import { Button } from '@rapold/framework-core'
import { Carousel, CarouselContent, CarouselControls, CarouselItem } from '@rapold/framework-core'
import {
  MediaBar,
  MediaBarActions,
  MediaBarArtwork,
  MediaBarInfo,
  MediaBarMeta,
  MediaBarTimeline,
  MediaBarTransport,
} from '@rapold/framework-core'
import { GeneratedCover, MediaCard } from '@rapold/framework-core'
import { PlayButton } from '@rapold/framework-core'

/** Deterministische Beispiel-Wellenform (keine Zufallswerte → SSR-stabil). */
function demoWave(count: number, seed = 1): number[] {
  return Array.from({ length: count }, (_, i) => {
    const a = Math.sin(i * 0.37 * seed) * 0.5 + 0.5
    const b = Math.sin(i * 0.11 + seed) * 0.5 + 0.5
    return 0.2 + 0.8 * (a * 0.6 + b * 0.4) * Math.sin((i / (count - 1)) * Math.PI)
  })
}

/** Synthetische «Live»-Werte für die Demo; in Apps kommen sie aus einem Analyser. */
function useDemoLevels(count: number, active: boolean) {
  const [tick, setTick] = React.useState(0)
  React.useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setTick((t) => t + 1), 120)
    return () => window.clearInterval(id)
  }, [active])
  return React.useMemo(
    () =>
      Array.from(
        { length: count },
        (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 0.9 + tick * 0.6) * Math.cos(i * 0.3 - tick * 0.25)),
      ),
    [count, tick],
  )
}

const EPISODES = [
  {
    title: 'Morgenjournal',
    eyebrow: 'Nachrichten',
    description: 'Die wichtigsten Meldungen aus der Schweiz und der Welt, kompakt in zwölf Minuten.',
    meta: 'Mo, 12. Okt. · 12 Min.',
  },
  {
    title: 'Kulturplatz am Abend',
    eyebrow: 'Kultur',
    description: 'Gespräche über Bühne, Literatur und Film – mit Gästen aus Zürich, Basel und Bern.',
    meta: 'So, 11. Okt. · 48 Min.',
  },
  {
    title: 'Wissen kompakt',
    eyebrow: 'Wissen',
    description: 'Warum die Gletscher schneller schmelzen und was die Forschung dagegen unternimmt.',
    meta: 'Sa, 10. Okt. · 25 Min.',
  },
]

export function MediaDemo() {
  const [playing, setPlaying] = React.useState(false)
  const [position, setPosition] = React.useState(83)
  const duration = 742
  const wave = React.useMemo(() => demoWave(64), [])
  const levels = useDemoLevels(36, playing)
  const [ringMode, setRingMode] = React.useState<'speech' | 'music' | 'off'>('speech')

  return (
    <div className="demo-grid">
      <section className="demo-panel">
        <h2>MediaBar</h2>
        <p>
          Persistente Wiedergabeleiste: Cover, Titel mit Live-Slot, Transport mit Timeline und Zusatzaktionen. Rein
          darstellend – Audio steuert die App.
        </p>
        <div className="overflow-hidden rounded-lg border">
          <MediaBar status={playing ? 'Wiedergabe läuft: Morgenjournal' : 'Pausiert'}>
            <MediaBarInfo>
              <MediaBarArtwork title="Morgenjournal" />
              <MediaBarMeta
                eyebrow="Nachrichten"
                badge={<Badge variant="secondary">Neu</Badge>}
                title="Morgenjournal vom 12. Oktober"
                subtitle="Mit Anna Keller und Luca Meier"
              />
            </MediaBarInfo>
            <MediaBarTransport
              before={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-11"
                  aria-label="15 Sekunden zurück"
                  onClick={() => setPosition((p) => Math.max(0, p - 15))}
                >
                  <RotateCcw aria-hidden />
                </Button>
              }
              playButton={{
                label: 'Morgenjournal abspielen',
                state: playing ? 'playing' : 'paused',
                material: 'solid',
                announce: false,
                onPlay: () => setPlaying(true),
                onPause: () => setPlaying(false),
              }}
            >
              <MediaBarTimeline value={position} duration={duration} onSeek={setPosition} waveform={wave} />
            </MediaBarTransport>
            <MediaBarActions>
              <Button
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label="15 Sekunden vor"
                onClick={() => setPosition((p) => Math.min(duration, p + 15))}
              >
                <RotateCw aria-hidden />
              </Button>
              <Button variant="ghost" size="icon" className="size-11" aria-label="Lautstärke">
                <Volume2 aria-hidden />
              </Button>
              <Button variant="ghost" size="icon" className="size-11" aria-label="Warteschlange öffnen">
                <ListMusic aria-hidden />
              </Button>
            </MediaBarActions>
          </MediaBar>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border">
          <MediaBar label="Livestream">
            <MediaBarInfo>
              <MediaBarArtwork title="Radio Live" />
              <MediaBarMeta
                eyebrow="Jetzt live"
                badge={<Badge variant="destructive">Live</Badge>}
                title="Mittagsmagazin"
                subtitle="Bis 13:30 Uhr"
              />
            </MediaBarInfo>
            <MediaBarTransport playButton={{ label: 'Livestream abspielen', state: 'paused', announce: false }}>
              <MediaBarTimeline value={0} duration={0} live />
            </MediaBarTransport>
          </MediaBar>
        </div>
        <pre>
          <code>{`import { MediaBar, MediaBarInfo, MediaBarArtwork, MediaBarMeta,
  MediaBarTransport, MediaBarTimeline, MediaBarActions } from '@rapold/framework-core'

<MediaBar position="fixed" status={statusText}>
  <MediaBarInfo>
    <MediaBarArtwork src={cover} title="Morgenjournal" />
    <MediaBarMeta eyebrow="Nachrichten" title="Morgenjournal" subtitle="12 Min." />
  </MediaBarInfo>
  <MediaBarTransport playButton={{ label: 'Morgenjournal abspielen', state, onPlay, onPause }}>
    <MediaBarTimeline value={time} duration={742} onSeek={seek} />
  </MediaBarTransport>
  <MediaBarActions>{/* Lautstärke, Queue … */}</MediaBarActions>
</MediaBar>`}</code>
        </pre>
      </section>

      <section className="demo-panel">
        <h2>MediaCard</h2>
        <p>Kachel und Breitformat mit Stretched Link, Ersatz-Cover, Overlay-Etikett und eigenständigem Aktions-Slot.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {EPISODES.map((ep, i) => (
            <MediaCard
              key={ep.title}
              href="#media-card"
              title={ep.title}
              eyebrow={ep.eyebrow}
              description={ep.description}
              meta={ep.meta}
              overlayTag={i === 0 ? 'Neu' : undefined}
              active={i === 0 && playing}
              action={
                <PlayButton
                  size="sm"
                  material="solid"
                  label={`${ep.title} abspielen`}
                  announce={false}
                  state={i === 0 && playing ? 'playing' : 'paused'}
                  onPlay={() => i === 0 && setPlaying(true)}
                  onPause={() => setPlaying(false)}
                />
              }
            />
          ))}
        </div>
        <div className="mt-4 grid gap-4">
          <MediaCard
            variant="wide"
            href="#media-card"
            title="Kulturplatz am Abend: Theater in der Provinz"
            eyebrow="Kultur"
            description="Warum kleine Bühnen in Graubünden und im Jura gerade boomen – eine Reportage mit Stimmen aus dem Publikum."
            meta={
              <>
                <span>So, 11. Okt.</span>
                <span aria-hidden>·</span>
                <span>48 Min.</span>
              </>
            }
            overlayTag="48 Min."
            action={
              <Button size="sm" variant="secondary" className="min-h-11">
                <Plus aria-hidden /> Merken
              </Button>
            }
          />
        </div>
        <pre>
          <code>{`import { MediaCard } from '@rapold/framework-core'

<MediaCard
  variant="wide"
  href="/sendungen/kulturplatz"
  imageSrc={cover}
  title="Kulturplatz am Abend"
  eyebrow="Kultur"
  meta="So, 11. Okt. · 48 Min."
  action={<PlayButton label="Kulturplatz abspielen" size="sm" />}
/>`}</code>
        </pre>
      </section>

      <section className="demo-panel">
        <h2>GeneratedCover</h2>
        <p>Deterministisches Ersatz-Cover aus Titel und Seed. Farben stammen aus den Chart-Tokens der aktiven Brand.</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {['Morgenjournal', 'Kulturplatz', 'Wissen kompakt', 'Sport am Wochenende', 'Musikwelle'].map((t, i) => (
            <GeneratedCover
              key={t}
              title={t}
              eyebrow={i % 2 ? 'Podcast' : 'Sendung'}
              index={i}
              className="rounded-md"
            />
          ))}
        </div>
        <pre>
          <code>{`import { GeneratedCover } from '@rapold/framework-core'

<GeneratedCover title="Morgenjournal" eyebrow="Sendung" index={0} />`}</code>
        </pre>
      </section>

      <section className="demo-panel">
        <h2>Carousel</h2>
        <p>
          Scroll-Snap ohne Bibliothek. Autoplay mit sichtbarem Pause-Knopf; bei Hover, Fokus und «Bewegung reduzieren»
          steht es still.
        </p>
        <Carousel label="Empfohlene Sendungen" autoplay={6000} loop>
          <CarouselContent>
            {EPISODES.concat({
              title: 'Sport am Wochenende',
              eyebrow: 'Sport',
              description: 'Alle Resultate aus Super League, Eishockey und Ski alpin.',
              meta: 'Sa, 10. Okt. · 30 Min.',
            }).map((ep) => (
              <CarouselItem key={ep.title} className="pr-3 sm:basis-1/2">
                <MediaCard
                  variant="wide"
                  href="#carousel"
                  title={ep.title}
                  eyebrow={ep.eyebrow}
                  meta={ep.meta}
                  description={ep.description}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselControls />
        </Carousel>
        <pre>
          <code>{`import { Carousel, CarouselContent, CarouselItem, CarouselControls } from '@rapold/framework-core'

<Carousel label="Empfohlene Sendungen" autoplay={6000} loop>
  <CarouselContent>
    <CarouselItem className="sm:basis-1/2">…</CarouselItem>
  </CarouselContent>
  <CarouselControls />
</Carousel>`}</code>
        </pre>
      </section>

      <section className="demo-panel">
        <h2>Audio-Visualisierungen</h2>
        <p>
          Datengetriebenes SVG ohne Web Audio im Core. Farben über Tokens, bei «Bewegung reduzieren» eine stehende
          Hüllkurve.
        </p>
        <div className="grid gap-6">
          <div>
            <p>BarWaveform mit Fortschritt</p>
            <BarWaveform values={wave} progress={position / duration} label="Wellenform der Episode" className="h-12" />
          </div>
          <div>
            <p>BarWaveform live, vom Boden</p>
            <BarWaveform values={levels} live anchor="bottom" tone="chart-2" className="h-10" />
          </div>
          <div className="flex flex-wrap items-center gap-8">
            <RadialBars values={levels} live tone="chart-3" size={96} innerRadius={26} label="Pegel" />
            <ActivityRing
              mode={ringMode}
              values={playing ? levels : undefined}
              intensity={playing ? levels[3] : undefined}
              diameter={56}
              label={ringMode === 'speech' ? 'Moderation spricht' : undefined}
            >
              <span className="grid size-full place-items-center rounded-full bg-muted text-sm font-semibold">AK</span>
            </ActivityRing>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Modus des Aktivitätsrings">
              {(['speech', 'music', 'off'] as const).map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={ringMode === m ? 'default' : 'outline'}
                  aria-pressed={ringMode === m}
                  className="min-h-11"
                  onClick={() => setRingMode(m)}
                >
                  {m === 'speech' ? 'Sprache' : m === 'music' ? 'Musik' : 'Aus'}
                </Button>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="min-h-11"
                aria-pressed={playing}
                onClick={() => setPlaying((p) => !p)}
              >
                Pegel animieren
              </Button>
            </div>
          </div>
        </div>
        <pre>
          <code>{`import { BarWaveform, RadialBars, ActivityRing } from '@rapold/framework-core'

<BarWaveform values={peaks} progress={time / duration} label="Wellenform" />
<RadialBars values={analyserLevels} live tone="chart-3" />
<ActivityRing mode="speech" values={levels} intensity={0.6} diameter={56}>
  <Avatar />
</ActivityRing>`}</code>
        </pre>
      </section>
    </div>
  )
}
