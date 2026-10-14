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
  readonly tokens?: BrandTokenOverrides;
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

export const requiredBrandKeys: readonly ('schemaVersion' | 'id' | 'name' | 'version' | 'status' | 'modes' | 'typography' | 'shape' | 'sources')[];
export const optionalBrandKeys: readonly ('palette' | 'tokens' | 'assets' | 'presentation' | 'genAI' | 'deck')[];

// ---- Foundation scales (foundation.json) ----
export type SpacingKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24';
export type FontSizeKey = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
export type LineHeightKey = 'tight' | 'heading' | 'body' | 'code';
export type FontWeightKey = 'regular' | 'medium' | 'semibold' | 'bold';
export type RadiusKey = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type BorderWidthKey = 'thin' | 'medium' | 'focus';
export type OpacityKey = 'disabled' | 'overlay' | 'hover';
export type DurationKey = 'instant' | 'fast' | 'normal' | 'slow' | 'deliberate' | 'exit' | 'reduced';
export type EasingKey = 'standard' | 'enter' | 'exit' | 'drawer';
export type BreakpointKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type LayoutKey = 'sidebar' | 'rail' | 'header' | 'footer' | 'content' | 'reading';
export type ZIndexKey = 'base' | 'sticky' | 'dropdown' | 'overlay' | 'modal' | 'toast' | 'tooltip';
export type IconKey = 'sm' | 'md' | 'lg' | 'stroke';
/** CSS length (`16px`, `1rem`), duration (`200ms`) or `cubic-bezier(…)`. */
export type CssValue = string;
/** Exact shape of every foundation group: CSS strings or plain numbers. */
export interface FoundationScales {
  spacing: Record<SpacingKey,CssValue>;
  fontSize: Record<FontSizeKey,CssValue>;
  lineHeight: Record<LineHeightKey,number>;
  fontWeight: Record<FontWeightKey,number>;
  radius: Record<RadiusKey,CssValue>;
  borderWidth: Record<BorderWidthKey,CssValue>;
  opacity: Record<OpacityKey,number>;
  duration: Record<DurationKey,CssValue>;
  easing: Record<EasingKey,CssValue>;
  breakpoint: Record<BreakpointKey,CssValue>;
  layout: Record<LayoutKey,CssValue>;
  zIndex: Record<ZIndexKey,number>;
  icon: Record<Exclude<IconKey,'stroke'>,CssValue> & {stroke: number};
}
export type FoundationGroup = keyof FoundationScales;
/** Known keys are typed; the string index keeps dynamic lookups (`scale[key]`) compiling. */
type Lookup<T> = Readonly<T> & Readonly<Record<string,T[keyof T]>>;
export type Foundation = {readonly schemaVersion: number; readonly provenance: string} & {readonly [G in FoundationGroup]: Lookup<FoundationScales[G]>};
/** Brand overrides: an existing group and key, same value type as the baseline. */
export type BrandTokenOverrides = {readonly [G in FoundationGroup]?: Readonly<Partial<FoundationScales[G]>>};
export const foundation: Foundation;
export function resolveFoundation(brand: Brand): Foundation;

// ---- Colour roles ----
export type DerivedColorKey = 'info' | 'info-foreground' | 'sidebar' | 'sidebar-foreground' | 'sidebar-accent' | 'sidebar-border' | 'overlay' | 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5' | 'surface-info' | 'surface-success' | 'surface-warning' | 'surface-danger';
export type SemanticColorKey = ColorKey | DerivedColorKey;
/** Hex value per role. Known roles are typed; the string index keeps dynamic lookups compiling. */
export type SemanticTokens = Readonly<Record<SemanticColorKey,string>> & Readonly<Record<string,string>>;
export const derivedColorKeys: readonly DerivedColorKey[];
export function semanticTokens(brand: Brand, mode?: Mode): SemanticTokens;
export interface TokenDocument {schemaVersion: 1; brand: string; mode: Mode; foundation: Foundation; semantic: SemanticTokens; palette: Readonly<Record<string,string>>; typography: Brand['typography']; shape: Brand['shape']}
export function tokenDocument(brand: Brand, mode?: Mode): TokenDocument;

