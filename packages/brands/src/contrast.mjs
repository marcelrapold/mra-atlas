import { semanticTokens } from './foundation.mjs';
// WCAG 2.x relative luminance and contrast ratio (sRGB, piecewise transfer).
export function relativeLuminance(hex) {
  const [r,g,b] = hex.slice(1).match(/../g).map(v => parseInt(v,16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
  return .2126*r + .7152*g + .0722*b;
}
export function contrast(a,b) {
  const x=relativeLuminance(a),y=relativeLuminance(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
// APCA 0.0.98G-4g (W3 base constants). Advisory only: WCAG 2.x stays the gate.
// Returns Lc, positive for dark text on light ground, negative for light on dark.
const A={trc:2.4,r:.2126729,g:.7151522,b:.072175,normBG:.56,normTXT:.57,revTXT:.62,revBG:.65,blkThrs:.022,blkClmp:1.414,scale:1.14,offset:.027,loClip:.1,deltaYmin:.0005};
const apcaY=hex=>{const [r,g,b]=hex.slice(1).match(/../g).map(v=>(parseInt(v,16)/255)**A.trc);const y=A.r*r+A.g*g+A.b*b;return y>A.blkThrs?y:y+(A.blkThrs-y)**A.blkClmp;};
export function apcaContrast(text,background) {
  const t=apcaY(text),bg=apcaY(background);
  if(Math.abs(bg-t)<A.deltaYmin)return 0;
  if(bg>t){const s=(bg**A.normBG-t**A.normTXT)*A.scale;return s<A.loClip?0:(s-A.offset)*100;}
  const s=(bg**A.revBG-t**A.revTXT)*A.scale;return s>-A.loClip?0:(s+A.offset)*100;
}
const text=(fg,bg)=>({fg,bg,min:4.5,use:'text'}),ui=(fg,bg)=>({fg,bg,min:3,use:'ui'});
/** Every foreground/background pairing the components actually render, incl. derived roles. */
export const contrastPairs=Object.freeze([
  ...[['foreground','background'],['card-foreground','card'],['popover-foreground','popover'],['muted-foreground','background'],['muted-foreground','muted'],['muted-foreground','card'],
    ['primary-foreground','primary'],['primary-hover-foreground','primary-hover'],['secondary-foreground','secondary'],['accent-foreground','accent'],
    ['destructive-foreground','destructive'],['success-foreground','success'],['warning-foreground','warning'],['info-foreground','info'],['sidebar-foreground','sidebar'],
    ['foreground','surface-info'],['foreground','surface-success'],['foreground','surface-warning'],['foreground','surface-danger'],
    ['primary','background'],['primary','card']].map(([f,b])=>text(f,b)),
  ...[['ring','background'],['ring','card'],['input','background'],['input','card'],
    ...[1,2,3,4,5].flatMap(i=>[[`chart-${i}`,'card'],[`chart-${i}`,'background']])].map(([f,b])=>ui(f,b)),
].map(Object.freeze));
/** Contrast of every pair in every mode the brand ships. `pass` compares WCAG 2.x against `min`. */
export function auditBrand(brand) {
  return Object.keys(brand.modes).flatMap(mode=>{
    const c=semanticTokens(brand,mode);
    return contrastPairs.map(({fg,bg,min,use})=>{const ratio=contrast(c[fg],c[bg]);return {brand:brand.id,mode,fg,bg,use,min,ratio,pass:ratio>=min,apca:apcaContrast(c[fg],c[bg])};});
  });
}
