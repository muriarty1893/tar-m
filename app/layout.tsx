import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkLocalization } from "@/lib/clerk-localization";
import { Onest, Plus_Jakarta_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import { siteUrl } from "@/lib/site-url";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/nav/BottomNav";
import { Footer } from "@/components/Footer";
import { WelcomeGate } from "@/components/WelcomeGate";
import { SmoothScroll } from "@/components/SmoothScroll";
import "lenis/dist/lenis.css";
import "./globals.css";

// latin-ext carries the Turkish letters (ç ğ ı İ ö ş ü).
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin", "latin-ext"], preload: false });
// The site is set in Onest; the demo phone's app uses the mobile app's Plus Jakarta Sans (loaded on demand).
const onest = Onest({ variable: "--font-onest", subsets: ["latin", "latin-ext"] });
const fonts = [onest, jakarta].map((f) => f.variable).join(" ");

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

// `cover`: the page runs under the iPhone's rounded corners and home bar; the bottom tab bar keeps
// clear of them with env(safe-area-inset-bottom).
export const viewport: Viewport = { viewportFit: "cover", themeColor: "#ffffff" };

// Arms the home hero's one-time intro before first paint (so nothing flashes), only when motion is
// allowed and on wide screens (phones get the portal home, without the hero). If the hero hasn't started within 4 s (slow or failed JS), the content simply shows.
const cineScript = `(function(){var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches||!matchMedia("(min-width: 80rem)").matches)return;d.classList.add("cine");setTimeout(function(){if(!d.dataset.cineRun)d.classList.remove("cine")},4000)})()`;

const clerkAppearance = {
  variables: {
    colorPrimary: "#0b7a3b",
    colorForeground: "#0f2e1d",
    colorMutedForeground: "#4b5a51",
    colorDanger: "#b91c1c",
    colorBackground: "#ffffff",
    fontFamily: "var(--site-sans)",
    fontSize: "1rem",
    borderRadius: "0.75rem",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${fonts} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: cineScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        {/* Sign-in (Clerk), in Turkish and the site's green. Inside <body>, as Cache Components needs. */}
        <ClerkProvider localization={clerkLocalization} signInUrl="/giris" signUpUrl="/kayit" afterSignOutUrl="/" appearance={clerkAppearance}>
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
          <BottomNav />
          <WelcomeGate />
          <SmoothScroll />
        </ClerkProvider>
      </body>
    </html>
  );
}
