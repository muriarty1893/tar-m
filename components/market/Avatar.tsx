import Image from "next/image";

const TONES = ["bg-emerald-100 text-emerald-800", "bg-amber-100 text-amber-900", "bg-sky-100 text-sky-900", "bg-violet-100 text-violet-900", "bg-orange-100 text-orange-900"];

/**
 * A person's profile photo in a circle (lib/avatars.ts); without one, their initials in a tinted
 * circle. Decorative: the name always sits beside it.
 */
export function Avatar({ id, name, photo, size = 44 }: { id: string; name: string; photo?: string | null; size?: number }) {
  if (photo) {
    return (
      <Image
        src={photo}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full bg-muted object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
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
