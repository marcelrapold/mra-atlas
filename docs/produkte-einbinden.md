# Atlas in Produkten einbinden

Kurzanleitung für Rapold-Produkte (Lotse, Cockpit, Auditor, Rapold Auth, PocketForge, Atlas, AI Fabric, ÆON Learn, Argus, EdgePortal). Alle Pfade liegen unter **https://atlas.rapold.io**. Für den Produktivbetrieb Dateien **ins Produkt-Repository kopieren** (oder beim Build herunterladen) und selbst ausliefern; Atlas ist die Quelle, kein CDN mit Verfügbarkeitszusage.

`<produkt>` steht für die ID aus [`identity.json`](https://atlas.rapold.io/brands/rapold/identity.json): `fabric`, `argus`, `learn`, `edgeportal`, `lotse`, `cockpit`, `auditor`, `auth`, `pocketforge`, `atlas`.

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

| Datei | Pfad |
|---|---|
| CSS hell / dunkel | `/brands/rapold/tokens.light.css`, `/brands/rapold/tokens.dark.css` |
| JSON / DTCG | `/brands/rapold/tokens.light.json`, `tokens.light.dtcg.json` (dunkel analog) |

In den Beispielen liegen Atlas-Dateien im Produkt unter `/atlas/`. Die Variablen greifen nur unter `[data-brand="rapold"][data-mode="light|dark"]`:

```html
<html lang="de-CH" data-brand="rapold" data-mode="dark">
<link rel="stylesheet" href="/atlas/tokens.light.css">
<link rel="stylesheet" href="/atlas/tokens.dark.css">
```

Hell/Dunkel über `data-mode` umschalten (z. B. aus `prefers-color-scheme`). Im Produkt nur Variablen verwenden (`var(--brand-color-azure)`, `var(--spacing-4)` …), keine Hex-Werte kopieren. Regeln: [`/brands/rapold/rules.md`](https://atlas.rapold.io/brands/rapold/rules.md), Agenten-Kurzfassung: [`/brands/rapold/llms.txt`](https://atlas.rapold.io/brands/rapold/llms.txt).

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
- [ ] `tokens.light.css` + `tokens.dark.css` eingebunden, `data-brand="rapold"` und `data-mode` gesetzt
- [ ] Geist-Ordner inkl. Lizenzdateien kopiert, `fonts.css` eingebunden
- [ ] OIDC-Client auf auth.rapold.io angelegt, Issuer und Scopes wie oben
- [ ] Bei Atlas-Updates Dateien neu übernehmen (Version siehe [`/build-info.json`](https://atlas.rapold.io/build-info.json))
