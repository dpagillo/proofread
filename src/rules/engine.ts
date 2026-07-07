import type { DesignNode } from '../extractor/types';
import type { Finding, Rule, RuleContext } from './types';

export function runRules(roots: DesignNode[], ruleSet: Rule[], context: RuleContext): Finding[] {
  return ruleSet.flatMap((rule) => rule.evaluate(roots, context));
}
