import type { ColorDefinition, RuleContext } from '../rules/types';

async function getColorStyles(): Promise<ColorDefinition[]> {
  const styles = await figma.getLocalPaintStylesAsync();
  const result: ColorDefinition[] = [];

  for (const style of styles) {
    const solid = style.paints.find(
      (paint): paint is SolidPaint => paint.type === 'SOLID' && paint.visible !== false,
    );
    if (solid) {
      result.push({
        id: style.id,
        name: style.name,
        color: { r: solid.color.r, g: solid.color.g, b: solid.color.b, a: solid.opacity ?? 1 },
      });
    }
  }

  return result;
}

async function getColorVariables(): Promise<ColorDefinition[]> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const result: ColorDefinition[] = [];

  for (const collection of collections) {
    for (const variableId of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(variableId);
      if (!variable || variable.resolvedType !== 'COLOR') continue;

      const value = variable.valuesByMode[collection.defaultModeId];
      if (value && typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value) {
        result.push({
          id: variable.id,
          name: variable.name,
          color: { r: value.r, g: value.g, b: value.b, a: 'a' in value ? value.a : 1 },
        });
      }
    }
  }

  return result;
}

function getComponentNames(): Set<string> {
  const nodes = figma.root.findAllWithCriteria({ types: ['COMPONENT', 'COMPONENT_SET'] });
  return new Set(nodes.map((node) => node.name));
}

export async function buildRuleContext(): Promise<RuleContext> {
  const [colorStyles, colorVariables] = await Promise.all([getColorStyles(), getColorVariables()]);
  return { colorStyles, colorVariables, componentNames: getComponentNames() };
}
