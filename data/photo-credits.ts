/** Photos from Wikimedia Commons used on the site. CC BY photos must stay credited (listed on /kaynaklar). */
export type PhotoCredit = {
  src: string;
  /** Short Turkish label shown in the credit line. */
  label: string;
  author: string;
  license: "Kamu malı" | "CC0" | "CC BY 2.0" | "CC BY 3.0" | "CC BY 3.0 DE" | "CC BY 4.0" | "CC BY-SA 2.0" | "CC BY-SA 3.0" | "CC BY-SA 4.0";
  licenseUrl?: string;
  sourceUrl: string;
};

const BY2 = "https://creativecommons.org/licenses/by/2.0/";
const BY3 = "https://creativecommons.org/licenses/by/3.0/";
const BY3DE = "https://creativecommons.org/licenses/by/3.0/de/";
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
  // The demo phone's Tarlalarım, Tarla Haritası and Pazar screens (the mobile app's photos).
  { src: "/app/tractor-field.webp", label: "Traktör", author: "U.S. Fish and Wildlife Service", license: "Kamu malı", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tractor_plow_fields_cultivated.jpg" },
  { src: "/app/harita-uydu.webp", label: "Tarlalar, tepeden (harita)", author: "Bhullargraphic", license: "CC BY-SA 4.0", licenseUrl: BYSA4, sourceUrl: "https://commons.wikimedia.org/wiki/File:Aerial_view_of_agricultural_fields_in_Punjab,_India.jpg" },
  { src: "/market/ilan-traktor.webp", label: "Traktör (Massey Ferguson 3085)", author: "Chris Sampson", license: "CC BY 2.0", licenseUrl: BY2, sourceUrl: "https://commons.wikimedia.org/wiki/File:Massey_Ferguson_3085.jpg" },
  { src: "/market/ilan-bicerdover.webp", label: "Biçerdöver", author: "Dan Kollmann", license: "CC BY-SA 3.0", licenseUrl: BYSA3, sourceUrl: "https://commons.wikimedia.org/wiki/File:Combine_in_wheat_field.jpg" },
  { src: "/market/ilan-saman-balya.webp", label: "Rulo saman balyası", author: "High Contrast", license: "CC BY 3.0 DE", licenseUrl: BY3DE, sourceUrl: "https://commons.wikimedia.org/wiki/File:Round_straw_bales_in_Bavaria_-01.jpg" },
  { src: "/market/ilan-domates.webp", label: "Domates kasaları", author: "Hoypiwoo Summ", license: "CC BY-SA 4.0", licenseUrl: BYSA4, sourceUrl: "https://commons.wikimedia.org/wiki/File:HK_ALC_%E9%B4%A8%E8%84%B7%E6%B4%B2_Ap_Lei_Chau_%E5%88%A9%E6%9D%B1%E9%82%A8_Lei_Tung_Estate_%E8%A1%97%E5%B8%82_Market_January_2021_SS2_12.jpg" },
  { src: "/market/ilan-pulverizator.webp", label: "Asılır pulverizatör", author: "bdk", license: "CC BY-SA 3.0", licenseUrl: BYSA3, sourceUrl: "https://commons.wikimedia.org/wiki/File:Hardi_Master_mounted_field_sprayer.jpg" },
  { src: "/market/ilan-damla-sulama.webp", label: "Damla sulama", author: "Himvkpack007", license: "CC BY-SA 4.0", licenseUrl: BYSA4, sourceUrl: "https://commons.wikimedia.org/wiki/File:Vk_rain_pipe.jpg" },
  { src: "/market/ilan-mibzer.webp", label: "Mibzer", author: "Kowloonese", license: "CC BY 3.0", licenseUrl: BY3, sourceUrl: "https://commons.wikimedia.org/wiki/File:John_Deere_Planter_with_Case_IH_Tractor.JPG" },
  { src: "/market/ilan-el-aletleri.webp", label: "Budama aletleri takımı", author: "Ragesoss", license: "CC BY-SA 3.0", licenseUrl: BYSA3, sourceUrl: "https://commons.wikimedia.org/wiki/File:Bonsai_tools.jpg" },
  { src: "/market/ilan-romork.webp", label: "Tarım römorku", author: "Oleg Yunakov", license: "CC BY-SA 4.0", licenseUrl: BYSA4, sourceUrl: "https://commons.wikimedia.org/wiki/File:1970s%E2%80%931980s_IFA_Fortschritt_HW_60.11_twin-axle_agricultural_tipping_trailer.jpg" },
  { src: "/market/ilan-sirt-pompasi.webp", label: "Sırt pompası", author: "Safapalanadan94", license: "CC BY-SA 4.0", licenseUrl: BYSA4, sourceUrl: "https://commons.wikimedia.org/wiki/File:Knapsack_sprayer.jpg" },
  { src: "/market/ilan-motorlu-tirpan.webp", label: "Motorlu tırpan", author: "Feťour", license: "Kamu malı", sourceUrl: "https://commons.wikimedia.org/wiki/File:Brush_cutter_02.JPG" },
  { src: "/market/ilan-bugday.webp", label: "Buğday taneleri", author: "Peer Schilperoord", license: "CC BY-SA 4.0", licenseUrl: BYSA4, sourceUrl: "https://commons.wikimedia.org/wiki/File:Triticum_aestivum_naked_wheat_kernels.jpg" },
  { src: "/market/ilan-bugday-tohumu.webp", label: "Makarnalık buğday taneleri", author: "Zerohund", license: "CC BY-SA 3.0", licenseUrl: BYSA3, sourceUrl: "https://commons.wikimedia.org/wiki/File:Triticum_durum_grains_on_porcelain_plate_(cropped).JPG" },
  { src: "/market/ilan-aycicegi-tohumu.webp", label: "Ayçiçeği tohumu", author: "Dmitry Makeev", license: "CC BY-SA 4.0", licenseUrl: BYSA4, sourceUrl: "https://commons.wikimedia.org/wiki/File:Sunflower_seeds._img_012.jpg" },
  { src: "/market/ilan-nohut.webp", label: "Nohut", author: "Fumikas Sagisavas", license: "CC0", licenseUrl: CC0, sourceUrl: "https://commons.wikimedia.org/wiki/File:Chickpeas%F0%9F%AB%98.jpg" },
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
