import type { Metadata } from "next";
import { DM_Sans, Onest, Sofia_Sans_Condensed, Space_Grotesk, Spline_Sans_Mono } from "next/font/google";
import { siteConfig } from "@/config/site";
import { siteUrl } from "@/lib/site-url";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WelcomeGate } from "@/components/WelcomeGate";
import { SmoothScroll } from "@/components/SmoothScroll";
import "lenis/dist/lenis.css";
import "./globals.css";

// latin-ext carries the Turkish letters (ç ğ ı İ ö ş ü).
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin", "latin-ext"], preload: false });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  preload: false,
});
// The site is set in Onest; the demo phone's app keeps DM Sans and Space Grotesk (loaded on demand).
const onest = Onest({ variable: "--font-onest", subsets: ["latin", "latin-ext"] });
// The footer's type: a condensed display face for the brand name and address, a monospace for its labels.
const sofiaCondensed = Sofia_Sans_Condensed({ variable: "--font-sofia-condensed", subsets: ["latin", "latin-ext"], preload: false });
const splineMono = Spline_Sans_Mono({ variable: "--font-spline-mono", subsets: ["latin", "latin-ext"], preload: false });
const fonts = [onest, dmSans, spaceGrotesk, sofiaCondensed, splineMono].map((f) => f.variable).join(" ");

const defaultTitle = `${siteConfig.name} — ${siteConfig.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: siteConfig.name,
    title: defaultTitle,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
};

// Arms the home hero's one-time intro before first paint (so nothing flashes), only when motion is
// allowed. If the hero hasn't started within 4 s (slow or failed JS), the content simply shows.
const cineScript = `(function(){var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("cine");setTimeout(function(){if(!d.dataset.cineRun)d.classList.remove("cine")},4000)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${fonts} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: cineScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-2xl focus:bg-card focus:px-4 focus:py-3 focus:font-semibold focus:shadow-lift"
        >
          İçeriğe geç
        </a>
        <Header />
        <main id="icerik" className="flex-1 overflow-x-clip">
          {children}
        </main>
        <Footer />
        <WelcomeGate />
        <SmoothScroll />
      </body>
    </html>
  );
}
