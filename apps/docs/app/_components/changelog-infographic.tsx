'use client';

import {Banknote,CalendarDays,Check,Contact,FileText,MapPinned,PackageCheck,Route,ShieldCheck,Truck,type LucideIcon} from 'lucide-react';
import {useActiveBrand} from './framework-shell';

type ChangelogContent = {
  eyebrow: string;
  label: string;
  tagline: string;
  title: string;
  introduction: string;
  metadata: string[];
  notice?: string;
  groups: {icon: LucideIcon; title: string; subtitle: string; items: string[]}[];
  detail: {title: string; subtitle: string; items: {icon: LucideIcon; text: string}[]};
  footerTitle: string;
  footerLabels: string[];
};

const dominicanoChangelog: ChangelogContent = {
  eyebrow: 'Dominicano Express · Caja',
  label: 'Changelog',
  tagline: 'Mehr als eine Sendung. Eine Verbindung.',
  title: 'Caja — Changelog 26.09.2026',
  introduction: 'Ein Tag. Ein grosser Sprung im operativen System.',
  metadata: ['Kisten · Sendungen · Menschen','Dominikanische Republik','Effizienter · einfacher · gemeinsam weiter'],
  groups: [
    {icon: Route,title: 'Navigation & Workflow',subtitle: 'Übersichtlich. Auf allen Geräten.',items: ['Navigation neu gegliedert: Operativ · Geld · Auswertung','Mobile und Desktop nutzen dieselbe Navigation','Kiste ausgeben wird zum Startpunkt einer neuen Sendung']},
    {icon: Truck,title: 'Sendungen end-to-end',subtitle: 'Alles im Blick. Von Anfang bis Ende.',items: ['Status und nächster Schritt direkt oben auf jeder Sendung','Geld & Belege zeigt Preis, bezahlt, offen und Belege an einem Ort','Neue Sendungsnummern ab 20001, getrennt vom Alt-System']},
    {icon: PackageCheck,title: 'Abholung & Rechnung',subtitle: 'Schneller zum Ziel.',items: ['Abholung kann direkt die Rechnung erzeugen','Anzahlungen werden automatisch berücksichtigt','Zurückgebliebene Kisten werden eigene Sendungen']},
    {icon: Contact,title: 'KYC & Kontakte',subtitle: 'Sicher. Vollständig. Aktuell.',items: ['Ausweis erneut scannen und bestehende Kontakte prüfen','ID-Karte, Pass und Cédula unterstützt','Nationalität und Ausweisdaten direkt am Kontakt sichtbar']},
    {icon: Banknote,title: 'Finanzen & Kontrolle',subtitle: 'Transparenz in der ganzen App.',items: ['Beträge lassen sich appweit verwischen','Revolut-Buchungen neu als Haus-Tabelle','Bank-/Buchungs-Wächter erkennt Inkonsistenzen sofort']},
    {icon: FileText,title: 'Belege & Kommunikation',subtitle: 'Zuverlässig. Mehrsprachig. Professionell.',items: ['Rechnungen und Offerten werden wieder zuverlässig per E-Mail versendet','E-Mail-Absender Dominicano Express, Antworten ins Büro','Belege in Spanisch, Deutsch und Englisch in einem PDF']},
  ],
  detail: {
    title: 'Zeit, Daten & Stabilität',
    subtitle: 'Stabiler Betrieb. Weniger Fehler.',
    items: [
      {icon: Check,text: 'Zürcher Kalendertag statt UTC-Fehler nach Mitternacht'},
      {icon: Check,text: 'PDFs öffnen wieder zuverlässig'},
      {icon: MapPinned,text: 'Empfänger-Orte mit amtlichem Provinz/Municipio/Distrito-Katalog'},
      {icon: ShieldCheck,text: 'Automatische Zahlungszuordnung korrigiert: eine Zahlung deckt nur eine Rechnung'},
    ],
  },
  footerTitle: 'Heute verbessert',
  footerLabels: ['Operativ','Finanzen','KYC','Stabilität'],
};

