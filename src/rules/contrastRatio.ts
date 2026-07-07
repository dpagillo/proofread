import type { DesignNode, ExtractedColor } from '../extractor/types';
import type { Finding, Rule } from './types';

const DEFAULT_BACKGROUND: ExtractedColor = { r: 1, g: 1, b: 1, a: 1 };
const NORMAL_TEXT_MIN_RATIO = 4.5;
const LARGE_TEXT_MIN_RATIO = 3.0;

function getOpaqueSolidFill(node: DesignNode): ExtractedColor | null {
  const solid = node.fills.find((paint) => paint.paintType === 'SOLID' && paint.color && paint.color.a >= 0.99);
  return solid?.color ?? null;
}

function relativeLuminance(color: ExtractedColor): number {
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

function contrastRatio(a: ExtractedColor, b: ExtractedColor): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function isLargeText(fontSize: number | 'MIXED', fontStyle: string | 'MIXED'): boolean {
  if (fontSize === 'MIXED') return false;
  if (fontSize >= 24) return true;
  return fontSize >= 18.66 && fontStyle !== 'MIXED' && fontStyle.toLowerCase().includes('bold');
}

function walk(node: DesignNode, background: ExtractedColor, findings: Finding[]): void {
  if (node.nodeType === 'TEXT' && node.text) {
    const foreground = getOpaqueSolidFill(node);
    if (foreground) {
      const ratio = contrastRatio(foreground, background);
      const required = isLargeText(node.text.fontSize, node.text.fontStyle)
        ? LARGE_TEXT_MIN_RATIO
        : NORMAL_TEXT_MIN_RATIO;

      if (ratio < required) {
        findings.push({
          id: `contrast-ratio:${node.id}`,
          ruleId: 'contrast-ratio',
          category: 'accessibility',
          severity: 'error',
          title: 'Text contrast is below WCAG AA',
          description: `"${node.name}" has a contrast ratio of ${ratio.toFixed(2)}:1 against its background, below the ${required}:1 minimum required for ${
            required === LARGE_TEXT_MIN_RATIO ? 'large' : 'normal-sized'
          } text. Low-contrast text is harder to read, especially for users with low vision.`,
          recommendation: 'Darken the text, lighten the background, or otherwise adjust the colors until the contrast ratio meets WCAG AA.',
          nodeIds: [node.id],
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
        });
      }
    }
  }

  const nextBackground = getOpaqueSolidFill(node) ?? background;
  node.children.forEach((child) => walk(child, nextBackground, findings));
}

export const contrastRatioRule: Rule = {
  id: 'contrast-ratio',
  category: 'accessibility',
  evaluate(roots, _context) {
    const findings: Finding[] = [];
    roots.forEach((root) => walk(root, DEFAULT_BACKGROUND, findings));
    return findings;
  },
};
