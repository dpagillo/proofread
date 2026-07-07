import type { ColorDefinition, RuleContext } from '../rules/types';

function colorFromSolid(paint: SolidPaint): ColorDefinition['color'] {
  return { r: paint.color.r, g: paint.color.g, b: paint.color.b, a: paint.opacity ?? 1 };
}

async function getColorStyles(): Promise<ColorDefinition[]> {
  const result = new Map<string, ColorDefinition>();

  const localStyles = await figma.getLocalPaintStylesAsync();
  for (const style of localStyles) {
    const solid = style.paints.find(
      (paint): paint is SolidPaint => paint.type === 'SOLID' && paint.visible !== false,
    );
    if (solid) {
      result.set(style.id, { id: style.id, name: style.name, color: colorFromSolid(solid) });
    }
  }

  // Local styles only cover styles defined in this file. A style from a linked
  // team library won't show up above, so also resolve any style still actively
  // referenced by a node anywhere in the document (local or remote).
  const nodesWithFillStyle = figma.root.findAll(
    (node) => 'fillStyleId' in node && typeof node.fillStyleId === 'string' && node.fillStyleId.length > 0,
  ) as Array<SceneNode & { fillStyleId: string }>;

  const uniqueStyleIds = new Set(nodesWithFillStyle.map((node) => node.fillStyleId));
  for (const styleId of uniqueStyleIds) {
    if (result.has(styleId)) continue;
    const style = await figma.getStyleByIdAsync(styleId);
    if (style && style.type === 'PAINT') {
      const paintStyle = style as PaintStyle;
      const solid = paintStyle.paints.find(
        (paint): paint is SolidPaint => paint.type === 'SOLID' && paint.visible !== false,
      );
      if (solid) {
        result.set(styleId, { id: styleId, name: paintStyle.name, color: colorFromSolid(solid) });
      }
    }
  }

  return [...result.values()];
}

async function getColorVariables(): Promise<ColorDefinition[]> {
  const result = new Map<string, ColorDefinition>();

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  for (const collection of collections) {
    for (const variableId of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(variableId);
      if (!variable || variable.resolvedType !== 'COLOR') continue;

      const value = variable.valuesByMode[collection.defaultModeId];
      if (value && typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value) {
        result.set(variable.id, {
          id: variable.id,
          name: variable.name,
          color: { r: value.r, g: value.g, b: value.b, a: 'a' in value ? value.a : 1 },
        });
      }
    }
  }

  // Same local-only gap as styles: also resolve variables bound to a fill
  // anywhere in the document, which catches ones from a linked library.
  const nodesWithBoundFillVariable = figma.root.findAll((node) => {
    if (!('fills' in node)) return false;
    const fills = node.fills;
    return Array.isArray(fills) && fills.some((paint) => paint.type === 'SOLID' && paint.boundVariables?.color);
  }) as SceneNode[];

  const variableIds = new Set<string>();
  for (const node of nodesWithBoundFillVariable) {
    const fills = (node as unknown as { fills: Paint[] }).fills;
    for (const paint of fills) {
      if (paint.type === 'SOLID' && paint.boundVariables?.color) {
        variableIds.add(paint.boundVariables.color.id);
      }
    }
  }

  for (const variableId of variableIds) {
    if (result.has(variableId)) continue;
    const variable = await figma.variables.getVariableByIdAsync(variableId);
    if (!variable || variable.resolvedType !== 'COLOR') continue;

    const firstValue = Object.values(variable.valuesByMode)[0];
    if (firstValue && typeof firstValue === 'object' && 'r' in firstValue && 'g' in firstValue && 'b' in firstValue) {
      result.set(variableId, {
        id: variableId,
        name: variable.name,
        color: { r: firstValue.r, g: firstValue.g, b: firstValue.b, a: 'a' in firstValue ? firstValue.a : 1 },
      });
    }
  }

  return [...result.values()];
}

async function getComponentNames(): Promise<Set<string>> {
  const names = new Set<string>();

  const localDefinitions = figma.root.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] });
  localDefinitions.forEach((node) => names.add(node.name));

  // Local definitions only cover components defined in this file. A component
  // from a linked team library has no local definition node, so also resolve
  // the main component of every remaining instance (local or remote).
  const instances = figma.root.findAllWithCriteria({ types: ['INSTANCE'] });
  for (const instance of instances) {
    const mainComponent = await instance.getMainComponentAsync();
    if (mainComponent) {
      names.add(mainComponent.name);
      // Variant components are auto-named after their variant properties
      // (e.g. "Variant=Outlined, State=Enabled"), while the parent component
      // set carries the friendly name (e.g. "Text Field") shown in the
      // Assets panel — an instance may be named after either one.
      if (mainComponent.parent && mainComponent.parent.type === 'COMPONENT_SET') {
        names.add(mainComponent.parent.name);
      }
    }
  }

  return names;
}

export async function buildRuleContext(): Promise<RuleContext> {
  const [colorStyles, colorVariables, componentNames] = await Promise.all([
    getColorStyles(),
    getColorVariables(),
    getComponentNames(),
  ]);
  return { colorStyles, colorVariables, componentNames };
}
