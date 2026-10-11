import type {MetadataRoute} from 'next';
import {pages,href} from './_components/catalog';
export const dynamic='force-static';
// The reference catalogue is the single source of routes; a page added to a
// navigation group is published, indexed and listed here without a second edit.
export default function sitemap():MetadataRoute.Sitemap{
 return pages.map(page=>({url:new URL(href(page.id),'https://atlas.rapold.io').toString(),changeFrequency:'weekly' as const,priority:page.id==='overview'?1:0.7}));
}
