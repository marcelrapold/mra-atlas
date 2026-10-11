import type { Metadata } from 'next';
import './globals.css';
import FrameworkShell from './_components/framework-shell';
const title='Atlas';
const description='Atlas, das Designsystem von Rapold: ein Designstandard mit austauschbaren Brands für Interfaces und Management-Präsentationen.';
export const metadata: Metadata = {
  metadataBase: new URL('https://atlas.rapold.io'),
  title,
  description,
  alternates: {canonical: '/'},
  openGraph: {type: 'website', siteName: title, locale: 'de_CH', title, description, url: '/', images: [{url: '/og.png', width: 1200, height: 630, alt: title}]},
  twitter: {card: 'summary_large_image', title, description, images: ['/og.png']},
};
export default function RootLayout({children}: {children: React.ReactNode}) {
  return <html lang="de-CH"><body><FrameworkShell>{children}</FrameworkShell></body></html>;
}
