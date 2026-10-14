import type {Brand} from '@rapold/framework-brands';
import {mermaidClassDefs} from '../../../../packages/brands/src/mermaid-theme.mjs';

export function mermaidExamples(brand: Brand) {
  return [
    {id:'fluss',title:'Flussdiagramm',description:'Quelle, Auslieferung und Anwendung erhalten gezielte Akzente. Übrige Knoten, Kanten und Gruppen bleiben neutral.',code:`flowchart LR
  accTitle: Vom Design-Vertrag zur Anwendung
  accDescr: Der Design-Vertrag speist das Framework-Paket, das die Anwendung verwendet. Der Showcase bezieht Referenz und Komponenten aus beiden.
  Source[Design-Vertrag] --> Package[Framework-Paket]
  Package --> App[Anwendung]
  Source -. Referenz .-> Showcase[Showcase]
  Package -. Komponenten .-> Showcase
  ${mermaidClassDefs(brand)}
  class Source source;
  class Package delivery;
  class App consumer;`},
    {id:'sequenz',title:'Sequenzdiagramm',description:'Akteure, Lebenslinien, Signale und Notizen haben eigene Farbrollen. So bleibt der Ablauf auch in dunkler Darstellung lesbar.',code:`sequenceDiagram
  accTitle: Beispiel einer Veröffentlichung
  accDescr: Ein Push startet die Prüfung. Nur ein erfolgreich geprüfter Build wird veröffentlicht.
  autonumber
  participant Dev as Entwicklung
  participant Git as GitHub
  participant CI as Prüfung
  participant Web as Website
  Dev->>Git: Push auf main
  Git->>CI: Tests und Build starten
  Note over Git,CI: Beispielablauf – kein Live-Status
  alt Prüfung erfolgreich
    CI-->>Git: Build freigegeben
    Git->>Web: Version veröffentlichen
    Web-->>Dev: Vorschau öffnen
  else Prüfung fehlgeschlagen
    CI-->>Dev: Fehlerbericht
  end`},
    {id:'zeitstrahl',title:'Zeitstrahl',description:'Abschnitte und Ereignisse verwenden die Brand-Palette. Jede Kategorie wird beschriftet; die Farbe unterstützt die Orientierung.',code:`timeline
  accTitle: Beispiel einer Projektplanung
  accDescr: Zwei Abschnitte, Grundlage und Umsetzung, mit je zwei Ereignissen vom Entwurf bis zur Abnahme.
  title Von der Grundlage zur Anwendung
  section Grundlage
    Entwurf : Brand-Vertrag : Tokens und Typografie
    Referenz : Komponenten : Dokumentation
  section Umsetzung
    Integration : Anwendung : Barrierefreiheit
    Abnahme : Tests und Build : Veröffentlichung`},
    {id:'torte',title:'Tortendiagramm',description:'Volle Deckkraft, klare Segmentgrenzen und weisse Werte auf kontrastreichen Flächen. Die Legende nennt Kategorie und Wert.',code:`pie showData
  accTitle: Dokumentierte Bausteine, illustrative Beispieldaten
  accDescr: Beispielwerte mit 4 Spezifikationen, 8 Anleitungen und 6 Rezepte, zusammen 18 Bausteine.
  title Dokumentierte Bausteine · Beispiel
  "Spezifikationen" : 4
  "Anleitungen" : 8
  "Rezepte" : 6`},
    {id:'umbruch',title:'Lange Beschriftungen',description:'260 px Umbruchbreite und 10 px Innenabstand geben langen Aussagen Platz. Die Schrift wird vor der Vermessung geladen; Kantenbeschriftungen bleiben kurz.',code:`flowchart TB
  accTitle: Lange Beschriftungen im Ablauf
  accDescr: Ein Projektauftrag führt über die Analyse zu belegten Aussagen und nach der Freigabe zu einer editierbaren Präsentation.
  A[Projektauftrag] -->|Analyse| B[Belegte Aussagen aus Repository und Dokumentation für eine nachvollziehbare Management-Entscheidung]
  B -->|Freigabe| C[Eine editierbare Präsentation mit Quellen, Zuständigkeiten und konkreten nächsten Schritten]`},
  ];
}
