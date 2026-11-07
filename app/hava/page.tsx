import type { Metadata } from "next";
import Link from "next/link";
import { WeatherWidget } from "@/components/WeatherWidget";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Hava Durumu",
  description: "81 il için 7 günlük hava tahmini ve çiftçilere özel don, yağış ve ilaçlama uyarıları.",
};

export default function WeatherPage() {
  return (
    <>
      <PageHero
        title="Hava Durumu"
        intro="İlinizi seçin; 7 günlük tahminle birlikte don, yoğun yağış ve ilaçlama için uygun günleri görün."
      />
      <section className="mx-auto max-w-5xl px-2 py-3 sm:px-4 sm:py-6">
        <WeatherWidget headingLevel={2} />
        <p className="mt-4 px-2 text-sm text-muted-foreground sm:px-0">
          İlaçlamaya uygun günü ya da don uyarısını unutmayın:{" "}
          <Link href="/takvim" className="font-semibold text-primary underline underline-offset-4">
            tarım takviminize iş ekleyin
          </Link>
          .
        </p>
      </section>
    </>
  );
}
