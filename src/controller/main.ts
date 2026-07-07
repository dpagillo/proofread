import { extractSelection } from '../extractor/walk';
import { runRules } from '../rules/engine';
import { rules } from '../rules';
import { buildRuleContext } from './fileContext';
import { onMessageFromUI, postToUI } from './messaging';

figma.showUI(__html__, { width: 380, height: 600 });

function sendSelectionInfo(): void {
  postToUI({ type: 'SELECTION_INFO', count: figma.currentPage.selection.length });
}

async function sendAnalysis(): Promise<void> {
  try {
    const [tree, context] = await Promise.all([
      extractSelection(figma.currentPage.selection),
      buildRuleContext(),
    ]);
    const findings = runRules(tree, rules, context);
    postToUI({ type: 'ANALYSIS_RESULT', findings });
  } catch (error) {
    postToUI({ type: 'ANALYSIS_ERROR', message: error instanceof Error ? error.message : String(error) });
  }
}

async function selectAndZoomTo(nodeIds: string[]): Promise<void> {
  const nodes: SceneNode[] = [];
  for (const id of nodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node && 'x' in node) {
      nodes.push(node as SceneNode);
    }
  }
  if (nodes.length === 0) return;
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);
}

sendSelectionInfo();

figma.on('selectionchange', sendSelectionInfo);

onMessageFromUI((message) => {
  if (message.type === 'REQUEST_SELECTION_INFO') {
    sendSelectionInfo();
  } else if (message.type === 'REQUEST_ANALYSIS') {
    void sendAnalysis();
  } else if (message.type === 'SELECT_NODES') {
    void selectAndZoomTo(message.nodeIds);
  }
});
