import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ListingForm } from "@/components/market/ListingForm";
import { isAdmin, requireProfile } from "@/lib/auth";
import { num, str } from "@/lib/db";
import { formatPrice } from "@/lib/market";
import { getEditableListing } from "@/lib/market-data";

export const metadata: Metadata = { title: "İlanı düzenle", robots: { index: false } };

export default function EditListingPage({ params }: PageProps<"/pazar/ilan/[id]/duzenle">) {
  return (
    <>
      <h1 className="sr-only">İlanı düzenle</h1>
      <Suspense fallback={<div aria-hidden="true" className="mx-auto mt-6 h-96 max-w-5xl rounded-sm bg-muted motion-safe:animate-pulse" />}>
        <EditListing params={params} />
      </Suspense>
    </>
  );
}

async function EditListing({ params }: { params: PageProps<"/pazar/ilan/[id]/duzenle">["params"] }) {
  const { id } = await params;
  const profile = await requireProfile(`/pazar/ilan/${id}/duzenle`);
  const admin = await isAdmin(profile.userId);
  const r = await getEditableListing(id, profile.userId, admin);
  if (!r) notFound();
  const someoneElses = str(r.seller_id) !== profile.userId;
  const unit = str(r.unit);
  // "25 ton" is edited as "25" with the unit chosen separately.
  const quantity = unit && str(r.quantity).endsWith(` ${unit}`) ? str(r.quantity).slice(0, -unit.length - 1) : str(r.quantity);
  return (
    <>
      {someoneElses && (
        <p className="mx-auto mt-4 max-w-5xl rounded-sm bg-gold-soft px-4 py-3 font-semibold text-gold ring-1 ring-gold/30 max-sm:mx-3">
          Yönetici olarak başkasının ilanını düzenliyorsunuz (satıcı: {str(r.seller_name) || "Kullanıcı"}).
        </p>
      )}
      <ListingForm
      listingId={id}
      initial={{
        title: str(r.title),
        category: str(r.category),
        condition: str(r.condition),
        price: formatPrice(num(r.price) ?? 0).replace(" ₺", ""),
        unit,
        quantity,
        negotiable: r.negotiable === true,
        province: str(r.province),
        district: str(r.district),
        description: str(r.description),
        photos: (r.photos as string[] | null) ?? [],
      }}
      />
    </>
  );
}
