/**
 * useSwipeToDismiss: drag a bottom sheet down with one finger to close it.
 *
 * Behaviour
 * - The sheet follows the finger downwards (never above its resting place).
 * - Releasing closes at SWIPE_DISMISS_RATIO of the sheet height, or on a
 *   flick (>= SWIPE_DISMISS_VELOCITY px/ms over at least FLICK_MIN_DISTANCE px).
 *   Velocity is measured only over the last FLICK_WINDOW_MS before release:
 *   pulling fast, holding still and then letting go is not a flick.
 * - Scrolling wins: if content under the finger is scrolled away from the top,
 *   or the first movement goes up or sideways, the gesture belongs to the content.
 * - Inputs, sliders, contenteditable and `[data-no-swipe-dismiss]` never swipe.
 * - Only the topmost open dialog reacts (Radix `data-state="open"`).
 * - prefers-reduced-motion: no spring-back or exit animation; the sheet snaps
 *   back or closes immediately. Following the finger stays (user-driven motion).
 *
 * The element is moved with the CSS `translate` property, not `transform`,
 * so enter/exit keyframes that own `transform` are not overridden.
 *
 * This module has no relative imports and only erasable TypeScript, so the
 * pure helpers can be tested with `node --test` (Node >= 22.18 strips types).
 */
import { useEffect, useRef } from 'react'

/** Releasing beyond this share of the sheet height dismisses. */
export const SWIPE_DISMISS_RATIO = 0.25
/** A fast gesture (px/ms) dismisses below the ratio threshold … */
export const SWIPE_DISMISS_VELOCITY = 0.5
/** … when it travelled at least this far (px). */
export const FLICK_MIN_DISTANCE = 24
/** Velocity is measured over this window before release (ms). */
export const FLICK_WINDOW_MS = 100
/** Until here a touch is still a tap, not a direction (px). */
export const SWIPE_SLOP = 8

const SPRING_MS = 220
const EXIT_MS = 180

export const NO_SWIPE_SELECTOR = [
  'input',
  'textarea',
  'select',
  '[contenteditable="true"]',
  '[contenteditable=""]',
  '[role="slider"]',
  '[data-no-swipe-dismiss]',
].join(',')

export interface SwipeSample {
  t: number
  y: number
}

/**
 * Release velocity in px/ms (downwards positive): distance over the last
 * FLICK_WINDOW_MS before `now`, divided by that duration. If the finger stood
 * still for the whole window the result is 0. `samples` must be sorted by time.
 */
export function releaseVelocity(samples: readonly SwipeSample[], now: number): number {
  if (samples.length === 0) return 0
  const cutoff = now - FLICK_WINDOW_MS
  const last = samples[samples.length - 1]
  if (last.t <= cutoff) return 0
  let anchor = samples[0]
  for (const s of samples) {
    if (s.t > cutoff) break
    anchor = s
  }
  const span = now - Math.max(anchor.t, cutoff)
  return span > 0 ? (last.y - anchor.y) / span : 0
}

/** Should a released drag of `offset` px on a sheet of `height` px dismiss? */
export function shouldDismiss({
  offset,
  height,
  velocity,
}: {
  offset: number
  height: number
  velocity: number
}): boolean {
  const far = height > 0 && offset >= height * SWIPE_DISMISS_RATIO
  const flick = offset >= FLICK_MIN_DISTANCE && velocity >= SWIPE_DISMISS_VELOCITY
  return far || flick
}

/**
 * Decide what the first movement of a touch means.
 * - 'pending': still within the tap slop, wait for more movement
 * - 'drag': downward, mostly vertical, content at top: the sheet takes over
 * - 'release': upward, sideways or scrolled content: the content owns it
 */
