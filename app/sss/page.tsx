import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { PageHero } from "@/components/PageHero";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "@/data/faqs";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description: `${siteConfig.name} hakkında merak edilenler: ne zaman çıkacak, ücretli mi, hangi ürünleri tanıyor, verilerim güvende mi?`,
};


export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="SSS"
        title="Sıkça Sorulan Sorular"
        intro={
          <>
            Aradığınız cevabı bulamadıysanız bize{" "}
            <a href={`mailto:${siteConfig.contactEmail}`} className="font-semibold text-primary underline underline-offset-4">
              {siteConfig.contactEmail}
            </a>{" "}
            adresinden yazın.
          </>
        }
      />
      <section className="mx-auto max-w-3xl px-4 py-14">
        {/* shadcn/ui Accordion (Base UI): answers stay in the HTML for search engines. */}
        <Accordion className="gap-3">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q} className="rounded-3xl border border-border bg-card px-6 shadow-soft not-last:border-b">
              <AccordionTrigger headingLevel={2}>{f.q}</AccordionTrigger>
              <AccordionContent className="text-lg">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
