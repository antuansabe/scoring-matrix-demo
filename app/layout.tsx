import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-plex-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Walkthrough } from "@/components/Walkthrough";

const SITE_TITLE = "Changemaker Worldview Scoring Matrix — Demo";
const SITE_DESCRIPTION =
  "An interactive demo of Ashoka's Changemaker Worldview Scoring Matrix — reading the architecture of a text across five dimensions.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang: the UI copy is English (audited Phase 9); "es" made screen
    // readers mispronounce the whole interface. Analyzed TEXTS may still be
    // Spanish — that's content, not UI chrome. Full i18n is a separate,
    // flagged decision for Antonio.
    <html
      lang="en"
      className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ScrollProgress />
        <Header />
        {children}
        <Footer />
        <Walkthrough />
      </body>
    </html>
  );
}
