// Shared constants for the axe smoke and the baseline writer.
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag22aa'];
export const BLOCKING_IMPACTS = new Set(['serious', 'critical']);
export const AXE_FRAGMENTS = new URL('../../node_modules/.cache/playwright/axe-baseline/', import.meta.url);
export const routeKey = (project, route) => `${project} ${route}`;
