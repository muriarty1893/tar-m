import { Asset } from 'expo-asset';
import { useEffect, useRef, type ReactNode } from 'react';

// The demo's fonts as the website loads them (next/font): one family per typeface, with weights.
const FACES: [family: string, weight: number, file: number][] = [
  ['DM Sans', 400, require('@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf')],
  ['DM Sans', 500, require('@expo-google-fonts/dm-sans/500Medium/DMSans_500Medium.ttf')],
  ['DM Sans', 600, require('@expo-google-fonts/dm-sans/600SemiBold/DMSans_600SemiBold.ttf')],
  ['DM Sans', 700, require('@expo-google-fonts/dm-sans/700Bold/DMSans_700Bold.ttf')],
  ['Space Grotesk', 700, require('@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf')],
];

function useDemoFonts() {
  useEffect(() => {
    if (document.getElementById('demo-fonts')) return;
    const style = document.createElement('style');
    style.id = 'demo-fonts';
    style.textContent = FACES.map(
      ([family, weight, file]) => `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;font-display:block;src:url('${Asset.fromModule(file).uri}') format('truetype');}`
    ).join('');
    document.head.appendChild(style);
  }, []);
}

/**
 * The root of every DOM component: the demo phone's scope (`.demo-app`, its palette and type,
 * app/globals.css on the website) and its base text size, so the website's components inside
 * look exactly as they do in the demo.
 */
export function DomRoot({ children, onHeight }: { children: ReactNode; onHeight?: (height: number) => Promise<void> }) {
  useDemoFonts();
  const ref = useRef<HTMLDivElement>(null);
  // Report the content's height so the native side can size the web view to fit (width stays the parent's).
  useEffect(() => {
    const el = ref.current;
    if (!el || !onHeight) return;
    const report = () => void onHeight(Math.ceil(el.getBoundingClientRect().height));
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeight]);
  return (
    <div ref={ref} className="demo-app text-[15px] leading-snug text-foreground antialiased">
      {children}
    </div>
  );
}
