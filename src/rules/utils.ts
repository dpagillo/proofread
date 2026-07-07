import type { DesignNode } from '../extractor/types';

export function flattenNodes(roots: DesignNode[]): DesignNode[] {
  const all: DesignNode[] = [];

  function visit(node: DesignNode): void {
    all.push(node);
    node.children.forEach(visit);
  }

  roots.forEach(visit);
  return all;
}

export type NodeWithParent = {
  node: DesignNode;
  parent: DesignNode | null;
};

export function flattenWithParent(roots: DesignNode[]): NodeWithParent[] {
  const all: NodeWithParent[] = [];

  function visit(node: DesignNode, parent: DesignNode | null): void {
    all.push({ node, parent });
    node.children.forEach((child) => visit(child, node));
  }

  roots.forEach((root) => visit(root, null));
  return all;
}
