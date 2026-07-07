import type { Rule } from './types';
import { detachedComponentRule } from './detachedComponent';
import { hardcodedColorRule } from './hardcodedColor';

export const rules: Rule[] = [detachedComponentRule, hardcodedColorRule];
