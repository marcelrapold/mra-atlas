/**
 * Generische, SSR-sichere Client-Hooks für Atlas-Komponenten.
 *
 * Alle Hooks greifen erst im Browser auf `window`, `document` oder
 * `matchMedia` zu. Auf dem Server liefern sie einen neutralen Standardwert,
 * damit Server- und Client-Render beim Hydrieren übereinstimmen.
 */
import * as React from 'react'

const isBrowser = typeof window !== 'undefined'

/** `useLayoutEffect` im Browser, `useEffect` auf dem Server (keine SSR-Warnung). */
const useIsomorphicLayoutEffect = isBrowser ? React.useLayoutEffect : React.useEffect

/* -------------------------------------------------------------------------- */
/* useMediaQuery                                                              */
/* -------------------------------------------------------------------------- */

export interface UseMediaQueryOptions {
  /** Wert auf dem Server und beim Hydrieren. Standard: `false`. */
  defaultValue?: boolean
}

/**
 * Reaktiver Boolean für eine beliebige CSS-Media-Query.
 *
 * Nur verwenden, wenn sich die DOM-Struktur je Breakpoint ändert. Reine
 * Darstellungsunterschiede gehören in Tailwind-Varianten (`md:`, `motion-safe:`).
 *
 * @example const wide = useMediaQuery('(min-width: 48rem)')
 */
export function useMediaQuery(query: string, { defaultValue = false }: UseMediaQueryOptions = {}): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (!isBrowser || typeof window.matchMedia !== 'function') return () => {}
      const mq = window.matchMedia(query)
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
      }
      // Ältere Safari-Versionen kennen nur addListener.
      mq.addListener(onChange)
      return () => mq.removeListener(onChange)
    },
    [query],
  )

  const getSnapshot = () =>
    isBrowser && typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : defaultValue

  return React.useSyncExternalStore(subscribe, getSnapshot, () => defaultValue)
}

/* -------------------------------------------------------------------------- */
/* usePrefersReducedMotion                                                    */
/* -------------------------------------------------------------------------- */

/**
 * `true`, wenn die Person im Betriebssystem «Bewegung reduzieren» gewählt hat.
 * Reagiert auf Änderungen während der Sitzung. Server: `false`.
 *
 * Für reine CSS-Animationen genügen `motion-safe:`/`motion-reduce:`; der Hook
 * ist für Inline-Styles und JS-Animationen (z. B. `scrollTo({ behavior })`).
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/* -------------------------------------------------------------------------- */
/* useElementSize                                                             */
/* -------------------------------------------------------------------------- */

export interface ElementSize {
  width: number
  height: number
}

export interface UseElementSizeOptions {
  /** Nur grösser werden (z. B. für `srcset`, damit kein zweiter Download folgt). */
  growOnly?: boolean
}

/**
 * Gerenderte Grösse eines Elements in CSS-Pixeln (aufgerundet).
 * Misst vor dem ersten Paint und bleibt per `ResizeObserver` aktuell.
 * `null`, solange nichts gemessen ist (Server, `display: none`, jsdom).
 */
export function useElementSize<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
  { growOnly = false }: UseElementSizeOptions = {},
): ElementSize | null {
  const [size, setSize] = React.useState<ElementSize | null>(null)

  useIsomorphicLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const take = (rawWidth: number, rawHeight: number) => {
      if (!(rawWidth > 0) && !(rawHeight > 0)) return
      const width = Math.ceil(rawWidth)
      const height = Math.ceil(rawHeight)
      setSize((prev) => {
        if (prev && prev.width === width && prev.height === height) return prev
        if (growOnly && prev) {
          const next = { width: Math.max(prev.width, width), height: Math.max(prev.height, height) }
          return next.width === prev.width && next.height === prev.height ? prev : next
        }
        return { width, height }
      })
    }
    const rect = el.getBoundingClientRect()
    take(rect.width, rect.height)
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      const last = entries[entries.length - 1]
      if (last) take(last.contentRect.width, last.contentRect.height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, growOnly])

  return size
}

/* -------------------------------------------------------------------------- */
/* useScrollDirection                                                         */
/* -------------------------------------------------------------------------- */

export type ScrollDirection = 'up' | 'down'

export interface UseScrollDirectionOptions {
  /** Scroll-Container. Ohne Angabe wird `window` beobachtet. */
  container?: React.RefObject<HTMLElement | null>
  /** Mindeständerung in px, bevor die Richtung wechselt (filtert Touchpad-Rauschen). Standard 6. */
  delta?: number
  /** Innerhalb dieser Distanz zum Anfang immer `'up'` (Chrome sichtbar). Standard 32. */
  revealThreshold?: number
}

