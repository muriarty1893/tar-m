import type { Metadata } from "next";
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
        eyebrow="Hava durumu"
        title="Hava Durumu"
        intro="İlinizi seçin; 7 günlük tahminle birlikte don, yoğun yağış ve ilaçlama için uygun günleri görün."
      />
      <section className="mx-auto max-w-5xl px-4 py-12">
        <WeatherWidget headingLevel={2} />
      </section>
    </>
  );
}
