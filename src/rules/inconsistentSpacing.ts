import type { Finding, Rule } from './types';
import { flattenNodes } from './utils';

const GAP_TOLERANCE_PX = 2;
const MIN_CHILDREN = 3;

export const inconsistentSpacingRule: Rule = {
  id: 'inconsistent-spacing',
  category: 'layout',
  evaluate(roots, _context) {
    const findings: Finding[] = [];

    for (const node of flattenNodes(roots)) {
      if (node.autoLayout) continue; // auto-layout already enforces uniform gaps

      const children = node.children.filter((child) => child.visible);
      if (children.length < MIN_CHILDREN) continue;

      const xSpread = Math.max(...children.map((c) => c.x)) - Math.min(...children.map((c) => c.x));
      const ySpread = Math.max(...children.map((c) => c.y)) - Math.min(...children.map((c) => c.y));
      const vertical = ySpread >= xSpread;

      const sorted = [...children].sort((a, b) => (vertical ? a.y - b.y : a.x - b.x));
      const gaps: number[] = [];
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        gaps.push(vertical ? curr.y - (prev.y + prev.height) : curr.x - (prev.x + prev.width));
      }

      if (gaps.some((gap) => gap < 0)) continue; // overlapping children — layout unclear, skip

      const maxGap = Math.max(...gaps);
      const minGap = Math.min(...gaps);
      if (maxGap - minGap > GAP_TOLERANCE_PX) {
        findings.push({
          id: `inconsistent-spacing:${node.id}`,
          ruleId: 'inconsistent-spacing',
          category: 'layout',
          severity: 'suggestion',
          title: 'Inconsistent spacing between elements',
          description: `The gaps between children of "${node.name}" range from ${Math.round(minGap)}px to ${Math.round(
            maxGap,
          )}px. Uneven spacing like this often reads as unintentional and can make a layout feel less polished.`,
          recommendation: `Align these gaps to a single consistent value, or switch "${node.name}" to an auto-layout frame so spacing is enforced automatically.`,
          nodeIds: [node.id, ...sorted.map((child) => child.id)],
        });
      }
    }

    return findings;
  },
};
