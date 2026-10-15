"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { shouldLoad3D } from "@/lib/phone-stage";
import { usePrefersReducedMotion } from "@/lib/use-media-query";
import { Loader } from "@/components/ui/loader";
import { StageBackdrop, type Backdrop } from "./StageBackdrop";

// three.js, R3F and the 1 MB model download once the page is idle (or when the demo nears the
// viewport, if that comes first), so the phone is usually ready by the time the visitor gets there.
const PhoneScene = dynamic(() => import("./PhoneScene"), { ssr: false, loading: () => null });

/** How long the loader may spin before the flat phone takes over (a stalled download). */
const GIVE_UP_MS = 12_000;

type Connection = { saveData?: boolean; effectiveType?: string };

/** A failed model download or WebGL error shows the flat phone instead of breaking the page. */
class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export { useMediaQuery, usePrefersReducedMotion } from "@/lib/use-media-query";

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
export type StageScene = { src: string; alt: string };

export function PhoneStage({
  children,
  scene = null,
  backdrop = "meadow",
}: {
  children: ReactNode;
  scene?: StageScene | null;
  /** The scene behind the phone, following the app's tab (StageBackdrop). */
  backdrop?: Backdrop;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [load, setLoad] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const markFailed = useCallback(() => setFailed(true), []);
  const reduced = usePrefersReducedMotion();
  const markReady = useCallback(() => setReady(true), []);
  // Keep the last scene mounted so clearing it fades out instead of popping.
  const [lastScene, setLastScene] = useState<StageScene | null>(scene);
  if (scene && scene.src !== lastScene?.src) setLastScene(scene);

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

  // Fetch the 3D code and model while the visitor is still reading the top of the page.
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: Connection }).connection;
    if (conn?.saveData || /2g/.test(conn?.effectiveType ?? "")) return;
    let idle = 0;
    let timer = 0;
    const fetchAhead = () => {
      if (!shouldLoad3D({ renderer: webglRenderer(), saveData: false })) return;
      import("./PhoneScene").then((m) => m.preloadPhoneModel()).catch(() => {});
    };
    const start = () => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(fetchAhead, { timeout: 3000 });
      else timer = globalThis.setTimeout(fetchAhead, 1500) as unknown as number;
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (idle) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, []);

  // A download that stalls must not leave the loader spinning: show the flat phone instead.
  useEffect(() => {
    if (!load || ready) return;
    const t = window.setTimeout(markFailed, GIVE_UP_MS);
    return () => window.clearTimeout(t);
  }, [load, ready, markFailed]);

  const loading = near && load && !failed && !ready;
  const flat = near && (!load || failed) && !ready;

  return (
    <div>
      <div
        ref={ref}
        data-scene={scene?.src}
        data-backdrop={backdrop}
        className="stage-bg relative mx-auto h-[640px] w-full overflow-hidden rounded-[2.5rem] ring-1 ring-border sm:h-[780px] lg:h-[860px]"
      >
        <StageBackdrop backdrop={backdrop} />

        {/* The chosen field fills the stage, as if the phone were standing in it and filming it live. */}
        {lastScene && (
          <div aria-hidden="true" className={`absolute inset-0 transition-opacity duration-700 ${scene ? "opacity-100" : "opacity-0"}`}>
            <Image
              key={lastScene.src}
              src={lastScene.src}
              alt=""
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="scale-105 object-cover blur-[3px] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgb(0_0_0/0)_25%,rgb(0_0_0/0.5)_100%)]" />
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Loader variant="bars" size={44} label="Demo yükleniyor" className="text-primary" />
            <p aria-hidden="true" className="text-sm font-semibold text-muted-foreground">
              Demo yükleniyor…
            </p>
          </div>
        )}

        {flat && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="shrink-0 scale-[0.74] sm:scale-[0.86] lg:scale-[0.95]">
              {/* Without 3D (no WebGL, Save-Data or a failed download) the app runs in a flat phone frame. */}
              <div className="rounded-[70px] bg-[#1d211f] p-[10px] shadow-lift ring-2 ring-[#9ca3a0]">{children}</div>
            </div>
          </div>
        )}

        {load && (
          <div className="absolute inset-0">
            <SceneBoundary onError={markFailed}>
              <PhoneScene animate={!reduced} intro={!reduced} dark={false} active={onScreen} overlay={overlay} onReady={markReady} scenery={!scene && backdrop === "meadow"} />
            </SceneBoundary>
          </div>
        )}
        {ready && (
          // Warped onto the phone's display by PhoneScene each frame; hidden until the first frame places it.
          <div ref={overlay} className="invisible absolute left-0 top-0 origin-top-left">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
