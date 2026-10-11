import {
  Activity, BadgeInfo, BarChart3, Bell, Bot, Boxes, ClipboardCheck,
  ClipboardCopy, Database, Fingerprint, HeartPulse, Images, Inbox,
  KeyRound, Layers, Layout, LayoutDashboard, Mail, Maximize2,
  Network, Palette, Presentation, ScrollText, ShieldCheck, Skull, Sparkles,
  Type, Wand2, Waypoints, Workflow, Accessibility, Ruler, type LucideIcon,
} from 'lucide-react';

// One semantic Lucide icon per page and navigation group.
export const pageIcons: Record<string, LucideIcon> = {
  overview: BadgeInfo, brand: Fingerprint, tokens: Palette,
  typography: Type, layout: Ruler, icons: Sparkles, content: Images,
  organigramm: Network, techstack: ScrollText, praesentation: Presentation,
  praesentationslogik: Workflow, 'prompt-compiler': Wand2,
  'prompt-vorlagen': ClipboardCopy, agenten: Bot, navigation: Layout,
  components: Boxes, toasts: Bell, 'empty-states': Inbox, skeletons: Skull,
  lightbox: Maximize2, mermaid: Workflow, tables: Database, forms: ClipboardCheck,
  dashboard: LayoutDashboard, charts: BarChart3, dataviz: BarChart3,
  'login-pattern': KeyRound, 'auth-flow': ShieldCheck, 'mail-templates': Mail,
  motion: Waypoints, 'marketing-hero': Wand2, 'health-status': HeartPulse,
  engineering: ScrollText, accessibility: Accessibility,
};
export const groupIcons: Record<string, LucideIcon> = {
  Einstieg: Layers, Marke: Fingerprint, Agenten: Bot, Komponenten: Boxes,
  Daten: Database, Abläufe: Workflow, Motion: Waypoints, Betrieb: Activity,
};
