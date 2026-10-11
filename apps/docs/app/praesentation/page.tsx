import type {Metadata, ResolvingMetadata} from 'next';
import PresentationPage from '../_components/presentation-page';
export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
 const title='Präsentation · Design Framework';
 const inherited=await parent;
 return {
  title,
  alternates:{canonical:'/praesentation'},
  openGraph:{...inherited.openGraph,title,url:'/praesentation'},
 };
}
export default function Page(){return <PresentationPage/>;}
