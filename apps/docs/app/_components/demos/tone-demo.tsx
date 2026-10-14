'use client'

import { Bot } from 'lucide-react'

import { Badge } from '@rapold/framework-core'
import { LiveDot, StatusDot } from '@rapold/framework-core'
import { Eyebrow } from '@rapold/framework-core'
import { Inset } from '@rapold/framework-core'
import { AiDisclosureBadge } from '@rapold/framework-core'
import { TONES, statusToneClasses, type StatusRole } from '@rapold/framework-core'
import { focusRing } from '@rapold/framework-core'

import { DemoPanel } from '../demo-panel'

const TONE_LABELS: Record<(typeof TONES)[number], string> = {
  neutral: 'Archiviert',
  primary: 'In Arbeit',
  info: 'Hinweis',
  success: 'Freigegeben',
  warning: 'Prüfen',
  danger: 'Fehlgeschlagen',
  live: 'Live',
  highlight: 'Ausgewählt',
}

const STATUS_ROWS: { status: StatusRole; label: string }[] = [
  { status: 'success', label: 'Export abgeschlossen' },
  { status: 'info', label: 'Wartet auf Freigabe' },
  { status: 'progress', label: 'Wird erstellt' },
  { status: 'warning', label: 'Speicher fast voll' },
  { status: 'error', label: 'Upload abgebrochen' },
  { status: 'neutral', label: 'Archiviert' },
  { status: 'active', label: 'Ausgewählt' },
]

