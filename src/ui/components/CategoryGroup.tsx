import type { Finding, FindingCategory } from '../../rules/types';
import { FindingCard } from './FindingCard';

export const CATEGORY_LABELS: Record<FindingCategory, string> = {
  'design-system': 'Design System',
  accessibility: 'Accessibility',
  layout: 'Layout',
};

export function CategoryGroup({
  category,
  findings,
  onSelectNodes,
}: {
  category: FindingCategory;
  findings: Finding[];
  onSelectNodes: (nodeIds: string[]) => void;
}) {
  if (findings.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <h2
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: '#888',
          marginBottom: 8,
        }}
      >
        {CATEGORY_LABELS[category]} ({findings.length})
      </h2>
      {findings.map((finding) => (
        <FindingCard key={finding.id} finding={finding} onSelectNodes={onSelectNodes} />
      ))}
    </div>
  );
}
