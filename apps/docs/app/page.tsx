import ReferencePage from './_components/reference-page';
import {jsonLd,siteViewport,websiteData} from './_seo/seo';
export const viewport=siteViewport;
export default function Page(){return <>{jsonLd(websiteData())}<ReferencePage/></>;}
