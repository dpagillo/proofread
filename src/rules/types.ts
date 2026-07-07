import type { DesignNode } from '../extractor/types';

export type FindingCategory = 'design-system' | 'accessibility' | 'layout';

export type FindingSeverity = 'error' | 'warning' | 'suggestion';

export type Finding = {
  id: string;
  ruleId: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  recommendation: string;
  nodeIds: string[];
};

export type Rule = {
  id: string;
  category: FindingCategory;
  evaluate: (roots: DesignNode[]) => Finding[];
};
