import { GrainsIcon } from "@phosphor-icons/react/dist/ssr";
import { siteConfig } from "@/config/site";

/** Placeholder mark: Phosphor "Grains" in an organic leaf-green shape. Replace with the real logo. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-heading font-bold tracking-tight ${className}`}>
      <span aria-hidden="true" className="blob flex size-10 items-center justify-center bg-primary text-primary-foreground">
        <GrainsIcon weight="duotone" className="size-6" />
      </span>
      <span>{siteConfig.name}</span>
    </span>
  );
}
