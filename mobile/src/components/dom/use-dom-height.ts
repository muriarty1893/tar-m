import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DOMProps } from 'expo/dom';

/*
 * Why DOM components need help to start in Expo Go (Android):
 * Expo's page reads two startup values, the host OS and the first props, from
 * `ReactNativeWebView.injectedObjectJson()` while it loads. react-native-webview only defines that
 * function once the page has started loading, which can be too late; the component then throws
 * "Top OS ($$EXPO_DOM_HOST_OS) is not defined" and stays blank. Two fixes, both no-ops when the
 * page started fine:
 *   1. FILL_DOM_GLOBALS runs at page start and copies the values over the moment the function is
 *      defined, which is still before the component's bundle (a separate download) runs.
 *   2. useDomStart, a fallback: after load, if the component still didn't start, it sets the values
 *      and runs the bundle again.
 */

const FILL_DOM_GLOBALS = `(function () {
  var bridge = window.ReactNativeWebView = window.ReactNativeWebView || {};
  function fill(get) {
    try {
      var injected = JSON.parse(get());
      if (window.$$EXPO_DOM_HOST_OS === undefined) window.$$EXPO_DOM_HOST_OS = injected.EXPO_DOM_HOST_OS;
      if (window.$$EXPO_INITIAL_PROPS === undefined) window.$$EXPO_INITIAL_PROPS = injected.initialProps;
    } catch (e) {}
  }
  if (typeof bridge.injectedObjectJson === 'function') fill(bridge.injectedObjectJson);
  var current = bridge.injectedObjectJson;
  try {
    Object.defineProperty(bridge, 'injectedObjectJson', {
      configurable: true,
      get: function () { return current; },
      set: function (fn) { current = fn; if (typeof fn === 'function') fill(fn); },
    });
  } catch (e) {}
})();
true;`;

/** Metro's bundle starts from a clean module table on each run, so running it again is a clean start. */
const RESTART_DOM = `(function () {
  function restart() {
    if (window.$$EXPO_DOM_HOST_OS !== undefined || window.__domRestarted) return;
    var bridge = window.ReactNativeWebView;
    if (!bridge || typeof bridge.injectedObjectJson !== 'function') return;
    try {
      var injected = JSON.parse(bridge.injectedObjectJson());
      window.$$EXPO_DOM_HOST_OS = injected.EXPO_DOM_HOST_OS;
      window.$$EXPO_INITIAL_PROPS = injected.initialProps;
    } catch (e) {
      return;
    }
    var scripts = document.querySelectorAll('script[src]');
    var bundle = scripts[scripts.length - 1];
    if (!bundle) return;
    window.__domRestarted = true;
    var again = document.createElement('script');
    again.src = bundle.src;
    document.body.appendChild(again);
  }
  if (document.readyState === 'complete') restart();
  else window.addEventListener('load', restart);
})();
true;`;

/** Expo Go's web view doesn't run `injectedJavaScript`, so the fallback is sent from here, for a while after mount. */
const RESTART_EVERY_MS = 1000;
const RESTART_TRIES = 30;

/** What a DOM component's `ref` reaches on the native side: its web view. */
export type DomViewRef = { injectJavaScript?: (script: string) => void };

/**
 * The fallback start (see above): pass the returned ref as the DOM component's `ref`. When the
 * component is remounted under a new React `key`, pass that key too, so the new web view gets a
 * fresh ref (Expo binds a ref to the first web view it sees).
 */
export function useDomStart(key?: unknown) {
  // A new ref object per key, on purpose.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ref = useMemo<{ current: DomViewRef | null }>(() => ({ current: null }), [key]);
  useEffect(() => {
    let tries = 0;
    const id = setInterval(() => {
      ref.current?.injectJavaScript?.(RESTART_DOM);
      if (++tries >= RESTART_TRIES) clearInterval(id);
    }, RESTART_EVERY_MS);
    return () => clearInterval(id);
  }, [ref]);
  return ref;
}

/**
 * The web view every DOM component runs in. Expo defaults to `@expo/dom-webview`, but Expo Go
 * (57.0.9 from the Play Store) doesn't ship that native view, so mounting one crashes the app
 * ("Can't find ViewManager ExpoDomWebViewModule"). Expo Go does ship `react-native-webview`.
 */
export const DOM_BASE: DOMProps = { useExpoDOMWebView: false, scrollEnabled: false, injectedJavaScriptBeforeContentLoaded: FILL_DOM_GLOBALS };

/**
 * Sizes a DOM component to its content's height while it fills its parent's width: pass `onHeight`
 * to the component (it reports from inside the web view) and spread `dom`.
 */
export function useDomHeight(initial: number) {
  const [height, setHeight] = useState(initial);
  const onHeight = useCallback(async (h: number) => {
    if (h > 0) setHeight(h);
  }, []);
  const dom: DOMProps = { ...DOM_BASE, containerStyle: { width: '100%', height }, style: { height } };
  return { onHeight, dom };
}