export function classifyGestureStart({
  dx,
  dy,
  scrolled,
}: {
  dx: number
  dy: number
  scrolled: boolean
}): 'pending' | 'drag' | 'release' {
  if (Math.abs(dx) < SWIPE_SLOP && Math.abs(dy) < SWIPE_SLOP) return 'pending'
  if (dy <= 0 || Math.abs(dx) > Math.abs(dy) || scrolled) return 'release'
  return 'drag'
}

/** Keep only samples inside the flick window, plus one anchor before it. */
export function trimSamples(samples: SwipeSample[], now: number): SwipeSample[] {
  while (samples.length > 2 && samples[1].t <= now - FLICK_WINDOW_MS) samples.shift()
  return samples
}

/** Is anything between `from` and `stop` (inclusive) scrolled down? */
function scrolledAwayFromTop(from: Element | null, stop: HTMLElement): boolean {
  let node: Element | null = from
  while (node) {
    if (node.scrollTop > 0) return true
    if (node === stop) break
    node = node.parentElement
  }
  return false
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

const OPEN_DIALOG_SELECTOR = '[role="dialog"][data-state="open"],[role="alertdialog"][data-state="open"]'

/**
 * Is `el` (a Radix dialog content node) open and the topmost open dialog?
 * Radix renders nested dialogs in later portals, so the last open dialog in
 * document order is the top of the stack.
 */
export function isTopmostOpenDialog(el: HTMLElement): boolean {
  if (el.getAttribute('data-state') !== 'open') return false
  const open = el.ownerDocument.querySelectorAll(OPEN_DIALOG_SELECTOR)
  const top = open[open.length - 1]
  return !top || top === el || el.contains(top)
}

interface Gesture {
  target: Element | null
  startX: number
  startY: number
  samples: SwipeSample[]
  offset: number
  dragging: boolean
}

export interface SwipeToDismissOptions {
  /** Attach listeners only while true (e.g. bottom sheet and open). */
  enabled: boolean
  /** Called once the sheet should close (after the exit motion). */
  onDismiss: () => void
}

/**
 * Attach swipe-down-to-dismiss to `element` (the moving sheet, typically the
 * Radix `Dialog.Content`). Pass the element from a callback ref kept in state,
 * so listeners attach when portalled content mounts. SSR-safe: effects only.
 */
export function useSwipeToDismiss(
  element: HTMLElement | null,
  { enabled, onDismiss }: SwipeToDismissOptions,
): void {
  const onDismissRef = useRef(onDismiss)
  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useEffect(() => {
    if (!enabled || !element) return
    const sheet = element

    let gesture: Gesture | null = null
    let settleTimer: ReturnType<typeof setTimeout> | undefined
    let saved: { translate: string; transition: string; willChange: string; opacity: string } | null =
      null

    const setOffset = (px: number) => {
      sheet.style.translate = px > 0 ? `0 ${px}px` : ''
      if (px > 0) sheet.setAttribute('data-swipe-offset', String(Math.round(px)))
      else sheet.removeAttribute('data-swipe-offset')
    }

    const restore = () => {
      if (!saved) return
      sheet.style.translate = saved.translate
      sheet.style.transition = saved.transition
      sheet.style.willChange = saved.willChange
      sheet.style.opacity = saved.opacity
      sheet.removeAttribute('data-swipe-offset')
      sheet.removeAttribute('data-swiping')
      saved = null
    }

    const springBack = () => {
      clearTimeout(settleTimer)
      if (prefersReducedMotion()) {
        restore()
        return
      }
      sheet.style.transition = `translate ${SPRING_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
      setOffset(0)
      settleTimer = setTimeout(restore, SPRING_MS + 40)
    }

    const dismiss = (offset: number) => {
      clearTimeout(settleTimer)
      if (!isTopmostOpenDialog(sheet)) {
        restore()
        return
      }
      // If the caller keeps the sheet open after onDismiss, put it back.
      const settle = () => {
        if (sheet.isConnected && sheet.getAttribute('data-state') === 'open') restore()
      }
      if (prefersReducedMotion()) {
        onDismissRef.current()
        settleTimer = setTimeout(settle, 0)
        return
      }
      const top = sheet.getBoundingClientRect().top
      const exit = Math.max(sheet.offsetHeight, window.innerHeight - top + offset)
      sheet.style.transition = `translate ${EXIT_MS}ms cubic-bezier(0.4, 0, 1, 1), opacity ${EXIT_MS}ms ease-in`
      setOffset(exit)
      sheet.style.opacity = '0'
      settleTimer = setTimeout(() => {
        if (!isTopmostOpenDialog(sheet)) {
          restore()
          return
        }
        onDismissRef.current()
        settleTimer = setTimeout(settle, 50)
      }, EXIT_MS)
    }

    const onTouchStart = (e: TouchEvent) => {
      gesture = null
      clearTimeout(settleTimer)
      restore()
      if (e.touches.length !== 1) return
      const target = e.target instanceof Element ? e.target : null
      if (!target || !sheet.contains(target)) return
      if (!isTopmostOpenDialog(sheet)) return
      if (target.closest(NO_SWIPE_SELECTOR)) return
      const t = e.touches[0]
      gesture = {
        target,
        startX: t.clientX,
        startY: t.clientY,
        samples: [{ t: e.timeStamp, y: t.clientY }],
        offset: 0,
        dragging: false,
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      const g = gesture
      if (!g) return
      if (!isTopmostOpenDialog(sheet)) {
        gesture = null
        restore()
        return
      }
      if (e.touches.length !== 1) {
        gesture = null
        if (g.dragging) springBack()
        return
      }
      const t = e.touches[0]
      const dx = t.clientX - g.startX
      const dy = t.clientY - g.startY
      if (!g.dragging) {
        const intent = classifyGestureStart({
          dx,
          dy,
          scrolled: scrolledAwayFromTop(g.target, sheet),
        })
        if (intent === 'pending') return
        if (intent === 'release') {
          gesture = null
          return
        }
        g.dragging = true
        saved = {
          translate: sheet.style.translate,
          transition: sheet.style.transition,
          willChange: sheet.style.willChange,
          opacity: sheet.style.opacity,
        }
        sheet.style.transition = 'none'
        sheet.style.willChange = 'translate'
        sheet.setAttribute('data-swiping', '')
      }
      // No page scroll or rubber band while the sheet is being dragged.
      if (e.cancelable) e.preventDefault()
      g.samples.push({ t: e.timeStamp, y: t.clientY })
      trimSamples(g.samples, e.timeStamp)
      g.offset = Math.max(0, dy)
      setOffset(g.offset)
    }

    const onTouchEnd = (e: TouchEvent) => {
      const g = gesture
      gesture = null
      if (!g || !g.dragging) return
      sheet.removeAttribute('data-swiping')
      const height = sheet.offsetHeight || sheet.getBoundingClientRect().height
      const velocity = releaseVelocity(g.samples, e.timeStamp)
      if (shouldDismiss({ offset: g.offset, height, velocity })) dismiss(g.offset)
      else springBack()
    }

    const onTouchCancel = () => {
      const g = gesture
      gesture = null
      if (g?.dragging) springBack()
    }

    sheet.addEventListener('touchstart', onTouchStart, { passive: true })
    // passive: false, otherwise preventDefault cannot stop scrolling.
    sheet.addEventListener('touchmove', onTouchMove, { passive: false })
    sheet.addEventListener('touchend', onTouchEnd)
    sheet.addEventListener('touchcancel', onTouchCancel)
    return () => {
      sheet.removeEventListener('touchstart', onTouchStart)
      sheet.removeEventListener('touchmove', onTouchMove)
      sheet.removeEventListener('touchend', onTouchEnd)
      sheet.removeEventListener('touchcancel', onTouchCancel)
      clearTimeout(settleTimer)
      restore()
      gesture = null
    }
  }, [enabled, element])
}
