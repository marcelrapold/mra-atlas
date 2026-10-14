'use client';

// Cmd+K palette. Loaded on demand by the shell (next/dynamic, ssr:false), so cmdk stays out of the
// initial route chunks. Index: pages from the catalog, plus component modules and guidance sections
// once a query is typed.
import {useEffect, useMemo, useState} from 'react';
import {Hash, Layers, type LucideIcon} from 'lucide-react';
import {CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem} from '@rapold/framework-core';
import {groups, pages, componentNames, componentPages, guidance, guidanceFor} from './catalog';
import {pageIcons} from './navigation-icons';

// Same algorithm as the heading ids of the reference pages (docs-ia-navigation).
export const slug = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Search folding: case, umlaut spelling (ä = ae) and diacritics do not matter.
export const fold = (s: string) => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
// German and technical terms people type for a page whose title does not contain them.
export const aliases: Record<string, string[]> = {
  tokens: ['Farben', 'Variablen', 'CSS', 'Custom Properties', 'Kontrast', 'JSON', 'DTCG'],
  praesentation: ['PowerPoint', 'PPTX', 'Folien', 'Deck', 'PDF'],
  praesentationslogik: ['Storyline', 'Folien', 'Deck'],
  accessibility: ['Kontrast', 'WCAG', 'a11y', 'Fokus', 'Tastatur'],
  typography: ['Schrift', 'Fonts', 'Schriftgrade'],
  layout: ['Grid', 'Spacing', 'Breakpoints'],
  icons: ['Icons', 'Symbole', 'Lucide'],
  brand: ['Logo', 'Theme', 'CI', 'Corporate Design'],
  motion: ['Animation', 'Bewegung', 'View Transitions'],
  dataviz: ['Diagramme', 'Serienfarben'],
  charts: ['Diagramme', 'ECharts'],
  forms: ['Eingabe', 'Validierung'],
  toasts: ['Benachrichtigung', 'Sonner'],
  navigation: ['Seitenleiste', 'Sidebar', 'Rail'],
};
type Entry = {key: string; label: string; hint: string; target: string; page: string; haystack: string; keywords: string[]};
const keywordsOf = (...parts: string[]) => [...parts, ...parts.map(fold)];
const pageHaystack = (id: string, title: string, group: string) => fold([id, title, group, ...(aliases[id] ?? [])].join(' '));
const titleOf = (id: string) => pages.find(p => p.id === id)?.title ?? id;
const icon = (Icon: LucideIcon) => <span className="command-icon"><Icon size={16} aria-hidden="true"/></span>;

export type SearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  themedHref: (id: string) => string;
  onSelect: (target: string) => void;
  onCloseAutoFocus: (event: Event) => void;
};

export default function SearchDialog({open, onOpenChange, brandId, themedHref, onSelect, onCloseAutoFocus}: SearchDialogProps) {
  const [query, setQuery] = useState('');
  useEffect(() => {if (!open) setQuery('');}, [open]);
  // Built per brand: guidance sections differ between brands, and anchors must exist on the target page.
  const index = useMemo(() => {
    const modules: Entry[] = componentNames.map(name => {
      const page = componentPages[name] ?? 'components';
      return {key: `modul-${name}`, label: name, hint: titleOf(page), target: `${themedHref(page)}#${slug(name)}`, page, haystack: fold(`${name} ${titleOf(page)}`), keywords: keywordsOf(titleOf(page), 'Komponente', 'Modul')};
    });
    const sections: Entry[] = Object.keys(guidance).flatMap(id => (guidanceFor(id, brandId)?.sections ?? []).map(s => ({
      key: `abschnitt-${id}-${slug(s.title)}`, label: s.title, hint: titleOf(id), target: `${themedHref(id)}#${slug(s.title)}`, page: id,
      haystack: fold([s.title, titleOf(id), s.body, ...(s.items ?? [])].join(' ')), keywords: keywordsOf(titleOf(id), s.body, ...(s.items ?? [])),
    })));
    return {modules, sections};
  }, [brandId, themedHref]);
  // Every typed word must occur in the entry (title, page, aliases or text). cmdk then only ranks:
  // its fuzzy subsequence match alone lets «Kontrast» hit «Raster & Abstände».
  const terms = fold(query).split(/\s+/).filter(Boolean);
  const matches = (haystack: string) => terms.every(term => haystack.includes(term));
  // Modules carry the icon of their page; sections are anchors within a page.
  const item = (entry: Entry, Icon?: LucideIcon) => <CommandItem key={entry.key} value={entry.key} keywords={[entry.label, ...entry.keywords]} onSelect={() => onSelect(entry.target)}>
    {icon(Icon ?? pageIcons[entry.page] ?? Layers)}<span>{entry.label}</span><span className="search-hint">{entry.hint}</span>
  </CommandItem>;
  const modules = terms.length ? index.modules.filter(e => matches(e.haystack)) : [], sections = terms.length ? index.sections.filter(e => matches(e.haystack)) : [];

  return <CommandDialog open={open} onOpenChange={onOpenChange} title="Atlas durchsuchen" description="Seite, Komponente oder Abschnitt öffnen" closeLabel="Suche schliessen" contentProps={{onCloseAutoFocus}}>
    <CommandInput placeholder="Tokens, Präsentation, Switch, Kontrast …" value={query} onValueChange={setQuery}/>
    <CommandList label="Suchergebnisse">
      <CommandEmpty>Keine Treffer. Versuche einen anderen Suchbegriff.</CommandEmpty>
      {groups.map(group => <CommandGroup key={group.title} heading={group.title}>{group.items.filter(([id, title]) => matches(pageHaystack(id, title, group.title))).map(([id, title]) =>
        <CommandItem key={id} value={`${group.title} ${title}`} keywords={keywordsOf(id, ...(aliases[id] ?? []), title, group.title)} onSelect={() => onSelect(themedHref(id))}>{icon(pageIcons[id] ?? Layers)}{title}</CommandItem>)}</CommandGroup>)}
      {modules.length > 0 && <CommandGroup heading="Komponenten-Module">{modules.map(entry => item(entry))}</CommandGroup>}
      {sections.length > 0 && <CommandGroup heading="Abschnitte">{sections.map(entry => item(entry, Hash))}</CommandGroup>}
    </CommandList>
  </CommandDialog>;
}
