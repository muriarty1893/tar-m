import { Asset } from 'expo-asset';
import { useEffect, useRef, type ReactNode } from 'react';

// The app's typeface as the website loads it (next/font): one family, with weights.
const FACES: [family: string, weight: number, file: number][] = [
  ['Plus Jakarta Sans', 400, require('@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf')],
  ['Plus Jakarta Sans', 500, require('@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf')],
  ['Plus Jakarta Sans', 600, require('@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf')],
  ['Plus Jakarta Sans', 700, require('@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf')],
  ['Plus Jakarta Sans', 800, require('@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf')],
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
    <div ref={ref} className="demo-app w-full text-[15px] leading-snug text-foreground antialiased">
      {children}
    </div>
  );
}
