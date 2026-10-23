/**
 * "Görsel kaynakları": who made the photos, components, icons and fonts the app uses, and where its live data comes from. CC BY and
 * CC BY-SA photos must stay credited. CREDITS.md has the same list; a test checks that every photo
 * under assets/images/app and assets/images/market is here.
 */
export type License = 'Kamu malı' | 'CC0' | 'CC BY 2.0' | 'CC BY 3.0' | 'CC BY 3.0 DE' | 'CC BY 4.0' | 'CC BY-SA 3.0' | 'CC BY-SA 4.0';

export type PhotoCredit = {
  /** Under assets/images. */
  file: string;
  label: string;
  author: string;
  license: License;
  licenseUrl?: string;
  sourceUrl: string;
};

const LICENSE_URLS: Partial<Record<License, string>> = {
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC BY 3.0 DE': 'https://creativecommons.org/licenses/by/3.0/de/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
};

const COMMONS = 'https://commons.wikimedia.org/wiki/File:';
const photo = (file: string, label: string, author: string, license: License, commonsFile: string): PhotoCredit => ({
  file,
  label,
  author,
  license,
  licenseUrl: LICENSE_URLS[license],
  sourceUrl: COMMONS + commonsFile,
});

export const PHOTO_CREDITS: PhotoCredit[] = [
  photo('app/bugday-sari-pas.webp', 'Sarı pas (tritikale yaprağı)', 'Rasbak', 'CC BY-SA 3.0', 'Puccinia_striiformis_f.sp._triticale,_gele_roest_op_triticale_(2).jpg'),
  photo('app/misir-kuraklik.webp', 'Kuraklıkta mısır', 'CraneStation', 'CC BY 2.0', 'Corn_in_drought,_Western_Kentucky,_August,_2012.jpg'),
  photo('app/aycicegi-tarlasi.webp', 'Ayçiçeği tarlası', 'Audrey from Central Pennsylvania, USA', 'CC BY 2.0', 'Sunflower_Field_(7848177492).jpg'),
  photo('app/domates-mildiyo.webp', 'Domates mildiyösü', 'Natalka Ukraine (baby-bear.org)', 'CC BY 4.0', 'Phytophthora_infestans_on_Solanum_lycopersicum_in_Dnipro_by_baby-bear.org.jpg'),
  photo('app/tractor-field.webp', 'Traktör', 'U.S. Fish and Wildlife Service', 'Kamu malı', 'Tractor_plow_fields_cultivated.jpg'),
  photo('app/harita-uydu.webp', 'Tarlalar, tepeden (harita)', 'Bhullargraphic', 'CC BY-SA 4.0', 'Aerial_view_of_agricultural_fields_in_Punjab,_India.jpg'),
  photo('market/ilan-traktor.webp', 'Traktör (Massey Ferguson 3085)', 'Chris Sampson', 'CC BY 2.0', 'Massey_Ferguson_3085.jpg'),
  photo('market/ilan-bicerdover.webp', 'Biçerdöver', 'Dan Kollmann', 'CC BY-SA 3.0', 'Combine_in_wheat_field.jpg'),
  photo('market/ilan-saman-balya.webp', 'Rulo saman balyası', 'High Contrast', 'CC BY 3.0 DE', 'Round_straw_bales_in_Bavaria_-01.jpg'),
  photo(
    'market/ilan-domates.webp',
    'Domates kasaları',
    'Hoypiwoo Summ',
    'CC BY-SA 4.0',
    'HK_ALC_%E9%B4%A8%E8%84%B7%E6%B4%B2_Ap_Lei_Chau_%E5%88%A9%E6%9D%B1%E9%82%A8_Lei_Tung_Estate_%E8%A1%97%E5%B8%82_Market_January_2021_SS2_12.jpg'
  ),
  photo('market/ilan-pulverizator.webp', 'Asılır pulverizatör', 'bdk', 'CC BY-SA 3.0', 'Hardi_Master_mounted_field_sprayer.jpg'),
  photo('market/ilan-damla-sulama.webp', 'Damla sulama', 'Himvkpack007', 'CC BY-SA 4.0', 'Vk_rain_pipe.jpg'),
  photo('market/ilan-mibzer.webp', 'Mibzer', 'Kowloonese', 'CC BY 3.0', 'John_Deere_Planter_with_Case_IH_Tractor.JPG'),
  photo('market/ilan-el-aletleri.webp', 'Budama aletleri takımı', 'Ragesoss', 'CC BY-SA 3.0', 'Bonsai_tools.jpg'),
  photo('market/ilan-romork.webp', 'Tarım römorku', 'Oleg Yunakov', 'CC BY-SA 4.0', '1970s%E2%80%931980s_IFA_Fortschritt_HW_60.11_twin-axle_agricultural_tipping_trailer.jpg'),
  photo('market/ilan-sirt-pompasi.webp', 'Sırt pompası', 'Safapalanadan94', 'CC BY-SA 4.0', 'Knapsack_sprayer.jpg'),
  photo('market/ilan-motorlu-tirpan.webp', 'Motorlu tırpan', 'Feťour', 'Kamu malı', 'Brush_cutter_02.JPG'),
  photo('market/ilan-bugday.webp', 'Buğday taneleri', 'Peer Schilperoord', 'CC BY-SA 4.0', 'Triticum_aestivum_naked_wheat_kernels.jpg'),
  photo('market/ilan-bugday-tohumu.webp', 'Makarnalık buğday taneleri', 'Zerohund', 'CC BY-SA 3.0', 'Triticum_durum_grains_on_porcelain_plate_(cropped).JPG'),
  photo('market/ilan-aycicegi-tohumu.webp', 'Ayçiçeği tohumu', 'Dmitry Makeev', 'CC BY-SA 4.0', 'Sunflower_seeds._img_012.jpg'),
  photo('market/ilan-nohut.webp', 'Nohut', 'Fumikas Sagisavas', 'CC0', 'Chickpeas%F0%9F%AB%98.jpg'),
];

export type OtherCredit = { group: 'veri' | 'bilesen' | 'ikon-yazi'; name: string; license?: string; url: string };

export const OTHER_CREDITS: OtherCredit[] = [
  { group: 'veri', name: 'Hava durumu: Open-Meteo.com', license: 'CC BY 4.0', url: 'https://open-meteo.com' },
  { group: 'bilesen', name: 'React Bits SpringCheck', license: 'MIT', url: 'https://reactbits.dev' },
  { group: 'bilesen', name: 'Magic UI NumberTicker', license: 'MIT', url: 'https://magicui.design' },
  { group: 'bilesen', name: '21st.dev “Analyzing image” yükleyicisi', url: 'https://21st.dev' },
  { group: 'bilesen', name: 'shadcn/ui grafik ve Recharts', license: 'MIT', url: 'https://ui.shadcn.com' },
  { group: 'bilesen', name: 'React Native Reusables', license: 'MIT', url: 'https://reactnativereusables.com' },
  { group: 'ikon-yazi', name: 'Phosphor Icons', license: 'MIT', url: 'https://phosphoricons.com' },
  { group: 'ikon-yazi', name: 'Plus Jakarta Sans', license: 'SIL Open Font License', url: 'https://fonts.google.com/specimen/Plus+Jakarta+Sans' },
];
