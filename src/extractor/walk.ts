import { extractNode } from './extractNode';
import type { DesignNode } from './types';

export async function extractSelection(selection: readonly SceneNode[]): Promise<DesignNode[]> {
  return Promise.all(selection.map(extractNode));
}
