/**
 * Tonrollen: eine Farbe pro Bedeutung, ausschliesslich aus den bestehenden
 * semantischen Atlas-Rollen. Keine neuen Brand-Farben, keine Hexwerte.
 *
 *   neutral    kein Akzent                      → muted / muted-foreground
 *   primary    Interaktion, Markenakzent        → primary
 *   info       Hinweis, wartet auf mich         → info
 *   success    erledigt, gesund                 → success
 *   warning    beobachten, weicher Fehler       → warning
 *   danger     Fehler, harter Abbruch           → destructive
 *   live       nur «jetzt live / auf Sendung»   → destructive
 *   highlight  hervorgehoben, ausgewählt        → accent
 *
 * `highlight` nutzt `accent` statt `chart-4`, weil die Foundation `chart-4`
 * auf `destructive` legt und `highlight` sonst nicht von `danger` zu
 * unterscheiden wäre.
 *
 * Die Klassen stehen ausgeschrieben da, weil Tailwind nur vollständige
 * Klassennamen im Quelltext findet.
 */

export const TONES = ['neutral', 'primary', 'info', 'success', 'warning', 'danger', 'live', 'highlight'] as const

export type Tone = (typeof TONES)[number]

/** Darstellung einer getönten Fläche. */
export type ToneAppearance = 'soft' | 'solid' | 'outline'

/** Textfarbe in der Tonrolle (für Labels auf neutralem Grund). */
export const toneText: Record<Tone, string> = {
  neutral: 'text-muted-foreground',
  primary: 'text-primary',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
  live: 'text-destructive',
  highlight: 'text-accent-foreground',
}

/** Volle Füllung ohne Textfarbe (Punkte, Balken, Marker). */
export const toneFill: Record<Tone, string> = {
  neutral: 'bg-muted-foreground',
  primary: 'bg-primary',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  live: 'bg-destructive',
  highlight: 'bg-accent-foreground',
}

/** Rahmen einer getönten Fläche. */
export const toneBorder: Record<Tone, string> = {
  neutral: 'border-border',
  primary: 'border-primary/30',
  info: 'border-info/30',
  success: 'border-success/30',
  warning: 'border-warning/30',
  danger: 'border-destructive/30',
  live: 'border-destructive/30',
  highlight: 'border-accent-foreground/20',
}

/** Hauch von Farbe auf einer Innenfläche. */
export const toneTint: Record<Tone, string> = {
  neutral: 'bg-muted',
  primary: 'bg-primary/10',
  info: 'bg-info/10',
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  danger: 'bg-destructive/10',
  live: 'bg-destructive/10',
  highlight: 'bg-accent',
}

/** Solide Füllung mit passender, kontrastgeprüfter Vordergrundfarbe. */
export const toneSolid: Record<Tone, string> = {
  neutral: 'bg-muted text-foreground',
  primary: 'bg-primary text-primary-foreground',
  info: 'bg-info text-info-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-destructive text-destructive-foreground',
  live: 'bg-destructive text-destructive-foreground',
  highlight: 'bg-accent text-accent-foreground',
}

/**
 * Klassen für eine getönte Fläche (Chip, Badge, Hinweis).
 *
 * - `soft`: Rahmen + leichter Grund + Text in der Tonrolle (Standard).
 * - `solid`: volle Füllung mit `*-foreground`.
 * - `outline`: nur Rahmen + Text, transparenter Grund.
 */
export function toneClasses(tone: Tone, appearance: ToneAppearance = 'soft'): string {
  switch (appearance) {
    case 'solid':
      return `border-transparent ${toneSolid[tone]}`
    case 'outline':
      return `bg-transparent ${toneBorder[tone]} ${toneText[tone]}`
    default:
      return `${toneBorder[tone]} ${toneTint[tone]} ${toneText[tone]}`
  }
}

/* -------------------------------------------------------------------------- */
/* Status → Tonrolle                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Status-Semantik für Listen, Admin- und Studioansichten. Jeder Status hat
 * genau eine Tonrolle, damit dieselbe Farbe nie zwei Bedeutungen trägt.
 *
 *   success  erledigt / gesund        → success
 *   info     informativ / wartet      → info
 *   progress läuft / wird erstellt    → primary
 *   warning  beobachten / weich       → warning
 *   error    defekt / hart            → danger
 *   neutral  ohne Status / archiviert → neutral
 *   active   ausgewählt / gewählt     → highlight
 */
export type StatusRole = 'success' | 'info' | 'progress' | 'warning' | 'error' | 'neutral' | 'active'

const STATUS_TONE: Record<StatusRole, Tone> = {
  success: 'success',
  info: 'info',
  progress: 'primary',
  warning: 'warning',
  error: 'danger',
  neutral: 'neutral',
  active: 'highlight',
}

/** Liefert die Tonrolle zu einem Status. */
export function statusTone(status: StatusRole): Tone {
  return STATUS_TONE[status]
}

export interface StatusToneClasses {
  tone: Tone
  /** Rahmen + leichter Grund + Text. */
  chip: string
  /** Volle Füllung mit Vordergrundfarbe. */
  solid: string
  /** Nur die Füllung (Punkt). */
  dot: string
}

/** Klassen-Set für einen Status-Chip. */
export function statusToneClasses(status: StatusRole): StatusToneClasses {
  const tone = statusTone(status)
  return {
    tone,
    chip: toneClasses(tone, 'soft'),
    solid: toneClasses(tone, 'solid'),
    dot: toneFill[tone],
  }
}
