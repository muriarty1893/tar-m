import Link from "next/link";
import { PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { getUserId, isAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";

/**
 * For admins only, on the public news pages: "Haber ekle", or "Bu haberi düzenle" on an article.
 * Everyone else gets nothing. Render it inside <Suspense> (it reads the session).
 */
export async function AdminNewsLink({ slug }: { slug?: string }) {
  const userId = await getUserId();
  if (!(await isAdmin(userId))) return null;
  let href = "/yonetim/haberler/yeni";
  if (slug) {
    const rows = await sql()`select id from articles where slug = ${slug}`;
    if (!rows[0]) return null;
    href = `/yonetim/haberler/${rows[0].id}`;
  }
  return (
    <Link href={href} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold-soft px-4 font-semibold text-gold ring-1 ring-gold/30 hover:bg-gold/15">
      {slug ? <PencilSimpleIcon aria-hidden="true" weight="bold" className="size-5" /> : <PlusIcon aria-hidden="true" weight="bold" className="size-5" />}
      {slug ? "Bu haberi düzenle" : "Haber ekle"}
    </Link>
  );
}
