import type { Finding, Rule } from './types';
import { flattenNodes } from './utils';

const CONTAINER_TYPES = new Set(['FRAME', 'GROUP']);

export const detachedComponentRule: Rule = {
  id: 'detached-component',
  category: 'design-system',
  evaluate(roots, context) {
    const findings: Finding[] = [];

    for (const node of flattenNodes(roots)) {
      if (!CONTAINER_TYPES.has(node.nodeType)) continue;
      if (!context.componentNames.has(node.name)) continue;

      findings.push({
        id: `detached-component:${node.id}`,
        ruleId: 'detached-component',
        category: 'design-system',
        severity: 'warning',
        title: 'Possibly detached component instance',
        description: `"${node.name}" shares its name with a component defined elsewhere in this file, but this layer is a plain ${node.nodeType.toLowerCase()}, not a component instance — usually a sign an instance was detached.`,
        recommendation: `If this wasn't intentional, swap this layer for an instance of the "${node.name}" component so it stays connected to future design-system updates.`,
        nodeIds: [node.id],
      });
    }

    return findings;
  },
};
