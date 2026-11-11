import type { Metadata } from 'next';
import './globals.css';

import { BRAND, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: BRAND,
  title: {
    default: `Wheelchair & Medical Rides in Taunton, MA | ${BRAND}`,
    template: `%s | ${BRAND}`,
  },
  description:
    'Private-pay wheelchair van and ambulatory rides in Taunton and Southeastern MA. Published rates, screened drivers, inspected vans. Get a price in 30 seconds.',
  openGraph: { type: 'website', siteName: BRAND, locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/img/logo-mark.png', apple: '/img/logo-mark.png' },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  formatDetection: { telephone: true },
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
