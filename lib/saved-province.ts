import { DEFAULT_PROVINCE, provinces, type Province } from "@/data/provinces";

/**
 * The province the visitor last looked at on the weather page, kept in this browser so the home
 * page's and the calendar's weather show the same place. Browser-only.
 */
const KEY = "ciftci-il";

export function readSavedProvince(): Province | null {
  try {
    const name = localStorage.getItem(KEY);
    return provinces.find((p) => p.name === name) ?? null;
  } catch {
    return null;
  }
}

export function saveProvince(p: Province) {
  try {
    localStorage.setItem(KEY, p.name);
  } catch {
    // Storage blocked: the default stays.
  }
}

export { DEFAULT_PROVINCE };
