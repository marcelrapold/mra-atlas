// First paint: brand, mode and rail are decided before the browser paints.
// No imports on purpose. The resolver runs in three places from one source:
// the inline boot script (serialised below), the shell on mount and node --test.
export type Appearance = 'light' | 'dark' | 'system';
export type BootBrand = {id: string; dark: boolean};
export type BootState = {brand: string; mode: 'light' | 'dark'; appearance: Appearance; collapsed: boolean};
export const preferencesKey = 'framework-preferences';
export const defaultBrand = 'neutral';
// Documentation-only additions on top of toCssVariables; the brand fonts are loaded by this app, not Core.
export const docsOverrides: Record<string, Record<string, string>> = {rapold: {'--font-mono': '"Geist Mono", ui-monospace, monospace'}};

// Query beats storage beats system. Dark falls back to light for light-only brands.
// Plain ES5 without closures or helpers: Function#toString() must stay self-contained.
export function resolveTheme(brands: readonly BootBrand[], query: string | null | undefined, stored: unknown, systemDark: boolean): BootState {
  var prefs: {[key: string]: unknown} = stored !== null && typeof stored === 'object' && !Array.isArray(stored) ? stored as {[key: string]: unknown} : {};
  var brand: BootBrand | null = null;
  var wanted = [query, prefs.brand, 'neutral'];
  for (var w = 0; w < wanted.length && !brand; w++) for (var i = 0; i < brands.length; i++) if (brands[i].id === wanted[w]) {brand = brands[i]; break;}
  if (!brand) brand = brands[0];
  var appearance: Appearance = prefs.mode === 'light' || prefs.mode === 'dark' || prefs.mode === 'system' ? prefs.mode : 'system';
  var dark = appearance === 'dark' || (appearance === 'system' && systemDark === true);
  return {brand: brand.id, mode: dark && brand.dark ? 'dark' : 'light', appearance: appearance, collapsed: prefs.collapsed === true};
}

// Applies a resolved state to <html>; shared by the boot script and the shell's sync effect.
export function applyTheme(root: HTMLElement, state: Pick<BootState, 'brand' | 'mode' | 'collapsed'>) {
  root.dataset.brand = state.brand;
  root.dataset.mode = state.mode;
  if (state.collapsed) root.dataset.rail = ''; else delete root.dataset.rail;
  root.style.colorScheme = state.mode;
}

// Serialised at build time: brand ids and modes are baked in, nothing is fetched.
// Storage, query and matchMedia are read independently so one failure keeps the others.
export function themeBootScript(brands: readonly BootBrand[]) {
  const list = JSON.stringify(brands.map(b => ({id: b.id, dark: b.dark}))).replace(/</g, '\\u003c');
  return `(function(resolve,apply,brands){try{var s=null,q=null,d=false;`
    + `try{s=JSON.parse(localStorage.getItem(${JSON.stringify(preferencesKey)})||'null')}catch(e){}`
    + `try{q=new URLSearchParams(location.search).get('brand')}catch(e){}`
    + `try{d=matchMedia('(prefers-color-scheme: dark)').matches}catch(e){}`
    + `apply(document.documentElement,resolve(brands,q,s,d))}catch(e){}})(${resolveTheme.toString()},${applyTheme.toString()},${list})`;
}
