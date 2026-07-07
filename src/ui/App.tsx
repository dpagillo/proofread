import { useEffect, useState } from 'react';
import type { PluginToUIMessage, UIToPluginMessage } from '../shared/messages';
import type { Finding, FindingCategory } from '../rules/types';
import { CategoryGroup } from './components/CategoryGroup';
import { EmptyState } from './components/EmptyState';

const CATEGORY_ORDER: FindingCategory[] = ['design-system', 'accessibility', 'layout'];

function postToPlugin(message: UIToPluginMessage): void {
  parent.postMessage({ pluginMessage: message }, '*');
}

export function App() {
  const [selectionCount, setSelectionCount] = useState<number | null>(null);
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const message = event.data.pluginMessage as PluginToUIMessage | undefined;
      if (message?.type === 'SELECTION_INFO') {
        setSelectionCount(message.count);
      } else if (message?.type === 'ANALYSIS_RESULT') {
        setFindings(message.findings);
        setAnalyzing(false);
        setError(null);
      } else if (message?.type === 'ANALYSIS_ERROR') {
        setError(message.message);
        setAnalyzing(false);
      }
    }

    window.addEventListener('message', handleMessage);
    postToPlugin({ type: 'REQUEST_SELECTION_INFO' });

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  function handleAnalyze() {
    setAnalyzing(true);
    setError(null);
    postToPlugin({ type: 'REQUEST_ANALYSIS' });
  }

  function handleSelectNodes(nodeIds: string[]) {
    postToPlugin({ type: 'SELECT_NODES', nodeIds });
  }

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
          <button onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? 'Analyzing…' : 'Analyze selection'}
          </button>
        </>
      )}

      {error && <p style={{ color: '#c00', marginTop: 12 }}>Analysis failed: {error}</p>}

      {findings && !analyzing && (
        <div style={{ marginTop: 16 }}>
          {findings.length === 0 ? (
            <EmptyState />
          ) : (
            CATEGORY_ORDER.map((category) => (
              <CategoryGroup
                key={category}
                category={category}
                findings={findings.filter((finding) => finding.category === category)}
                onSelectNodes={handleSelectNodes}
              />
            ))
          )}
        </div>
      )}
    </main>
  );
}
