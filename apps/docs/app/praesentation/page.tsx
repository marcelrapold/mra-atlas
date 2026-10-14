import type {Metadata, ResolvingMetadata} from 'next';
import PresentationPage from '../_components/presentation-page';
import {articleData,jsonLd,pageDescription,pageMetadata} from '../_seo/seo';
const title='Präsentation',description=pageDescription('praesentation','Der Präsentationsbaukasten von Atlas: vermessene Layouts, ausführbare Folienrezepte und dieselbe Brand für Website und PowerPoint.');
export function generateMetadata(_props:unknown,parent:ResolvingMetadata):Promise<Metadata>{return pageMetadata(parent,{title,description,path:'/praesentation'});}
export default function Page(){return <>{jsonLd(articleData('praesentation',{title,description}))}<PresentationPage/></>;}
