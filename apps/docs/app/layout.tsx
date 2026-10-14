import type { Metadata, Viewport } from 'next';
import {brands, neutral, toCssVariables} from '@rapold/framework-brands';
import './globals.css';
import FrameworkShell from './_components/framework-shell';
import {defaultBrand, docsOverrides, themeBootScript} from './_components/theme-boot';
const title='Atlas';
const description='Atlas, das Designsystem von Rapold: ein Designstandard mit austauschbaren Brands für Interfaces und Management-Präsentationen.';
export const metadata: Metadata = {
  metadataBase: new URL('https://atlas.rapold.io'),
  title,
  description,
  alternates: {canonical: '/'},
  openGraph: {type: 'website', siteName: title, locale: 'de_CH', title, description, url: '/', images: [{url: '/og.png', width: 1200, height: 630, alt: title}]},
  twitter: {card: 'summary_large_image', title, description, images: ['/og.png']},
};
// Browser chrome follows the toolbar surface of the default brand; no new colours.
export const viewport: Viewport = {themeColor: (['light', 'dark'] as const).map(mode => ({media: `(prefers-color-scheme: ${mode})`, color: String(toCssVariables(neutral, mode)['--card'])}))};

// Build time: every brand x mode as custom properties on <html>, keyed by the attributes the boot script sets.
// Values shared by all scopes go to :root once, brand-wide values to [data-brand]; the rest per mode.
// Properties live on <html> so ::view-transition-* and the canvas background resolve them as well.
type Scope = {brand: string; mode: 'light' | 'dark'; vars: Record<string, string>};
const scopes: Scope[] = brands.flatMap(brand => (brand.modes.dark ? ['light', 'dark'] as const : ['light'] as const).map(mode => ({brand: brand.id, mode,
  vars: Object.fromEntries(Object.entries({...toCssVariables(brand, mode), ...docsOverrides[brand.id]}).map(([k, v]) => [k, String(v)]))})));
const shared = (list: Scope[]) => Object.fromEntries(Object.entries(list[0].vars).filter(([k, v]) => list.every(s => s.vars[k] === v)));
const declare = (vars: Record<string, string>) => Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';');
const without = (vars: Record<string, string>, known: Record<string, string>) => Object.fromEntries(Object.entries(vars).filter(([k, v]) => known[k] !== v));
const global = shared(scopes);
const themeStyle = [`:root{${declare(global)}}`, ...brands.flatMap(brand => {
  const own = scopes.filter(s => s.brand === brand.id), common = without(shared(own), global);
  return [`:root[data-brand="${brand.id}"]{${declare(common)}}`, ...own.map(s =>
    `:root[data-brand="${s.brand}"][data-mode="${s.mode}"]{${declare(without(s.vars, {...global, ...common}))};color-scheme:${s.mode};background-color:${s.vars['--background']}}`)];
}), ':root[data-mode="dark"] body>.framework-scope{color-scheme:dark}'].join('\n').replace(/</g, '\\3c ');
const bootScript = themeBootScript(brands.map(brand => ({id: brand.id, dark: Boolean(brand.modes.dark)})));

export default function RootLayout({children}: {children: React.ReactNode}) {
  // The boot script rewrites these attributes before the first paint; React must accept the DOM.
  return <html lang="de-CH" data-brand={defaultBrand} data-mode="light" suppressHydrationWarning>
    <head>
      <meta name="color-scheme" content="light dark"/>
      <script id="theme-boot" dangerouslySetInnerHTML={{__html: bootScript}}/>
      <style id="theme-tokens" dangerouslySetInnerHTML={{__html: themeStyle}}/>
    </head>
    <body><FrameworkShell>{children}</FrameworkShell></body>
  </html>;
}