/**
 * Meldet, ob gerade nach unten (`'down'`, Chrome ausblenden) oder nach oben
 * (`'up'`, Chrome zeigen) gescrollt wird. Passive Listener, ein Update pro Frame.
 *
 * Das Ausblenden selbst sollte `motion-reduce:transition-none` respektieren.
 */
export function useScrollDirection({
  container,
  delta = 6,
  revealThreshold = 32,
}: UseScrollDirectionOptions = {}): ScrollDirection {
  const [direction, setDirection] = React.useState<ScrollDirection>('up')
  const lastY = React.useRef(0)
  const lastDir = React.useRef<ScrollDirection>('up')

  React.useEffect(() => {
    if (!isBrowser) return
    const el = container?.current ?? null
    const target: HTMLElement | Window = el ?? window
    const getY = () => (el ? el.scrollTop : window.scrollY)

    lastY.current = getY()
    let frame = 0

    const update = (next: ScrollDirection) => {
      if (next === lastDir.current) return
      lastDir.current = next
      setDirection(next)
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        const y = getY()
        if (y <= revealThreshold) {
          update('up')
          lastY.current = y
          return
        }
        const diff = y - lastY.current
        if (Math.abs(diff) < delta) return
        update(diff > 0 ? 'down' : 'up')
        lastY.current = y
      })
    }

    target.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      target.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [container, delta, revealThreshold])

  return direction
}

/* -------------------------------------------------------------------------- */
/* useVisibilityAwareInterval                                                 */
/* -------------------------------------------------------------------------- */

/** Nach dieser Zeit blockiert eine nie abgeschlossene Runde das Polling nicht mehr. */
export const IN_FLIGHT_STALE_MS = 120_000

export interface VisibilityPollerOptions {
  interval: number
  run: () => unknown
  fireOnMount?: boolean
  isHidden?: () => boolean
  now?: () => number
}

export interface VisibilityPoller {
  /** An `visibilitychange` hängen. */
  handleVisibilityChange(): void
  dispose(): void
}

const documentIsHidden = (): boolean =>
  typeof document !== 'undefined' && document.visibilityState === 'hidden'

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return typeof value === 'object' && value !== null && typeof (value as { then?: unknown }).then === 'function'
}

/**
 * Framework-freie Zeitsteuerung für `useVisibilityAwareInterval` (testbar ohne React).
 *
 * - pausiert in verborgenen Tabs und holt beim Zurückkommen nach,
 * - feuert nie, solange die vorige Runde (Promise) noch läuft,
 * - hält auch beim Nachholen den Mindestabstand `interval` ein.
 */
export function createVisibilityPoller({
  interval,
  run,
  fireOnMount = true,
  isHidden = documentIsHidden,
  now = Date.now,
}: VisibilityPollerOptions): VisibilityPoller {
  let timer: ReturnType<typeof setTimeout> | null = null
  let disposed = false
  let lastStartedAt: number | null = null
  let inFlightToken: number | null = null
  let nextToken = 0

  const clear = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  const fire = () => {
    if (inFlightToken !== null && lastStartedAt !== null && now() - lastStartedAt < IN_FLIGHT_STALE_MS) return
    inFlightToken = null
    lastStartedAt = now()
    const result = run()
    if (isThenable(result)) {
      const token = ++nextToken
      inFlightToken = token
      const settle = () => {
        if (inFlightToken === token) inFlightToken = null
      }
      result.then(settle, (err: unknown) => {
        settle()
        throw err
      })
    }
  }

  const schedule = (delay: number) => {
    clear()
    timer = setTimeout(() => {
      timer = null
      if (disposed || isHidden()) return
      // Erst planen, dann feuern: wirft `run` synchron, läuft das Polling weiter.
      schedule(interval)
      fire()
    }, Math.max(0, delay))
  }

  if (!isHidden()) schedule(interval)
  if (fireOnMount && !isHidden()) fire()

  return {
    handleVisibilityChange() {
      if (disposed) return
      if (isHidden()) {
        clear()
        return
      }
      const since = lastStartedAt === null ? Infinity : now() - lastStartedAt
      if (since >= interval) {
        schedule(interval)
        fire()
      } else {
        schedule(interval - since)
      }
    },
    dispose() {
      disposed = true
      clear()
    },
  }
}

export interface VisibilityAwareIntervalOptions {
  /** Abstand in ms, solange der Tab sichtbar ist. `<= 0` deaktiviert. */
  interval: number
  /** Pro Tick und beim Nachholen. Ein zurückgegebenes Promise pausiert weitere Ticks bis zum Abschluss. */
  onTick: () => void | Promise<unknown>
  /** `false` macht den Hook wirkungslos. Standard `true`. */
  enabled?: boolean
  /** Sofort beim Einhängen feuern. Standard `true`. */
  fireOnMount?: boolean
}

