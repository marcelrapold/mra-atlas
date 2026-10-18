# Atlas in Produkten einbinden

Kurzanleitung für Rapold-Produkte (Lotse, Cockpit, Auditor, Rapold Auth, PocketForge, Atlas, Fabric, ÆON Learn, Argus, EdgePortal, Agents). Alle Pfade liegen unter **https://atlas.rapold.io**. Für den Produktivbetrieb Dateien **ins Produkt-Repository kopieren** (oder beim Build herunterladen) und selbst ausliefern; Atlas ist die Quelle, kein CDN mit Verfügbarkeitszusage. Neu lassen sich Tokens, Fonts, Signets, Icons und der Core auch als npm-Paket beziehen (Abschnitt 5).

`<produkt>` steht für die ID aus [`identity.json`](https://atlas.rapold.io/brands/rapold/identity.json): `fabric`, `argus`, `learn`, `edgeportal`, `lotse`, `cockpit`, `auditor`, `auth`, `pocketforge`, `atlas`, `agents`.

## 1. Signet, Favicon, Manifest

Komplettpaket pro Produkt (Signets, Icons, Banner, Manifest):
`/brands/rapold/exports/bundles/<produkt>-brand-assets.zip`

Einzeldateien unter `/brands/rapold/exports/<produkt>/`:

| Zweck | Pfad |
|---|---|
| Favicon (SVG, ICO, PNG 16–96) | `icons/favicon.svg`, `icons/favicon.ico`, `icons/favicon-32x32.png` … |
| Apple Touch Icon | `icons/apple-touch-icon.png` |
| PWA-Icons | `icons/android-chrome-192x192.png`, `-512x512.png`, `icons/maskable-icon-192x192.png`, `-512x512.png` |
| Web-Manifest | `manifest.webmanifest` (Icon-Pfade relativ: `./icons/…`) |
| Signet hell/dunkel/mono | `logos/<produkt>-light.svg`, `logos/<produkt>-dark.svg`, `logos/<produkt>-current-color.svg`, PNG in 256–2048 |
| Social/OG-Bild | `banners/<produkt>-og-light.png`, `banners/<produkt>-og-dark.png` |

Den Ordner `exports/<produkt>/` unverändert ins Web-Root (z. B. `public/`) legen, dann:

```html
<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/icons/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#050B19">
```

`theme-color` entspricht `theme_color` im jeweiligen `manifest.webmanifest`.

Signets nicht nachzeichnen, umfärben oder neu zusammensetzen. Massgeblich sind die Dateien und Prüfsummen im [`assets-manifest.json`](https://atlas.rapold.io/brands/rapold/assets-manifest.json).

## 2. Tokens

| Datei | Pfad | Zweck |
|---|---|---|
| **CSS (empfohlen)** | `/brands/rapold/tokens.css` | Ein Stylesheet für hell und dunkel |
| DTCG-Resolver | `/brands/rapold/tokens.resolver.json` | Einstieg für Token-Werkzeuge (DTCG 2025.10) |
| DTCG-Quellen | `tokens.foundation.dtcg.json`, `tokens.color.light.dtcg.json`, `tokens.color.dark.dtcg.json` | Vom Resolver referenziert, gleicher Ordner |
| Bisherige Dateien | `tokens.light.css`, `tokens.dark.css`, `tokens.light.json`, `tokens.light.dtcg.json` (dunkel analog) | Bleiben erhalten |

In den Beispielen liegen Atlas-Dateien im Produkt unter `/atlas/`. `tokens.css` greift unter `data-brand` allein und folgt dann dem Farbschema des Systems: Jede Farbrolle ist als `light-dark(hell, dunkel)` hinterlegt, Skalen, Schriften und Identitätsfarben gelten in beiden Modi. `data-mode` ist optional und erzwingt ein Schema, auf demselben Element oder auf einem Abschnitt darin:

```html
<html lang="de-CH" data-brand="rapold">
<link rel="stylesheet" href="/atlas/tokens.css">
<!-- optional: <html data-brand="rapold" data-mode="dark"> oder <section data-mode="light"> -->
```

Die Regeln haben die Spezifität 0 (`:where(…)`), produkteigene Overrides gewinnen deshalb ohne `!important`. `light-dark()` setzt einen aktuellen Browser voraus (seit 2024 in allen grossen Engines); wer ältere Browser unterstützen muss, bindet weiterhin `tokens.light.css` und `tokens.dark.css` mit `data-mode` ein.

Token-Werkzeuge (Style Dictionary, Terrazzo, Figma-Plugins) lesen `tokens.resolver.json` und wählen den Modus über den Modifier `mode` (`light`, `dark`; nur Modi, die die Brand liefert). Abgeleitete Rollen sind dort Aliase (`info` → `{color.primary}`, `chart-1` → `{color.primary}`), `surface-*` stehen aufgelöst mit der Mischregel unter `$extensions`. Die Farbrollen auf oberster Ebene in `tokens.{mode}.dtcg.json` sind als `$deprecated` markiert und entfallen mit 0.12.0; stattdessen `color.<rolle>` verwenden.

Im Produkt nur Variablen verwenden (`var(--brand-color-azure)`, `var(--spacing-4)` …), keine Hex-Werte kopieren. Regeln: [`/brands/rapold/rules.md`](https://atlas.rapold.io/brands/rapold/rules.md), Agenten-Kurzfassung: [`/brands/rapold/llms.txt`](https://atlas.rapold.io/brands/rapold/llms.txt).

## 3. Geist-Fonts

Unter `/brands/rapold/assets/fonts/`: `fonts.css`, `Geist-Variable.woff2`, `GeistMono-Variable.woff2` sowie `OFL.txt`, `LICENSE.txt`, `AUTHORS.txt`. Den ganzen Ordner kopieren (die Lizenzdateien gehören dazu) und `fonts.css` einbinden; die `url()` darin sind relativ.

```html
<link rel="preload" href="/atlas/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/atlas/fonts/fonts.css">
```

Next.js-Apps können alternativ das Paket `geist` (`geist/font/sans`, `geist/font/mono`) verwenden; Familienname bleibt `Geist` bzw. `Geist Mono`.

## 4. Login über auth.rapold.io

Rapold-Produkte melden sich zentral über **Rapold Auth** (Authelia, OpenID Connect) an.

| Feld | Wert |
|---|---|
| Issuer / Discovery | `https://auth.rapold.io` (`/.well-known/openid-configuration`) |
| Scopes | `openid profile email groups` |
| Client-ID, Redirect-URI | wie in der Client-Definition auf auth.rapold.io |
| Rollen | Claim `groups` (z. B. `admins`) |

Client anlegen (Secret erzeugen, Client-Definition, Deploy): Anleitung im Repository `marcelrapold/mra-auth`, [`docs/anleitungen/oidc-client-hinzufuegen.md`](https://github.com/marcelrapold/mra-auth/blob/main/docs/anleitungen/oidc-client-hinzufuegen.md). Client-Secrets nur in 1Password und in den Secrets der App, nie im Repository. Dienste ohne eigenes Login schützt stattdessen `forward_auth` im Reverse-Proxy.

Auf der Login-Seite des Produkts das eigene Signet (`logos/<produkt>-*.svg`) und die Tokens verwenden; das Zeichen von Rapold Auth (`exports/auth/`) gehört nur zu auth.rapold.io selbst.

## 5. Bezug über npm (Tarball)

Statt Dateien von Hand zu kopieren, bezieht ein Produkt Atlas als Paket. Entscheid und Ausblick (später npmjs.com unter `@rapold`) stehen in `docs/adr/0001-npm-bezug.md`. Beide Pakete sind `private` und liegen in keiner Registry; Atlas erzeugt die Tarballs:

```sh
npm run pack:packages
# dist/packages/rapold-brand-rapold-0.1.0.tgz     Tokens, Geist, Signets, Icons, typisierter Katalog
# dist/packages/rapold-framework-core-0.3.0.tgz   markenfreie Komponenten (TypeScript-Quelle) und styles.css
```

Im Produkt die Tarballs unter `vendor/` ablegen und exakt einbinden:

```sh
npm install ./vendor/rapold-brand-rapold-0.1.0.tgz ./vendor/rapold-framework-core-0.3.0.tgz
# package.json: "@rapold/brand-rapold": "file:vendor/rapold-brand-rapold-0.1.0.tgz"
```

| Import | Inhalt |
|---|---|
| `@rapold/brand-rapold/tokens.css` | Tokens hell und dunkel (`light-dark()`), greift unter `data-brand="rapold"` |
| `@rapold/brand-rapold/tokens.light.css`, `tokens.dark.css` | Einzelmodi für ältere Browser, mit `data-mode` |
| `@rapold/brand-rapold/fonts.css` | Geist und Geist Mono; woff2 und Lizenzdateien unter `@rapold/brand-rapold/fonts/` |
| `@rapold/brand-rapold/signets/<produkt>-<variante>.svg` | `dark`, `light`, `mono-white`, `mono-black`, `current-color` |
| `@rapold/brand-rapold/icons/<produkt>/…` | Favicon-Satz (SVG, ICO, PNG), Apple Touch, PWA-Icons, `manifest.webmanifest` |
| `@rapold/brand-rapold` | `productIds`, `getProduct()`, `signetPath()`, `colorRoles`, `cssVariables` mit Typen (`ProductId`, `ColorRole`) |
| `@rapold/framework-core`, `@rapold/framework-core/styles.css` | Komponenten und Stylesheet des Core |

```ts
// app/layout.tsx (Next.js)
import '@rapold/brand-rapold/fonts.css';
import '@rapold/brand-rapold/tokens.css';
import { getProduct } from '@rapold/brand-rapold';
const product = getProduct('edgeportal'); // Name, Domain, Paketpfade der Signets und Icons
```

Für den Core: `transpilePackages: ['@rapold/framework-core']` in `next.config`, `moduleResolution: "bundler"` und im Tailwind-Stylesheet `@source "../node_modules/@rapold/framework-core/src";` (Pfad relativ zum Stylesheet). Favicons und Manifest gehören ins Web-Root: per Kopierschritt vor dem Build aus `node_modules/@rapold/brand-rapold/dist/icons/<produkt>/` nach `public/`, nicht von Hand. Update: neue Tarballs aus Atlas übernehmen, Version steht nur in `package-lock.json`.

### EdgePortal-Controller migrieren (Pilot)

Gilt für den Controller unter edgeportal.rapold.io (Steuerung, Einrichtung, Login). **Der TV bleibt, wie er ist:** Bühne, Präsenz, Übersicht und TV an/aus behalten ihre Stylesheets und ihr Bild. Die Kopien unter `brands/rapold/edgeportal/tv/` sind Ist-Referenzen in Atlas und werden nicht durch Paket-Importe ersetzt; Änderungen am TV sind höchstens optionale Ideen mit pixelgleichem Nachweis.

1. **Pakete einbinden:** beide Tarballs unter `vendor/`, exakt gepinnt; `transpilePackages` und `@source` wie oben. Sichtbar ändert sich nichts.
2. **Fonts, Signet, Favicons aus dem Paket:** `fonts.css` statt `next/font` mit gehashtem Namen, Signet und Favicon-Satz per Kopierschritt aus `@rapold/brand-rapold`. Die Dateien sind heute byte-identisch; die Pipeline prüft das über die Prüfsummen.
3. **Tokens:** `tokens.css` einbinden, `<html data-brand="rapold">`, next-themes auf `data-mode` umstellen; ein Codemod ersetzt im Controller `hsl(var(--x))` durch `var(--x)` und `/ α` durch `color-mix(…)`. Danach fallen die Rollenblöcke des Controllers in `globals.css` weg; die TV-Stylesheets bleiben unberührt.
4. **Core-Komponenten:** Button, Input, Switch, Segmented (als ToggleGroup) und Dialog des Controllers durch den Core ersetzen, mit visueller Abnahme in hell und dunkel.
5. **Drift-Prüfungen in der CI:** Hex-Verbot ausserhalb einer produktlokalen Liste (die TV-Stylesheets stehen darauf), Prüfsummen der Assets gegen das Paket, Atlas-Version nur in `package-lock.json`, nicht in Kommentaren.
6. **Boot-Kit:** sobald `@rapold/brand-rapold/edgeportal/boot/*` im Paket liegt, nutzen Einrichtung und Startseite es. Die Pis bekommen die Dateien weiter per OTA, nicht über npm.

## Checkliste

- [ ] `exports/<produkt>/` ins Web-Root übernommen, Favicon/Manifest verlinkt
- [ ] `tokens.css` eingebunden und `data-brand="rapold"` gesetzt (`data-mode` nur zum Erzwingen eines Schemas)
- [ ] Geist-Ordner inkl. Lizenzdateien kopiert, `fonts.css` eingebunden
- [ ] OIDC-Client auf auth.rapold.io angelegt, Issuer und Scopes wie oben
- [ ] Bei Atlas-Updates Dateien neu übernehmen (Version siehe [`/build-info.json`](https://atlas.rapold.io/build-info.json)) oder, beim Bezug über npm, die neuen Tarballs exakt pinnen
