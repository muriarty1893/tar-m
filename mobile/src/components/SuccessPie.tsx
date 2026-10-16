"use client";

import { Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

/**
 * The shadcn/recharts donut ("ChartPie"), cut in half to sit in the gauge's space: the success
 * share in the result's tone and the remaining risk in grey, with a tooltip on each part.
 */
export function SuccessPie({ value, tone }: { value: number; tone: string }) {
  const reduced = usePrefersReducedMotion();
  const config = {
    share: { label: "Pay (%)" },
    success: { label: "Başarı", color: tone },
    risk: { label: "Risk", color: "var(--muted)" },
  } satisfies ChartConfig;
  const data = [
    { part: "success", share: value, fill: "var(--color-success)" },
    { part: "risk", share: 100 - value, fill: "var(--color-risk)" },
  ];
  return (
    <ChartContainer config={config} className="aspect-auto h-[112px] w-[224px]">
      <PieChart margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="part" />} />
        <Pie
          data={data}
          dataKey="share"
          nameKey="part"
          cx="50%"
          cy="100%"
          startAngle={180}
          endAngle={0}
          innerRadius={74}
          outerRadius={104}
          paddingAngle={3}
          cornerRadius={6}
          strokeWidth={2}
          isAnimationActive={!reduced}
          animationDuration={700}
        />
      </PieChart>
    </ChartContainer>
  );
}
