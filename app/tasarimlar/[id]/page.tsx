import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DESIGNS } from "@/components/designs";
import "./onizleme.css";

export const metadata: Metadata = { title: "Tasarım önizlemesi", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return DESIGNS.map((_, i) => ({ id: String(i + 1) }));
}

/** One home page design, full screen (temporary, for choosing a design on /tasarimlar). */
export default async function DesignPreview({ params }: PageProps<"/tasarimlar/[id]">) {
  const { id } = await params;
  const design = DESIGNS[Number(id) - 1];
  if (!design) notFound();
  const { Page } = design;
  return <Page />;
}
