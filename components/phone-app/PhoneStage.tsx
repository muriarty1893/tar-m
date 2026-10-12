"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { HandGrabbingIcon, PauseIcon, PlayIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { SCREEN, shouldLoad3D } from "@/lib/phone-stage";

// three.js, R3F and the 1 MB model load only when the demo nears the viewport.
const PhoneScene = dynamic(() => import("./PhoneScene"), { ssr: false, loading: () => null });

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/** The WebGL renderer's name (to spot software rendering), or null without WebGL. */
function webglRenderer(): string | null {
  try {
    const gl = document.createElement("canvas").getContext("webgl2") ?? document.createElement("canvas").getContext("webgl");
    if (!gl) return null;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return name;
  } catch {
    return null;
  }
}

/**
 * Shows the simulated app on the 3D phone model. Until the model is ready — or for
 * good when WebGL is missing or Save-Data is on — the same screen sits in a flat frame.
 */
export function PhoneStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [load, setLoad] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  const markReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
        setNear(true);
        setLoad(shouldLoad3D({ renderer: webglRenderer(), saveData }));
        near.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    const visible = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    near.observe(el);
    visible.observe(el);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, []);

  return (
    <div>
      <div ref={ref} className="stage-sky relative mx-auto h-[600px] w-full max-w-[26rem] overflow-hidden rounded-[2rem] shadow-soft ring-1 ring-border sm:h-[680px]">

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="shrink-0 scale-[0.7] sm:scale-[0.79]">
              {/* Same size before and after: the app screen (~200 nodes) mounts only once the demo is near, keeping first paint light. */}
              <div className="rounded-[56px] bg-[#1d211f] p-[10px] shadow-lift ring-2 ring-[#9ca3a0]">
                {near ? children : <div className="bg-background" style={{ width: SCREEN.width, height: SCREEN.height, borderRadius: SCREEN.radius }} />}
              </div>
            </div>
          </div>
        )}

        {load && (
          <div className="absolute inset-0">
            <PhoneScene animate={!reduced && !paused} intro={!reduced} dark={dark} active={onScreen} overlay={overlay} onReady={markReady} />
          </div>
        )}
        {ready && (
          // Warped onto the phone's display by PhoneScene each frame; hidden until the first frame places it.
          <div ref={overlay} className="invisible absolute left-0 top-0 origin-top-left">
            {children}
          </div>
        )}
      </div>

      {ready && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="hidden items-center gap-1.5 [@media(pointer:fine)]:flex">
            <HandGrabbingIcon aria-hidden="true" weight="duotone" className="size-5" />
            Telefonu sürükleyerek çevirin
          </span>
          {!reduced && (
            <Button variant="ghost" size="sm" onClick={() => setPaused((p) => !p)}>
              {paused ? <PlayIcon aria-hidden="true" weight="fill" /> : <PauseIcon aria-hidden="true" weight="fill" />}
              {paused ? "Hareketi başlat" : "Hareketi durdur"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
