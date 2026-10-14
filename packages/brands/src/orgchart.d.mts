export interface OrgDepartment {name:string;head:string;desc:string[];members:string[];sub?:{name:string;lead?:boolean}[]|null;color?:string|null}
export interface OrgData {title:string;asOf:string;legend?:string;direction:{name:string;head:string};departments:OrgDepartment[]}
export interface OrgOptions {primary:string;font?:string;monochrome?:boolean;omitTitle?:boolean;omitDesc?:boolean;responsive?:boolean;line?:string;text?:string;scale?:number}
export function renderOrgchart(data:OrgData,options:OrgOptions):string;
export function toPublicData(data:OrgData):OrgData;
export function toJsonLd(data:OrgData):object;
export function renderZustaendigkeiten(data:object,options:OrgOptions):string;
/** Department accent colours, assigned in order after the primary colour. */
export const DEPT_ACCENTS: readonly string[];
/** Mixes a hex colour with white; `white` is the white share from 0 to 1. */
export function tint(hex:string,white:number):string;
