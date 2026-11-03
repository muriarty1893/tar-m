const TONES = ["bg-emerald-100 text-emerald-800", "bg-amber-100 text-amber-900", "bg-sky-100 text-sky-900", "bg-violet-100 text-violet-900", "bg-orange-100 text-orange-900"];

/** A person's initials in a tinted circle: the site shows no photos of people. */
export function Avatar({ id, name, size = 44 }: { id: string; name: string; size?: number }) {
  const tone = TONES[[...id].reduce((n, c) => n + c.charCodeAt(0), 0) % TONES.length];
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0]!.toLocaleUpperCase("tr"))
      .slice(0, 2)
      .join("") || "?";
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${tone}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}
