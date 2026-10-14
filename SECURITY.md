# Sicherheit

Atlas ist eine statisch ausgelieferte Referenz unter https://atlas.rapold.io. Die Website verarbeitet keine Konten, Zahlungen oder Formulardaten auf einem Server. Relevante Schwachstellen betreffen deshalb vor allem ausgelieferten Code, Abhängigkeiten, Verträge für Agenten und die HTTP-Konfiguration.

## Schwachstelle melden

Ein vertraulicher Meldekanal (private Schwachstellenmeldung von GitHub) wird eingerichtet. Bis er aktiv ist, Befunde bitte direkt an Marcel Rapold richten, nicht öffentlich.

Keine öffentlichen Issues, Pull Requests oder Diskussionen für Sicherheitsbefunde verwenden. Hilfreich sind betroffene URL oder Datei, Commit oder Version aus `/build-info.json`, Reproduktionsschritte und die erwartete Auswirkung. Meldungen auf Deutsch oder Englisch.

Sobald der Kanal aktiv ist, folgt ein maschinenlesbarer Kontakt unter https://atlas.rapold.io/.well-known/security.txt (RFC 9116).

## Ablauf

- Einschätzung, Korrektur und Veröffentlichung werden in der vertraulichen Meldung abgestimmt.
- Unterstützt wird nur der aktuelle Stand von `main`, der auf atlas.rapold.io ausgeliefert ist.

## Nicht im Umfang

- Automatisierte Scan-Ergebnisse ohne Reproduktion und nachvollziehbare Auswirkung.
- Last- und Denial-of-Service-Tests gegen die Produktionsumgebung.

## Grundlinie der Auslieferung

`vercel.json` setzt für alle Antworten Content-Security-Policy, HSTS mit `includeSubDomains`, `X-Frame-Options`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Referrer-Policy` und `X-Content-Type-Options`. `tests/security-headers.test.mjs` prüft die Konfiguration, `npm run verify:deployment` die ausgelieferten Header aller geprüften Seiten und die Cache-Regel des Vendor-Bundles auf der Produktionsdomain. `tests/security-headers.test.mjs` prüft eine veröffentlichte `security.txt` auf Kontakt und Ablaufdatum.
