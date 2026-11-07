import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolHeader } from "@/components/tool/ToolHeader";
import { ListingForm } from "@/components/market/ListingForm";
import { requireProfile } from "@/lib/auth";
import { EMPTY_LISTING } from "@/lib/market";

export const metadata: Metadata = { title: "İlan ver", robots: { index: false } };

export default function NewListingPage() {
  return (
    <>
      <ToolHeader eyebrow="Pazar" title="İlan ver" intro="Birkaç dakikada ilanınızı yayınlayın. Alıcılar size site içinden mesaj gönderir; telefon numaranız görünmez." />
      <div className="mx-auto max-w-3xl px-3 py-3 sm:px-4 sm:py-6">
        <Suspense fallback={<div aria-hidden="true" className="h-96 rounded-lg bg-muted motion-safe:animate-pulse" />}>
          <NewListing />
        </Suspense>
      </div>
    </>
  );
}

async function NewListing() {
  const profile = await requireProfile("/pazar/ilan-ver");
  return <ListingForm initial={EMPTY_LISTING} defaultProvince={profile.province} />;
}
