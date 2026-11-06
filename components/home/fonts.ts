import { Fira_Code, Fira_Sans } from "next/font/google";

/**
 * The phone home page's typefaces (the Borsa design): Fira Sans for text, Fira Code for every figure
 * (`font-borsa-mono`). Not preloaded: the page reads fine in the fallback for the moment they load.
 */
export const borsaSans = Fira_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], preload: false, variable: "--font-borsa-sans" });
export const borsaMono = Fira_Code({ subsets: ["latin", "latin-ext"], preload: false, variable: "--font-borsa-mono" });
