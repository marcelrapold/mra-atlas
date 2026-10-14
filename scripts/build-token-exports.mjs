// Token exports per brand, next to the legacy tokens.{mode}.* files:
//   tokens.foundation.dtcg.json   mode-independent DTCG tokens
//   tokens.color.{mode}.dtcg.json colour roles of each mode the brand ships
//   tokens.resolver.json          DTCG Resolver 2025.10 tying the two together
//   tokens.css                    one stylesheet, light-dark() per colour role
// Standalone: node scripts/build-token-exports.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { brands, dtcgFoundation, dtcgColors, dtcgResolver, toCssText } from '../packages/brands/src/index.mjs';

const json=value=>JSON.stringify(value,null,2)+'\n';
/** Writes the four export kinds for one brand into `dir` (a directory URL or path) and returns the file names. */
export async function writeTokenExports(brand, dir) {
  const base=dir instanceof URL?dir:pathToFileURL(String(dir).replace(/[\\/]?$/,'/'));
  await mkdir(base,{recursive:true});
  // File names come from the resolver so the references can never drift from the files.
  const resolver=dtcgResolver(brand),files={'tokens.resolver.json':json(resolver),'tokens.css':toCssText(brand)};
  files[resolver.sets.foundation.sources[0].$ref]=json(dtcgFoundation(brand));
  for(const [mode,[source]] of Object.entries(resolver.modifiers.mode.contexts))files[source.$ref]=json(dtcgColors(brand,mode));
  for(const [name,text] of Object.entries(files))await writeFile(new URL(name,base),text);
  return Object.keys(files).sort();
}
/** Every registered brand into apps/docs/public/brands/<id>/. */
export async function writeAll(root=new URL('../apps/docs/public/brands/',import.meta.url)) {
  for(const brand of brands)await writeTokenExports(brand,new URL(`${brand.id}/`,root));
  return brands.length;
}
if(import.meta.url===pathToFileURL(process.argv[1]??'').href)console.log(`Generated token exports for ${await writeAll()} brands.`);
