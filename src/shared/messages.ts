import type { DesignNode } from '../extractor/types';

export type PluginToUIMessage =
  | { type: 'SELECTION_INFO'; count: number }
  | { type: 'EXTRACTION_RESULT'; tree: DesignNode[] }
  | { type: 'EXTRACTION_ERROR'; message: string };

export type UIToPluginMessage =
  | { type: 'REQUEST_SELECTION_INFO' }
  | { type: 'REQUEST_EXTRACTION' };