const sampleChangelog: ChangelogContent = {
  eyebrow: 'Muster · Fiktives Produkt',
  label: 'Changelog-Vorlage',
  tagline: 'Änderungen verständlich erklären.',
  title: 'Muster-Changelog',
  introduction: 'So kann ein übersichtliches Produktupdate aussehen.',
  metadata: ['Beispielrelease','Fiktive Inhalte','Aufbau zur Wiederverwendung'],
  notice: 'Dieses Changelog ist ein fiktives Muster. Die folgenden Änderungen zeigen das Format und beschreiben kein reales Produkt oder Unternehmen.',
  groups: [
    {icon: Route,title: 'Navigation & Orientierung',subtitle: 'Wege und nächste Schritte erklären.',items: ['Hauptbereiche sind nach häufigen Aufgaben gegliedert','Die aktuelle Position bleibt in der Navigation sichtbar','Direkte Links führen zu zuletzt geöffneten Ansichten']},
    {icon: FileText,title: 'Formulare & Eingaben',subtitle: 'Eingaben verständlich begleiten.',items: ['Pflichtfelder sind vor dem Absenden erkennbar','Fehlermeldungen stehen direkt am betroffenen Feld','Ein Entwurf kann später weiterbearbeitet werden']},
    {icon: Check,title: 'Aufgaben & Fortschritt',subtitle: 'Den Arbeitsstand sichtbar machen.',items: ['Offene und erledigte Aufgaben sind getrennt sichtbar','Ein Status zeigt den nächsten möglichen Schritt','Filter helfen beim Eingrenzen längerer Listen']},
    {icon: Contact,title: 'Zusammenarbeit',subtitle: 'Gemeinsame Arbeit beschreiben.',items: ['Kommentare bleiben beim zugehörigen Eintrag','Zuständigkeiten sind in der Übersicht erkennbar','Änderungen erscheinen in einer gemeinsamen Aktivitätsliste']},
    {icon: CalendarDays,title: 'Planung & Überblick',subtitle: 'Termine und Prioritäten ordnen.',items: ['Eine Wochenansicht bündelt anstehende Aufgaben','Termine lassen sich direkt im Eintrag bearbeiten','Eine leere Ansicht erklärt den nächsten Schritt']},
    {icon: ShieldCheck,title: 'Qualität & Bedienbarkeit',subtitle: 'Verbesserungen konkret benennen.',items: ['Bedienelemente haben verständliche Beschriftungen','Die Tastaturbedienung folgt der sichtbaren Reihenfolge','Lange Inhalte passen sich schmalen Ansichten an']},
  ],
  detail: {
    title: 'System & Zuverlässigkeit',
    subtitle: 'Weitere Änderungen im fiktiven Beispiel.',
    items: [
      {icon: Check,text: 'Datumsangaben verwenden ein einheitliches Format'},
      {icon: Check,text: 'Ladezustände erklären, welche Inhalte noch fehlen'},
      {icon: FileText,text: 'Ein Export übernimmt die ausgewählten Spalten'},
      {icon: ShieldCheck,text: 'Eine Bestätigung zeigt, wann eine Änderung gespeichert ist'},
    ],
  },
  footerTitle: 'Themen im Muster',
  footerLabels: ['Orientierung','Eingaben','Zusammenarbeit','Bedienbarkeit'],
};

