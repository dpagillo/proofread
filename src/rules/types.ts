import type { DesignNode, ExtractedColor } from '../extractor/types';

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

export type ColorDefinition = {
  id: string;
  name: string;
  color: ExtractedColor;
};

export type RuleContext = {
  colorStyles: ColorDefinition[];
  colorVariables: ColorDefinition[];
  componentNames: Set<string>;
};

export type Rule = {
  id: string;
  category: FindingCategory;
  evaluate: (roots: DesignNode[], context: RuleContext) => Finding[];
};
