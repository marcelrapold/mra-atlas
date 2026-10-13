'use client'

import * as React from 'react'
import { Loader2Icon, RefreshCwIcon } from 'lucide-react'

import { Alert, AlertActions, AlertDescription, AlertTitle } from '@rapold/framework-core'
import { Announcer } from '@rapold/framework-core'
import { Button } from '@rapold/framework-core'
import { LogView, type LogLine } from '@rapold/framework-core'
import {
  useDocumentTitle,
  useElementSize,
  useMediaQuery,
  usePrefersReducedMotion,
  useScrollDirection,
  useVisibilityAwareInterval,
} from '@rapold/framework-core'

/* -------------------------------------------------------------------------- */
/* Alert                                                                      */
/* -------------------------------------------------------------------------- */

type JobStatus = 'queued' | 'running' | 'recovering' | 'completed' | 'failed'

function formatElapsed(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min`
}

function JobStatusAlert() {
  const [status, setStatus] = React.useState<JobStatus>('queued')
  const [startedAt, setStartedAt] = React.useState(() => Date.now())
  const [now, setNow] = React.useState(() => Date.now())
  const [visible, setVisible] = React.useState(true)
  const running = status === 'queued' || status === 'running' || status === 'recovering'

  useVisibilityAwareInterval({ interval: 1000, onTick: () => setNow(Date.now()), enabled: running && visible })

  const restart = () => {
    setStatus('queued')
    setStartedAt(Date.now())
    setNow(Date.now())
    setVisible(true)
  }
  const elapsed = formatElapsed(now - startedAt)

  const spinner = <Loader2Icon className="motion-safe:animate-spin" />
  const content: Record<JobStatus, { tone: 'info' | 'warning' | 'success' | 'danger'; title: string; text: string; icon?: React.ReactNode }> = {
    queued: { tone: 'info', title: `Wartet auf den Start · ${elapsed}`, text: 'Der Bericht steht in der Warteschlange.', icon: spinner },
    running: { tone: 'info', title: `Wird erstellt · ${elapsed}`, text: 'Dauert typisch 2–5 Minuten. Sie können die Seite verlassen.', icon: spinner },
    recovering: {
      tone: 'warning',
      title: `Wird fortgesetzt · ${elapsed}`,
      text: 'Der Export wurde unterbrochen. Die Daten sind gespeichert, ein Neustart ist nicht nötig.',
      icon: <RefreshCwIcon className="motion-safe:animate-spin" />,
    },
    completed: { tone: 'success', title: `Fertig nach ${elapsed}`, text: 'Der Quartalsbericht ist bereit.' },
    failed: { tone: 'danger', title: `Fehlgeschlagen nach ${elapsed}`, text: 'Die Datenquelle hat nicht geantwortet (Zeitüberschreitung).' },
  }
  const c = content[status]

  return (
    <div className="grid gap-3">
      {visible ? (
        <Alert
          key={status}
          tone={c.tone}
          icon={c.icon}
          role={status === 'failed' ? 'alert' : 'status'}
          aria-busy={running || undefined}
          dismissible={!running}
          onDismiss={() => setVisible(false)}
        >
          <AlertTitle>{c.title}</AlertTitle>
          <AlertDescription>{c.text}</AlertDescription>
          {status === 'completed' && (
            <AlertActions>
              <Button size="sm">Bericht öffnen</Button>
            </AlertActions>
          )}
          {status === 'failed' && (
            <AlertActions>
              <Button size="sm" variant="outline" onClick={restart}>
                Erneut versuchen
              </Button>
            </AlertActions>
          )}
        </Alert>
      ) : (
        <p>Meldung geschlossen.</p>
      )}
      <div className="demo-row" role="group" aria-label="Job-Status simulieren">
        {(['queued', 'running', 'recovering', 'completed', 'failed'] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? 'default' : 'outline'}
            aria-pressed={status === s}
            onClick={() => {
              setStatus(s)
              setVisible(true)
            }}
          >
            {{ queued: 'Wartend', running: 'Läuft', recovering: 'Erholung', completed: 'Fertig', failed: 'Fehler' }[s]}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={restart}>
          Zurücksetzen
        </Button>
      </div>
    </div>
  )
}

function AlertSection() {
  const [shareVisible, setShareVisible] = React.useState(true)
  return (
    <section className="demo-panel">
      <h2>Alert</h2>
      <div className="grid gap-3">
        <Alert tone="info" role="none">
          <AlertTitle>Nur in der Schweiz und in Liechtenstein verfügbar</AlertTitle>
          <AlertDescription>Programm und Inhalte bleiben sichtbar; die Wiedergabe ist ausserhalb gesperrt.</AlertDescription>
        </Alert>
        <Alert tone="success" dismissible>
          <AlertTitle>Änderungen gespeichert</AlertTitle>
        </Alert>
        <Alert tone="warning">
          <AlertTitle>Wartung am Samstag, 06:00–08:00</AlertTitle>
          <AlertDescription>In dieser Zeit sind Exporte nicht möglich.</AlertDescription>
        </Alert>
        <Alert tone="danger" role="none">
          <AlertTitle>Zahlungsdaten unvollständig</AlertTitle>
          <AlertDescription>Bitte ergänzen Sie die Rechnungsadresse, bevor Sie fortfahren.</AlertDescription>
        </Alert>
        <Alert tone="neutral" size="sm" dismissible>
          Automatisch geöffnet · die Ansicht wechselt nach 30 Sekunden Inaktivität.
        </Alert>
        {shareVisible ? (
          <Alert tone="info" size="sm" dismissible autoHideMs={15000} onDismiss={() => setShareVisible(false)}>
            Geteilt: «Quartalsbericht Q3» · blendet nach 15 s aus (pausiert bei Zeiger oder Fokus).
          </Alert>
        ) : (
          <div>
            <Button size="sm" variant="outline" onClick={() => setShareVisible(true)}>
              Geteilt-Hinweis erneut zeigen
            </Button>
          </div>
        )}
        <h3>Job-Status</h3>
        <JobStatusAlert />
      </div>
      <pre>
        <code>{`import { Alert, AlertTitle, AlertDescription, AlertActions } from '@rapold/framework-core'

<Alert tone="warning" dismissible onDismiss={() => setOpen(false)}>
  <AlertTitle>Wartung am Samstag</AlertTitle>
  <AlertDescription>Exporte sind von 06:00–08:00 nicht möglich.</AlertDescription>
  <AlertActions><Button size="sm">Details</Button></AlertActions>
</Alert>`}</code>
      </pre>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Announcer + useDocumentTitle                                               */
/* -------------------------------------------------------------------------- */

const TRACKS = [
  { id: 't1', title: 'Morgenrot', artist: 'Lea Brunner' },
  { id: 't2', title: 'Föhnwind', artist: 'Die Talstation' },
  { id: 't3', title: 'Aareschwimmen', artist: 'Nina & Jon' },
]

function TitleSync({ title }: { title: string }) {
  useDocumentTitle(title)
  return null
}

function AnnouncerSection() {
  const [index, setIndex] = React.useState(0)
  const [playing, setPlaying] = React.useState(true)
  const [syncTitle, setSyncTitle] = React.useState(false)
  const track = TRACKS[index]
  const tabTitle = `${playing ? '▶ ' : ''}${track.title} · ${track.artist} – Atlas`

  return (
    <section className="demo-panel">
      <h2>Announcer & useDocumentTitle</h2>
      <p>
        Jetzt: <strong>{track.title}</strong> · {track.artist}. Der Screenreader hört den Wechsel erst, wenn der neue
        Titel 1,5 s hält; der Stand beim Laden bleibt still.
      </p>
      <div className="demo-row">
        <Button size="sm" onClick={() => setIndex((i) => (i + 1) % TRACKS.length)}>
          Nächster Titel
        </Button>
        <Button size="sm" variant="outline" aria-pressed={playing} onClick={() => setPlaying((p) => !p)}>
          {playing ? 'Pause' : 'Wiedergabe'}
        </Button>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={syncTitle} onChange={(e) => setSyncTitle(e.target.checked)} />
          Tab-Titel setzen
        </label>
      </div>
      <p className="muted">Tab-Titel: {syncTitle ? tabTitle : 'unverändert'}</p>
      <Announcer
        message={`Jetzt läuft: ${track.title} von ${track.artist}`}
        announceKey={track.id}
        settleMs={1500}
      />
      {syncTitle && <TitleSync title={tabTitle} />}
      <pre>
        <code>{`import { Announcer, useDocumentTitle } from '@rapold/framework-core'

<Announcer message={\`Jetzt läuft: \${title}\`} announceKey={trackId} settleMs={5000} />

useDocumentTitle(playing ? \`▶ \${title} – Atlas\` : 'Atlas')`}</code>
      </pre>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Hooks                                                                      */
/* -------------------------------------------------------------------------- */

function HooksSection() {
  const wide = useMediaQuery('(min-width: 48rem)')
  const reduced = usePrefersReducedMotion()
  const boxRef = React.useRef<HTMLDivElement>(null)
  const size = useElementSize(boxRef)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const direction = useScrollDirection({ container: scrollRef, revealThreshold: 16 })
  const [ticks, setTicks] = React.useState(0)
  useVisibilityAwareInterval({ interval: 2000, onTick: () => setTicks((t) => t + 1) })

  return (
    <section className="demo-panel">
      <h2>Hooks</h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt>useMediaQuery(≥ 48rem)</dt>
        <dd>{wide ? 'breit' : 'schmal'}</dd>
        <dt>usePrefersReducedMotion</dt>
        <dd>{reduced ? 'Bewegung reduziert' : 'Bewegung erlaubt'}</dd>
        <dt>useElementSize</dt>
        <dd>{size ? `${size.width} × ${size.height} px` : 'noch nicht gemessen'}</dd>
        <dt>useScrollDirection</dt>
        <dd>{direction === 'down' ? 'nach unten (Kopfzeile aus)' : 'nach oben (Kopfzeile sichtbar)'}</dd>
        <dt>useVisibilityAwareInterval</dt>
        <dd>{ticks} Abfragen (pausiert im Hintergrund-Tab)</dd>
      </dl>
      <div
        ref={boxRef}
        className="mt-4 min-w-32 max-w-full resize-x overflow-auto rounded-[var(--brand-radius)] border border-dashed border-border p-3 text-sm"
        style={{ width: 240 }}
      >
        Ecke ziehen, um die Breite zu ändern.
      </div>
      <div
        ref={scrollRef}
        tabIndex={0}
        aria-label="Scrollbereich für useScrollDirection"
        className="relative mt-4 h-40 overflow-y-auto rounded-[var(--brand-radius)] border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <div
          className={`sticky top-0 border-b border-border bg-card px-3 py-2 text-sm font-semibold motion-safe:transition-transform ${direction === 'down' ? '-translate-y-full' : 'translate-y-0'}`}
        >
          Kopfzeile
        </div>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} className="px-3 py-1">
            Absatz {i + 1}
          </p>
        ))}
      </div>
      <pre>
        <code>{`import { useMediaQuery, usePrefersReducedMotion, useElementSize,
  useScrollDirection, useVisibilityAwareInterval } from '@rapold/framework-core'

const wide = useMediaQuery('(min-width: 48rem)')
const size = useElementSize(ref)            // { width, height } | null
const dir = useScrollDirection({ container: ref })
useVisibilityAwareInterval({ interval: 5000, onTick: () => fetchStatus() })`}</code>
      </pre>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* LogView                                                                    */
