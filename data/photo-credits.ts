/** Photos from Wikimedia Commons used on the site. CC BY photos must stay credited (listed on /kaynaklar). */
export type PhotoCredit = {
  src: string;
  /** Short Turkish label shown in the credit line. */
  label: string;
  author: string;
  license: "Kamu malı" | "CC0" | "CC BY 2.0" | "CC BY 4.0" | "CC BY-SA 2.0" | "CC BY-SA 3.0" | "CC BY-SA 4.0";
  licenseUrl?: string;
  sourceUrl: string;
};

const BY2 = "https://creativecommons.org/licenses/by/2.0/";
const BY4 = "https://creativecommons.org/licenses/by/4.0/";
const BYSA2 = "https://creativecommons.org/licenses/by-sa/2.0/";
const BYSA3 = "https://creativecommons.org/licenses/by-sa/3.0/";
const BYSA4 = "https://creativecommons.org/licenses/by-sa/4.0/";
const CC0 = "https://creativecommons.org/publicdomain/zero/1.0/";

/** Background of the subpage header band (components/PageHero.tsx), credited in the band itself. */
export const pageHeroPhoto: PhotoCredit = {
  src: "/hero/susehri-wheat.webp",
  label: "Suşehri'nde buğday tarlası (Sivas)",
  author: "Maurice Flesier",
  license: "CC BY-SA 4.0",
  licenseUrl: BYSA4,
  sourceUrl: "https://commons.wikimedia.org/wiki/File:A_wheat_field_in_Su%C5%9Fehri,_Sivas_Province.jpg",
};

export const photoCredits: PhotoCredit[] = [
  { src: "/demo/bugday-sari-pas.webp", label: "Sarı pas (tritikale yaprağı)", author: "Rasbak", license: "CC BY-SA 3.0", licenseUrl: BYSA3, sourceUrl: "https://commons.wikimedia.org/wiki/File:Puccinia_striiformis_f.sp._triticale,_gele_roest_op_triticale_(2).jpg" },
  { src: "/demo/misir-kuraklik.webp", label: "Kuraklıkta mısır", author: "CraneStation", license: "CC BY 2.0", licenseUrl: BY2, sourceUrl: "https://commons.wikimedia.org/wiki/File:Corn_in_drought,_Western_Kentucky,_August,_2012.jpg" },
  { src: "/demo/aycicegi-tarlasi.webp", label: "Ayçiçeği tarlası", author: "Audrey from Central Pennsylvania, USA", license: "CC BY 2.0", licenseUrl: BY2, sourceUrl: "https://commons.wikimedia.org/wiki/File:Sunflower_Field_(7848177492).jpg" },
  { src: "/demo/domates-mildiyo.webp", label: "Domates mildiyösü", author: "Natalka Ukraine (baby-bear.org)", license: "CC BY 4.0", licenseUrl: BY4, sourceUrl: "https://commons.wikimedia.org/wiki/File:Phytophthora_infestans_on_Solanum_lycopersicum_in_Dnipro_by_baby-bear.org.jpg" },
  { src: "/demo/sahne-gokyuzu.webp", label: "Bulutlu gökyüzü", author: "Dmitry Makeev", license: "CC BY-SA 4.0", licenseUrl: BYSA4, sourceUrl: "https://commons.wikimedia.org/wiki/File:Cumulus_clouds_in_Russia._img_064.jpg" },
  { src: "/demo/sahne-surulmus-tarla.webp", label: "Sürülmüş tarla", author: "Partonez", license: "CC BY-SA 4.0", licenseUrl: BYSA4, sourceUrl: "https://commons.wikimedia.org/wiki/File:Ploughed_field_near_Aish.jpg" },
  { src: "/demo/sahne-balyalar.webp", label: "Hasattan sonra saman balyaları", author: "foxypar4", license: "CC BY 2.0", licenseUrl: BY2, sourceUrl: "https://commons.wikimedia.org/wiki/File:Round_straw_bales_in_a_field.jpg" },
  { src: "/hero/field-horizon.webp", label: "Ufka uzanan tarla", author: "John Sutton", license: "CC BY-SA 2.0", licenseUrl: BYSA2, sourceUrl: "https://commons.wikimedia.org/wiki/File:Waldringfield,_potato_rows_and_a_cloudless_sky_-_geograph.org.uk_-_7121840.jpg" },
  { src: "/app/hero-field.webp", label: "Gün batımında tarla", author: "Summer Stock", license: "CC0", licenseUrl: CC0, sourceUrl: "https://commons.wikimedia.org/wiki/File:Sunflower_field_at_sunset.jpg" },
  pageHeroPhoto,
];

/** The 3D phone in the demo (CC BY 4.0, credit required; listed on /kaynaklar). */
export const modelCredit = {
  title: "iPhone 17 Pro",
  author: "Ranguel",
  sourceUrl: "https://sketchfab.com/3d-models/iphone-17-pro-4541aa8a28324b33a2baaf81d263aaec",
  license: "CC BY 4.0",
  licenseUrl: BY4,
  note: "web için sıkıştırıldı",
};
