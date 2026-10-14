export type Mode = 'light' | 'dark';
export type ColorKey = 'background' | 'foreground' | 'card' | 'card-foreground' | 'popover' | 'popover-foreground' | 'primary' | 'primary-foreground' | 'primary-hover' | 'primary-hover-foreground' | 'secondary' | 'secondary-foreground' | 'muted' | 'muted-foreground' | 'accent' | 'accent-foreground' | 'destructive' | 'destructive-foreground' | 'success' | 'success-foreground' | 'warning' | 'warning-foreground' | 'border' | 'input' | 'ring';
export interface Brand {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly status: 'baseline' | 'draft' | 'approved';
  readonly modes: { readonly light: Readonly<Record<ColorKey,string>>; readonly dark?: Readonly<Record<ColorKey,string>> };
  readonly typography: { readonly family: string; readonly bodyWeight: number; readonly headingWeight: number; readonly bodyFamily?: string; readonly headingFamily?: string };
  readonly shape: { readonly radius: string; readonly shadow: string; readonly buttonMinHeight: string };
  readonly assets?: {readonly logo: {readonly path:string; readonly aspectRatio:number; readonly background:string; readonly padding:number}};
  readonly tokens?: Readonly<Record<string,Record<string,string | number>>>;
  readonly palette?: Readonly<Record<string,string>>;
  readonly presentation?: {
    readonly editorialDarkSurfaces?: boolean;
    readonly preferIconsForConcepts?: boolean;
    readonly preferMermaidForSystems?: boolean;
    readonly logoOnCover?: boolean;
    readonly preferredDiagramShare?: string;
    readonly preferredGenAiImages?: string;
  };
  readonly genAI?: {
    readonly contract?: string;
    readonly families?: readonly string[];
    readonly maxKeyVisualsPer12Slides?: number;
    readonly logoGeneratedInImage?: boolean;
  };
  readonly deck?: DeckContract;
  readonly sources: readonly string[];
}
export type DeckLayout = 'cover' | 'section' | 'content' | 'closing';
export type DeckAnchor = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
/** Hex colour or a palette key. */
export type DeckColor = string;
export interface DeckSurface { readonly fill: string; readonly backdrop?: string; readonly logo?: boolean | {readonly anchor?: DeckAnchor; readonly heightCm?: number}; readonly mode?: Mode; readonly textWidthCm?: number }
export interface DeckMaterial { readonly fill: string; readonly fillOpacity: number; readonly border: string; readonly borderOpacity: number; readonly borderPt: number; readonly radiusCm: number; readonly highlight?: {readonly color: string; readonly opacity: number} }
export interface DeckGraphic { readonly path: string; readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly opacity?: number }
/** Render contract for decks. Image paths: brands/<id>/…, PNG or JPG. */
export interface DeckContract {
  readonly mode: Mode;
  readonly surfaces: {readonly cover: DeckSurface; readonly section: DeckSurface; readonly content: DeckSurface; readonly closing?: DeckSurface};
  readonly materials: {readonly panel: DeckMaterial; readonly panelRaised: DeckMaterial; readonly window?: DeckMaterial};
  readonly glow: {readonly color: DeckColor; readonly opacity: number; readonly blurPt: number};
  readonly accents: {readonly primary?: DeckColor; readonly signal?: DeckColor; readonly chart: readonly DeckColor[]; readonly chartPrevious?: DeckColor};
  readonly type: {readonly headingFace: string; readonly bodyFace: string; readonly displayFace?: string; readonly labelFace?: string; readonly headingWeight?: number; readonly capsTrackingEm: number; readonly displayScale?: number};
  readonly logo: {readonly onDark: string; readonly onLight: string; readonly aspectRatio: number; readonly heightCm: number; readonly anchor: DeckAnchor; readonly plate: false; readonly marginCm?: number};
  readonly supergraphic?: {readonly cover?: DeckGraphic; readonly section?: DeckGraphic; readonly closing?: DeckGraphic};
  readonly punctuation?: {readonly glyph: string; readonly onDark: DeckColor; readonly onLight: DeckColor; readonly scale?: number; readonly append?: boolean};
}
export const colorKeys: readonly ColorKey[];
export function defineBrand(input: unknown): Brand;
export const neutral: Brand;
export const dominicanoExpress: Brand;
export const radiox: Brand;
export const rapold: Brand;
export const brands: readonly Brand[];
export function toCssVariables(brand: Brand, mode?: Mode): Record<string,string | number>;
export function contrast(a: string,b: string): number;
export function relativeLuminance(hex: string): number;
export const deckLayouts: readonly DeckLayout[];
export const deckAnchors: readonly DeckAnchor[];
export function surfaceMode(surface: DeckSurface): Mode;
export function deckAssetPaths(brand: Brand): string[];

export const foundation: Record<string,any>;
export function resolveFoundation(brand: Brand): Record<string,any>;
export function semanticTokens(brand: Brand, mode?: Mode): Record<string,string>;
export function tokenDocument(brand: Brand, mode?: Mode): Record<string,any>;
export function dtcgTokens(brand: Brand, mode?: Mode): Record<string,any>;
