'use client';

import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {createContext, useContext, useEffect, useRef, useState, type ReactNode} from 'react';
import {Search, PanelLeft, ChevronRight, Layers, ExternalLink} from 'lucide-react';
import {BrandProvider, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription, Toaster} from '@rapold/framework-core';
import {brands, neutral, toCssVariables, type Brand, type Mode} from '@rapold/framework-brands';
import {groups, pages, href} from './catalog';
import {pageIcons, groupIcons} from './navigation-icons';
import {version} from '../../../../package.json';

type Appearance = Mode | 'system';
const BrandContext = createContext<{brand: Brand; mode: Mode; setBrand: (id: string) => void}>({brand: neutral, mode: 'light', setBrand: () => {}});
export const useActiveBrand = () => useContext(BrandContext);

// Atlas signet (brands/rapold/assets/logos/current-color/atlas.svg): the system's own mark,
// drawn in currentColor so it follows every brand and mode. Decorative: the name sits beside it.
function AtlasMark({size}: {size: number}) {
  return <svg width={size} height={size} viewBox="30 32 196 196" aria-hidden="true" focusable="false">
    <path fill="currentColor" fillRule="evenodd" d="M 34 84 L 81 58 L 81 176 L 34 202 Z M 128 84 L 175 58 L 175 176 L 128 202 Z M 151.5 108 L 165 128 L 151.5 148 L 138 128 Z"/>
    <polygon fill="currentColor" fillOpacity={0.55} points="81,58 128,84 128,202 81,176"/>
    <polygon fill="currentColor" fillOpacity={0.55} points="175,58 222,84 222,202 175,176"/>
  </svg>;
}

