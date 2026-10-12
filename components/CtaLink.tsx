import Link from "next/link";
import { siteConfig } from "@/config/site";

export function CtaLink({ className = "", onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/#kayit"
      onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-3 font-bold text-on-primary shadow-sm transition hover:bg-primary-strong ${className}`}
    >
      {siteConfig.ctaLabel}
    </Link>
  );
}
