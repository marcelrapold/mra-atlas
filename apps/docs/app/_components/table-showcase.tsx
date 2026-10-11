'use client';
import {useRef,useState} from 'react';
import {ArrowDown,ArrowUp,ArrowUpDown,ChevronLeft,ChevronRight,Search,X} from 'lucide-react';
import {useReactTable,getCoreRowModel,getFilteredRowModel,getSortedRowModel,getPaginationRowModel,flexRender,type ColumnDef,type SortingState} from '@tanstack/react-table';
import {Badge,Button,Input} from '@rapold/framework-core';

type Row={id:string;name:string;team:string;type:string;status:string;updated:string;coverage:number};
const names=['Navigation','Design-Tokens','Präsentation','Formulare','Tabellen','Diagramme','Benachrichtigungen','Typografie','Suche','Bildwelt'];
const teams=['Design','Engineering','Produkt','Betrieb'];
const data:Row[]=Array.from({length:250},(_,i)=>({
  id:`DS-${String(i+1).padStart(3,'0')}`,name:names[i%names.length],team:teams[i%teams.length],
  type:['Komponente','Muster','Vertrag'][i%3],status:['Entwurf','In Prüfung','Freigegeben'][Math.floor(i/2)%3],
  updated:`2026-09-${String(1+i%11).padStart(2,'0')}`,coverage:60+i%41,
}));
const columns:ColumnDef<Row>[]=[
  {accessorKey:'id',header:'Referenz',cell:info=><span className="table-code">{String(info.getValue())}</span>},
  {accessorKey:'name',header:'Baustein',cell:info=><span className="table-name">{String(info.getValue())}</span>},
  {accessorKey:'team',header:'Team',enableSorting:false,cell:info=><Badge variant="outline">{String(info.getValue())}</Badge>},
  {accessorKey:'type',header:'Typ',enableSorting:false,cell:info=><span className="table-secondary">{String(info.getValue())}</span>},
  {accessorKey:'status',header:'Status',enableSorting:false,cell:info=>{const status=String(info.getValue());return <Badge variant={status==='Freigegeben'?'default':status==='Entwurf'?'secondary':'outline'}>{status}</Badge>;}},
  {accessorKey:'updated',header:'Aktualisiert',cell:info=><time className="table-code" dateTime={String(info.getValue())}>{String(info.getValue()).split('-').reverse().join('.')}</time>},
  {accessorKey:'coverage',header:'Abdeckung',cell:info=><span className="table-number">{String(info.getValue())}<span className="table-secondary"> %</span></span>},
];
const pattern=`const table = useReactTable({
  data, columns,
  state: { sorting, globalFilter: search },
  onSortingChange: setSorting,
  onGlobalFilterChange: setSearch,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageSize: 12 } }
});`;