export default function FrameworkShell({children}: {children: ReactNode}) {
  const path = usePathname();
  const router = useRouter();
  const current = pages.find(p => href(p.id) === path) ?? pages[0];
  const [brandId, setBrandId] = useState('neutral');
  const [appearance, setAppearance] = useState<Appearance>('system');
  const [systemDark, setSystemDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [closed, setClosed] = useState<string[]>([]);
  const [search, setSearch] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [ready, setReady] = useState(false);
  const searchOrigin = useRef<HTMLElement | null>(null);
  const searchNavigating = useRef(false);
  const mobileNavigating = useRef(false);
  const mobileSearchRequested = useRef(false);

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('framework-preferences') ?? '{}');
      if (brands.some(b => b.id === p.brand)) setBrandId(p.brand);
      if (p.mode === 'light' || p.mode === 'dark' || p.mode === 'system') setAppearance(p.mode);
      setCollapsed(p.collapsed === true);
      if (Array.isArray(p.closed)) setClosed(p.closed.filter((x: unknown) => typeof x === 'string'));
    } catch { /* Storage may be disabled; the reference remains usable. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('brand');
    if (requested && brands.some(b => b.id === requested)) setBrandId(requested);
  }, [path]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(media.matches);
    const update = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (ready) try {
      localStorage.setItem('framework-preferences', JSON.stringify({brand: brandId, mode: appearance, collapsed, closed}));
    } catch { /* A storage failure must not block navigation. */ }
  }, [brandId, appearance, collapsed, closed, ready]);

  const openSearch = (origin: HTMLElement | null) => {
    searchOrigin.current = origin;
    searchNavigating.current = false;
    setSearch(true);
  };
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (search) setSearch(false);
        else if (mobile) {mobileSearchRequested.current = true; setMobile(false);}
        else openSearch(document.activeElement instanceof HTMLElement ? document.activeElement : null);
      }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [search, mobile]);

  const selectBrand = (id: string) => {
    if (!brands.some(b => b.id === id)) return;
    setBrandId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('brand', id);
    window.history.replaceState(null, '', url);
  };
  const brand = brands.find(b => b.id === brandId) ?? neutral;
  const wantsDark = appearance === 'dark' || (appearance === 'system' && systemDark);
  const mode: Mode = wantsDark && brand.modes.dark ? 'dark' : 'light';
  const themedHref = (id: string) => `${href(id)}?brand=${encodeURIComponent(brand.id)}`;
  // Brand fonts are loaded by the documentation adapter, independently of Core.
  const variables = {...toCssVariables(brand, mode), ...(brand.id === 'rapold' ? {'--font-mono': '"Geist Mono", ui-monospace, monospace'} : {})};

  const nav = (rail = false, mobileView = false) => <>{groups.map((group, index) => {
    const GroupIcon = groupIcons[group.title] ?? Layers;
    const expanded = rail || !closed.includes(group.title);
    const groupId = `nav-${mobileView ? 'mobile' : 'desktop'}-${index}`;
    return <div className="nav-group" key={group.title}>
      {rail ? <div className="rail-group" title={group.title}><GroupIcon size={14} aria-hidden="true"/><span className="sr-only">{group.title}</span></div> :
        <button className="nav-group-label" type="button" onClick={() => setClosed(value => value.includes(group.title) ? value.filter(x => x !== group.title) : [...value, group.title])} aria-expanded={expanded} aria-controls={groupId}>
          <GroupIcon size={14} aria-hidden="true"/><span>{group.title}</span><ChevronRight size={13} aria-hidden="true" className={expanded ? 'rotate' : ''}/>
        </button>}
      <div id={groupId} hidden={!expanded}>{group.items.map(([id, title]) => {
        const Icon = pageIcons[id] ?? Layers;
        return <Link key={id} href={themedHref(id)} prefetch={false} title={rail ? title : undefined} aria-label={rail ? title : undefined} aria-current={current.id === id ? 'page' : undefined}
          onClick={() => {if (mobileView) {mobileNavigating.current = true; setMobile(false);}}} className="nav-link">
          <Icon size={16} aria-hidden="true"/>{!rail && <span>{title}</span>}
        </Link>;
      })}</div>
    </div>;
  })}</>;

  return <BrandProvider brand={{id: brand.id, mode, variables}}><BrandContext.Provider value={{brand, mode, setBrand: selectBrand}}>
    <a className="skip" href="#main">Zum Inhalt</a>
    <Sheet open={mobile} onOpenChange={open => {if (open) {mobileNavigating.current = false; mobileSearchRequested.current = false;} setMobile(open);}}>
      <div className={`framework-app ${collapsed ? 'rail' : ''}`}>
        <aside className="sidebar">
          <Link href={themedHref('overview')} className={`identity ${brand.assets?.logo && !collapsed ? 'identity-brand' : ''}`} aria-label={`${brand.name} · Startseite`}>
            {brand.assets?.logo && !collapsed ? <img src={`/${brand.assets.logo.path}`} width={142} height={24} alt={`${brand.name}-Logo`}/> : <><AtlasMark size={23}/>{!collapsed && <span>Atlas <small>{version}</small></span>}</>}
          </Link>
          <button className="search-trigger" type="button" onClick={event => openSearch(event.currentTarget)} aria-label="Seiten durchsuchen" aria-haspopup="dialog"><Search size={16} aria-hidden="true"/>{!collapsed && <><span>Suchen</span><kbd aria-hidden="true">⌘ / Ctrl K</kbd></>}</button>
          <nav aria-label="Hauptnavigation">{nav(collapsed)}</nav>
          <div className="sidebar-foot">{collapsed ? <Layers size={18} aria-hidden="true"/> : <><strong>{brand.name}</strong><span>{brand.status === 'draft' ? 'CI-Entwurf' : brand.status === 'baseline' ? 'Framework-Standard' : 'Freigegebene Brand'}</span></>}</div>
        </aside>
        <div className="workspace">
          <header className="toolbar">
            <button className="icon-button desktop-toggle" type="button" aria-label={collapsed ? 'Seitenleiste erweitern' : 'Seitenleiste einklappen'} onClick={() => setCollapsed(value => !value)}><PanelLeft size={18} aria-hidden="true"/></button>
            <SheetTrigger asChild><button className="icon-button mobile-toggle" type="button" aria-label="Navigation öffnen"><PanelLeft size={18} aria-hidden="true"/></button></SheetTrigger>
            <div className="breadcrumb"><span>{current.group}</span><ChevronRight size={14} aria-hidden="true"/><strong>{current.title}</strong></div>
            <div className="toolbar-controls">
              <label className="sr-only" htmlFor="brand-choice">Theme</label>
              <select id="brand-choice" value={brandId} onChange={event => selectBrand(event.target.value)}>{brands.map(item => <option value={item.id} key={item.id}>{item.id === 'neutral' ? 'Default' : item.name}</option>)}</select>
              <label className="sr-only" htmlFor="appearance-choice">Darstellung</label>
              <select id="appearance-choice" value={appearance === 'dark' && !brand.modes.dark ? 'light' : appearance} onChange={event => setAppearance(event.target.value as Appearance)} title={brand.modes.dark ? 'System, Hell oder Dunkel' : 'Für diese Brand ist nur Hell definiert'}>
                <option value="system">System</option><option value="light">Hell</option><option value="dark" disabled={!brand.modes.dark}>Dunkel</option>
              </select>
              <a className="icon-button" href="https://github.com/marcelrapold/mra-atlas" aria-label="GitHub-Repository"><ExternalLink size={17} aria-hidden="true"/></a>
            </div>
          </header>
          <main id="main" tabIndex={-1}>{children}</main>
          <footer><span>Atlas · {brand.name}</span><a href={`/brands/${brand.id}/llms.txt`}>Agenten-Einstieg</a></footer>
        </div>
      </div>
      <SheetContent side="left" className="mobile-nav" closeLabel="Navigation schliessen" onCloseAutoFocus={event => {if (mobileSearchRequested.current) {event.preventDefault(); mobileSearchRequested.current = false; openSearch(document.querySelector<HTMLButtonElement>('.mobile-toggle'));} else if (mobileNavigating.current) {event.preventDefault(); document.getElementById('main')?.focus();}}}>
        <SheetTitle>Navigation · {brand.name}</SheetTitle><SheetDescription>Referenzseiten und Design-Verträge</SheetDescription>
        <button className="search-trigger" type="button" onClick={() => {mobileSearchRequested.current = true; setMobile(false);}}><Search size={16} aria-hidden="true"/><span>Referenzseiten durchsuchen</span></button>
        <nav aria-label="Mobile Navigation">{nav(false, true)}</nav>
      </SheetContent>
    </Sheet>
    <CommandDialog open={search} onOpenChange={setSearch} title="Atlas durchsuchen" description="Eine Referenzseite öffnen" closeLabel="Suche schliessen" contentProps={{onCloseAutoFocus: event => {
      event.preventDefault();
      const origin = searchOrigin.current;
      if (!searchNavigating.current && origin?.isConnected) origin.focus();
      else document.getElementById('main')?.focus();
    }}}>
      <CommandInput placeholder="Tokens, Präsentation, Komponenten …"/>
      <CommandList label="Referenzseiten"><CommandEmpty>Keine passende Seite. Versuche einen anderen Suchbegriff.</CommandEmpty>{groups.map(group => <CommandGroup key={group.title} heading={group.title}>{group.items.map(([id, title]) => <CommandItem key={id} value={`${group.title} ${title}`} onSelect={() => {
        searchNavigating.current = true; setSearch(false); router.push(themedHref(id));
      }}><span className="command-icon">{(() => {const Icon = pageIcons[id] ?? Layers; return <Icon size={16} aria-hidden="true"/>;})()}</span>{title}</CommandItem>)}</CommandGroup>)}</CommandList>
    </CommandDialog>
    <Toaster/>
  </BrandContext.Provider></BrandProvider>;
}
