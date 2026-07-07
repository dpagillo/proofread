import type { DesignNode } from '../extractor/types';
import type { Finding, Rule } from './types';

export function runRules(roots: DesignNode[], ruleSet: Rule[]): Finding[] {
  return ruleSet.flatMap((rule) => rule.evaluate(roots));
}
