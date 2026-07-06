import { onMessageFromUI, postToUI } from './messaging';

figma.showUI(__html__, { width: 360, height: 480 });

function sendSelectionInfo(): void {
  postToUI({ type: 'SELECTION_INFO', count: figma.currentPage.selection.length });
}

sendSelectionInfo();

figma.on('selectionchange', sendSelectionInfo);

onMessageFromUI((message) => {
  if (message.type === 'REQUEST_SELECTION_INFO') {
    sendSelectionInfo();
  }
});
