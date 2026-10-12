import type { Metadata } from "next";
import { WeatherWidget } from "@/components/WeatherWidget";

export const metadata: Metadata = {
  title: "Hava Durumu",
  description: "81 il için 7 günlük hava tahmini ve çiftçilere özel don, yağış ve ilaçlama uyarıları.",
};

export default function WeatherPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-extrabold">Hava Durumu</h1>
      <p className="mt-3 text-lg text-muted">
        İlinizi seçin; 7 günlük tahminle birlikte don, yoğun yağış ve ilaçlama için uygun günleri görün.
      </p>
      <div className="mt-8">
        <WeatherWidget />
      </div>
    </section>
  );
}
