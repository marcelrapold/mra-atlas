import test from 'node:test';
import assert from 'node:assert/strict';
import {
  releaseVelocity,
  shouldDismiss,
  classifyGestureStart,
  trimSamples,
  SWIPE_DISMISS_RATIO,
  SWIPE_DISMISS_VELOCITY,
  FLICK_MIN_DISTANCE,
  FLICK_WINDOW_MS,
} from '../packages/core/src/lib/use-swipe-to-dismiss.ts';

test('release velocity only counts the last flick window', () => {
  assert.equal(releaseVelocity([], 1000), 0);
  // 100 px fast, then holding still for 800 ms: not a flick.
  assert.equal(releaseVelocity([{ t: 0, y: 0 }, { t: 50, y: 100 }], 850), 0);
  // 60 px within the last 100 ms.
  const v = releaseVelocity([{ t: 0, y: 0 }, { t: 900, y: 40 }, { t: 1000, y: 100 }], 1000);
  assert.ok(Math.abs(v - 0.6) < 1e-9);
  // Upward movement is negative.
  assert.ok(releaseVelocity([{ t: 0, y: 100 }, { t: 50, y: 0 }], 50) < 0);
});

test('dismiss on distance ratio or on a real flick', () => {
  assert.equal(shouldDismiss({ offset: 400 * SWIPE_DISMISS_RATIO, height: 400, velocity: 0 }), true);
  assert.equal(shouldDismiss({ offset: 99, height: 400, velocity: 0 }), false);
  assert.equal(shouldDismiss({ offset: FLICK_MIN_DISTANCE, height: 800, velocity: SWIPE_DISMISS_VELOCITY }), true);
  assert.equal(shouldDismiss({ offset: FLICK_MIN_DISTANCE - 1, height: 800, velocity: 5 }), false);
  assert.equal(shouldDismiss({ offset: 50, height: 0, velocity: 0 }), false);
});

test('scroll and sideways movement win over the sheet', () => {
  assert.equal(classifyGestureStart({ dx: 3, dy: 5, scrolled: false }), 'pending');
  assert.equal(classifyGestureStart({ dx: 0, dy: 20, scrolled: false }), 'drag');
  assert.equal(classifyGestureStart({ dx: 0, dy: -20, scrolled: false }), 'release');
  assert.equal(classifyGestureStart({ dx: 30, dy: 20, scrolled: false }), 'release');
  assert.equal(classifyGestureStart({ dx: 0, dy: 20, scrolled: true }), 'release');
});

test('samples keep the window plus one anchor', () => {
  const samples = [0, 100, 200, 300, 400].map((t) => ({ t, y: t }));
  trimSamples(samples, 400);
  assert.equal(FLICK_WINDOW_MS, 100);
  assert.deepEqual(samples.map((s) => s.t), [300, 400]);
});
