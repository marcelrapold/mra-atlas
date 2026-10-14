'use client';

// Cmd+K palette. Loaded on demand by the shell (next/dynamic, ssr:false), so cmdk stays out of the
// initial route chunks. Index and matching live in search-index.ts; cmdk only renders and handles the keyboard.
import {useEffect, useMemo, useState} from 'react';
import {Hash, Layers, type LucideIcon} from 'lucide-react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem} from '@rapold/framework-core';
import {groups, componentNames, componentPages, guidance, guidanceFor} from './catalog';
import {pageIcons} from './navigation-icons';
import {buildIndex, search, type Entry} from './search-index';

const catalog = {groups, componentNames, componentPages, guidance, guidanceFor};
const icon = (Icon: LucideIcon) => <span className="command-icon"><Icon size={16} aria-hidden="true"/></span>;
const title = 'Atlas durchsuchen';

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
  const index = useMemo(() => buildIndex(catalog, brandId, themedHref), [brandId, themedHref]);
  const results = useMemo(() => search(index, query), [index, query]);
  // Pages carry their own icon, modules the icon of their page; sections are text within a page.
  const item = (entry: Entry) => <CommandItem key={entry.key} value={entry.key} onSelect={() => onSelect(entry.target)}>
    {icon(entry.kind === 'section' ? Hash : pageIcons[entry.page] ?? Layers)}<span>{entry.label}</span>{entry.kind !== 'page' && <span className="search-hint">{entry.hint}</span>}
  </CommandItem>;

  // CommandDialog does not forward Command props, so the palette composes Dialog and Command itself:
  // shouldFilter={false} keeps cmdk's own fuzzy filter from re-filtering the folded results.
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent onCloseAutoFocus={onCloseAutoFocus} className="overflow-hidden p-0" closeLabel="Suche schliessen">
      <DialogHeader className="sr-only"><DialogTitle>{title}</DialogTitle><DialogDescription>Seite, Komponente oder Abschnitt öffnen</DialogDescription></DialogHeader>
      <Command label={title} shouldFilter={false} className="**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
        <CommandInput placeholder="Tokens, Präsentation, Switch, Kontrast …" value={query} onValueChange={setQuery}/>
        <CommandList label="Suchergebnisse">
          <CommandEmpty>Keine Treffer. Versuche einen anderen Suchbegriff.</CommandEmpty>
          {results.groups.map(group => <CommandGroup key={group.title} heading={group.title}>{group.entries.map(item)}</CommandGroup>)}
          {results.modules.length > 0 && <CommandGroup heading="Komponenten-Module">{results.modules.map(item)}</CommandGroup>}
          {results.sections.length > 0 && <CommandGroup heading="Abschnitte">{results.sections.map(item)}</CommandGroup>}
        </CommandList>
      </Command>
    </DialogContent>
  </Dialog>;
}
