'use client'

import { useState } from 'react'
import { BarChart3, CalendarDays, FolderKanban, Home, Inbox, Pause, Play, Plus, Settings, UserRound, Users } from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@rapold/framework-core'
import { PageHeader } from '@rapold/framework-core'
import { Section } from '@rapold/framework-core'
import {
  BottomNav,
  BottomNavFab,
  BottomNavItem,
  BottomStack,
} from '@rapold/framework-core'
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  getInitials,
} from '@rapold/framework-core'
import { Button } from '@rapold/framework-core'

import { DemoPanel } from '../demo-panel'

const team = ['Anna Meier', 'Luca Brunner', 'Sofia Keller', 'Noah Frei', 'Mia Graf', 'Elias Huber']

const navItems = [
  { id: 'start', label: 'Start', icon: <Home /> },
  { id: 'projekte', label: 'Projekte', icon: <FolderKanban /> },
  { id: 'termine', label: 'Termine', icon: <CalendarDays /> },
  { id: 'eingang', label: 'Eingang', icon: <Inbox /> },
]

const adminItems = [
  { id: 'uebersicht', label: 'Übersicht', icon: <Home /> },
  { id: 'auswertung', label: 'Auswertung', icon: <BarChart3 /> },
  { id: 'personen', label: 'Personen', icon: <Users /> },
  { id: 'projekte', label: 'Projekte', icon: <FolderKanban /> },
  { id: 'termine', label: 'Termine', icon: <CalendarDays /> },
  { id: 'eingang', label: 'Eingang', icon: <Inbox /> },
  { id: 'einstellungen', label: 'Einstellungen', icon: <Settings /> },
]

