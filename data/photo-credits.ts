/** Photos from Wikimedia Commons used on the site. CC BY photos must stay credited (shown under the demo). */
export type PhotoCredit = {
  src: string;
  /** Short Turkish label shown in the credit line. */
  label: string;
  author: string;
  license: "Kamu malı" | "CC0" | "CC BY 2.0" | "CC BY 4.0";
  licenseUrl?: string;
  sourceUrl: string;
};

const BY2 = "https://creativecommons.org/licenses/by/2.0/";
const BY4 = "https://creativecommons.org/licenses/by/4.0/";
const CC0 = "https://creativecommons.org/publicdomain/zero/1.0/";

export const photoCredits: PhotoCredit[] = [
  { src: "/demo/bugday-pas.webp", label: "Buğdayda sarı pas", author: "USDA", license: "Kamu malı", sourceUrl: "https://commons.wikimedia.org/wiki/File:Stripe_rust_on_wheat.jpg" },
  { src: "/app/scan-leaf.webp", label: "Buğdayda sarı pas (kırpılmış)", author: "USDA", license: "Kamu malı", sourceUrl: "https://commons.wikimedia.org/wiki/File:Stripe_rust_on_wheat.jpg" },
  { src: "/demo/kuru-misir.webp", label: "Kuraklıkta mısır", author: "CraneStation", license: "CC BY 2.0", licenseUrl: BY2, sourceUrl: "https://commons.wikimedia.org/wiki/File:Corn_in_drought,_Western_Kentucky,_August,_2012.jpg" },
  { src: "/demo/aycicegi.webp", label: "Ayçiçeği tarlası", author: "Audrey from Central Pennsylvania, USA", license: "CC BY 2.0", licenseUrl: BY2, sourceUrl: "https://commons.wikimedia.org/wiki/File:Sunflower_Field_(7848177492).jpg" },
  { src: "/demo/zeytin.webp", label: "Zeytin kara koşnili", author: "Dustin", license: "CC BY 4.0", licenseUrl: BY4, sourceUrl: "https://commons.wikimedia.org/wiki/File:Saissetia_oleae_338167960.jpg" },
  { src: "/app/hero-field.webp", label: "Gün batımında tarla", author: "Summer Stock", license: "CC0", licenseUrl: CC0, sourceUrl: "https://commons.wikimedia.org/wiki/File:Sunflower_field_at_sunset.jpg" },
  { src: "/app/tractor-field.webp", label: "Traktör", author: "U.S. Fish and Wildlife Service", license: "Kamu malı", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tractor_plow_fields_cultivated.jpg" },
  { src: "/app/field-map.webp", label: "Tarlalar (havadan)", author: "Carol M. Highsmith", license: "Kamu malı", sourceUrl: "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Pennsylvania_farmland_LCCN2011631350_(flipped_%26_removed_vignette).tif" },
  { src: "/app/seedlings.webp", label: "Çimlenen tohumlar", author: "Aerospectra", license: "CC BY 4.0", licenseUrl: BY4, sourceUrl: "https://commons.wikimedia.org/wiki/File:Sprouting_seeds.jpg" },
];
