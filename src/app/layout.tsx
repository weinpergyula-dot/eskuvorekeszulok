import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TopLoader } from "@/components/layout/top-loader";

export const metadata: Metadata = {
  title: "Esküvőre Készülök – Esküvői Szolgáltatók",
  description:
    "Találj meg mindent egy helyen a nagy napodra! Fotósok, zenészek, vőfélyek és egyéb esküvői szolgáltatók.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className="h-full">
      <head>
        <link rel="preload" href="/fonts/BloomSpeakBody-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/BloomSpeakBody-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/BloomSpeakBody-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/BloomSpeakTitle-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/BloomSpeakTitle-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/BloomSpeakTitle-ExtraBold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <TopLoader />
        <div className="w-full bg-white text-center py-1.5">
          <span className="text-[#F06C6C] font-bold text-base tracking-wide">PREVIEW ENVIRONMENT</span>
        </div>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
