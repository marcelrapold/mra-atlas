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
  readonly sources: readonly string[];
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

export const foundation: Record<string,any>;
export function resolveFoundation(brand: Brand): Record<string,any>;
export function semanticTokens(brand: Brand, mode?: Mode): Record<string,string>;
export function tokenDocument(brand: Brand, mode?: Mode): Record<string,any>;
export function dtcgTokens(brand: Brand, mode?: Mode): Record<string,any>;
