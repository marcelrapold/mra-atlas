'use client';
import {useId,useState} from 'react';
import {Inbox} from 'lucide-react';
import {toast} from 'sonner';
import * as UI from '@rapold/framework-core';
import {DemoPanel} from './demo-panel';

const code={
 buttonBadge:`import { Button, Badge } from '@rapold/framework-core'

<Button onClick={save}>Primäraktion</Button>
<Button variant="secondary">Sekundär</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Löschen</Button>
<Badge variant="secondary">Entwurf</Badge>`,
 inputLabelCheckbox:`import { Input, Label, Checkbox } from '@rapold/framework-core'

<Label htmlFor="project">Projektname</Label>
<Input id="project" required placeholder="Kundenportal" />
<Checkbox id="confirm" />
<Label htmlFor="confirm">Belege geprüft</Label>`,
 dialogSheet:`import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, Sheet, SheetTrigger, SheetContent } from '@rapold/framework-core'

<Dialog>
  <DialogTrigger asChild><Button variant="outline">Dialog öffnen</Button></DialogTrigger>
  <DialogContent closeLabel="Dialog schliessen">
    <DialogHeader>
      <DialogTitle>Projekt freigeben</DialogTitle>
      <DialogDescription>Escape schliesst und gibt den Fokus zurück.</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>

<Sheet>
  <SheetTrigger asChild><Button variant="outline">Detailpanel</Button></SheetTrigger>
  <SheetContent closeLabel="Detailpanel schliessen">…</SheetContent>
</Sheet>`,
 selectMenu:`import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@rapold/framework-core'

<Select defaultValue="draft">
  <SelectTrigger aria-label="Projektstatus"><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectItem value="draft">Entwurf</SelectItem>
    <SelectItem value="review">In Prüfung</SelectItem>
  </SelectContent>
</Select>

<DropdownMenu>
  <DropdownMenuTrigger asChild><Button variant="outline">Aktionen</Button></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onSelect={exportProject}>Exportieren</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
 tabs:`import { Tabs, TabsList, TabsTrigger, TabsContent } from '@rapold/framework-core'

<Tabs defaultValue="overview">
  <TabsList aria-label="Projektansicht">
    <TabsTrigger value="overview">Übersicht</TabsTrigger>
    <TabsTrigger value="activity">Aktivität</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
  <TabsContent value="activity">…</TabsContent>
</Tabs>`,
 popoverTooltip:`import { Popover, PopoverTrigger, PopoverContent, PopoverTitle,
  TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@rapold/framework-core'

<Popover>
  <PopoverTrigger asChild><Button variant="outline">Hinweise</Button></PopoverTrigger>
  <PopoverContent aria-labelledby="hint-title">
    <PopoverTitle id="hint-title">Kontext zur Aktion</PopoverTitle>
  </PopoverContent>
</Popover>

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild><Button variant="ghost">Fokus oder Hover</Button></TooltipTrigger>
    <TooltipContent>Zusätzliche Erklärung</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
 cardSeparator:`import { Card, CardHeader, CardTitle, CardDescription, CardContent,
  Separator } from '@rapold/framework-core'

<Card>
  <CardHeader>
    <CardTitle>Projektübersicht</CardTitle>
    <CardDescription>Zusammengehörige Informationen</CardDescription>
  </CardHeader>
  <CardContent>
    Status: In Prüfung
    <Separator className="my-4" />
    Verantwortung: Projektleitung
  </CardContent>
</Card>`,
 emptySkeleton:`import { EmptyState, Skeleton } from '@rapold/framework-core'
import { Inbox } from 'lucide-react'

<EmptyState icon={Inbox} title="Keine Einträge" description="Neue Projekte erscheinen hier." />
<Skeleton className="h-4 w-3/4" />`,
 command:`import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup,
  CommandItem } from '@rapold/framework-core'

<Command label="Aktion suchen">
  <CommandInput placeholder="Aktion suchen …" />
  <CommandList label="Verfügbare Aktionen">
    <CommandEmpty>Keine Aktion gefunden.</CommandEmpty>
    <CommandGroup heading="Projekt">
      <CommandItem onSelect={openProject}>Projekt öffnen</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`,
 lightboxToaster:`import { Lightbox, Toaster } from '@rapold/framework-core'
import { toast } from 'sonner'

// einmal im Layout
<Toaster />

<Lightbox label="Folie 3"><img src="/folie-3.png" alt="" /></Lightbox>
toast.success('Änderung gespeichert')`,
};

export function ComponentDemo(){
 const popoverTitleId=useId();
 const [value,setValue]=useState(''),[done,setDone]=useState(false);
 return <div className="demo-grid">
 <DemoPanel id="button-badge" title="Button & Badge" code={code.buttonBadge}><div className="demo-row"><UI.Button onClick={()=>toast.success('Aktion ausgeführt')}>Primäraktion</UI.Button><UI.Button variant="secondary">Sekundär</UI.Button><UI.Button variant="outline">Outline</UI.Button><UI.Button variant="ghost">Ghost</UI.Button><UI.Button variant="destructive">Löschen</UI.Button><UI.Button disabled>Deaktiviert</UI.Button></div><div className="demo-row"><UI.Badge>Aktiv</UI.Badge><UI.Badge variant="secondary">Entwurf</UI.Badge><UI.Badge variant="destructive">Fehler</UI.Badge></div></DemoPanel>
 <DemoPanel id="input-label-checkbox" title="Input, Label & Checkbox" code={code.inputLabelCheckbox} layout="fill"><form onSubmit={e=>{e.preventDefault();setDone(true);}}><UI.Label htmlFor="demo-project">Projektname</UI.Label><UI.Input id="demo-project" value={value} onChange={e=>{setValue(e.target.value);setDone(false);}} required placeholder="Kundenportal"/><div className="demo-row"><UI.Checkbox id="demo-confirm"/><UI.Label htmlFor="demo-confirm">Belege geprüft</UI.Label></div><UI.Button type="submit">Eingabe prüfen</UI.Button><p role="status">{done?`«${value}» lokal geprüft.`:'Keine Daten werden versendet.'}</p></form></DemoPanel>
 <DemoPanel id="dialog-sheet" title="Dialog & Sheet" code={code.dialogSheet}><div className="demo-row"><UI.Dialog><UI.DialogTrigger asChild><UI.Button variant="outline">Dialog öffnen</UI.Button></UI.DialogTrigger><UI.DialogContent closeLabel="Dialog schliessen"><UI.DialogHeader><UI.DialogTitle>Projekt freigeben</UI.DialogTitle><UI.DialogDescription>Der Dialog übernimmt die aktive Brand. Escape schliesst und gibt den Fokus zurück.</UI.DialogDescription></UI.DialogHeader><UI.DialogFooter><UI.DialogClose asChild><UI.Button>Schliessen</UI.Button></UI.DialogClose></UI.DialogFooter></UI.DialogContent></UI.Dialog><UI.Sheet><UI.SheetTrigger asChild><UI.Button variant="outline">Detailpanel</UI.Button></UI.SheetTrigger><UI.SheetContent closeLabel="Detailpanel schliessen"><UI.SheetHeader><UI.SheetTitle>Projektdetails</UI.SheetTitle><UI.SheetDescription>Ein seitliches Panel für Kontext und ergänzende Aktionen.</UI.SheetDescription></UI.SheetHeader></UI.SheetContent></UI.Sheet></div></DemoPanel>
 <DemoPanel id="select-dropdown-menu" title="Select & Dropdown Menu" code={code.selectMenu}><div className="demo-row"><UI.Select defaultValue="draft"><UI.SelectTrigger aria-label="Projektstatus"><UI.SelectValue/></UI.SelectTrigger><UI.SelectContent><UI.SelectItem value="draft">Entwurf</UI.SelectItem><UI.SelectItem value="review">In Prüfung</UI.SelectItem><UI.SelectItem value="approved">Freigegeben</UI.SelectItem></UI.SelectContent></UI.Select><UI.DropdownMenu><UI.DropdownMenuTrigger asChild><UI.Button variant="outline">Aktionen</UI.Button></UI.DropdownMenuTrigger><UI.DropdownMenuContent><UI.DropdownMenuLabel>Projekt</UI.DropdownMenuLabel><UI.DropdownMenuItem onSelect={()=>toast('Export angefragt')}>Exportieren</UI.DropdownMenuItem><UI.DropdownMenuSeparator/><UI.DropdownMenuItem onSelect={()=>toast('Link kopieren ausgewählt')}>Link kopieren</UI.DropdownMenuItem></UI.DropdownMenuContent></UI.DropdownMenu></div></DemoPanel>
 <DemoPanel id="tabs" title="Tabs" code={code.tabs} layout="fill"><UI.Tabs defaultValue="overview"><UI.TabsList aria-label="Projektansicht"><UI.TabsTrigger value="overview">Übersicht</UI.TabsTrigger><UI.TabsTrigger value="activity">Aktivität</UI.TabsTrigger></UI.TabsList><UI.TabsContent value="overview"><p>Mit Pfeiltasten zwischen Tabs wechseln.</p></UI.TabsContent><UI.TabsContent value="activity"><p>Heute 3 Änderungen, zuletzt um 14:20.</p></UI.TabsContent></UI.Tabs></DemoPanel>
 <DemoPanel id="popover-tooltip" title="Popover & Tooltip" code={code.popoverTooltip}><div className="demo-row"><UI.Popover><UI.PopoverTrigger asChild><UI.Button variant="outline">Hinweise</UI.Button></UI.PopoverTrigger><UI.PopoverContent aria-labelledby={popoverTitleId}><UI.PopoverTitle id={popoverTitleId}>Kontext zur Aktion</UI.PopoverTitle><p>Kurze ergänzende Informationen, ohne die Seite zu verlassen.</p></UI.PopoverContent></UI.Popover><UI.TooltipProvider><UI.Tooltip><UI.TooltipTrigger asChild><UI.Button variant="ghost">Fokus oder Hover</UI.Button></UI.TooltipTrigger><UI.TooltipContent>Zusätzliche Erklärung</UI.TooltipContent></UI.Tooltip></UI.TooltipProvider></div></DemoPanel>
 <DemoPanel id="card-separator" title="Card & Separator" code={code.cardSeparator} layout="fill"><UI.Card><UI.CardHeader><UI.CardTitle>Projektübersicht</UI.CardTitle><UI.CardDescription>Zusammengehörige Informationen</UI.CardDescription></UI.CardHeader><UI.CardContent>Status: In Prüfung<UI.Separator className="my-4"/>Verantwortung: Projektleitung</UI.CardContent></UI.Card></DemoPanel>
 <DemoPanel id="empty-state-skeleton" title="Empty State & Skeleton" code={code.emptySkeleton} layout="fill"><UI.EmptyState icon={Inbox} title="Keine Einträge" description="Neue Projekte erscheinen hier."/><div><UI.Skeleton className="h-4 w-3/4 mb-3"/><UI.Skeleton className="h-4 w-1/2"/></div></DemoPanel>
 <DemoPanel id="command" title="Command" code={code.command} layout="fill"><UI.Command label="Aktion suchen"><UI.CommandInput placeholder="Aktion suchen …"/><UI.CommandList label="Verfügbare Aktionen"><UI.CommandEmpty>Keine Aktion gefunden.</UI.CommandEmpty><UI.CommandGroup heading="Projekt"><UI.CommandItem onSelect={()=>toast('Projekt öffnen ausgewählt')}>Projekt öffnen</UI.CommandItem><UI.CommandItem onSelect={()=>toast('Einstellungen ausgewählt')}>Einstellungen</UI.CommandItem></UI.CommandGroup></UI.CommandList></UI.Command></DemoPanel>
 <DemoPanel id="lightbox-toaster" title="Lightbox & Toaster" description="Die Präsentationsgalerie zeigt alle 18 Muster vergrössert im Dialog." code={code.lightboxToaster}><a href="/praesentation">Zur Galerie</a><div className="demo-row"><UI.Button variant="outline" onClick={()=>toast.success('Änderung gespeichert')}>Erfolg</UI.Button><UI.Button variant="outline" onClick={()=>toast.error('Speichern fehlgeschlagen')}>Fehler</UI.Button></div></DemoPanel>
 </div>;
}
