const path=require('path');const sharp=require('sharp');
const fs=require('fs');const [,,src,dst]=process.argv;
(async()=>{for(const f of fs.readdirSync(src).filter(f=>f.endsWith('.svg'))){const svg=fs.readFileSync(path.join(src,f));const m=/viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg.toString());const w=+m[1];const scale=f.startsWith('check-sizes')?2:(w<=300?4:(w<1000?2:1.5));const bg=/light|black/.test(f)?'#F4FAFF':'#050B19';
await sharp(svg,{density:72*scale}).flatten({background:bg}).png().toFile(path.join(dst,f.replace('.svg','.png')));console.log('ok',f);}})();
