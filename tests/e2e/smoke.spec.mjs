// Route smoke over the static export: every page renders its main landmark,
// logs no console or page errors and has no serious/critical axe violations
// beyond tests/e2e/axe-baseline.json. The baseline only shrinks: an entry that
// no longer occurs fails too, so fixed issues cannot silently come back.
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { AXE_FRAGMENTS, AXE_TAGS, BLOCKING_IMPACTS, routeKey } from './axe-support.mjs';

const out = new URL('../../apps/docs/out/', import.meta.url);
const routes = readdirSync(out)
  .filter((name) => name.endsWith('.html') && !['404.html', '_not-found.html'].includes(name))
  .map((name) => (name === 'index.html' ? '/' : `/${name.slice(0, -'.html'.length)}`))
  .sort();
const baseline = JSON.parse(readFileSync(new URL('axe-baseline.json', import.meta.url), 'utf8'));
const updating = process.env.AXE_BASELINE_UPDATE === '1';

/**
 * Excluded from axe, each with a reason. Nothing else is skipped.
 * - iframe[sandbox]: illustrative mail preview rendered via srcdoc with an empty
 *   sandbox; axe cannot inject into it and its content is sample output in the
 *   brand palette, not part of the reference UI.
 * - canvas[aria-hidden="true"]: decorative animated backdrops (RadioX matrix,
 *   Rapold worlds); hidden from assistive technology and without content.
 */
const AXE_EXCLUDE = ['iframe[sandbox]', 'canvas[aria-hidden="true"]'];

test('routes are discovered from the export', () => {
  expect(routes.length, 'Run `npm run build` first').toBeGreaterThan(10);
  expect(routes).toContain('/');
});

for (const route of routes) {
  test(`${route} renders without errors and without new axe violations`, async ({ page }, testInfo) => {
    const scheme = testInfo.project.use.colorScheme ?? 'light';
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      // Chromium reports its own probe of the script-less, sandboxed mail preview; not a page error.
      if (msg.location().url === 'about:srcdoc' && msg.text().startsWith('Blocked script execution')) return;
      errors.push(`console: ${msg.text()} @ ${msg.location().url}`);
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

    const response = await page.goto(route, { waitUntil: 'load' });
    expect(response?.status(), `${route} HTTP status`).toBe(200);
    await expect(page.locator('#main')).toBeVisible();
    // Hydrated and in the requested scheme before anything is measured.
    await expect(page.locator('[data-brand][data-mode]').first()).toHaveAttribute('data-mode', scheme);
    // Settled before axe: fonts loaded, then reduced motion so late state changes
    // (e.g. a button enabled after an async render) snap instead of fading, and
    // every finite animation finished. axe never samples a half-faded colour.
    // No networkidle: some pages keep media streaming.
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(async () => {
      const finite = document.getAnimations().filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime ?? Infinity));
      await Promise.allSettled(finite.map((a) => a.finished));
      await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
    });

    // Page errors are judged before axe runs; axe's own script injection is tooling.
    const pageErrors = [...errors];

    // One exclude() per selector: an array would be read as a frame path.
    const axe = new AxeBuilder({ page }).withTags(AXE_TAGS);
    for (const selector of AXE_EXCLUDE) axe.exclude(selector);
    const results = await axe.analyze();
    const found = {};
    for (const v of results.violations) if (BLOCKING_IMPACTS.has(v.impact)) found[v.id] = v.nodes.length;
    const key = routeKey(testInfo.project.name, route);

    if (updating) {
      mkdirSync(AXE_FRAGMENTS, { recursive: true });
      writeFileSync(new URL(`${key.replace(/[^a-z0-9-]+/gi, '_')}.json`, AXE_FRAGMENTS), JSON.stringify({ key, found }));
    } else {
      const allowed = baseline.violations?.[testInfo.project.name]?.[route] ?? {};
      const details = results.violations
        .filter((v) => BLOCKING_IMPACTS.has(v.impact) && !(v.id in allowed && v.nodes.length <= allowed[v.id]))
        .map((v) => `${v.id} (${v.impact}, ${v.nodes.length}×): ${v.help}\n    ${v.nodes.slice(0, 5).map((n) => n.target.join(' ')).join('\n    ')}`);
      expect(details, `New axe violations on ${route}`).toEqual([]);
      const stale = Object.entries(allowed)
        .filter(([id, count]) => (found[id] ?? 0) < count)
        .map(([id, count]) => `${id}: baseline ${count}, now ${found[id] ?? 0}`);
      expect(stale, `axe-baseline.json is stale for ${key}: lower or remove these entries`).toEqual([]);
    }

    expect(pageErrors, `Console or page errors on ${route}`).toEqual([]);
  });
}
