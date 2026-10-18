# EdgePortal Boot-Kit

**Status: Boot-Kit in Atlas, ändert nichts an den Pis.** Dieser Ordner ist die deterministische, reproduzierbare Quelle der EdgePortal-Bootsequenz (Fassung 5, von Marcel Rapold freigegeben). Er ändert weder ein Gerät noch das Repository `mra-edgeportal`. Ob und wann Teile davon auf die Pis kommen, entscheidet Marcel; die Wege dafür stehen unten unter «Entscheide».

| Datei | Inhalt |
|---|---|
| `timeline.json` | Kanonische Werte: Zeitachse des Systemstarts (Phasen in ms, Easings, was gezeichnet wird), Signale und Signal-Gates pro Stufe, die drei Szenarien mit Wortlaut in fünf Hacker Levels, Diagnosehinweis für «Netz fehlt», statischer Endzustand, Plymouth-Vorgaben und die gespiegelten Korona-Grenzen aus `dna.json`. |
| `boot.html` | Eigenständige Offline-Seite (kein CDN, kein Netz), die die Sequenz aus einer eingebetteten Kopie von `timeline.json` abspielt. Optik und Rechenweg sind aus Fassung 5 übernommen. |
| `../../../../scripts/render-boot-frames.mjs` | Rendert PNG-Bilder mit Playwright aus `boot.html?t=<ms>`, auch die Plymouth-Sprites. |
| `../../../../tests/edgeportal-boot.test.mjs` | Schneller Test ohne Browser: Phasen, Szenarien, Korona-Grenzen, Signal-Gates, Gleichheit der eingebetteten Zeitachse. |

## Quellen

