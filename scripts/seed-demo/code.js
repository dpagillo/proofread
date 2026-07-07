// Throwaway dev script: seeds the current page with a demo setup that
// triggers Proofread's detached-component and hardcoded-color rules.
// Not part of the plugin build — import and run this manifest once via
// Plugins > Development > Import plugin from manifest..., then switch
// back to running the real Proofread plugin.

try {
  const BRAND_BLUE = { r: 0.2, g: 0.4, b: 1 }; // #3366FF

  // Reference frame holding the "real" component + color style.
  const libraryFrame = figma.createFrame();
  libraryFrame.name = 'Component Library (reference only)';
  libraryFrame.resize(400, 200);
  libraryFrame.x = 0;
  libraryFrame.y = 0;

  const buttonComponent = figma.createComponent();
  buttonComponent.name = 'Primary Button';
  buttonComponent.resize(160, 48);
  buttonComponent.fills = [{ type: 'SOLID', color: BRAND_BLUE }];
  libraryFrame.appendChild(buttonComponent);
  buttonComponent.x = 20;
  buttonComponent.y = 20;

  const paintStyle = figma.createPaintStyle();
  paintStyle.name = 'Brand/Primary Blue';
  paintStyle.paints = [{ type: 'SOLID', color: BRAND_BLUE }];

  // Demo frame — select THIS one when running Proofread.
  const demoFrame = figma.createFrame();
  demoFrame.name = 'Proofread Demo Selection';
  demoFrame.resize(400, 300);
  demoFrame.x = 500;
  demoFrame.y = 0;

  // Detached component: instance created then immediately detached,
  // keeping the original component's name so the name-match heuristic fires.
  const instance = buttonComponent.createInstance();
  demoFrame.appendChild(instance);
  instance.x = 20;
  instance.y = 20;
  const detachedFrame = instance.detachInstance();
  detachedFrame.name = buttonComponent.name;

  // Hardcoded color: same RGB as the paint style above, but typed directly
  // rather than applied via the style, so fillStyleId stays unset.
  const rect = figma.createRectangle();
  rect.name = 'Hardcoded Fill Example';
  rect.resize(160, 48);
  demoFrame.appendChild(rect);
  rect.x = 20;
  rect.y = 100;
  rect.fills = [{ type: 'SOLID', color: BRAND_BLUE }];

  figma.currentPage.selection = [demoFrame];
  figma.viewport.scrollAndZoomIntoView([libraryFrame, demoFrame]);

  figma.closePlugin('Seeded demo data. "Proofread Demo Selection" is now selected — run Proofread on it.');
} catch (error) {
  figma.closePlugin('Seed script failed: ' + (error && error.message ? error.message : String(error)));
}
