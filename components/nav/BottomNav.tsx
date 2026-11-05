"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { CalendarDotsIcon, HouseIcon, SquaresFourIcon, StorefrontIcon } from "@phosphor-icons/react/dist/ssr";
import { QUICK_PATHS } from "./quick-menu-items";

// The sheet is only needed once someone opens it.
const QuickMenu = dynamic(() => import("./QuickMenu"), { ssr: false });

type Tab = { href: string; label: string; Icon: typeof HouseIcon; match: (path: string) => boolean };

const TABS: Tab[] = [
  { href: "/", label: "Ana sayfa", Icon: HouseIcon, match: (p) => p === "/" || p.startsWith("/forum") || p.startsWith("/ara") },
  { href: "/pazar", label: "Pazar", Icon: StorefrontIcon, match: (p) => p.startsWith("/pazar") },
  { href: "/takvim", label: "Takvim & Hava", Icon: CalendarDotsIcon, match: (p) => p.startsWith("/takvim") || p.startsWith("/hava") },
];

const item =
  "group relative flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-semibold leading-tight text-[var(--nav-fg)] transition-colors duration-150 hover:text-[var(--nav-active)] focus-visible:outline-offset-[-4px] aria-[current=page]:text-[var(--nav-active)] data-[open]:text-[var(--nav-active)]";
const pill =
  "flex h-7 w-14 items-center justify-center rounded-full transition-colors duration-200 group-aria-[current=page]:bg-[var(--nav-pill)] group-data-[open]:bg-[var(--nav-pill)]";

/**
 * The phone's tab bar, as in the app: Ana sayfa (the portal and its forum), Pazar, Takvim & Hava,
 * and "Hızlı menü" for everything else. Below 1280 px only; wide screens keep the top menu. It steps
 * aside while the on-screen keyboard is up, so it never sits on a text box.
 */
export function BottomNav() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [typing, setTyping] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const isField = (t: EventTarget | null) => t instanceof HTMLElement && (t.matches("input:not([type=checkbox]):not([type=radio]):not([type=file]), textarea, select") || t.isContentEditable);
    const onIn = (e: FocusEvent) => isField(e.target) && matchMedia("(pointer: coarse)").matches && setTyping(true);
    const onOut = () => setTyping(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  const tabs = (pathname: string) => (
    <Tabs
      pathname={pathname}
      open={open}
      trigger={trigger}
      onQuick={() => {
        setLoaded(true);
        setOpen(true);
      }}
    />
  );

  return (
    <>
      <nav
        aria-label="Alt menü"
        data-typing={typing || undefined}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--nav-line)] bg-[var(--nav-bg)] pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-200 data-[typing]:translate-y-full xl:hidden"
      >
        {/* The current page is URL data: on dynamic pages it streams in, the plain tabs show first. */}
        <Suspense fallback={tabs("")}>
          <CurrentTabs render={tabs} />
        </Suspense>
      </nav>
      {loaded && <QuickMenu open={open} onOpenChange={setOpen} returnFocusTo={trigger} />}
    </>
  );
}

function CurrentTabs({ render }: { render: (pathname: string) => React.ReactNode }) {
  return render(usePathname());
}

function Tabs({ pathname, open, trigger, onQuick }: { pathname: string; open: boolean; trigger: RefObject<HTMLButtonElement | null>; onQuick: () => void }) {
  const quickActive = Boolean(pathname) && QUICK_PATHS.some((p) => pathname.startsWith(p));
  return (
    <ul className="mx-auto flex h-[var(--bottom-nav-bar)] max-w-xl items-stretch">
      {TABS.map(({ href, label, Icon, match }) => {
        const current = Boolean(pathname) && match(pathname);
        return (
          <li key={href} className="flex min-w-0 flex-1">
            <Link href={href} aria-current={current ? "page" : undefined} className={item}>
              <span aria-hidden="true" className={pill}>
                <Icon weight={current ? "fill" : "regular"} className="size-6" />
              </span>
              <span className="max-w-full truncate px-0.5">{label}</span>
            </Link>
          </li>
        );
      })}
      <li className="flex min-w-0 flex-1">
        <button
          ref={trigger}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-current={quickActive && !open ? "page" : undefined}
          data-open={open || undefined}
          onClick={onQuick}
          className={item}
        >
          <span aria-hidden="true" className={pill}>
            <SquaresFourIcon weight={open || quickActive ? "fill" : "regular"} className="size-6" />
          </span>
          <span className="max-w-full truncate px-0.5">Hızlı menü</span>
        </button>
      </li>
    </ul>
  );
}
