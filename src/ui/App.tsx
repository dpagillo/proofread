import { useEffect, useState } from 'react';
import type { PluginToUIMessage, UIToPluginMessage } from '../shared/messages';

function postToPlugin(message: UIToPluginMessage): void {
  parent.postMessage({ pluginMessage: message }, '*');
}

export function App() {
  const [selectionCount, setSelectionCount] = useState<number | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const message = event.data.pluginMessage as PluginToUIMessage | undefined;
      if (message?.type === 'SELECTION_INFO') {
        setSelectionCount(message.count);
      }
    }

    window.addEventListener('message', handleMessage);
    postToPlugin({ type: 'REQUEST_SELECTION_INFO' });

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <main style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, padding: 16 }}>
      <h1 style={{ fontSize: 14, marginBottom: 4 }}>Proofread</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>A second set of eyes for every design.</p>
      {selectionCount === null && <p>Loading selection…</p>}
      {selectionCount === 0 && <p>Select a frame or layer to analyze.</p>}
      {selectionCount !== null && selectionCount > 0 && (
        <p>{selectionCount} node{selectionCount === 1 ? '' : 's'} selected.</p>
      )}
    </main>
  );
}
