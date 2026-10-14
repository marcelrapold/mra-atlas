import type {MetadataRoute} from 'next';
import {site} from './_seo/seo';
export const dynamic='force-static';
// theme_color follows the tile of app/icon.svg so the installed shortcut and the
// browser chrome share one colour; the neutral icon carries no product signet.
export default function manifest():MetadataRoute.Manifest{
 return {name:'Atlas – Designsystem von Rapold',short_name:site.name,description:'Designstandard mit austauschbaren Brands für Interfaces und Management-Präsentationen.',lang:site.language,dir:'ltr',start_url:'/',scope:'/',display:'browser',background_color:'#ffffff',theme_color:site.themeColor,icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'},{src:'/apple-icon.png',sizes:'180x180',type:'image/png'}]};
}
