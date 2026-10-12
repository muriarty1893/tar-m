import { siteConfig } from "@/config/site";

/** Placeholder wordmark with a wheat-ear icon; replace when a real logo exists. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-extrabold ${className}`}>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-7 w-7 text-accent"
        fill="currentColor"
      >
        <path d="M12 22c-.4 0-.7-.3-.7-.7V9.5h1.4v11.8c0 .4-.3.7-.7.7Z" />
        <ellipse cx="12" cy="4" rx="1.6" ry="2.6" />
        <ellipse cx="9" cy="8" rx="1.5" ry="2.5" transform="rotate(-30 9 8)" />
        <ellipse cx="15" cy="8" rx="1.5" ry="2.5" transform="rotate(30 15 8)" />
        <ellipse cx="9" cy="12.5" rx="1.5" ry="2.5" transform="rotate(-30 9 12.5)" />
        <ellipse cx="15" cy="12.5" rx="1.5" ry="2.5" transform="rotate(30 15 12.5)" />
      </svg>
      <span>{siteConfig.name}</span>
    </span>
  );
}
