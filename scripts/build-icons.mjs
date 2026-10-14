import {mkdir,writeFile,copyFile,readFile} from 'node:fs/promises';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {icons} from 'lucide-react';
const root=new URL('../apps/docs/public/icons/',import.meta.url);
await mkdir(root,{recursive:true});
const names=Object.keys(icons).filter(n=>!n.endsWith('Icon')&&!n.startsWith('Lucide')).sort();
for(const name of names)await writeFile(new URL(`${name}.svg`,root),renderToStaticMarkup(createElement(icons[name],{size:24,strokeWidth:1.5,xmlns:'http://www.w3.org/2000/svg'}))+'\n');
const pkg=JSON.parse(await readFile(new URL('../node_modules/lucide-react/package.json',import.meta.url),'utf8'));
await writeFile(new URL('index.json',root),JSON.stringify({library:'lucide-react',version:pkg.version,license:'ISC',sizes:[16,20,24],strokeWidth:1.5,icons:names.map(name=>({name,svg:`/icons/${name}.svg`,react:`import { ${name} } from 'lucide-react'`}))},null,2)+'\n');
// Bare name list for the docs gallery: /icons renders mask tiles from the SVGs above instead of bundling the Lucide namespace.
await writeFile(new URL('names.json',root),JSON.stringify(names)+'\n');
await copyFile(new URL('../node_modules/lucide-react/LICENSE',import.meta.url),new URL('LICENSE.txt',root));
console.log(`Generated ${names.length} neutral Lucide SVGs.`);
