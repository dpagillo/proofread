import type { Rule } from './types';
import { detachedComponentRule } from './detachedComponent';
import { hardcodedColorRule } from './hardcodedColor';
import { contrastRatioRule } from './contrastRatio';
import { inconsistentSpacingRule } from './inconsistentSpacing';

export const rules: Rule[] = [
  detachedComponentRule,
  hardcodedColorRule,
  contrastRatioRule,
  inconsistentSpacingRule,
];
