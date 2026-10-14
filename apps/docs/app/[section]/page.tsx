import type {Metadata, ResolvingMetadata} from 'next';
import {notFound} from 'next/navigation';
import ReferencePage from '../_components/reference-page';
import {ComponentSpec} from '../_components/component-spec';
import {pages,href} from '../_components/catalog';
import {articleData,jsonLd,pageDescription,pageMetadata} from '../_seo/seo';
type Props={params:Promise<{section:string}>};
export const dynamicParams=false;
export function generateStaticParams(){return pages.filter(p=>p.id!=='overview'&&p.id!=='praesentationslogik'&&p.id!=='praesentation').map(p=>({section:p.id}));}
export async function generateMetadata({params}:Props,parent:ResolvingMetadata):Promise<Metadata>{const {section}=await params;const title=pages.find(p=>p.id===section)?.title??'Referenz';return pageMetadata(parent,{title,description:pageDescription(section),path:href(section)});}
export default async function Page({params}:Props){const {section}=await params;const entry=pages.find(p=>p.id===section);if(!entry)notFound();return <>{jsonLd(articleData(section,{title:entry.title,description:pageDescription(section)}))}<ReferencePage section={section}/><ComponentSpec section={section}/></>;}
