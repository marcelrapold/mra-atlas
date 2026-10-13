'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

import { usePrefersReducedMotion } from '../lib/hooks'
import { cn } from '../lib/utils'

/*
 * Carousel — ohne Fremdbibliothek: CSS Scroll-Snap für Wischen und
 * Trägheit, IntersectionObserver für die aktive Folie. Autoplay ist
 * optional, pausiert bei Hover, Fokus, verdecktem Tab und bleibt bei
 * «Bewegung reduzieren» aus. Ein sichtbarer Pause-Knopf ist Pflicht
 * (WCAG 2.2.2), sobald Autoplay aktiv ist.
 */

interface CarouselLabels {
  previous: string
  next: string
  pause: string
  play: string
  /** Name einer Folie, z. B. «2 von 5». */
  slide: (index: number, count: number) => string
  /** Name eines Punkts. */
  goTo: (index: number, count: number) => string
  /** Name der Punktgruppe. */
  dots: string
}

const DEFAULT_LABELS: CarouselLabels = {
  previous: 'Vorherige Folie',
  next: 'Nächste Folie',
  pause: 'Automatische Wiedergabe anhalten',
  play: 'Automatische Wiedergabe starten',
  slide: (i, n) => `${i + 1} von ${n}`,
  goTo: (i, n) => `Folie ${i + 1} von ${n} anzeigen`,
  dots: 'Folie wählen',
}

interface CarouselContextValue {
  viewportRef: React.RefObject<HTMLDivElement | null>
  viewportId: string
  index: number
  count: number
  setCount: (n: number) => void
  setIndexFromScroll: (i: number) => void
  scrollTo: (i: number) => void
  previous: () => void
  next: () => void
  canPrevious: boolean
  canNext: boolean
  loop: boolean
  labels: CarouselLabels
  /** Autoplay konfiguriert und nicht durch reduzierte Bewegung gesperrt. */
  autoplayAvailable: boolean
  /** Benutzer hat Autoplay nicht angehalten. */
  playing: boolean
  /** Läuft gerade wirklich (nicht durch Hover/Fokus/Tab unterbrochen). */
  running: boolean
  togglePlaying: () => void
  delay: number
}

/** Scroll-Position, an der `slide` am Anfang des Viewports steht. */
function slideOffset(viewport: HTMLElement, slide: HTMLElement) {
  return viewport.scrollLeft + slide.getBoundingClientRect().left - viewport.getBoundingClientRect().left
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)
const CarouselProgressContext = React.createContext(0)
const CarouselItemIndexContext = React.createContext(0)

function useCarousel() {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) throw new Error('Carousel-Teile müssen innerhalb von <Carousel> stehen.')
  return ctx
}

interface CarouselProps extends Omit<React.ComponentProps<'section'>, 'onChange'> {
  /** Name des Karussells (Pflicht für Screenreader). */
  label: string
  /** Autoplay: `true` = 6000 ms oder Intervall in ms. Standard aus. */
  autoplay?: boolean | number
  /** Nach der letzten Folie zur ersten springen. */
  loop?: boolean
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  /** Deutsche Standardtexte, einzeln überschreibbar. */
  labels?: Partial<CarouselLabels>
}

