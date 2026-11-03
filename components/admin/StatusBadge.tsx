/** An article's status in words (never colour alone). */
export function StatusBadge({ status }: { status: "draft" | "published" }) {
  return status === "published" ? (
    <span className="rounded-full bg-secondary px-3 py-0.5 text-sm font-semibold text-primary">Yayında</span>
  ) : (
    <span className="rounded-full bg-gold-soft px-3 py-0.5 text-sm font-semibold text-gold">Taslak</span>
  );
}
