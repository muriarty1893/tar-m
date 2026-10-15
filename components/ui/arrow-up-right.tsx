import { cn } from "cn";

const Arrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" fill="none">
    <path
      d="M1.81213 19.1203L19.4395 1.43779M5.76584 1.24781L19.6484 1.2279L19.6922 15.1104"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Diagonal "go" arrow for buttons: points up-right, and turns to point straight ahead when its
 * button is hovered or focused (app/globals.css, .btn-arrow). Reduced motion makes the turn instant.
 */
export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("btn-arrow", className)}>
      <Arrow />
    </span>
  );
}
