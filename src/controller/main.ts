import { extractSelection } from '../extractor/walk';
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

sendSelectionInfo();

figma.on('selectionchange', sendSelectionInfo);

onMessageFromUI((message) => {
  if (message.type === 'REQUEST_SELECTION_INFO') {
    sendSelectionInfo();
  } else if (message.type === 'REQUEST_EXTRACTION') {
    void sendExtraction();
  }
});
