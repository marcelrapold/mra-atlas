# @rapold/brand-rapold

Rapold-Brand für Atlas als npm-Paket: Tokens, Geist-Fonts, Produkt-Signets und Icons. Der Core (`@rapold/framework-core`) bleibt markenfrei; alles Markengebundene kommt aus diesem Paket.

Das Paket ist `private` und wird nicht in eine Registry veröffentlicht. Bezug als Tarball aus `npm run pack:packages` (Entscheid: [`docs/adr/0001-npm-bezug.md`](../../docs/adr/0001-npm-bezug.md), Anleitung: [`docs/produkte-einbinden.md`](../../docs/produkte-einbinden.md)).

## Exporte

| Import | Inhalt |
|---|---|
| `@rapold/brand-rapold` | Typisierter Katalog: `productIds`, `products`, `getProduct()`, `signetPath()`, `colorRoles`, `cssVariables` (mit `.d.ts`) |
| `@rapold/brand-rapold/tokens.css` | Ein Stylesheet für hell und dunkel (`light-dark()`, Scope `[data-brand="rapold"]`) |
| `@rapold/brand-rapold/tokens.light.css`, `tokens.dark.css` | Bisherige Einzelmodi mit `data-mode` |
| `@rapold/brand-rapold/fonts.css`, `fonts/*` | Geist und Geist Mono (woff2) mit `OFL.txt`, `LICENSE.txt`, `AUTHORS.txt` |
| `@rapold/brand-rapold/signets/<produkt>-<variante>.svg` | Varianten `dark`, `light`, `mono-white`, `mono-black`, `current-color` |
| `@rapold/brand-rapold/icons/<produkt>/…` | `favicon.svg`, `favicon.ico`, `favicon-*.png`, `apple-touch-icon.png`, `android-chrome-*.png`, `maskable-icon-*.png`, `manifest.webmanifest` |
| `@rapold/brand-rapold/edgeportal/boot/*` | Reserviert für das Boot-Kit von EdgePortal; nur enthalten, wenn `brands/rapold/edgeportal/boot/` beim Packen existiert |

## Herkunft

`dist/` ist generiert und nicht eingecheckt. `scripts/build-brand-package.mjs` erzeugt es aus den kanonischen Quellen: `packages/brands/src/rapold.json` (Tokens über dieselben Generatoren wie die Website), `brands/rapold/identity.json` und `brands/rapold/assets/` (Signets, Fonts), Favicon-Satz über `scripts/build-brand-assets.mjs`. Nichts in `dist/` von Hand ändern.

Lizenz: «Alle Rechte vorbehalten», siehe `LICENSE`. Geist und Geist Mono stehen unter der SIL Open Font License 1.1 (`dist/fonts/OFL.txt`).
