# Atlas in Produkten einbinden

Kurzanleitung für Rapold-Produkte (Lotse, Cockpit, Auditor, Rapold Auth, PocketForge, Atlas, AI Fabric, ÆON Learn, Argus, EdgePortal, Agents). Alle Pfade liegen unter **https://atlas.rapold.io**. Für den Produktivbetrieb Dateien **ins Produkt-Repository kopieren** (oder beim Build herunterladen) und selbst ausliefern; Atlas ist die Quelle, kein CDN mit Verfügbarkeitszusage.

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

## Checkliste

- [ ] `exports/<produkt>/` ins Web-Root übernommen, Favicon/Manifest verlinkt
- [ ] `tokens.css` eingebunden und `data-brand="rapold"` gesetzt (`data-mode` nur zum Erzwingen eines Schemas)
- [ ] Geist-Ordner inkl. Lizenzdateien kopiert, `fonts.css` eingebunden
- [ ] OIDC-Client auf auth.rapold.io angelegt, Issuer und Scopes wie oben
- [ ] Bei Atlas-Updates Dateien neu übernehmen (Version siehe [`/build-info.json`](https://atlas.rapold.io/build-info.json))
