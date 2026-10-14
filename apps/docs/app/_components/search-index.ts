// Search index of the Cmd+K palette: pages, component modules and guidance sections.
// No imports on purpose: node --test and the post-build check load this file directly and pass the catalog in.
// The palette filters and ranks here alone (cmdk runs with shouldFilter={false}), so folding is consistent.

// Case, umlaut spelling (ä = ae) and diacritics do not matter.
export const fold = (s: string) => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').normalize('NFKD').replace(/[̀-ͯ]/g, '');
// German and technical terms people type for a page whose id and title do not contain them.
export const aliases: Record<string, string[]> = {
  tokens: ['Farben', 'Variablen', 'CSS', 'Custom Properties', 'Kontrast', 'JSON', 'DTCG'],
  praesentation: ['PowerPoint', 'PPTX', 'Folien', 'Deck', 'PDF'],
  praesentationslogik: ['Storyline', 'Folien', 'Deck'],
  accessibility: ['Kontrast', 'WCAG', 'a11y', 'Fokus', 'Tastatur'],
  typography: ['Schrift', 'Fonts', 'Schriftgrade'],
  layout: ['Grid', 'Spacing', 'Breakpoints'],
  icons: ['Symbole', 'Lucide'],
  brand: ['Logo', 'Theme', 'CI', 'Corporate Design'],
  motion: ['Animation', 'Bewegung', 'View Transitions'],
  dataviz: ['Diagramme', 'Serienfarben'],
  charts: ['Diagramme', 'ECharts'],
  forms: ['Eingabe', 'Validierung'],
  toasts: ['Benachrichtigung', 'Sonner'],
  navigation: ['Seitenleiste', 'Sidebar', 'Rail'],
};

type Section = {title: string; body: string; items?: string[]};
export type Catalog = {
  groups: readonly {title: string; items: readonly (readonly string[])[]}[];
  componentNames: readonly string[];
  componentPages: Record<string, string>;
  guidance: Record<string, unknown>;
  guidanceFor: (id: string, brandId: string) => {sections: Section[]} | null | undefined;
};
export type Entry = {key: string; kind: 'page' | 'module' | 'section'; label: string; hint: string; page: string; target: string; haystack: string};
export type Results = {groups: {title: string; entries: Entry[]}[]; modules: Entry[]; sections: Entry[]};

// Built per brand: guidance sections differ between brands. Modules and sections open their page;
// heading anchors follow once the reference pages render heading ids (docs-ia-navigation).
export function buildIndex(catalog: Catalog, brandId: string, themedHref: (id: string) => string) {
  const titles = new Map(catalog.groups.flatMap(g => g.items.map(([id, title]) => [id, title] as const)));
  const titleOf = (id: string) => titles.get(id) ?? id;
  const pages = catalog.groups.map(group => ({title: group.title, entries: group.items.map(([id, title]): Entry => ({
    key: id, kind: 'page', label: title, hint: group.title, page: id, target: themedHref(id), haystack: fold([id, title, group.title, ...(aliases[id] ?? [])].join(' ')),
  }))}));
  const modules = catalog.componentNames.map((name): Entry => {
    const page = catalog.componentPages[name] ?? 'components';
    return {key: `modul-${name}`, kind: 'module', label: name, hint: titleOf(page), page, target: themedHref(page), haystack: fold(`${name} ${titleOf(page)} Komponente Modul`)};
  });
  const sections = Object.keys(catalog.guidance).flatMap(id => (catalog.guidanceFor(id, brandId)?.sections ?? []).map((s): Entry => ({
    key: `abschnitt-${id}-${s.title}`, kind: 'section', label: s.title, hint: titleOf(id), page: id, target: themedHref(id),
    haystack: fold([s.title, titleOf(id), s.body, ...(s.items ?? [])].join(' ')),
  })));
  return {pages, modules, sections};
}

// Every typed word must occur in the entry (title, page, aliases or text); a fuzzy subsequence match
// would let «Kontrast» hit «Raster & Abstände». Hits in the label rank first, label prefixes before them.
export function search(index: ReturnType<typeof buildIndex>, query: string): Results {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  const score = (entry: Entry) => {const label = fold(entry.label); return terms.every(t => label.includes(t)) ? (label.startsWith(terms[0]) ? 2 : 1) : 0;};
  const rank = (list: Entry[]) => list.filter(e => terms.every(t => e.haystack.includes(t))).map((e, i) => ({e, i, s: score(e)})).sort((a, b) => b.s - a.s || a.i - b.i).map(x => x.e);
  return {
    groups: index.pages.map(g => ({title: g.title, entries: terms.length ? rank(g.entries) : g.entries})).filter(g => g.entries.length),
    modules: terms.length ? rank(index.modules) : [],
    sections: terms.length ? rank(index.sections) : [],
  };
}
