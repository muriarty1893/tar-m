import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkLocalization } from "@/lib/clerk-localization";
import { Fira_Code, Fira_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import { siteUrl } from "@/lib/site-url";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/nav/BottomNav";
import { Footer } from "@/components/Footer";
import { WelcomeGate } from "@/components/WelcomeGate";
import { SmoothScroll } from "@/components/SmoothScroll";
import "lenis/dist/lenis.css";
import "./globals.css";

// The Borsa design: Fira Sans for everything, Fira Code for figures (`font-borsa-mono`).
// latin-ext carries the Turkish letters (ç ğ ı İ ö ş ü).
const firaSans = Fira_Sans({ variable: "--font-fira-sans", subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"] });
const firaCode = Fira_Code({ variable: "--font-borsa-mono", subsets: ["latin", "latin-ext"], preload: false });
const fonts = [firaSans, firaCode].map((f) => f.variable).join(" ");

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

const clerkAppearance = {
  variables: {
    colorPrimary: "#1d4ed8",
    colorForeground: "#111827",
    colorMutedForeground: "#4b5563",
    colorDanger: "#b91c1c",
    colorBackground: "#ffffff",
    fontFamily: "var(--site-sans)",
    fontSize: "1rem",
    borderRadius: "0.375rem",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${fonts} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col font-sans">
        {/* Sign-in (Clerk), in Turkish and the site's blue. Inside <body>, as Cache Components needs. */}
        <ClerkProvider localization={clerkLocalization} signInUrl="/giris" signUpUrl="/kayit" afterSignOutUrl="/" appearance={clerkAppearance}>
          <a
            href="#icerik"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-card focus:px-4 focus:py-3 focus:font-semibold focus:shadow-lift"
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