// ---- DTCG 2025.10 ----
export type DtcgType = 'color' | 'dimension' | 'duration' | 'number' | 'fontWeight' | 'fontFamily' | 'cubicBezier' | 'typography' | 'shadow';
/** Curly-brace reference to another token, e.g. `{color.primary}`. */
export type DtcgAlias = `{${string}}`;
export interface DtcgColor {colorSpace: 'srgb'; components: [number,number,number]; alpha: number; hex: string}
export interface DtcgDimension {value: number; unit: 'px' | 'rem'}
export interface DtcgDuration {value: number; unit: 'ms' | 's'}
export interface DtcgTypography {fontFamily: string[] | DtcgAlias; fontSize: DtcgDimension | DtcgAlias; fontWeight: number | DtcgAlias; letterSpacing: DtcgDimension | DtcgAlias; lineHeight: number | DtcgAlias}
export interface DtcgShadow {color: DtcgColor; offsetX: DtcgDimension; offsetY: DtcgDimension; blur: DtcgDimension; spread: DtcgDimension}
export type DtcgValue = DtcgColor | DtcgDimension | DtcgDuration | number | string[] | [number,number,number,number] | DtcgTypography | DtcgShadow | DtcgAlias;
export interface DtcgToken {$type: DtcgType; $value: DtcgValue; $description?: string; $deprecated?: boolean | string; $extensions?: Record<string,unknown>}
export interface DtcgGroup {$description?: string; [name: string]: DtcgToken | DtcgGroup | string | undefined}
/** A DTCG token file: nested groups whose leaves carry `$value`. */
export type DtcgDocument = DtcgGroup;
export interface DtcgResolverSource {$ref: string}
export interface DtcgResolverDocument {
  name: string; version: '2025.10'; description?: string;
  sets: Record<string,{description?: string; sources: DtcgResolverSource[]}>;
  modifiers: Record<string,{description?: string; contexts: Partial<Record<Mode,DtcgResolverSource[]>>; default?: Mode}>;
  resolutionOrder: DtcgResolverSource[];
}
/** Mode-independent tokens: palette, scales, font, typography, shadow, shape. */
export function dtcgFoundation(brand: Brand): DtcgDocument;
/** The `color` group of one mode; derived roles alias their base role. */
export function dtcgColors(brand: Brand, mode?: Mode): DtcgDocument;
/** Merged legacy document; root colour roles are deprecated copies of `color.*`. */
export function dtcgTokens(brand: Brand, mode?: Mode): DtcgDocument;
/** Resolver 2025.10: foundation set plus a `mode` modifier with the brand's own modes. */
export function dtcgResolver(brand: Brand): DtcgResolverDocument;

// ---- CSS ----
export interface CssVariableSets {shared: Record<string,string | number>; modes: {light: Record<string,string>; dark?: Record<string,string>}}
export function cssVariableSets(brand: Brand): CssVariableSets;
/** One stylesheet: `:where([data-brand])` with light-dark() roles, `data-mode` forces a scheme. */
export function toCssText(brand: Brand): string;

// ---- Contrast ----
export interface ContrastPair {readonly fg: SemanticColorKey; readonly bg: SemanticColorKey; readonly min: 4.5 | 3; readonly use: 'text' | 'ui'}
export interface ContrastResult {brand: string; mode: Mode; fg: SemanticColorKey; bg: SemanticColorKey; use: 'text' | 'ui'; min: number; ratio: number; pass: boolean; apca: number}
export const contrastPairs: readonly ContrastPair[];
export function auditBrand(brand: Brand): ContrastResult[];
/** APCA 0.0.98G Lc (advisory): positive for dark text on light ground. */
export function apcaContrast(text: string, background: string): number;
