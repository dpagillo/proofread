// Throwaway dev script: seeds the current page with a demo setup that
// triggers all four of Proofread's MVP rules (detached component,
// hardcoded color, low contrast text, inconsistent spacing).
// Not part of the plugin build — import and run this manifest once via
// Plugins > Development > Import plugin from manifest..., then switch
// back to running the real Proofread plugin.

(async () => {
  try {
    const BRAND_BLUE = { r: 0.2, g: 0.4, b: 1 }; // #3366FF
    const LOW_CONTRAST_GRAY = { r: 0.8, g: 0.8, b: 0.8 };

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
    demoFrame.resize(420, 220);
    demoFrame.x = 500;
    demoFrame.y = 0;

    // 1. Detached component: instance created then immediately detached,
    // keeping the original component's name so the name-match heuristic fires.
    const instance = buttonComponent.createInstance();
    demoFrame.appendChild(instance);
    instance.x = 20;
    instance.y = 20;
    const detachedFrame = instance.detachInstance();
    detachedFrame.name = buttonComponent.name;

    // 2. Hardcoded color: same RGB as the paint style above, but typed
    // directly rather than applied via the style, so fillStyleId stays unset.
    const rect = figma.createRectangle();
    rect.name = 'Hardcoded Fill Example';
    rect.resize(160, 48);
    demoFrame.appendChild(rect);
    rect.x = 220;
    rect.y = 20;
    rect.fills = [{ type: 'SOLID', color: BRAND_BLUE }];

    // 3. Low contrast text: light gray on the frame's white background,
    // well below the 4.5:1 WCAG AA minimum for normal-sized text.
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
    const lowContrastText = figma.createText();
    lowContrastText.fontName = { family: 'Inter', style: 'Regular' };
    lowContrastText.characters = 'This text is low contrast';
    lowContrastText.fontSize = 16;
    lowContrastText.fills = [{ type: 'SOLID', color: LOW_CONTRAST_GRAY }];
    demoFrame.appendChild(lowContrastText);
    lowContrastText.x = 20;
    lowContrastText.y = 100;

    // 4. Inconsistent spacing: three manually-positioned squares (not
    // auto-layout) with uneven gaps between them, grouped together.
    const squareA = figma.createRectangle();
    squareA.name = 'Square A';
    squareA.resize(40, 40);
    demoFrame.appendChild(squareA);
    squareA.x = 20;
    squareA.y = 160;

    const squareB = figma.createRectangle();
    squareB.name = 'Square B';
    squareB.resize(40, 40);
    demoFrame.appendChild(squareB);
    squareB.x = 80; // 20px gap from Square A
    squareB.y = 160;

    const squareC = figma.createRectangle();
    squareC.name = 'Square C';
    squareC.resize(40, 40);
    demoFrame.appendChild(squareC);
    squareC.x = 160; // 40px gap from Square B
    squareC.y = 160;

    const spacingGroup = figma.group([squareA, squareB, squareC], demoFrame);
    spacingGroup.name = 'Spacing Example';

    figma.currentPage.selection = [demoFrame];
    figma.viewport.scrollAndZoomIntoView([libraryFrame, demoFrame]);

    figma.closePlugin(
      'Seeded demo data covering all 4 rules. "Proofread Demo Selection" is now selected — run Proofread on it.',
    );
  } catch (error) {
    figma.closePlugin('Seed script failed: ' + (error && error.message ? error.message : String(error)));
  }
})();
