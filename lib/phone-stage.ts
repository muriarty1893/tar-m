/** CSS pixel size of the simulated app screen (matches the 3D model's display aspect). */
export const SCREEN = { width: 340, height: 738, radius: 46 } as const;

type Pt = [number, number];

/**
 * CSS `matrix3d` values (column-major) that warp a `width`×`height` element, with
 * transform-origin 0 0, onto `quad` (top-left, top-right, bottom-right, bottom-left
 * in pixels): the projective map from a rectangle to the phone screen's projected corners.
 */
export function quadMatrix3d(width: number, height: number, quad: [Pt, Pt, Pt, Pt]): number[] {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = quad;
  // Unit square → quad (Heckbert, "Fundamentals of Texture Mapping", 1989).
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / det;
  const h = (dx1 * dy3 - dx3 * dy1) / det;
  const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, c = x0;
  const d = y1 - y0 + g * y1, e = y3 - y0 + h * y3, f = y0;
  // Rescale the unit square to the element's size, then lay the 3×3 out as a 4×4.
  return [a / width, d / width, 0, g / width, b / height, e / height, 0, h / height, 0, 0, 1, 0, c, f, 0, 1];
}

const SOFTWARE_GL = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/**
 * The 3D phone is an enhancement. Skip it without WebGL (`renderer` null), with a
 * CPU-only renderer (it would starve the page), or when the visitor asked to save data.
 */
export function shouldLoad3D({ renderer, saveData }: { renderer: string | null; saveData: boolean }): boolean {
  return renderer !== null && !SOFTWARE_GL.test(renderer) && !saveData;
}

/** Ease-out-cubic progress (0..1) of the intro turn after `elapsed` of `duration` seconds. */
export function introProgress(elapsed: number, duration: number): number {
  const t = Math.min(1, Math.max(0, elapsed / duration));
  return 1 - (1 - t) ** 3;
}
