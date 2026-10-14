// Playwright globalSetup for AXE_BASELINE_UPDATE=1: collects the
// per-test fragments written by smoke.spec.mjs into axe-baseline.json. Review
// the diff: the baseline is meant to shrink, never to grow.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { AXE_FRAGMENTS } from './axe-support.mjs';

const target = new URL('axe-baseline.json', import.meta.url);
const updating = () => process.env.AXE_BASELINE_UPDATE === '1';

export default function setup() {
  if (!updating()) return undefined;
  rmSync(AXE_FRAGMENTS, { recursive: true, force: true });
  mkdirSync(AXE_FRAGMENTS, { recursive: true });
  return teardown;
}

function teardown() {
  const current = JSON.parse(readFileSync(target, 'utf8'));
  const violations = {};
  for (const name of readdirSync(AXE_FRAGMENTS).sort()) {
    const { key, found } = JSON.parse(readFileSync(new URL(name, AXE_FRAGMENTS), 'utf8'));
    if (!Object.keys(found).length) continue;
    const [project, route] = key.split(' ');
    ((violations[project] ??= {})[route] = Object.fromEntries(Object.entries(found).sort()));
  }
  const sorted = Object.fromEntries(Object.keys(violations).sort().map((p) => [p, Object.fromEntries(Object.keys(violations[p]).sort().map((r) => [r, violations[p][r]]))]));
  writeFileSync(target, `${JSON.stringify({ ...current, violations: sorted }, null, 2)}\n`);
  console.log(`axe-baseline.json rewritten from ${readdirSync(AXE_FRAGMENTS).length} route results.`);
}
