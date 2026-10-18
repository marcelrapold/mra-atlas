# ADR 0001: Bezug der Atlas-Pakete über npm

- Status: vorgeschlagen
- Datum: 18.10.2026
- Betrifft: `@rapold/framework-core`, `@rapold/brand-rapold` (neu); `@rapold/framework-brands` und `@rapold/framework-presentation` bleiben vorerst intern

## Kontext

Kein Produkt bezieht Atlas heute sauber. Fabric hat `@rapold/framework-core` 0.2.0 als Tarball eingecheckt, weil das Paket privat ist, in keiner Registry liegt und npm keine Workspace-Unterordner aus Git installiert. EdgePortal hat Tokens, Fonts und Signets von Hand kopiert und driftet. Die Paketversionen sagten nichts über den Inhalt: Core stand seit Atlas 0.7 auf 0.2.0.

Mit dem npm-Durchstich gibt es zwei packbare Pakete: `@rapold/framework-core` 0.3.0 (TypeScript-Quelle und `styles.css`, markenfrei) und `@rapold/brand-rapold` 0.1.0 (Tokens, Geist, Signets, Icons, typisierter Katalog). `npm run pack:packages` erzeugt `dist/packages/rapold-framework-core-<version>.tgz` und `dist/packages/rapold-brand-rapold-<version>.tgz`. Beide Pakete bleiben `private`, damit nichts versehentlich veröffentlicht wird; `npm pack` funktioniert trotzdem.

Wichtig für die Wahl: Das Repository ist öffentlich, die Rechte schützt die Lizenz («Alle Rechte vorbehalten»), nicht die Sichtbarkeit. Die Raspberry Pis von EdgePortal installieren kein npm, betroffen sind nur CI und Build-Server der Produkte.

## Optionen

| Option | Auth in CI und auf dem Server | Versionierung und Integrität | Aufwand | Einschätzung |
|---|---|---|---|---|
| Tarball im Produkt eingecheckt (Fabric-Weg) | keine | manuell; Lockfile prüft die Prüfsumme | klein | Binärdateien im Produkt-Repo; Herkunft nur per Kommentar belegt |
| Tarball als Asset eines GitHub-Release | keine (öffentliches Repo) | fester Pin auf Tag und URL, Prüfsumme im Lockfile | klein | gleiche Tarballs, aber eine Quelle für alle Produkte |
| GitHub Packages (`npm.pkg.github.com`) | Token für jede Installation, auch bei öffentlichen Paketen | Semver, unveränderlich | mittel | ein Secret mehr pro Host und `.npmrc` in jedem Produkt |
| npmjs.com öffentlich unter `@rapold` | keine | Semver, unveränderlich, Provenance aus CI | mittel | am einfachsten für Produkte; Scope `@rapold` muss reserviert werden, Lizenz bleibt «Alle Rechte vorbehalten» |

## Entscheid

**Jetzt:** Tarball aus `npm run pack:packages`, im Produkt unter `vendor/` eingecheckt und per `file:vendor/<tarball>` eingebunden. Das ist der Fabric-Weg, jetzt aber mit reproduzierbarem Build, eigener Version pro Paket und einem Test, der Exporte, Lizenzen und Markenfreiheit des Core prüft. Kein Konto, kein Token, kein Release nötig; der Pilot EdgePortal kann sofort starten.

**Später:** npmjs.com öffentlich unter `@rapold`, veröffentlicht aus der Atlas-CI nach `npm run check`, mit Provenance. Dann entfällt `private`, die Produkte pinnen exakt, Renovate oder Dependabot öffnet die Update-PRs. Vorstufe, falls npmjs noch nicht eingerichtet ist: dieselben Tarballs als GitHub-Release-Asset, damit nicht jedes Produkt Binärdateien eincheckt.

GitHub Packages scheidet aus: Auch öffentliche Pakete verlangen dort für jede Installation ein Token, das wäre ein zusätzliches Secret auf jedem Build-Server ohne Gewinn gegenüber npmjs.

## Konsequenzen

- Jede inhaltliche Änderung an einem Paket erhöht dessen Version (neue Rolle oder neuer Export: Minor; sichtbar geänderter Wert: mindestens Minor mit Changelog; Umbenennung oder Entfernung: Major). Zwei verschiedene Tarballs mit derselben Version darf es nicht geben.
- Core 0.3.0 ersetzt den 0.2.0-Tarball von Fabric; Fabric kann bei Gelegenheit nachziehen.
- Core liefert weiterhin TypeScript-Quelle. Konsumenten brauchen einen Bundler, der Pakete transpiliert (Next.js `transpilePackages`), `moduleResolution: "bundler"` und für Tailwind v4 ein `@source` auf `node_modules/@rapold/framework-core/src`. Ein vorgebauter Core (z. B. mit `tsup`) ist ein eigener Schritt.
- Die Tarballs und `packages/brand-rapold/dist/` sind generiert und nicht eingecheckt (`.gitignore`).
- Für den Wechsel auf npmjs braucht es: Scope `@rapold` reservieren, `private` entfernen, `publishConfig.access: public`, Veröffentlichungsjob mit Provenance. Nichts davon ist mit diesem ADR umgesetzt.
