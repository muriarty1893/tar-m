import type { Metadata } from "next";
import { Archivo, Atkinson_Hyperlegible_Next, Bitter, DM_Sans, Onest, Public_Sans, Space_Grotesk } from "next/font/google";
import { siteConfig } from "@/config/site";
import { siteUrl } from "@/lib/site-url";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TasarimSwitcher } from "@/components/TasarimSwitcher";
import { DEFAULT_TASARIM, tasarimScript } from "@/lib/tasarim";
import "./globals.css";
import "./tasarim.css";

// latin-ext carries the Turkish letters (ç ğ ı İ ö ş ü).
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin", "latin-ext"], preload: false });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  preload: false,
});
// The demo phone keeps DM Sans and Space Grotesk; the four design candidates (lib/tasarim.ts) bring
// their own. None is preloaded: the browser fetches only the faces the current design uses.
const onest = Onest({ variable: "--font-onest", subsets: ["latin", "latin-ext"], preload: false });
const bitter = Bitter({ variable: "--font-bitter", subsets: ["latin", "latin-ext"], style: ["normal", "italic"], preload: false });
const publicSans = Public_Sans({ variable: "--font-public-sans", subsets: ["latin", "latin-ext"], preload: false });
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin", "latin-ext"], axes: ["wdth"], preload: false });
const atkinson = Atkinson_Hyperlegible_Next({ variable: "--font-atkinson", subsets: ["latin", "latin-ext"], preload: false });
const fonts = [dmSans, spaceGrotesk, onest, bitter, publicSans, archivo, atkinson].map((f) => f.variable).join(" ");

const defaultTitle = `${siteConfig.name} — Çiftçinin yapay zekâ destekli tarla asistanı`;

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
    <html lang="tr" data-tasarim={DEFAULT_TASARIM} className={`${fonts} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: tasarimScript }} />
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
        <TasarimSwitcher />
      </body>
    </html>
  );
}