/**
 * `setInterval`-Ersatz für Polling: pausiert in verborgenen Tabs, holt beim
 * Zurückkommen nach und stapelt keine Anfragen. Eine neue `onTick`-Identität
 * startet keinen neuen Timer.
 */
export function useVisibilityAwareInterval({
  interval,
  onTick,
  enabled = true,
  fireOnMount = true,
}: VisibilityAwareIntervalOptions): void {
  const onTickRef = React.useRef(onTick)
  useIsomorphicLayoutEffect(() => {
    onTickRef.current = onTick
  }, [onTick])

  React.useEffect(() => {
    if (!enabled || !isBrowser || interval <= 0) return
    const poller = createVisibilityPoller({ interval, run: () => onTickRef.current(), fireOnMount })
    const handleVisibility = () => poller.handleVisibilityChange()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      poller.dispose()
    }
  }, [interval, enabled, fireOnMount])
}

/* -------------------------------------------------------------------------- */
/* useDocumentTitle                                                           */
/* -------------------------------------------------------------------------- */

export interface UseDocumentTitleOptions {
  /** Beim Aushängen den vorherigen Titel wiederherstellen. Standard `true`. */
  restoreOnUnmount?: boolean
}

/**
 * Setzt `document.title`, sobald sich der Inhalt ändert (WCAG 2.4.2), und
 * stellt beim Aushängen den vorherigen Titel wieder her. `null`/leer lässt den
 * Titel unverändert. Kein Ticker: nur bei inhaltlichen Wechseln aktualisieren.
 *
 * @example useDocumentTitle(playing ? `▶ ${track} – Atlas` : 'Atlas')
 */
export function useDocumentTitle(
  title: string | null | undefined,
  { restoreOnUnmount = true }: UseDocumentTitleOptions = {},
): void {
  const restoreRef = React.useRef(restoreOnUnmount)
  React.useEffect(() => {
    restoreRef.current = restoreOnUnmount
  }, [restoreOnUnmount])

  // Vorherigen Titel nur beim Ein- und Aushängen merken.
  React.useEffect(() => {
    const before = document.title
    return () => {
      if (restoreRef.current) document.title = before
    }
  }, [])

  React.useEffect(() => {
    const next = title?.trim()
    if (next && document.title !== next) document.title = next
  }, [title])
}

/* -------------------------------------------------------------------------- */
/* useControllableState                                                       */
/* -------------------------------------------------------------------------- */

export interface UseControllableStateOptions<T> {
  /** Kontrollierter Wert. `undefined` heisst: Die Komponente verwaltet den Wert selbst. */
  prop?: T | undefined
  /** Startwert im unkontrollierten Modus. */
  defaultProp: T
  /** Wird bei jeder echten Änderung aufgerufen, kontrolliert wie unkontrolliert. */
  onChange?: ((value: T) => void) | undefined
}

/**
 * Zustand, der kontrolliert (`open` + `onOpenChange`) und unkontrolliert
 * (`defaultOpen`) funktioniert: die Atlas-Konvention `value`/`defaultValue`/
 * `onValueChange` (siehe docs/components/api.md).
 *
 * Der Setter ist stabil und meldet nur echte Änderungen (`Object.is`).
 * Unkontrolliert vergleicht er mit dem zuletzt gesetzten Wert, damit zwei
 * Aufrufe im selben Ereignis `onChange` nicht doppelt auslösen; kontrolliert
 * mit dem gerenderten `prop`, bis der Aufrufer ihn ändert. Ist `T` selbst eine
 * Funktion, wird sie wie bei `useState` als Updater gelesen.
 *
 * @example const [open, setOpen] = useControllableState({ prop: open, defaultProp: true, onChange: onOpenChange })
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateOptions<T>): [T, (next: T | ((prev: T) => T)) => void] {
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultProp)
  const controlled = prop !== undefined
  const value = controlled ? (prop as T) : uncontrolled

  const valueRef = React.useRef(value)
  const onChangeRef = React.useRef(onChange)
  // Ohne Abhängigkeitsliste: nach jedem Render den gerenderten Stand übernehmen.
  useIsomorphicLayoutEffect(() => {
    valueRef.current = value
    onChangeRef.current = onChange
  })

  const setValue = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(valueRef.current) : next
      if (Object.is(resolved, valueRef.current)) return
      // Kontrolliert zählt nur, was der Aufrufer rendert: Lehnt er den Wechsel
      // ab, meldet der nächste Versuch ihn erneut.
      if (!controlled) {
        valueRef.current = resolved
        setUncontrolled(resolved)
      }
      onChangeRef.current?.(resolved)
    },
    [controlled],
  )

  return [value, setValue]
}
