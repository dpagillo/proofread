import type { Finding } from '../rules/types';

export type PluginToUIMessage =
  | { type: 'SELECTION_INFO'; count: number }
  | { type: 'ANALYSIS_RESULT'; findings: Finding[] }
  | { type: 'ANALYSIS_ERROR'; message: string };

export type UIToPluginMessage =
  | { type: 'REQUEST_SELECTION_INFO' }
  | { type: 'REQUEST_ANALYSIS' }
  | { type: 'SELECT_NODES'; nodeIds: string[] };
