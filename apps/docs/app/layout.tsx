import type { Metadata, Viewport } from 'next';
import {createHash} from 'node:crypto';
import {brands, toCssVariables} from '@rapold/framework-brands';
import './globals.css';
import {site} from './_seo/seo';
import FrameworkShell from './_components/framework-shell';
import {defaultBrand, resolveTheme, themeBootScript, themeStylesheet} from './_components/theme-boot';
const title='Atlas';
const description=site.description;
export const metadata: Metadata = {
  metadataBase: new URL('https://atlas.rapold.io'),
  title,
  description,
  alternates: {canonical: '/'},
  openGraph: {type: 'website', siteName: title, locale: 'de_CH', title, description, url: '/', images: [{url: '/og.png', width: 1200, height: 630, alt: title}]},
  twitter: {card: 'summary_large_image', title, description, images: ['/og.png']},
};
// Browser chrome uses the tile colour of app/icon.svg, the same value as manifest theme_color.
export const viewport: Viewport = {colorScheme: 'light dark', themeColor: site.themeColor};

const bootBrands = brands.map(brand => ({id: brand.id, dark: Boolean(brand.modes.dark)}));
const bootScript = themeBootScript(bootBrands);
// Build-time guard: run the serialised script as the browser would. It swallows every error at runtime,
// so a broken serialisation of the compiled resolver would otherwise only show up as a wrong first paint.
{
  const root = {dataset: {} as Record<string, string>, style: {} as Record<string, string>}, stored = {brand: 'neutral', mode: 'dark', collapsed: true};
  new Function('document', 'location', 'localStorage', 'matchMedia', 'URLSearchParams', bootScript)(
    {documentElement: root}, {search: ''}, {getItem: () => JSON.stringify(stored)}, () => ({matches: false}), URLSearchParams);
  const expected = resolveTheme(bootBrands, null, stored, false);
  if (root.dataset.brand !== expected.brand || root.dataset.mode !== expected.mode || !('rail' in root.dataset) || root.style.colorScheme !== expected.mode)
    throw new Error(`Theme boot script does not resolve the theme: ${JSON.stringify(root)}`);
}
// Token CSS ships as a static stylesheet (app/theme.css); the content hash busts caches on change.
const themeVersion = createHash('sha256').update(themeStylesheet(brands, toCssVariables)).digest('hex').slice(0, 12);

export default function RootLayout({children}: {children: React.ReactNode}) {
  // The boot script rewrites these attributes before the first paint; React must accept the DOM.
  return <html lang="de-CH" data-brand={defaultBrand} data-mode="light" suppressHydrationWarning>
    <head>
      <script id="theme-boot" dangerouslySetInnerHTML={{__html: bootScript}}/>
      <link id="theme-tokens" rel="stylesheet" href={`/theme.css?v=${themeVersion}`}/>
    </head>
    <body><FrameworkShell>{children}</FrameworkShell></body>
  </html>;
}
