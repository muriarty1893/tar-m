import Image from "next/image";
import { siteConfig } from "@/config/site";

/** The round badge logo (public/brand/logo.webp) and the brand name beside it. */
export function Logo({ className = "", imageClassName = "size-12" }: { className?: string; imageClassName?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-heading font-bold tracking-tight ${className}`}>
      <Image src="/brand/logo.webp" alt="" width={192} height={192} className={`${imageClassName} shrink-0`} />
      <span>{siteConfig.name}</span>
    </span>
  );
}
