'use client'

import * as React from 'react'
import { Download, Save, Settings, Share2, SkipForward, X } from 'lucide-react'

import { Button } from '@rapold/framework-core'
import { IconButton } from '@rapold/framework-core'
import { PlayButton, type PlayButtonState } from '@rapold/framework-core'
import { Switch } from '@rapold/framework-core'
import { RadioGroup, RadioGroupOption } from '@rapold/framework-core'
import { LikeToggle, Toggle } from '@rapold/framework-core'
import { Label } from '@rapold/framework-core'

/** Simuliert Laden → Abspielen, ohne echtes Audio. */
function usePlaybackDemo(initial: PlayButtonState = 'idle') {
  const [state, setState] = React.useState<PlayButtonState>(initial)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])
  const play = () => {
    setState('loading')
    timer.current = setTimeout(() => setState('playing'), 1200)
  }
  const pause = () => setState('paused')
  return { state, play, pause }
}

export function ControlsDemo() {
  const [saving, setSaving] = React.useState(false)
  const [status, setStatus] = React.useState('')
  const card = usePlaybackDemo()
  const mini = usePlaybackDemo('paused')
  const [follow, setFollow] = React.useState(true)
  const [quality, setQuality] = React.useState('auto')
  const [liked, setLiked] = React.useState(false)

  const save = () => {
    setSaving(true)
    setStatus('')
    setTimeout(() => {
      setSaving(false)
      setStatus('Entwurf gespeichert.')
    }, 1500)
  }

  return (
    <>
      <section className="demo-panel">
        <h2>Button: Ladezustand & volle Breite</h2>
        <p>Während des Speicherns zeigt der Button einen Spinner, ist gesperrt und meldet aria-busy.</p>
        <div className="demo-row">
          <Button loading={saving} onClick={save}>
            {!saving && <Save aria-hidden="true" />}
            {saving ? 'Wird gespeichert' : 'Entwurf speichern'}
          </Button>
          <Button variant="outline" loading>
            Export läuft
          </Button>
          <Button variant="secondary" size="icon" loading aria-label="Bericht herunterladen">
            <Download />
          </Button>
        </div>
        <div className="demo-row">
          <Button fullWidth variant="secondary">
            Alle Sendungen anzeigen
          </Button>
        </div>
        <p role="status">{status}</p>
        <pre>
          <code>{`import { Button } from '@rapold/framework-core'

<Button loading={saving} onClick={save}>Entwurf speichern</Button>
<Button fullWidth variant="secondary">Alle Sendungen anzeigen</Button>`}</code>
        </pre>
      </section>

      <section className="demo-panel">
        <h2>IconButton</h2>
        <p>Reine Icon-Aktionen. aria-label ist Pflicht; die Trefferfläche beträgt immer mindestens 44 px.</p>
        <div className="demo-row">
          <IconButton aria-label="Teilen" size="sm">
            <Share2 />
          </IconButton>
          <IconButton aria-label="Einstellungen" variant="outline">
            <Settings />
          </IconButton>
          <IconButton aria-label="Nächster Titel" variant="secondary" size="lg" shape="round">
            <SkipForward />
          </IconButton>
          <IconButton aria-label="Bericht herunterladen" variant="default" loading>
            <Download />
          </IconButton>
        </div>
        <div
          className="demo-row rounded-[var(--brand-radius)] bg-linear-to-br from-chart-1 via-chart-2 to-chart-4 p-6"
          aria-label="Glas-Variante auf farbigem Hintergrund"
          role="group"
        >
          <IconButton aria-label="Schliessen" variant="glass" shape="round">
            <X />
          </IconButton>
          <IconButton aria-label="Teilen" variant="glass" shape="round">
            <Share2 />
          </IconButton>
        </div>
        <pre>
          <code>{`import { IconButton } from '@rapold/framework-core'
import { Share2 } from 'lucide-react'

<IconButton aria-label="Teilen" variant="glass" shape="round">
  <Share2 />
</IconButton>`}</code>
        </pre>
      </section>

      <section className="demo-panel">
        <h2>PlayButton</h2>
        <p>
          Ein Wiedergabeknopf für alle Ansichten. Zustände idle, loading, playing, paused; Material Glas oder
          solid. Der Name bleibt fest, der Zustand läuft über aria-pressed und eine Live-Region.
        </p>
        <div
          className="demo-row relative rounded-[var(--brand-radius)] bg-linear-to-br from-chart-3 via-chart-1 to-chart-5 p-6"
          role="group"
          aria-label="Sendungskarte mit Cover"
        >
          <PlayButton
            label="Morgenjournal abspielen"
            state={card.state}
            onPlay={card.play}
            onPause={card.pause}
            size="lg"
          />
          <PlayButton label="Wochenrückblick abspielen" state="idle" size="md" />
          <PlayButton label="Lade-Beispiel" state="loading" size="sm" />
          <PlayButton label="Fahrmodus abspielen" state="playing" size="xl" />
        </div>
        <div className="demo-row">
          <PlayButton
            label="Live-Stream"
            material="solid"
            state={mini.state}
            onPlay={mini.play}
            onPause={mini.pause}
          />
          <span className="muted">Mini-Player · Zustand: {mini.state}</span>
        </div>
        <pre>
          <code>{`import { PlayButton } from '@rapold/framework-core'

<PlayButton
  label="Morgenjournal abspielen"
  state={state}            // 'idle' | 'loading' | 'playing' | 'paused'
  size="lg"                // sm 36 · md 44 · lg 64 · xl 112
  material="glass"         // oder 'solid'
  onPlay={start}
  onPause={pause}
/>`}</code>
        </pre>
      </section>

      <section className="demo-panel">
        <h2>Toggle & LikeToggle</h2>
        <p>Zweizustands-Knöpfe mit aria-pressed. LikeToggle ist ein Preset mit Herz, gefüllt wenn aktiv.</p>
        <div className="demo-row">
          <Toggle aria-label="Untertitel anzeigen" variant="outline">
            Untertitel
          </Toggle>
          <LikeToggle pressed={liked} onPressedChange={setLiked} />
          <LikeToggle label="Merken" showLabel size="lg" />
          <LikeToggle count={liked ? 1205 : 1204} pressed={liked} onPressedChange={setLiked} size="sm" />
        </div>
        <pre>
          <code>{`import { Toggle, LikeToggle } from '@rapold/framework-core'

<Toggle aria-label="Untertitel anzeigen">Untertitel</Toggle>
<LikeToggle pressed={liked} onPressedChange={setLiked} />`}</code>
        </pre>
      </section>

      <section className="demo-panel">
        <h2>Switch</h2>
        <p>Für Einstellungen mit sofortiger Wirkung. Die Speicherung der Präferenz bleibt Sache der App.</p>
        <div className="demo-row">
          <Switch id="demo-follow" checked={follow} onCheckedChange={setFollow} />
          <Label htmlFor="demo-follow">Transkript mitscrollen</Label>
          <span aria-hidden="true" className="muted">
            {follow ? 'An' : 'Aus'}
          </span>
        </div>
        <div className="demo-row">
          <Switch id="demo-notify" size="sm" defaultChecked={false} />
          <Label htmlFor="demo-notify">Benachrichtigung bei neuer Folge</Label>
        </div>
        <div className="demo-row">
          <Switch id="demo-locked" disabled defaultChecked />
          <Label htmlFor="demo-locked">Automatische Updates (vom Betrieb gesperrt)</Label>
        </div>
        <pre>
          <code>{`import { Switch, Label } from '@rapold/framework-core'

<Switch id="follow" checked={follow} onCheckedChange={setFollow} />
<Label htmlFor="follow">Transkript mitscrollen</Label>`}</code>
        </pre>
      </section>

      <section className="demo-panel">
        <h2>RadioGroup</h2>
        <p id="demo-quality-label" className="mb-3 text-sm font-semibold text-foreground">
          Audioqualität
        </p>
        <RadioGroup value={quality} onValueChange={setQuality} aria-labelledby="demo-quality-label">
          <RadioGroupOption
            value="auto"
            variant="card"
            label="Automatisch"
            description="Passt die Bitrate an die Verbindung an. Spart mobile Daten."
          />
          <RadioGroupOption
            value="high"
            variant="card"
            label="Hoch"
            description="Immer die beste verfügbare Qualität, auch unterwegs."
          />
          <RadioGroupOption value="offline" variant="card" label="Nur WLAN" description="Bald verfügbar." disabled />
        </RadioGroup>
        <RadioGroup defaultValue="de" aria-label="Sprache der Untertitel" className="mt-4">
          <RadioGroupOption value="de" label="Deutsch" />
          <RadioGroupOption value="fr" label="Französisch" />
          <RadioGroupOption value="it" label="Italienisch" />
        </RadioGroup>
        <pre>
          <code>{`import { RadioGroup, RadioGroupOption } from '@rapold/framework-core'

<RadioGroup value={quality} onValueChange={setQuality} aria-label="Audioqualität">
  <RadioGroupOption value="auto" variant="card" label="Automatisch"
    description="Passt die Bitrate an die Verbindung an." />
  <RadioGroupOption value="high" variant="card" label="Hoch" />
</RadioGroup>`}</code>
        </pre>
      </section>
    </>
  )
}
