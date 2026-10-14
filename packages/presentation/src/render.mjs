import PptxGenJS from 'pptxgenjs';
import {readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {presentationTheme} from '../../brands/src/presentation.mjs';
import JSZip from 'jszip';
import {localizeChartLabels} from './chart-labels.mjs';
export async function assetPath(root,relative){
 const base=await realpath(root),file=await realpath(path.resolve(base,relative));
 if(!file.startsWith(base+path.sep))throw new Error(`Asset must stay within its input directory: ${relative}`);
 return file;
}
// Deck contract images (backdrops, logos, supergraphics) are canonical repository files.
const repositoryRoot=fileURLToPath(new URL('../../../',import.meta.url));
async function deckImage(root,relative){
 if(/\.svg$/i.test(relative))throw new Error(`Deck images must be PNG or JPG, not SVG: ${relative}. Rasterise the source with node scripts/build-deck-assets.mjs.`);
 return assetPath(root,relative);
}
const transparency=opacity=>Math.round((1-opacity)*100);
const heavyFace=/\b(semibold|demibold|bold|extrabold|black|heavy|medium)\b/i;
export async function renderScenes(brand,scenes,{title=brand.name,notes=[],assetRoot,imageRoot=assetRoot,deckRoot=repositoryRoot}={}){
 const theme=presentationTheme(brand),pptx=new PptxGenJS(),d=theme.deck,labelColors=[];let runs=false;
 pptx.layout='LAYOUT_WIDE';pptx.author='Design Framework';pptx.title=title;pptx.lang='de-CH';pptx.theme={headFontFace:d?.type.headingFace??brand.typography.headingFamily??theme.typography.family,bodyFontFace:d?.type.bodyFace??brand.typography.bodyFamily??theme.typography.family,lang:'de-CH'};
 let logo;
 if(brand.assets?.logo&&!d){const spec=brand.assets.logo,file=await assetPath(assetRoot,spec.path);logo={...spec,file};}
 for(const [index,scene] of scenes.entries()){
  const slide=pptx.addSlide();
  if(scene.background){
   const b=scene.background;
   slide.background=b.path?{path:await deckImage(deckRoot,b.path)}:{color:b.color.slice(1)};
   for(const g of b.graphics??[])slide.addImage({path:await deckImage(deckRoot,g.path),x:g.x/2.54,y:g.y/2.54,w:g.w/2.54,h:g.h/2.54,...(g.opacity!==undefined?{transparency:transparency(g.opacity)}:{}),altText:''});
  }
  for(const n of scene.nodes){
   const pos={x:n.x/2.54,y:n.y/2.54,w:n.w/2.54,h:n.h/2.54};
   if(!Object.values(pos).every(Number.isFinite)||pos.w<0||pos.h<0)throw new Error(`Invalid geometry on slide ${index+1}`);
   if(n.kind==='chart'||n.kind==='linechart'){
    const styled=n.axisColor?{catAxisLabelColor:n.axisColor.slice(1),valAxisLabelColor:n.axisColor.slice(1),legendColor:n.axisColor.slice(1),legendFontFace:n.font,catAxisLabelFontFace:n.font,dataLabelColor:n.valueColor.slice(1),dataLabelFontFace:n.font}:{};
    slide.addChart(n.kind==='chart'?pptx.ChartType.bar:pptx.ChartType.line,n.series.map(s=>({name:s.name,labels:n.labels??s.values.map((_,i)=>String(i+1)),values:s.values})),{...pos,barDir:'col',catAxisLabelFontFace:theme.typography.family,catAxisLabelFontSize:9,valAxisLabelFontSize:9,showLegend:true,showValue:n.kind==='chart',showCatName:false,showTitle:false,showBorder:false,legendPos:'b',legendFontSize:9,chartColors:n.series.map(s=>s.color.slice(1)),valAxisHidden:true,showShadow:false,catAxisLineColor:(n.lineColor??theme.colors.border).slice(1),valGridLine:{style:'none'},dataLabelFormatCode:'0.00',...styled});
    labelColors.push(n.valueColor??null);
   }else if(n.kind==='rect'){
    const shape=n.radius?'roundRect':n.shape??'rect',fill={color:n.fill.slice(1),...(n.opacity!==undefined?{transparency:transparency(n.opacity)}:{})};
    const line=n.stroke?{color:n.stroke.slice(1),transparency:transparency(n.strokeOpacity??1),width:n.strokePt??.75}:{transparency:100};
    // Glow: pptxgenjs turns offset 0 into 4 pt at 270°, so a 1-EMU offset keeps it centred.
    slide.addShape(pptx.ShapeType[shape],{...pos,line,fill,...(n.radius?{rectRadius:n.radius/2.54}:{}),...(n.glow?{shadow:{type:'outer',color:n.glow.color.slice(1),opacity:n.glow.opacity,blur:n.glow.blurPt,offset:1e-4,angle:0}}:{})});
   }else if(n.kind==='brand'&&n.path){
    // Deck logos: variant chosen by surface luminance, no plate, raster only.
    slide.addImage({path:await deckImage(deckRoot,n.path),...pos,altText:brand.name});
   }else if(n.kind==='brand'&&logo){
    slide.addShape(pptx.ShapeType.rect,{...pos,line:{transparency:100},fill:{color:logo.background.slice(1)}});
    const w=Math.min(pos.w*(1-2*logo.padding),pos.h*(1-2*logo.padding)*logo.aspectRatio),h=w/logo.aspectRatio;
    slide.addImage({path:logo.file,x:pos.x+(pos.w-w)/2,y:pos.y+(pos.h-h)/2,w,h,altText:brand.name});
   }else if(n.kind==='image'){
    const file=await assetPath(imageRoot,n.path);
    slide.addImage({path:file,...pos,sizing:{type:n.fit==='cover'?'cover':'contain',w:pos.w,h:pos.h},altText:n.alt});
   }else if(d){
    const face=n.face??(n.bold?d.type.headingFace:d.type.bodyFace),pt=n.pt??11,body=n.kind==='brand'?brand.name:n.text??'';
    const options={...pos,fontFace:face,fontSize:pt,bold:Boolean(n.bold&&d.type.headingWeight>=600&&!heavyFace.test(face)),color:n.color?.slice(1)??theme.colors.text.slice(1),margin:0,align:n.align??'left',valign:'top',paraSpaceAfterPt:0,lang:'de-CH',...(n.caps?{charSpacing:Math.round(n.trackingEm*pt*100)/100}:{}),...(n.nowrap?{wrap:false}:{})};
    runs||=Boolean(n.punctuation);
    slide.addText(n.punctuation?[{text:body},{text:n.punctuation.glyph,options:{color:n.punctuation.color.slice(1),fontSize:Math.max(1,Math.round(pt*n.punctuation.scale))}}]:body,options);
   }else slide.addText(n.kind==='brand'?brand.name:n.text??'',{...pos,fontFace:(n.bold?brand.typography.headingFamily:brand.typography.bodyFamily)??theme.typography.family,fontSize:n.pt??11,bold:Boolean(n.bold && brand.typography.headingWeight>=600),color:n.color?.slice(1)??theme.colors.text.slice(1),margin:0,align:n.align??'left',valign:'top',paraSpaceAfterPt:0,lang:'de-CH'});
  }
  if(notes[index])slide.addNotes(notes[index]);
 }
 const buffer=await localizeChartLabels(await pptx.write({outputType:'nodebuffer'}),labelColors);
 return runs?singleParagraphProperties(buffer):buffer;
}
// pptxgenjs repeats <a:pPr> before every run of a multi-run paragraph; OOXML allows one, first.
async function singleParagraphProperties(buffer){
 const zip=await JSZip.loadAsync(buffer);
 for(const name of Object.keys(zip.files).filter(p=>/^ppt\/slides\/slide\d+\.xml$/.test(p)))zip.file(name,(await zip.file(name).async('string')).replace(/<\/a:r><a:pPr\b[^>]*?(?:\/>|>[\s\S]*?<\/a:pPr>)/g,'</a:r>'));
 return zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'});
}