export function LayoutDemo() {
  const [active, setActive] = useState('start')
  const [adminActive, setAdminActive] = useState('uebersicht')
  const [playing, setPlaying] = useState(false)
  const [status, setStatus] = useState('')

  return (
    <div className="demo-grid">
      <DemoPanel
        id="page-header"
        title="Page Header"
        layout="fill"
        code={`import { PageHeader } from '@rapold/framework-core'

<PageHeader
  eyebrow="Projektportfolio"
  title="Kundenportal 2027"
  description="Planung, Budget und Freigaben."
  breadcrumb={<Breadcrumb>…</Breadcrumb>}
  actions={<Button>Freigeben</Button>}
/>`}
      >
        <PageHeader
          size="default"
          eyebrow="Projektportfolio"
          eyebrowTone="primary"
          title="Kundenportal 2027"
          description="Planung, Budget und Freigaben für den Relaunch des Kundenportals."
          breadcrumb={
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Start</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Projekte</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Kundenportal 2027</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          }
          actions={
            <>
              <Button variant="outline">Exportieren</Button>
              <Button>Freigeben</Button>
            </>
          }
        />
        <PageHeader size="compact" title="Live-Übersicht" description="Kompakte Variante für dichte Dashboards." />
      </DemoPanel>

      <DemoPanel
        id="breadcrumb"
        title="Breadcrumb"
        layout="fill"
        code={`import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
} from '@rapold/framework-core'

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="/">Start</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbPage>Budget 2027</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Start</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis label="Weitere Ebenen: Organisation, Bereiche" />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Finanzen</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Budget 2027</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p>Mit Router-Links: <code>{'<BreadcrumbLink asChild><Link href="/">Start</Link></BreadcrumbLink>'}</code></p>
      </DemoPanel>

      <DemoPanel
        id="section"
        title="Section"
        layout="fill"
        code={`import { Section } from '@rapold/framework-core'

<Section
  title="Nächste Termine"
  description="Die drei nächsten Meilensteine."
  icon={<CalendarDays />}
  actions={<Button size="sm">Alle anzeigen</Button>}
  spacing="md"
>
  …
</Section>`}
      >
        <Section
          spacing="sm"
          icon={<CalendarDays />}
          title="Nächste Termine"
          description="Die drei nächsten Meilensteine im Projekt."
          actions={<Button variant="outline" size="sm">Alle anzeigen</Button>}
        >
          <ul>
            <li>14. Januar – Kick-off mit der Geschäftsleitung</li>
            <li>3. Februar – Prototyp-Review</li>
            <li>17. März – Go-live Pilotgruppe</li>
          </ul>
        </Section>
      </DemoPanel>

      <DemoPanel
        id="avatar"
        title="Avatar & Avatar Group"
        code={`import {
  Avatar, AvatarImage, AvatarFallback, AvatarGroup, getInitials,
} from '@rapold/framework-core'

<Avatar size="lg">
  <AvatarImage src={user.avatarUrl} alt={user.name} />
  <AvatarFallback label={user.name}>{getInitials(user.name)}</AvatarFallback>
</Avatar>

<AvatarGroup label="Projektteam" max={4} total={12}>
  {members.map((m) => <Avatar key={m.id}>…</Avatar>)}
</AvatarGroup>`}
      >
        <div className="demo-row">
          <Avatar size="xl">
            <AvatarFallback label="Anna Meier">{getInitials('Anna Meier')}</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback label="luca.brunner@example.ch">{getInitials('luca.brunner@example.ch')}</AvatarFallback>
          </Avatar>
          <Avatar size="md" shape="square">
            <AvatarFallback label="Team Finanzen">
              <Users />
            </AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarFallback label="Unbekannte Person"><UserRound /></AvatarFallback>
          </Avatar>
        </div>
        <div className="demo-row">
          <AvatarGroup label="Projektteam" max={4} size="md">
            {team.map((name) => (
              <Avatar key={name}>
                <AvatarFallback label={name}>{getInitials(name)}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
          <AvatarGroup label="Zuhörende" max={3} total={1240} size="sm" spacing="tight">
            {team.slice(0, 3).map((name) => (
              <Avatar key={name}>
                <AvatarFallback label={name}>{getInitials(name)}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </div>
      </DemoPanel>

      <DemoPanel
        id="bottom-nav"
        title="Bottom Nav"
        description={<p>Vorschau im Fluss (<code>position=&quot;static&quot;</code>). In der App ist die Leiste fixiert und berücksichtigt die Safe Area.</p>}
        layout="fill"
        code={`import { BottomNav, BottomNavItem, BottomNavFab } from '@rapold/framework-core'

<BottomNav className="lg:hidden" fab={<BottomNavFab label="Neu"><Plus /></BottomNavFab>}>
  <BottomNavItem asChild label="Start" icon={<Home />} active={pathname === '/'}>
    <Link href="/" />
  </BottomNavItem>
  <BottomNavItem href="/projekte" label="Projekte" icon={<FolderKanban />} />
</BottomNav>`}
      >
        <div className="mt-20 overflow-hidden rounded-[var(--brand-radius)] border border-border">
          <BottomNav
            position="static"
            aria-label="Hauptnavigation (Vorschau)"
            fab={
              <BottomNavFab label="Neuen Eintrag erfassen" onClick={() => setStatus('Neuer Eintrag geöffnet.')}>
                <Plus />
              </BottomNavFab>
            }
          >
            {navItems.map((item) => (
              <BottomNavItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                active={active === item.id}
                onClick={() => setActive(item.id)}
              />
            ))}
          </BottomNav>
        </div>
        <p className="mt-6">Viele Ziele: horizontale Leiste mit Scroll-Snap.</p>
        <div className="overflow-hidden rounded-[var(--brand-radius)] border border-border">
          <BottomNav position="static" layout="scroll" aria-label="Verwaltung (Vorschau)">
            {adminItems.map((item) => (
              <BottomNavItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                active={adminActive === item.id}
                onClick={() => setAdminActive(item.id)}
              />
            ))}
          </BottomNav>
        </div>
        <p role="status" aria-live="polite">{status}</p>
      </DemoPanel>

      <DemoPanel
        id="bottom-stack"
        title="Bottom Stack"
        description={<p>Player-Leiste über der Navigation in einem Container; die Höhe steht als <code>--bottom-stack-height</code> bereit.</p>}
        layout="fill"
        code={`import { BottomStack, BottomStackSpacer, BottomNav } from '@rapold/framework-core'

<main>… <BottomStackSpacer /></main>
<BottomStack label="Wiedergabe und Navigation">
  <PlayerBar />
  <BottomNav position="static">…</BottomNav>
</BottomStack>`}
      >
        <div className="mt-20 overflow-hidden rounded-[var(--brand-radius)] border border-border">
          <BottomStack
            position="static"
            label="Wiedergabe und Navigation (Vorschau)"
            fab={
              <BottomNavFab label="Livestream starten" pulse={playing} onClick={() => setPlaying(true)}>
                <Play />
              </BottomNavFab>
            }
          >
            <div className="flex items-center gap-3 border-t border-border bg-card px-4 py-2">
              <Avatar size="md" shape="square">
                <AvatarFallback>Q4</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-sm font-medium text-foreground">Quartalsbericht Q4</p>
                <p className="m-0 truncate text-xs text-muted-foreground">Audiozusammenfassung · 12 Min.</p>
              </div>
              <Button
                size="icon-lg"
                variant="ghost"
                aria-label={playing ? 'Pause' : 'Abspielen'}
                aria-pressed={playing}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <Pause /> : <Play />}
              </Button>
            </div>
            <BottomNav position="static" aria-label="Hauptnavigation (Stack-Vorschau)">
              {navItems.slice(0, 3).map((item) => (
                <BottomNavItem
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  active={active === item.id}
                  onClick={() => setActive(item.id)}
                />
              ))}
            </BottomNav>
          </BottomStack>
        </div>
      </DemoPanel>
    </div>
  )
}
