import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { faqs } from "@/data/faqs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section } from "./Section";
import { QuestionForm } from "./QuestionForm";

/** Home page: the most asked questions, and a form to ask the team anything else. */
export function QuestionSection() {
  return (
    <Section
      id="sorular"
      eyebrow="Sorularınız"
      title="Aklınıza takılan bir şey mi var?"
      intro="En çok sorulanlara buradan bakın; cevabını bulamazsanız sorunuzu yazın, ekibimiz e-postayla yanıtlasın."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <Accordion className="gap-3">
            {faqs.slice(1, 6).map((f) => (
              <AccordionItem key={f.q} value={f.q} className="rounded-3xl border border-border bg-card px-6 shadow-soft not-last:border-b">
                <AccordionTrigger headingLevel={3}>{f.q}</AccordionTrigger>
                <AccordionContent className="text-lg">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Link href="/sss" className="group mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline">
            Tüm sorular
            <ArrowRightIcon aria-hidden="true" weight="bold" className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <QuestionForm />
      </div>
    </Section>
  );
}
