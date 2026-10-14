import JSZip from 'jszip';

// Explicit point labels: Office's display locale must not change CH notation.
// Numeric series and the embedded workbook remain editable. Regenerate labels after data edits.
// colors[i] (optional '#RRGGBB') tints the labels of the i-th chart in insertion order.
export async function localizeChartLabels(buffer,colors=[]) {
 const zip=await JSZip.loadAsync(buffer),number=p=>Number(p.match(/(\d+)\.xml$/)[1]);
 // pptxgenjs numbers charts with a process-wide counter; sorted order is insertion order.
 const charts=Object.keys(zip.files).filter(p=>/^ppt\/charts\/chart\d+\.xml$/.test(p)).sort((a,b)=>number(a)-number(b));
 for(const [i,name] of charts.entries()){
  const xml=await zip.file(name).async('string'),color=colors[i];
  // Dense time series use axes and a legend; labels at every point would overlap.
  if(xml.includes('<c:lineChart>'))continue;
  zip.file(name,xml.replace(/<c:ser>[\s\S]*?<\/c:ser>/g,series=>{
   const values=series.match(/<c:val>[\s\S]*?<\/c:val>/)?.[0];
   if(!values)return series;
   const labels=[...values.matchAll(/<c:pt idx="(\d+)">\s*<c:v>([^<]+)<\/c:v>\s*<\/c:pt>/g)].map(([,idx,v])=>{
    const value=Number(v);if(!Number.isFinite(value))throw new Error(`Invalid chart value: ${v}`);
    const label=value.toFixed(2).replace('.',',').replace('-','−');
    return `<c:dLbl><c:idx val="${idx}"/><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="de-CH" sz="900" b="1"${color?`><a:solidFill><a:srgbClr val="${color.slice(1).toUpperCase()}"/></a:solidFill></a:rPr>`:'/>'}<a:t>${label}</a:t></a:r></a:p></c:rich></c:tx><c:showLegendKey val="0"/><c:showVal val="0"/><c:showCatName val="0"/><c:showSerName val="0"/></c:dLbl>`;
   }).join('');
   const block=`<c:dLbls>${labels}<c:showVal val="0"/></c:dLbls>`;
   return series.includes('<c:dLbls>')?series.replace(/<c:dLbls>[\s\S]*?<\/c:dLbls>/,block):series.replace(/<c:cat>/,block+'<c:cat>');
  }));
 }
 return zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'});
}
