import type { Metadata } from 'next';
import './globals.css';

const SITE = process.env.SITE_URL || 'https://www.edgelifetransportation.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Wheelchair & Medical Transportation in Taunton, MA | EdgeLIFE Transportation',
    template: '%s | EdgeLIFE Transportation',
  },
  description:
    'Private-pay wheelchair van and ambulatory transportation in Taunton and Southeastern Massachusetts. Published rates, screened drivers, accessible vans. Get an instant estimate.',
  openGraph: { type: 'website', siteName: 'EdgeLIFE Transportation', locale: 'en_US' },
  icons: { icon: '/img/logo-mark.png' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
