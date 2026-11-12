"use client";

import { useState, useTransition } from "react";
import { ArrowsClockwiseIcon, SpinnerGapIcon } from "@phosphor-icons/react/dist/ssr";
import { importNewsNow } from "@/app/yonetim/actions";
import { Button } from "@/components/ui/button";

/** Yönetim → Haberler: run the daily TKDK / Ministry import now, and say what came in. */
export function ImportNewsButton() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setResult(null);
            setResult(await importNewsNow());
          })
        }
      >
        {pending ? <SpinnerGapIcon aria-hidden="true" weight="bold" className="animate-spin" /> : <ArrowsClockwiseIcon aria-hidden="true" weight="bold" />}
        {pending ? "Kaynaklar okunuyor…" : "Kaynaklardan şimdi çek"}
      </Button>
      <p role="status" className={`text-sm ${result && !result.ok ? "text-destructive" : "text-muted-foreground"}`}>
        {result?.message}
      </p>
    </div>
  );
}