export default function ChangelogInfographic(){
  const {brand}=useActiveBrand();
  const content=brand.id==='dominicano-express'?dominicanoChangelog:sampleChangelog;

  return <div style={{maxWidth:1040,minWidth:0,margin:'0 auto 48px',border:'1px solid var(--border)',borderRadius:'var(--brand-radius)',overflow:'hidden',overflowWrap:'anywhere',background:'var(--card)',color:'var(--card-foreground)',boxShadow:'var(--brand-shadow)'}}>
    <section className="changelog-header" style={{background:'var(--primary)',color:'var(--primary-foreground)'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:24,alignItems:'flex-start',flexWrap:'wrap'}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:14,fontWeight:700,letterSpacing:1.8,textTransform:'uppercase'}}>{content.eyebrow}</div>
          <div style={{marginTop:5,fontSize:12,letterSpacing:3,textTransform:'uppercase'}}>{content.label}</div>
        </div>
        <div style={{fontSize:11,letterSpacing:2.4,textTransform:'uppercase',maxWidth:160,lineHeight:1.5}}>{content.tagline}</div>
      </div>
      <h2 style={{fontSize:'clamp(32px,5vw,56px)',lineHeight:1.02,margin:'34px 0 10px',letterSpacing:'-.035em',color:'inherit'}}>{content.title}</h2>
      <p style={{fontSize:20,margin:0,color:'inherit'}}>{content.introduction}</p>
      <div style={{display:'flex',gap:24,flexWrap:'wrap',marginTop:28,fontSize:11,letterSpacing:1.6,textTransform:'uppercase'}}>
        {content.metadata.map(item=><span key={item}>{item}</span>)}
      </div>
    </section>

    {content.notice&&<div style={{margin:'24px 24px 0',padding:'12px 14px',border:'1px solid var(--border)',borderRadius:10,background:'var(--muted)',color:'var(--muted-foreground)',fontSize:13}}>{content.notice}</div>}

    <section style={{padding:'clamp(16px,3vw,24px)',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,320px),1fr))',gap:16,background:'var(--background)'}}>
      {content.groups.map(({icon:Icon,title,subtitle,items})=><article key={title} style={{minWidth:0,padding:'clamp(16px,3vw,22px)',border:'1px solid var(--border)',borderRadius:'var(--brand-radius)',background:'var(--card)',color:'var(--card-foreground)',minHeight:230}}>
        <div style={{display:'grid',gridTemplateColumns:'56px minmax(0,1fr)',gap:16,alignItems:'start'}}>
          <div style={{width:56,height:56,borderRadius:12,display:'grid',placeItems:'center',background:'var(--accent)',color:'var(--accent-foreground)'}}><Icon size={28} aria-hidden="true"/></div>
          <div className="changelog-card-title">
            <h3 style={{margin:'2px 0 4px',fontSize:23,letterSpacing:'-.02em',color:'inherit'}}>{title}</h3>
            <p style={{margin:0,color:'inherit'}}>{subtitle}</p>
          </div>
        </div>
        <div style={{display:'grid',gap:12,marginTop:22}}>
          {items.map(item=><div key={item} style={{display:'grid',gridTemplateColumns:'22px minmax(0,1fr)',gap:10,lineHeight:1.38}}>
            <span style={{width:20,height:20,borderRadius:999,display:'grid',placeItems:'center',background:'var(--primary)',color:'var(--primary-foreground)',marginTop:1}}><Check size={13} strokeWidth={3} aria-hidden="true"/></span>
            <span>{item}</span>
          </div>)}
        </div>
      </article>)}
    </section>

    <section style={{padding:'0 clamp(16px,3vw,24px) clamp(16px,3vw,24px)',background:'var(--background)'}}>
      <article style={{minWidth:0,padding:'clamp(16px,3vw,22px)',border:'1px solid var(--border)',borderRadius:'var(--brand-radius)',background:'var(--card)',color:'var(--card-foreground)'}}>
        <div style={{display:'grid',gridTemplateColumns:'56px minmax(0,1fr)',gap:16,alignItems:'start'}}>
          <div style={{width:56,height:56,borderRadius:12,display:'grid',placeItems:'center',background:'var(--accent)',color:'var(--accent-foreground)'}}><CalendarDays size={28} aria-hidden="true"/></div>
          <div className="changelog-card-title">
            <h3 style={{margin:'2px 0 4px',fontSize:23,color:'inherit'}}>{content.detail.title}</h3>
            <p style={{margin:0,color:'inherit'}}>{content.detail.subtitle}</p>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))',gap:12,marginTop:22}}>
          {content.detail.items.map(({icon:Icon,text})=><div key={text} style={{display:'grid',gridTemplateColumns:'22px minmax(0,1fr)',gap:10,lineHeight:1.38}}>
            <Icon size={19} aria-hidden="true"/>
            <span>{text}</span>
          </div>)}
        </div>
      </article>
    </section>

    <footer style={{display:'block',padding:'18px clamp(16px,3vw,24px)',background:'var(--secondary)',color:'var(--secondary-foreground)'}}>
      <div style={{fontSize:11,letterSpacing:2.2,textTransform:'uppercase',marginBottom:12}}>{content.footerTitle}</div>
      <div className="changelog-footer-grid">
        {content.footerLabels.map(label=><div key={label} style={{minWidth:0,border:'1px solid var(--border)',borderRadius:10,padding:'14px 10px',background:'var(--card)',color:'var(--card-foreground)',textAlign:'center',fontWeight:700,letterSpacing:.5}}>{label}</div>)}
      </div>
    </footer>
  </div>;
}