export function ToneDemo() {
  return (
    <>
      <DemoPanel
        id="tone-status"
        title="Tonrollen & Status"
        description="Acht Tonrollen auf bestehenden Atlas-Rollen. Jede Bedeutung hat genau eine Farbe."
        layout="fill"
        code={`import { statusToneClasses, toneClasses } from '@rapold/framework-core'

const { chip } = statusToneClasses('warning')
<span className={\`rounded-full border px-2 \${chip}\`}>Prüfen</span>
<div className={toneClasses('success', 'solid')}>Freigegeben</div>`}
      >
        <div className="demo-row">
          {TONES.map((tone) => (
            <Badge key={tone} tone={tone} dot>
              {TONE_LABELS[tone]}
            </Badge>
          ))}
        </div>
        <ul className="grid gap-2 p-0" style={{ listStyle: 'none' }}>
          {STATUS_ROWS.map(({ status, label }) => {
            const classes = statusToneClasses(status)
            return (
              <li key={status} className="flex items-center gap-3 text-sm">
                <StatusDot tone={classes.tone} />
                <span>{label}</span>
                <span className={`ml-auto rounded-full border px-2 py-0.5 text-xs ${classes.chip}`}>{status}</span>
              </li>
            )
          })}
        </ul>
      </DemoPanel>

      <DemoPanel
        id="badge-tones"
        title="Badge: Tonrollen, Grössen, Zähler"
        layout="fill"
        code={`import { Badge } from '@rapold/framework-core'

<Badge tone="live" pulse>Live</Badge>
<Badge tone="info" size="md" numeric dot>128 hören zu</Badge>
<Badge tone="live" onMedia>Live</Badge>`}
      >
        <div className="demo-row">
          <Badge tone="success">Soft</Badge>
          <Badge tone="success" appearance="solid">Solid</Badge>
          <Badge tone="success" appearance="outline">Outline</Badge>
        </div>
        <div className="demo-row">
          <Badge tone="live" size="sm">Live</Badge>
          <Badge tone="live" size="md" pulse>Jetzt auf Sendung</Badge>
          <Badge tone="info" size="md" numeric dot>128 hören zu</Badge>
          <Badge tone="primary" size="sm" icon={<Bot aria-hidden="true" />}>Assistent</Badge>
        </div>
        <div className="relative overflow-hidden rounded-md bg-muted" style={{ aspectRatio: '16 / 7' }}>
          <div className="absolute inset-0 bg-linear-to-br from-primary/40 to-success/30" aria-hidden="true" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge tone="live" onMedia size="md">Live</Badge>
            <Badge tone="info" onMedia size="md" numeric dot>2 340 Zuschauende</Badge>
          </div>
        </div>
      </DemoPanel>

      <DemoPanel
        id="livedot-statusdot"
        title="LiveDot & StatusDot"
        code={`import { LiveDot, StatusDot } from '@rapold/framework-core'

<LiveDot pulse /> Auf Sendung
<StatusDot tone="success" label="Dienst erreichbar" />`}
      >
        <div className="demo-row">
          <span className="inline-flex items-center gap-2 text-sm">
            <LiveDot pulse /> Auf Sendung
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <LiveDot size="sm" /> Live (ruhig)
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <StatusDot tone="success" label="Dienst erreichbar" />
            Server Zürich
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <StatusDot tone="warning" /> Wartung ab 22:00
          </span>
        </div>
      </DemoPanel>

      <DemoPanel
        id="eyebrow"
        title="Eyebrow"
        layout="fill"
        code={`import { Eyebrow } from '@rapold/framework-core'

<Eyebrow>Quartalsbericht</Eyebrow>
<Eyebrow as="h3" tone="primary">Nächste Schritte</Eyebrow>`}
      >
        <div className="grid gap-4">
          <div>
            <Eyebrow>Quartalsbericht</Eyebrow>
            <p className="m-0 text-lg font-semibold text-foreground">Umsatz Q3 2026</p>
          </div>
          <div>
            <Eyebrow as="h3" tone="primary">
              Nächste Schritte
            </Eyebrow>
            <p className="m-0">Freigabe durch die Geschäftsleitung bis Freitag.</p>
          </div>
          <Eyebrow tone="danger">Frist überschritten</Eyebrow>
        </div>
      </DemoPanel>

      <DemoPanel
        id="inset"
        title="Inset"
        layout="fill"
        code={`import { Inset } from '@rapold/framework-core'

<Inset>…</Inset>
<Inset as="li" tone="success" padding="sm">Variante A</Inset>`}
      >
        <div className="grid gap-3">
          <Inset>
            <Eyebrow>Notiz</Eyebrow>
            <p className="m-0 text-sm">Die Offerte gilt 30 Tage ab Ausstellungsdatum.</p>
          </Inset>
          <ul className="m-0 grid gap-2 p-0" style={{ listStyle: 'none' }}>
            <Inset as="li" tone="success" padding="sm" className="text-sm">
              Variante A — 42 Stimmen
            </Inset>
            <Inset as="li" tone="highlight" padding="sm" className="text-sm">
              Variante B — 37 Stimmen (ausgewählt)
            </Inset>
          </ul>
          <Inset tone="warning">
            <p className="m-0 text-sm">Die Daten werden nachts um 02:00 synchronisiert.</p>
          </Inset>
        </div>
      </DemoPanel>

      <DemoPanel
        id="ai-disclosure"
        title="KI-Kennzeichnung"
        layout="fill"
        code={`import { AiDisclosureBadge } from '@rapold/framework-core'

<AiDisclosureBadge />
<AiDisclosureBadge compact />
<AiDisclosureBadge onMedia decorative className="absolute right-3 bottom-3" />`}
      >
        <div className="demo-row">
          <AiDisclosureBadge />
          <AiDisclosureBadge size="md" label="Mit KI übersetzt" />
          <AiDisclosureBadge compact />
        </div>
        <figure className="m-0">
          <a
            href="#ki-beispiel"
            className={`relative block overflow-hidden rounded-md bg-muted ${focusRing}`}
            style={{ aspectRatio: '16 / 7' }}
          >
            <span className="absolute inset-0 bg-linear-to-tr from-accent to-primary/30" aria-hidden="true" />
            <AiDisclosureBadge onMedia size="md" decorative className="absolute right-3 bottom-3" />
            <span className="sr-only">KI-generiertes Titelbild: Skyline von Zürich in der Abenddämmerung</span>
          </a>
          <figcaption className="mt-2 text-sm text-muted-foreground">
            Die Angabe steht im zugänglichen Namen des Bildes, das Badge ist darum `decorative`.
          </figcaption>
        </figure>
      </DemoPanel>
    </>
  )
}
