import type { PluginToUIMessage, UIToPluginMessage } from '../shared/messages';

export function postToUI(message: PluginToUIMessage): void {
  figma.ui.postMessage(message);
}

export function onMessageFromUI(handler: (message: UIToPluginMessage) => void): void {
  figma.ui.onmessage = handler;
}
