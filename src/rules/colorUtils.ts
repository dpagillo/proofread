import type { ExtractedColor } from '../extractor/types';

const DEFAULT_EPSILON = 0.004;

export function colorsApproxEqual(a: ExtractedColor, b: ExtractedColor, epsilon = DEFAULT_EPSILON): boolean {
  return Math.abs(a.r - b.r) < epsilon && Math.abs(a.g - b.g) < epsilon && Math.abs(a.b - b.b) < epsilon;
}