export default function TableShowcase(){
  const searchInput=useRef<HTMLInputElement>(null);
  const [search,setSearch]=useState(''),[sorting,setSorting]=useState<SortingState>([]);
  const table=useReactTable({data,columns,state:{globalFilter:search,sorting},onGlobalFilterChange:setSearch,onSortingChange:setSorting,getCoreRowModel:getCoreRowModel(),getFilteredRowModel:getFilteredRowModel(),getSortedRowModel:getSortedRowModel(),getPaginationRowModel:getPaginationRowModel(),initialState:{pagination:{pageSize:12}}});
  const filtered=table.getFilteredRowModel().rows.length;
  const pageIndex=table.getState().pagination.pageIndex;
  const resetSearch=()=>{setSearch('');table.setPageIndex(0);searchInput.current?.focus();};
  return <>
    <div className="table-toolbar"><div className="table-search"><Search size={16} aria-hidden="true"/><Input ref={searchInput} type="search" aria-label="Bausteine suchen" placeholder="Suchen – z. B. Design, Tabellen, DS-042 …" value={search} onChange={e=>{setSearch(e.target.value);table.setPageIndex(0);}}/>{search&&<button className="icon-button" aria-label="Suche zurücksetzen" onClick={resetSearch}><X size={14}/></button>}</div><p role="status">{filtered} von {data.length} Bausteinen</p></div>
    <div className="refined-table" role="region" aria-label="Bausteine – horizontal scrollbar" tabIndex={0}><table>
      <caption className="sr-only">250 illustrative Framework-Bausteine. Referenz, Name, Datum und Abdeckung sind sortierbar.</caption>
      <thead>{table.getHeaderGroups().map(group=><tr key={group.id}>{group.headers.map(header=>{const sorted=header.column.getIsSorted();const Icon=sorted==='asc'?ArrowUp:sorted==='desc'?ArrowDown:ArrowUpDown;return <th scope="col" key={header.id} className={header.id==='coverage'?'table-align-number':undefined} aria-sort={header.column.getCanSort()?(sorted==='asc'?'ascending':sorted==='desc'?'descending':'none'):undefined}>
        {header.column.getCanSort()?<button onClick={header.column.getToggleSortingHandler()} aria-label={`${header.column.columnDef.header}: ${header.column.getNextSortingOrder()==='asc'?'aufsteigend sortieren':header.column.getNextSortingOrder()==='desc'?'absteigend sortieren':'Sortierung aufheben'}`}>{flexRender(header.column.columnDef.header,header.getContext())}<Icon size={12} aria-hidden="true"/></button>:flexRender(header.column.columnDef.header,header.getContext())}
      </th>;})}</tr>)}</thead>
      <tbody>{table.getRowModel().rows.length?table.getRowModel().rows.map(row=><tr key={row.id}>{row.getVisibleCells().map(cell=><td key={cell.id} className={cell.column.id==='coverage'?'table-align-number':undefined}>{flexRender(cell.column.columnDef.cell,cell.getContext())}</td>)}</tr>):<tr><td colSpan={columns.length} className="table-empty"><Search size={22} aria-hidden="true"/><strong>Keine Treffer für «{search}».</strong><p>Versuche einen anderen Begriff oder setze die Suche zurück.</p><Button variant="outline" size="sm" onClick={resetSearch}>Suche zurücksetzen</Button></td></tr>}</tbody>
    </table></div>
    <div className="table-pagination"><span role="status">Seite {pageIndex+1} von {Math.max(1,table.getPageCount())}{filtered>0&&` · ${pageIndex*table.getState().pagination.pageSize+1}–${Math.min((pageIndex+1)*table.getState().pagination.pageSize,filtered)} von ${filtered}`}</span><div className="table-page-controls"><label>Zeilen<select aria-label="Zeilen pro Seite" value={table.getState().pagination.pageSize} onChange={e=>table.setPageSize(Number(e.target.value))}>{[12,24,48].map(size=><option key={size} value={size}>{size}</option>)}</select></label><Button variant="outline" size="sm" disabled={!table.getCanPreviousPage()} onClick={()=>table.previousPage()}><ChevronLeft size={15}/>Zurück</Button><Button variant="outline" size="sm" disabled={!table.getCanNextPage()} onClick={()=>table.nextPage()}>Weiter<ChevronRight size={15}/></Button></div></div>
    <section className="doc-section"><h2>Pattern</h2><p>Kompakte Zeilen, ruhige Konturen und Badges nach dem Atlas-Tabellenmuster. Kennungen und Zahlen stehen in Monospace, numerische Werte sind rechtsbündig. Die Suche durchsucht den vollständigen Datensatz vor der Pagination.</p><pre><code>{pattern}</code></pre><p className="muted">TanStack Table · 250 illustrative Datensätze · lokale Suche, Sortierung und Pagination. Auf kleinen Bildschirmen bleibt die Tabelle innerhalb ihres Rahmens horizontal scrollbar.</p></section>
  </>;
}
