export type ExtractedColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type ExtractedPaint = {
  paintType: Paint['type'];
  color?: ExtractedColor;
  boundToVariable: boolean;
};

export type CornerRadius =
  | { uniform: number }
  | { topLeft: number; topRight: number; bottomLeft: number; bottomRight: number }
  | null;

export type ComponentInfo =
  | { kind: 'INSTANCE'; mainComponentId: string | null; mainComponentName: string | null }
  | { kind: 'DEFINITION'; componentId: string };

export type TextInfo = {
  characters: string;
  fontSize: number | 'MIXED';
  fontFamily: string | 'MIXED';
  fontStyle: string | 'MIXED';
  textStyleId: string | null;
  boundToTextStyleVariable: boolean;
};

export type AutoLayoutInfo = {
  layoutMode: 'HORIZONTAL' | 'VERTICAL';
  itemSpacing: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
};

export type DesignNode = {
  id: string;
  name: string;
  nodeType: SceneNode['type'];
  width: number;
  height: number;
  x: number;
  y: number;
  visible: boolean;
  fills: ExtractedPaint[];
  strokes: ExtractedPaint[];
  cornerRadius: CornerRadius;
  autoLayout: AutoLayoutInfo | null;
  component: ComponentInfo | null;
  text: TextInfo | null;
  children: DesignNode[];
};
