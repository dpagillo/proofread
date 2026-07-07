import type {
  AutoLayoutInfo,
  ComponentInfo,
  CornerRadius,
  DesignNode,
  ExtractedPaint,
  TextInfo,
} from './types';

function extractPaints(paints: readonly Paint[] | typeof figma.mixed | undefined): ExtractedPaint[] {
  if (!paints || paints === figma.mixed) {
    return [];
  }
  return paints
    .filter((paint) => paint.visible !== false)
    .map((paint) => {
      const extracted: ExtractedPaint = {
        paintType: paint.type,
        boundToVariable:
          paint.type === 'SOLID' &&
          Boolean(paint.boundVariables && Object.keys(paint.boundVariables).length > 0),
      };
      if (paint.type === 'SOLID') {
        extracted.color = {
          r: paint.color.r,
          g: paint.color.g,
          b: paint.color.b,
          a: paint.opacity ?? 1,
        };
      }
      return extracted;
    });
}

function extractCornerRadius(node: SceneNode): CornerRadius {
  if (!('cornerRadius' in node)) {
    return null;
  }
  if (node.cornerRadius !== figma.mixed) {
    return { uniform: node.cornerRadius as number };
  }
  if (
    'topLeftRadius' in node &&
    'topRightRadius' in node &&
    'bottomLeftRadius' in node &&
    'bottomRightRadius' in node
  ) {
    return {
      topLeft: node.topLeftRadius,
      topRight: node.topRightRadius,
      bottomLeft: node.bottomLeftRadius,
      bottomRight: node.bottomRightRadius,
    };
  }
  return null;
}

function extractAutoLayout(node: SceneNode): AutoLayoutInfo | null {
  if (
    !('layoutMode' in node) ||
    (node.layoutMode !== 'HORIZONTAL' && node.layoutMode !== 'VERTICAL')
  ) {
    return null;
  }
  return {
    layoutMode: node.layoutMode,
    itemSpacing: node.itemSpacing,
    paddingLeft: node.paddingLeft,
    paddingRight: node.paddingRight,
    paddingTop: node.paddingTop,
    paddingBottom: node.paddingBottom,
  };
}

async function extractComponentInfo(node: SceneNode): Promise<ComponentInfo | null> {
  if (node.type === 'INSTANCE') {
    const mainComponent = await node.getMainComponentAsync();
    return {
      kind: 'INSTANCE',
      mainComponentId: mainComponent?.id ?? null,
      mainComponentName: mainComponent?.name ?? null,
    };
  }
  if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    return { kind: 'DEFINITION', componentId: node.id };
  }
  return null;
}

async function extractTextInfo(node: SceneNode): Promise<TextInfo | null> {
  if (node.type !== 'TEXT') {
    return null;
  }

  if (node.fontName !== figma.mixed) {
    try {
      await figma.loadFontAsync(node.fontName);
    } catch {
      // Font isn't available locally (e.g. a font not installed on this machine).
      // Fall back to whatever text properties can still be read without it.
    }
  }

  let characters = '';
  try {
    characters = node.characters.slice(0, 80);
  } catch {
    characters = '';
  }

  const boundToTextStyleVariable = Boolean(
    node.boundVariables?.fontSize || node.boundVariables?.fontFamily || node.boundVariables?.fontStyle,
  );

  return {
    characters,
    fontSize: node.fontSize === figma.mixed ? 'MIXED' : node.fontSize,
    fontFamily: node.fontName === figma.mixed ? 'MIXED' : node.fontName.family,
    fontStyle: node.fontName === figma.mixed ? 'MIXED' : node.fontName.style,
    textStyleId: typeof node.textStyleId === 'string' && node.textStyleId.length > 0 ? node.textStyleId : null,
    boundToTextStyleVariable,
  };
}

function hasChildren(node: SceneNode): node is SceneNode & ChildrenMixin {
  return 'children' in node;
}

function extractFillStyleId(node: SceneNode): string | 'MIXED' | null {
  if (!('fillStyleId' in node)) {
    return null;
  }
  if (node.fillStyleId === figma.mixed) {
    return 'MIXED';
  }
  return node.fillStyleId.length > 0 ? node.fillStyleId : null;
}

export async function extractNode(node: SceneNode): Promise<DesignNode> {
  const [component, text] = await Promise.all([extractComponentInfo(node), extractTextInfo(node)]);

  const children = hasChildren(node) ? await Promise.all(node.children.map(extractNode)) : [];

  return {
    id: node.id,
    name: node.name,
    nodeType: node.type,
    width: 'width' in node ? node.width : 0,
    height: 'height' in node ? node.height : 0,
    x: 'x' in node ? node.x : 0,
    y: 'y' in node ? node.y : 0,
    visible: node.visible,
    fills: 'fills' in node ? extractPaints(node.fills as readonly Paint[] | typeof figma.mixed) : [],
    fillStyleId: extractFillStyleId(node),
    strokes: 'strokes' in node ? extractPaints(node.strokes) : [],
    cornerRadius: extractCornerRadius(node),
    autoLayout: extractAutoLayout(node),
    component,
    text,
    children,
  };
}
