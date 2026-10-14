import ReferencePage from './_components/reference-page';
import {jsonLd,websiteData} from './_seo/seo';
export default function Page(){return <>{jsonLd(websiteData())}<ReferencePage/></>;}