function Carousel({
  label,
  autoplay = false,
  loop = false,
  defaultIndex = 0,
  onIndexChange,
  labels: labelOverrides,
  className,
  children,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: CarouselProps) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const viewportId = React.useId()
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = React.useState(defaultIndex)
  const [count, setCount] = React.useState(0)
  const delay = autoplay === true ? 6000 : typeof autoplay === 'number' ? autoplay : 0
  const autoplayAvailable = delay > 0 && !reduced
  const [playing, setPlaying] = React.useState(true)
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const [hidden, setHidden] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const running = autoplayAvailable && playing && !hovered && !focused && !hidden && count > 1

  const labels = React.useMemo(() => ({ ...DEFAULT_LABELS, ...labelOverrides }), [labelOverrides])

  const onIndexChangeRef = React.useRef(onIndexChange)
  onIndexChangeRef.current = onIndexChange

  const setIndexFromScroll = React.useCallback((i: number) => setIndex(i), [])

  // Wechsel melden und Autoplay-Fortschritt neu starten (auch nach Wischen).
  // Vergleich mit dem zuletzt gemeldeten Index statt «erster Lauf»-Flag,
  // damit StrictMode-Doppelläufe keinen falschen Wechsel melden.
  const reportedIndex = React.useRef(index)
  React.useEffect(() => {
    if (reportedIndex.current === index) return
    reportedIndex.current = index
    setProgress(0)
    onIndexChangeRef.current?.(index)
  }, [index])

  const scrollTo = React.useCallback(
    (i: number) => {
      const viewport = viewportRef.current
      if (!viewport || count === 0) return
      const target = loop ? (i + count) % count : Math.min(Math.max(i, 0), count - 1)
      const slide = viewport.querySelectorAll<HTMLElement>(':scope > [data-slot="carousel-item"]')[target]
      if (!slide) return
      viewport.scrollTo({ left: slideOffset(viewport, slide), behavior: reduced ? 'auto' : 'smooth' })
      setIndexFromScroll(target)
      setProgress(0)
    },
    [count, loop, reduced, setIndexFromScroll],
  )

  const previous = React.useCallback(() => scrollTo(index - 1), [scrollTo, index])
  const next = React.useCallback(() => scrollTo(index + 1), [scrollTo, index])

  // Erste Position ohne Animation.
  React.useEffect(() => {
    if (count === 0 || defaultIndex === 0) return
    const viewport = viewportRef.current
    const slide = viewport?.querySelectorAll<HTMLElement>(':scope > [data-slot="carousel-item"]')[defaultIndex]
    if (viewport && slide) viewport.scrollTo({ left: slideOffset(viewport, slide), behavior: 'auto' })
    // Nur beim ersten Messen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count > 0])

  // Verdeckter Tab pausiert.
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    const update = () => setHidden(document.hidden)
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  // Autoplay-Takt: Fortschritt in 100-ms-Schritten, dann nächste Folie.
  React.useEffect(() => {
    if (!running) return
    const tick = 100
    const timer = window.setInterval(() => {
      setProgress((p) => {
        const nextP = p + tick / delay
        return nextP >= 1 ? 1 : nextP
      })
    }, tick)
    return () => window.clearInterval(timer)
  }, [running, delay])

  React.useEffect(() => {
    if (progress < 1) return
    const atEnd = index >= count - 1
    // Autoplay läuft immer im Kreis, auch ohne `loop` für die Knöpfe.
    scrollTo(atEnd ? 0 : index + 1)
  }, [progress, index, count, scrollTo])

  const value: CarouselContextValue = {
    viewportRef,
    viewportId,
    index,
    count,
    setCount,
    setIndexFromScroll,
    scrollTo,
    previous,
    next,
    canPrevious: loop ? count > 1 : index > 0,
    canNext: loop ? count > 1 : index < count - 1,
    loop,
    labels,
    autoplayAvailable,
    playing,
    running,
    togglePlaying: () => {
      // Ausdrücklich gestartet: Fokus im Karussell soll nicht weiter bremsen.
      if (!playing) setFocused(false)
      setPlaying((p) => !p)
    },
    delay,
  }

  return (
    <CarouselContext.Provider value={value}>
      <CarouselProgressContext.Provider value={progress}>
        <section
          data-slot="carousel"
          data-autoplay={running ? 'running' : autoplayAvailable ? 'paused' : undefined}
          aria-roledescription="carousel"
          aria-label={label}
          className={cn('relative', className)}
          onPointerEnter={(e) => {
            if (e.pointerType === 'mouse') setHovered(true)
            onPointerEnter?.(e)
          }}
          onPointerLeave={(e) => {
            setHovered(false)
            onPointerLeave?.(e)
          }}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
            onBlur?.(e)
          }}
          {...props}
        >
          {children}
        </section>
      </CarouselProgressContext.Provider>
    </CarouselContext.Provider>
  )
}

/** Scroll-Snap-Viewport. Pfeiltasten wechseln die Folie, wenn er fokussiert ist. */
function CarouselContent({ className, children, onKeyDown, ...props }: React.ComponentProps<'div'>) {
  const { viewportRef, viewportId, setCount, setIndexFromScroll, previous, next, scrollTo, count, running } =
    useCarousel()
  const slides = React.Children.toArray(children).filter(React.isValidElement)

  React.useEffect(() => setCount(slides.length), [slides.length, setCount])

  // Aktive Folie = erste, die zu mindestens 60 % sichtbar ist.
  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || typeof IntersectionObserver === 'undefined') return
    const items = Array.from(viewport.querySelectorAll<HTMLElement>(':scope > [data-slot="carousel-item"]'))
    const visible = new Set<number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = items.indexOf(entry.target as HTMLElement)
          if (entry.isIntersecting) visible.add(i)
          else visible.delete(i)
        }
        if (visible.size > 0) setIndexFromScroll(Math.min(...visible))
      },
      { root: viewport, threshold: 0.6 },
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [viewportRef, setIndexFromScroll, slides.length])

  return (
    <div
      ref={viewportRef}
      id={viewportId}
      data-slot="carousel-content"
      tabIndex={0}
      // Laufendes Autoplay nicht ansagen, manuelle Wechsel schon.
      aria-live={running ? 'off' : 'polite'}
      className={cn(
        'flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-lg [scrollbar-width:none] motion-safe:scroll-smooth [&::-webkit-scrollbar]:hidden',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (e.defaultPrevented || e.target !== e.currentTarget) return
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          previous()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          next()
        } else if (e.key === 'Home') {
          e.preventDefault()
          scrollTo(0)
        } else if (e.key === 'End') {
          e.preventDefault()
          scrollTo(count - 1)
        }
      }}
      {...props}
    >
      {slides.map((child, i) => (
        <CarouselItemIndexContext.Provider key={child.key ?? i} value={i}>
          {child}
        </CarouselItemIndexContext.Provider>
      ))}
    </div>
  )
}

