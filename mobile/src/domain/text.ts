/** For search: lower case, Turkish letters to plain ones ("Traktör" → "traktor"). */
export function fold(s: string) {
  const plain: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
  return s
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .replace(/[çğıöşüâîû]/g, (c) => plain[c]);
}
