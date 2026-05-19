import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kapcsolat",
  description: "Vedd fel velünk a kapcsolatot! Kérdésed, észrevételed van az Esküvőre Készülök platformmal kapcsolatban? Írj nekünk.",
  alternates: { canonical: "https://eskuvorekeszulok.hu/kapcsolat" },
};

export default function KapcsolatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
