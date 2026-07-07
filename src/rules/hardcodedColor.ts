import { colorsApproxEqual } from './colorUtils';
import type { ColorDefinition, Finding, Rule } from './types';
import { flattenNodes } from './utils';

export const hardcodedColorRule: Rule = {
  id: 'hardcoded-color',
  category: 'design-system',
  evaluate(roots, context) {
    const findings: Finding[] = [];
    const library: Array<ColorDefinition & { kind: 'style' | 'variable' }> = [
      ...context.colorStyles.map((entry) => ({ ...entry, kind: 'style' as const })),
      ...context.colorVariables.map((entry) => ({ ...entry, kind: 'variable' as const })),
    ];

    for (const node of flattenNodes(roots)) {
      if (node.fillStyleId) continue;

      node.fills.forEach((paint, index) => {
        if (paint.paintType !== 'SOLID' || !paint.color || paint.boundToVariable) return;

        const match = library.find((entry) => colorsApproxEqual(entry.color, paint.color!));
        if (!match) return;

        const label = match.kind === 'style' ? 'color style' : 'variable';
        findings.push({
          id: `hardcoded-color:${node.id}:${index}`,
          ruleId: 'hardcoded-color',
          category: 'design-system',
          severity: 'warning',
          title: 'Hardcoded color matches an existing style',
          description: `This layer's fill is a hardcoded color that happens to match the "${match.name}" ${label} already defined in this file. Hardcoded values that coincidentally match a design-system value are easy to miss when that value changes later.`,
          recommendation: `Apply the "${match.name}" ${label} to this fill instead of the raw color, so it stays in sync with future updates.`,
          nodeIds: [node.id],
        });
      });
    }

    return findings;
  },
};
