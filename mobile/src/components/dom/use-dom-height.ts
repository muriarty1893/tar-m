import { useCallback, useState } from 'react';
import type { DOMProps } from 'expo/dom';

/**
 * Sizes a DOM component to its content's height while it fills its parent's width: pass
 * `onHeight` to the component (it reports from inside the web view) and spread `dom`.
 */
export function useDomHeight(initial: number) {
  const [height, setHeight] = useState(initial);
  const onHeight = useCallback(async (h: number) => {
    if (h > 0) setHeight(h);
  }, []);
  const dom: DOMProps = { scrollEnabled: false, containerStyle: { width: '100%', height }, style: { height } };
  return { onHeight, dom };
}
