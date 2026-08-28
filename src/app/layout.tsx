import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import { Footer } from "@/components/layout/footer";
import { TopLoader } from "@/components/layout/top-loader";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { ConditionalChrome } from "@/components/layout/conditional-chrome";
import { ScrollToTop } from "@/components/scroll-to-top";
import { BackgroundMusic } from "@/components/layout/background-music";

const SITE_NAME = "Esküvőre Készülök";
const SITE_URL = "https://eskuvorekeszulok.hu";
const SITE_DESCRIPTION =
  "Találj meg mindent egy helyen a nagy napodra! Fotósok, zenészek, vőfélyek és egyéb esküvői szolgáltatók.";

const GA_ID = "G-F3ZQFXKGET";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – Esküvői Szolgáltatók`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} – Esküvői Szolgáltatók`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – Esküvői Szolgáltatók`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className="h-full">
      <head>
        {/* Google Consent Mode v2 – minden más script elé, szinkron inicializálás */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'wait_for_update': 500
});
            `.trim(),
          }}
        />
        {/* Google Analytics 4 */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');
            `.trim(),
          }}
        />
        <link rel="preload" href="/fonts/BloomSpeakBody-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/BloomSpeakBody-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/BloomSpeakBody-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/BloomSpeakTitle-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/BloomSpeakTitle-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/BloomSpeakTitle-ExtraBold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              inLanguage: "hu-HU",
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <ScrollToTop />
        <TopLoader />
        <ConditionalChrome
          announcement={<AnnouncementBanner />}
          navbar={<Navbar />}
          footer={<Footer />}
          cookie={<CookieBanner />}
          extras={
<BackgroundMusic />
          }
        >
          {children}
        </ConditionalChrome>
      </body>
    </html>
  );
}
