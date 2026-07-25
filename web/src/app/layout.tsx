import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Archivo, Literata, JetBrains_Mono } from 'next/font/google';
import './global.css';
import { appName, siteUrl, tagline } from '@/lib/shared';

// Archivo carries a width axis, so headings can be pushed wide like the lettering
// on an instrument panel. Literata is drawn for screen reading and holds up over a
// nine-thousand-word chapter. JetBrains Mono handles timecodes, readouts and code.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

const literata = Literata({
  subsets: ['latin'],
  variable: '--font-literata',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: appName, template: `%s — ${appName}` },
  description: tagline,
  openGraph: { title: appName, description: tagline, type: 'website', siteName: appName },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${literata.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
