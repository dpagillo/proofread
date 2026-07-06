import { useEffect, useState } from 'react';
import type { PluginToUIMessage, UIToPluginMessage } from '../shared/messages';
import type { DesignNode } from '../extractor/types';

function postToPlugin(message: UIToPluginMessage): void {
  parent.postMessage({ pluginMessage: message }, '*');
}

export function App() {
  const [selectionCount, setSelectionCount] = useState<number | null>(null);
  const [tree, setTree] = useState<DesignNode[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const message = event.data.pluginMessage as PluginToUIMessage | undefined;
      if (message?.type === 'SELECTION_INFO') {
        setSelectionCount(message.count);
        setTree(null);
        setError(null);
      } else if (message?.type === 'EXTRACTION_RESULT') {
        setTree(message.tree);
        setError(null);
      } else if (message?.type === 'EXTRACTION_ERROR') {
        setError(message.message);
        setTree(null);
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
        <>
          <p style={{ marginBottom: 12 }}>
            {selectionCount} node{selectionCount === 1 ? '' : 's'} selected.
          </p>
          <button onClick={() => postToPlugin({ type: 'REQUEST_EXTRACTION' })}>
            Extract selection (debug)
          </button>
        </>
      )}
      {error && <p style={{ color: '#c00', marginTop: 12 }}>Extraction failed: {error}</p>}
      {tree && (
        <pre
          style={{
            marginTop: 12,
            padding: 8,
            background: '#f5f5f5',
            fontSize: 10,
            maxHeight: 320,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {JSON.stringify(tree, null, 2)}
        </pre>
      )}
    </main>
  );
}
