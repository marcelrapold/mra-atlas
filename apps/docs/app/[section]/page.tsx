import {notFound} from 'next/navigation';
import ReferencePage from '../_components/reference-page';
import {pages,href} from '../_components/catalog';
export const dynamicParams=false;
export function generateStaticParams(){return pages.filter(p=>p.id!=='overview'&&p.id!=='praesentationslogik'&&p.id!=='praesentation').map(p=>({section:p.id}));}
export async function generateMetadata({params}:{params:Promise<{section:string}>}){const {section}=await params;const entry=pages.find(p=>p.id===section);const title=`${entry?.title??'Referenz'} · Atlas`;return {title,alternates:{canonical:href(section)},openGraph:{title,url:href(section)}};}
export default async function Page({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!pages.some(p=>p.id===section))notFound();return <ReferencePage section={section}/>;}
