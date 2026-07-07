import type { Finding, FindingSeverity } from '../../rules/types';

const SEVERITY_COLORS: Record<FindingSeverity, string> = {
  error: '#c0392b',
  warning: '#b7791f',
  suggestion: '#2c5282',
};

export function FindingCard({
  finding,
  onSelectNodes,
}: {
  finding: Finding;
  onSelectNodes: (nodeIds: string[]) => void;
}) {
  return (
    <div
      style={{
        border: '1px solid #e0e0e0',
        borderLeft: `3px solid ${SEVERITY_COLORS[finding.severity]}`,
        borderRadius: 4,
        padding: 10,
        marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
        <strong>{finding.title}</strong>
        <span
          style={{
            color: SEVERITY_COLORS[finding.severity],
            textTransform: 'uppercase',
            fontSize: 10,
            whiteSpace: 'nowrap',
          }}
        >
          {finding.severity}
        </span>
      </div>
      <p style={{ color: '#444', marginBottom: 6 }}>{finding.description}</p>
      <p style={{ color: '#2c5282', marginBottom: 8 }}>{finding.recommendation}</p>
      <button
        style={{ fontSize: 11 }}
        onClick={() => onSelectNodes(finding.nodeIds)}
        disabled={finding.nodeIds.length === 0}
      >
        Select in Figma
      </button>
    </div>
  );
}