/* -------------------------------------------------------------------------- */

const SAMPLE: Omit<LogLine, 'id' | 'time'>[] = [
  { source: 'api', message: 'GET /projekte 200 · 84 ms' },
  { source: 'worker', message: 'Export «Quartalsbericht» gestartet' },
  { source: 'auth', message: 'Sitzung erneuert', level: 'debug' },
  { source: 'worker', message: 'PDF gerendert · 12 Seiten · 1,8 s', level: 'success' },
  { source: 'api', message: 'POST /freigaben 202 · 131 ms' },
  { source: 'mail', message: 'Zustellung verzögert, neuer Versuch in 30 s', level: 'warning' },
  { source: 'db', message: 'Verbindung verloren: Zeitüberschreitung nach 5000 ms', level: 'error' },
  { source: 'db', message: 'Verbindung wiederhergestellt', level: 'success' },
]

function LogViewSection() {
  const seqRef = React.useRef(0)
  const makeLine = React.useCallback((): LogLine => {
    const n = seqRef.current++
    return { ...SAMPLE[n % SAMPLE.length], id: n, time: new Date() }
  }, [])
  const [lines, setLines] = React.useState<LogLine[]>([])
  const [running, setRunning] = React.useState(true)
  const [live, setLive] = React.useState(false)

  React.useEffect(() => {
    setLines(Array.from({ length: 12 }, makeLine))
  }, [makeLine])

  useVisibilityAwareInterval({
    interval: 1200,
    enabled: running,
    fireOnMount: false,
    onTick: () => setLines((prev) => [...prev, makeLine()].slice(-200)),
  })

  return (
    <section className="demo-panel">
      <h2>LogView</h2>
      <p>Hochscrollen pausiert das Folgen; der Knopf zählt neue Einträge und springt zurück.</p>
      <div className="demo-row">
        <Button size="sm" variant="outline" aria-pressed={running} onClick={() => setRunning((r) => !r)}>
          {running ? 'Stream anhalten' : 'Stream fortsetzen'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setLines([])}>
          Leeren
        </Button>
        <label className="inline-flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
          Neue Zeilen ansagen
        </label>
      </div>
      <LogView
        lines={lines}
        maxLines={150}
        live={live ? 'polite' : 'off'}
        labels={{ log: 'Systemprotokoll, neueste Einträge unten' }}
        sourceClassName={(s) => (s === 'db' ? 'text-chart-1' : s === 'worker' ? 'text-chart-2' : undefined)}
      />
      <pre>
        <code>{`import { LogView } from '@rapold/framework-core'

<LogView
  lines={[{ id: 1, time: new Date(), source: 'api', message: 'GET /projekte 200', level: 'info' }]}
  maxLines={500}
  viewportClassName="h-96"
/>`}</code>
      </pre>
    </section>
  )
}

export function FeedbackDemo() {
  return (
    <div className="demo-grid">
      <AlertSection />
      <AnnouncerSection />
      <HooksSection />
      <LogViewSection />
    </div>
  )
}
