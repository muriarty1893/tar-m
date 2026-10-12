import type { Metadata } from "next";
import { PartnerForm } from "@/components/PartnerForm";

export const metadata: Metadata = {
  title: "İş Birliği",
  description: "Yatırımcılar, kooperatifler, ziraat odaları ve pilot çiftlikler için Bereket AI iş birliği.",
};

export default function PartnerPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-extrabold">İş Birliği</h1>
      <div id="iletisim-formu" className="mt-8">
        <PartnerForm />
      </div>
    </section>
  );
}
