import type { DesignNode } from '../extractor/types';
import type { Finding } from '../rules/types';

export type PluginToUIMessage =
  | { type: 'SELECTION_INFO'; count: number }
  | { type: 'EXTRACTION_RESULT'; tree: DesignNode[] }
  | { type: 'EXTRACTION_ERROR'; message: string }
  | { type: 'ANALYSIS_RESULT'; findings: Finding[] }
  | { type: 'ANALYSIS_ERROR'; message: string };

export type UIToPluginMessage =
  | { type: 'REQUEST_SELECTION_INFO' }
  | { type: 'REQUEST_EXTRACTION' }
  | { type: 'REQUEST_ANALYSIS' };
