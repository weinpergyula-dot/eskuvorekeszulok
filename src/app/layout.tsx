import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { TopLoader } from "@/components/layout/top-loader";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

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
    <html lang="hu" className={`h-full ${cormorant.variable}`}>
      <body className="min-h-full flex flex-col antialiased">
        <TopLoader />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
