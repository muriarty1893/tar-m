import { DM_Sans, Inter, Libre_Bodoni, Manrope, Nunito, Open_Sans, Public_Sans, Roboto, Roboto_Slab, Space_Grotesk } from "next/font/google";

/**
 * The design previews' typefaces (/tasarimlar). Loaded only on those pages; latin-ext has ç ğ ı İ ö ş ü.
 * next/font needs literal options here (no spread).
 */
export const inter = Inter({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-inter" });
export const spaceGrotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-space-grotesk" });
export const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-dm-sans" });
export const nunito = Nunito({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-nunito" });
export const libreBodoni = Libre_Bodoni({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-libre-bodoni" });
export const publicSans = Public_Sans({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-public-sans" });
export const roboto = Roboto({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-roboto" });
export const manrope = Manrope({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-manrope" });
export const robotoSlab = Roboto_Slab({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-roboto-slab" });
export const openSans = Open_Sans({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-open-sans" });