- **Prototyp Fassung 5** der EdgePortal-Bootsequenz (18.10.2026) mit der Zeitachse «FirstEngine», den Szenarien «Normaler Start», «Erststart mit Claim» und «Netz fehlt» und den Hacker Levels Calm, Shell, Syslog, Uplink und Ghost. Der Prototyp liegt nicht im Repository; `boot.html` übernimmt seine Bühne, Stile und Rechnung unverändert, nur die Steuerung ist neu.
- **Regeln:** `brands/rapold-io/DESIGN-DNA.md` 7.1 (Korona und Ridgeline im Systemstart, bewusste Abweichung A1), 4.3 (Rezepte), §9 (Do und Don't), §10 (Entscheide); Werte in `brands/rapold-io/dna.json` (`glow.corona`, `motion.systemStart`, `deviations`). Die Dachmarke «Der First» ist noch ein Vorschlag; die Abweichung A1 gilt erst mit ihrer Freigabe.
- **Zeichen:** EdgePortal-Signet aus `brands/rapold/assets/logos/edgeportal.svg` (der Test prüft die Geometrie), Dachmarke «Der First» und Lockup rapold.io aus `brands/rapold/assets/umbrella/`, Schrift Geist und Geist Mono aus `brands/rapold/assets/fonts/` (OFL).

**Annahmen:** Namen, Codes, Zeitstempel, Raumnamen und der QR-Code sind Beispiele aus Fassung 5. `127.0.0.1:8091` ist die lokale Bootstrap-Seite auf dem Gerät selbst, kein Netzwerkhost. Die Beat-Zeiten der Szenarien (1200 ms pro Signal) simulieren Signale; auf einem Gerät bestimmen die echten Signale den Takt.

## Ablauf

1. **Gate:** Die Zeitachse startet, wenn der TV per CEC «on» meldet (Signal `cec-on`, Fallback 6 s). Vorher hält das Ruhebild.
2. **Systemstart (0 bis 6740 ms):** Das flache R blendet ein, faltet sich (1200–2100), der First zündet (1760), ein Funke läuft genau eine Runde (2040–4440) und kehrt heim, die Lichter gehen aus (4940), der Grat kippt als Ridgeline auf die Fugenachse und kühlt zu Ice (5640–6740).
3. **EdgePortal, Signal für Signal:** Ab dem Kiosk-Punkt (6740 ms) erscheint jede Stufe erst, wenn ihr Signal wirklich bereit ist, in fester Reihenfolge und mit mindestens 400 ms Haltezeit: `kiosk`, `bootstrap`, `network`, `portal`, `pairing` (`paired` oder `claim`), `handoff`. Azure- und Ice-Fläche gleiten entlang der Fuge des Signets heran; der Azure-Schein kommt erst, wenn das Portal antwortet.
4. **Netz fehlt:** Das Signet bleibt als graue Silhouette stehen, die Fuge bricht, das Log zeigt den Fehlversuch und danach den Diagnosehinweis auf `edgeportal-setup.log` auf der SD-Karte. Kommt das Netz zurück, läuft die Sequenz ab der Uplink-Stufe weiter.

Ein Kopf, eine Runde, nie in Schleife: Der Test prüft die Grenzen aus `dna.json` (`glow.corona`). Unter 400 px gerenderter Zeichenhöhe (zum Beispiel auf 720p) zeigt `boot.html` weder Firstlicht noch Korona, und die Ridgeline startet in Ice (DNA 7.1, «Grösse»).

## Vorschau

`boot.html` wird beim Build **nicht** nach `apps/docs/public` veröffentlicht: Unter `brands/rapold/` veröffentlichen nur `scripts/build-brand-assets.mjs` und `scripts/build-product-worlds.mjs` ausgewählte, generierte Dateien. Lokal reicht ein Browser:

```bash
open brands/rapold/edgeportal/boot/boot.html                 # direkt als Datei, Fonts relativ
python3 -m http.server 8000 --directory brands/rapold          # oder ein statischer Server ab brands/rapold
# dann http://localhost:8000/edgeportal/boot/boot.html?scenario=netz-fehlt&level=4
```

| Parameter | Wirkung |
|---|---|
| `scenario=normaler-start \| erststart-claim \| netz-fehlt` | Szenario (Aliase aus Fassung 5: `normal`, `pair`, `offline`). Standard `normaler-start`. |
| `level=1..5` | Hacker Level: 1 Calm, 2 Shell (Standard), 3 Syslog, 4 Uplink, 5 Ghost. Ändert nur den Ton, nie Licht und Flächen. |
| `t=<ms>` | Deterministisches Standbild bei `t` ms ab CEC «on». |
| `still=end` | Statischer Endzustand des Szenarios ohne Bewegung (Normaler Start ohne Handoff). |
| `rm=1` | Reduzierte Bewegung erzwingen: gefaltetes Zeichen mit ruhendem Firstlicht, keine Korona, keine Ridgeline, danach Schnitt. Folgt sonst `prefers-reduced-motion`. |
| `light=auto \| on \| off` | Firstlicht und Korona nach Zeichenhöhe (Standard), erzwingen oder abschalten. |
| `gate=cec` | Ruhebild halten, bis `signal('cec-on')` kommt (Fallback 6 s). |
| `mode=live` | Keine simulierten Signale; nur die API treibt die Stufen. |
| `recover=<ms>` | Bei `netz-fehlt`: das Netz kommt zu diesem Zeitpunkt zurück. |
| `safe=1` | Overscan-Rand 5 % einblenden. |

API im Browser:

```js
edgeportalBoot.signal('cec-on')            // Zeitachse starten (bei gate=cec)
edgeportalBoot.signal('portal')            // Signal ist bereit
edgeportalBoot.signal('pairing', 'claim')  // Werte laut timeline.json: network ok|fail, pairing paired|claim
edgeportalBoot.recover()                   // «Netz kommt zurück»
edgeportalBoot.seek(3100)                  // Standbild
edgeportalBoot.still()                     // statischer Endzustand
edgeportalBoot.state()                     // Szenario, Level, geplante Stufen, empfangene Signale
```

## Bilder rendern (Plymouth-Sprites)

Jedes Bild ist ein eigener Seitenaufruf mit `?t=<ms>`, deshalb sind die Bilder unabhängig von der Uhr und reproduzierbar. Das Layout rechnet immer mit 1920 CSS-Pixeln Breite; die Auflösung kommt über den Device Scale Factor. 720p, 1080p und 4K sehen dadurch gleich aus, nur schärfer oder gröber. Die Ausgabe landet standardmässig im temporären Verzeichnis des Systems, nie im Repository; gerenderte Bilder werden nicht eingecheckt.

```bash
# Plymouth-Sprites: 30 fps von 0 bis 6740 ms (Ruhebild = Kiosk-Punkt), je Auflösung
node scripts/render-boot-frames.mjs --resolution 720p
node scripts/render-boot-frames.mjs --resolution 1080p
node scripts/render-boot-frames.mjs --resolution 4k --out /pfad/ausserhalb/des/repos

# Einzelbilder und Endzustände
node scripts/render-boot-frames.mjs --scenario netz-fehlt --times 12000
node scripts/render-boot-frames.mjs --scenario erststart-claim --still end --level 4
node scripts/render-boot-frames.mjs --rm --times 0           # statisches Plymouth-Bild (edgeportal/first = static)

# Nach einer Änderung an timeline.json die Kopie in boot.html nachziehen
node scripts/render-boot-frames.mjs --sync-timeline
```

Offen für die Sprites: DNA 7.1 verlangt Bewegungsunschärfe, intern 16 Bit und statisches Dither. Das Skript liefert scharfe 8-Bit-PNG; Unschärfe (mehrere Unterbilder pro Frame mitteln) und Dither sind ein eigener Schritt vor der Übergabe an Plymouth.

## Gerät: Gate, Notschalter, Ton

- **CEC-Gate:** Die Zeitachse startet erst, wenn der TV per CEC «on» meldet; bis dahin hält das Ruhebild. Fallback 6 s.
- **Plymouth** liegt ausserhalb des initramfs (Script-Plugin mit Sprite-Ebenen; laut Fassung 5 bei 1080p etwa 2,1 MB auf der Karte und 23 MB RAM). Das Ruhebild bei 6740 ms ist pixelgleich mit dem ersten Bild des Kiosks; `plymouth quit --retain-splash` hält es bis Chromium übernimmt.
- **Zwei Notschalter:** `plymouth.enable=0` auf der Kernel-Kommandozeile schaltet Plymouth ab. Die Datei `edgeportal/first` auf der Bootpartition wählt `0` (kein First), `static` (Endbild ohne Animation) oder `1` (Animation).
- **Pi 3** startet vorerst mit `static`.
- **Ton** ist standardmässig aus und schweigt in der Ruhezeit. `boot.html` spielt keinen Ton.
- **Nacht und Ruhezeit** (kein CEC-Wecken, R mit halber Helligkeit, rund 2,5 s) sind in `timeline.json` beschrieben, aber in `boot.html` noch nicht umgesetzt.

## GPU-Hinweis

Die Stylesheets des EdgePortal-TVs (`../tv/`) verzichten aus GPU-Gründen auf Blur. Die Korona-Rezepte der DNA (4.3) verlangen dagegen weichgezeichnetes Licht, und `boot.html` übernimmt den Rechenweg aus Fassung 5 unverändert: SVG-`feGaussianBlur` auf Grundschein, Funke, Firstlicht und Ridgeline, dazu `mix-blend-mode: screen`. Auf dem Pi ist das unkritisch, solange Plymouth fertige Sprites zeigt; die Blur-Kosten fallen dann nur beim Rendern auf dem Rechner an. Auf dem Gerät zeigt Plymouth die Korona als Sprites; im Kiosk-Browser wäre nur der Teil ab dem Kiosk-Punkt nötig, und der animiert nur Deckkraft und Position. `boot.html` spielt zur Vorschau die ganze Sequenz ab 0 ms. Ein Pi 3 bleibt ohnehin bei `static`. Vor einem Einsatz von `boot.html` als Live-Startseite auf einem Pi 4 oder 5 muss die Bildrate auf dem Gerät gemessen werden.

## Entscheide

- **Branding stufenweise:** Startseite und Hintergrund kommen per OTA; Plymouth mit dem First und der ruhige Kernel kommen mit dem nächsten Image, mit den Notschaltern auf der Bootpartition.
- **Ton:** standardmässig aus.
- **Testgerät:** wählt Marcel.
- **Hacker Level:** Fassung 5 startet mit Level 2 (Shell); die endgültige Wahl trifft Marcel im Setup.
- **Szenario-Name:** Fassung 5 nennt das zweite Szenario «Erststart mit Claim» (englische Nomenklatur: Claim statt Übernahme).

## Abweichung von Fassung 5

- **Reduzierte Bewegung:** Fassung 5 zeigte im statischen Bild auch den Grundschein und den Apex-Halo. DNA 7.1 verlangt bei reduzierter Bewegung «keine Korona»; `boot.html` zeigt deshalb nur das gefaltete Zeichen mit ruhendem Firstlicht. Das betrifft auch das statische Plymouth-Bild (`edgeportal/first = static`, Pi 3).
- **Unter 400 px Zeichenhöhe** ohne Firstlicht und Korona, Ridgeline in Ice (DNA 7.1, «Grösse»); Fassung 5 hatte dafür nur einen Hinweis.

## Grenzen

- Die Seite ist eine Vorschau- und Renderquelle, kein ausgerollter Kiosk. Sie liest keine Gerätesignale; diese kommen über `edgeportalBoot.signal()` von aussen.
- Zwischenbilder der Stufenübergänge nach dem Kiosk-Punkt entstehen aus pausierten CSS-Übergängen (Web Animations API); sie sind in Chromium deterministisch, in anderen Browsern ist das nicht geprüft.
- Atlas-Website: nicht veröffentlicht (siehe Vorschau). Für eine Veröffentlichung unter `/brands/rapold/edgeportal/boot/` bräuchte der Build einen Kopierschritt; die CSP der Website (`script-src 'self' 'unsafe-inline'`) liesse die eingebetteten Skripte zu.
