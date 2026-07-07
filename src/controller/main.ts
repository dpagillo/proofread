import { extractSelection } from '../extractor/walk';
import { runRules } from '../rules/engine';
import { rules } from '../rules';
import { buildRuleContext } from './fileContext';
import { onMessageFromUI, postToUI } from './messaging';

figma.showUI(__html__, { width: 360, height: 480 });

function sendSelectionInfo(): void {
  postToUI({ type: 'SELECTION_INFO', count: figma.currentPage.selection.length });
}

async function sendExtraction(): Promise<void> {
  try {
    const tree = await extractSelection(figma.currentPage.selection);
    postToUI({ type: 'EXTRACTION_RESULT', tree });
  } catch (error) {
    postToUI({ type: 'EXTRACTION_ERROR', message: error instanceof Error ? error.message : String(error) });
  }
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

sendSelectionInfo();

figma.on('selectionchange', sendSelectionInfo);

onMessageFromUI((message) => {
  if (message.type === 'REQUEST_SELECTION_INFO') {
    sendSelectionInfo();
  } else if (message.type === 'REQUEST_EXTRACTION') {
    void sendExtraction();
  } else if (message.type === 'REQUEST_ANALYSIS') {
    void sendAnalysis();
  }
});
