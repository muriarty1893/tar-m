import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingForm } from "@/components/market/ListingForm";
import { requireProfile } from "@/lib/auth";
import { EMPTY_LISTING } from "@/lib/market";

export const metadata: Metadata = { title: "İlan ver", robots: { index: false } };

export default function NewListingPage() {
  return (
    <>
      <h1 className="sr-only">İlan ver</h1>
      <Suspense fallback={<div aria-hidden="true" className="mx-auto mt-6 h-96 max-w-5xl rounded-sm bg-muted motion-safe:animate-pulse" />}>
        <NewListing />
      </Suspense>
    </>
  );
}

async function NewListing() {
  const profile = await requireProfile("/pazar/ilan-ver");
  return <ListingForm initial={EMPTY_LISTING} defaultProvince={profile.province} />;
}
