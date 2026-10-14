export type SceneNode={kind:'rect'|'text'|'brand'|'chart'|'linechart'|'image';x:number;y:number;w:number;h:number;fill?:string;text?:string;pt?:number;color?:string;bold?:boolean;align?:'left'|'center'|'right';shape?:string;labels?:string[];series?:{name:string;values:number[];color:string}[];
 /** Deck contract extensions (only on brands with a deck block). */
 opacity?:number;stroke?:string;strokeOpacity?:number;strokePt?:number;radius?:number;glow?:{color:string;opacity:number;blurPt:number};
 caps?:boolean;trackingEm?:number;nowrap?:boolean;face?:string;punctuation?:{glyph:string;color:string;scale:number};path?:string;plate?:boolean;alt?:string;fit?:string;
 axisColor?:string;valueColor?:string;lineColor?:string;font?:string};
export type SceneBackground={color:string;path?:string;graphics?:{path:string;x:number;y:number;w:number;h:number;opacity?:number}[]};
export function slideScene(id:string,deck:Record<string,any>):{width:number;height:number;background?:SceneBackground;nodes:SceneNode[]};
