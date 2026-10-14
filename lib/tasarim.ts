/**
 * The four white design candidates the owner is choosing between. Each is a set of tokens and a few
 * rules in app/tasarim.css, keyed by `data-tasarim` on <html>; the demo phone's app is left as it is.
 * Once one is chosen, its tokens become the defaults and this switcher goes away.
 */
export const TASARIMLAR = [
  {
    id: "a",
    name: "Sade",
    summary: "Bembeyaz ve sakin: ince çizgiler, gölgesiz kartlar, tek yeşil. Onest yazı tipi.",
  },
  {
    id: "b",
    name: "Almanak",
    summary: "Çiftçi almanağı: kalın tırnaklı başlıklar, buğday sarısı vurgular, çizgili bölümler. Bitter ve Public Sans.",
  },
  {
    id: "c",
    name: "Afiş",
    summary: "Hasat afişi: iri, dar başlıklar, traktör sarısı bloklar, net mürekkep çizgileri. Archivo.",
  },
  {
    id: "d",
    name: "Fide",
    summary: "Yumuşak ve okunaklı: yuvarlak hatlar, hafif gölgeler, az gören gözler için tasarlanmış Atkinson Hyperlegible.",
  },
] as const;

export type TasarimId = (typeof TASARIMLAR)[number]["id"];
export const DEFAULT_TASARIM: TasarimId = "a";
export const TASARIM_KEY = "tasarim";

/**
 * Runs in <head> before first paint: `?tasarim=x` shows that design (without remembering it, so the
 * comparison page's frames don't overwrite the visitor's choice); otherwise the remembered one.
 */
export const tasarimScript = `(function(){var d=document.documentElement,ok=/^[abcd]$/,v=null;try{v=new URLSearchParams(location.search).get("${TASARIM_KEY}")}catch(e){}if(!ok.test(v||"")){try{v=localStorage.getItem("${TASARIM_KEY}")}catch(e){}}d.dataset.tasarim=ok.test(v||"")?v:"${DEFAULT_TASARIM}"})()`;