/** Eine Folie. Breite über `className` (Standard volle Breite, z. B. `basis-1/2`). */
function CarouselItem({ className, ...props }: React.ComponentProps<'div'>) {
  const i = React.useContext(CarouselItemIndexContext)
  const { index, count, labels } = useCarousel()
  return (
    <div
      data-slot="carousel-item"
      data-active={i === index}
      role="group"
      aria-roledescription="slide"
      aria-label={labels.slide(i, count)}
      className={cn('min-w-0 shrink-0 grow-0 basis-full snap-start', className)}
      {...props}
    />
  )
}

const navButtonClass =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full border bg-background/90 text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 motion-safe:transition-colors [&_svg]:size-5'

function CarouselPrevious({ className, children, ...props }: React.ComponentProps<'button'>) {
  const { previous, canPrevious, labels, viewportId } = useCarousel()
  return (
    <button
      type="button"
      data-slot="carousel-previous"
      aria-label={labels.previous}
      aria-controls={viewportId}
      disabled={!canPrevious}
      onClick={previous}
      className={cn(navButtonClass, className)}
      {...props}
    >
      {children ?? <ChevronLeft aria-hidden />}
    </button>
  )
}

function CarouselNext({ className, children, ...props }: React.ComponentProps<'button'>) {
  const { next, canNext, labels, viewportId } = useCarousel()
  return (
    <button
      type="button"
      data-slot="carousel-next"
      aria-label={labels.next}
      aria-controls={viewportId}
      disabled={!canNext}
      onClick={next}
      className={cn(navButtonClass, className)}
      {...props}
    >
      {children ?? <ChevronRight aria-hidden />}
    </button>
  )
}

/** Punktnavigation; die aktive Marke zeigt bei Autoplay den Fortschritt. */
function CarouselDots({ className, ...props }: React.ComponentProps<'div'>) {
  const { index, count, scrollTo, labels, viewportId, autoplayAvailable } = useCarousel()
  const progress = React.useContext(CarouselProgressContext)
  if (count < 2) return null
  return (
    <div
      data-slot="carousel-dots"
      role="group"
      aria-label={labels.dots}
      className={cn('flex flex-wrap items-center justify-center', className)}
      {...props}
    >
      {Array.from({ length: count }, (_, i) => {
        const active = i === index
        return (
          <button
            key={i}
            type="button"
            aria-label={labels.goTo(i, count)}
            aria-current={active ? 'true' : undefined}
            aria-controls={viewportId}
            onClick={() => scrollTo(i)}
            className="group/dot inline-flex h-11 min-w-8 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ring"
          >
            <span
              aria-hidden
              className={cn(
                'relative block h-1.5 overflow-hidden rounded-full motion-safe:transition-[width,background-color] motion-safe:duration-300',
                active ? 'w-8 bg-primary/25' : 'w-2.5 bg-muted-foreground/40 group-hover/dot:bg-muted-foreground',
              )}
            >
              {active && (
                <span
                  className="absolute inset-y-0 left-0 bg-primary"
                  style={{ width: `${(autoplayAvailable ? progress : 1) * 100}%` }}
                />
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Sichtbarer Pause-/Play-Knopf für Autoplay (WCAG 2.2.2). Rendert nichts ohne Autoplay. */
function CarouselAutoplayToggle({ className, ...props }: React.ComponentProps<'button'>) {
  const { autoplayAvailable, playing, togglePlaying, labels, viewportId } = useCarousel()
  if (!autoplayAvailable) return null
  return (
    <button
      type="button"
      data-slot="carousel-autoplay-toggle"
      data-state={playing ? 'playing' : 'paused'}
      aria-label={playing ? labels.pause : labels.play}
      aria-controls={viewportId}
      onClick={togglePlaying}
      className={cn(navButtonClass, className)}
      {...props}
    >
      {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
    </button>
  )
}

/** Steuerleiste: Zurück, Punkte, Pause, Weiter in einer Reihe. */
function CarouselControls({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="carousel-controls"
      className={cn('mt-3 flex items-center justify-center gap-2', className)}
      {...props}
    >
      <CarouselPrevious />
      <CarouselDots />
      <CarouselAutoplayToggle />
      <CarouselNext />
    </div>
  )
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselAutoplayToggle,
  CarouselControls,
  useCarousel,
  type CarouselProps,
  type CarouselLabels,
}
