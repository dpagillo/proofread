# Proofread

**A second set of eyes for every design.**

Proofread is a Figma plugin that gives designers a thoughtful second set of eyes before design review or engineering handoff. It scans a selected design for consistency, accessibility, and design-system issues, then provides clear, actionable suggestions that help improve quality without disrupting the designer's workflow.

Proofread is not a linter. Instead of "Detached component," it explains why that matters and what to do about it:

> This component has been detached from the design system. If this wasn't intentional, reconnecting it will make future updates easier and help maintain consistency across the product.

## MVP scope

- Runs as a local Figma plugin — no backend, hosting, database, or AI API
- Analyzes the current Figma selection on demand (manual "Analyze" trigger, not live/reactive)
- Deterministic, rule-based checks (consistency, accessibility, design-system adherence)
- Findings displayed in a React UI, grouped by category, with click-to-select back to the offending node

## The four MVP rules

Each rule returns a standardized `Finding` (title, description, recommendation, severity, related node IDs) — never a bare error code.

| Rule | Category | Why it matters |
| --- | --- | --- |
| **Detached component** | Design System | A layer's name matches a component defined elsewhere in the file, but it's a plain frame/group, not an instance — the classic sign of an accidental detach. Once detached, a layer stops receiving future design-system updates silently. |
| **Hardcoded color** | Design System | A fill's raw RGB value happens to match an existing color style or variable, but isn't linked to it. The design system already has a name for this color — using it keeps the file in sync when that value changes later. |
| **Contrast ratio** | Accessibility | Text contrast against its nearest opaque background falls below WCAG AA (4.5:1 normal text, 3:1 large/bold text). Failing this is a real, provable accessibility barrier, not a style preference. |
| **Inconsistent spacing** | Layout | Manually-positioned siblings (not auto-layout) have gaps that vary by more than a couple pixels. Usually unintentional, and reads as a layout that wasn't finished. |

## Architecture

Layered so each piece has exactly one job:

- **`src/controller/`** — the only layer that touches the Figma Plugin API directly. Reads the selection, gathers file-wide context (existing color styles/variables/component names), and drives the pipeline.
- **`src/extractor/`** — walks the selected node tree into a plain-data `DesignNode` model (dimensions, fills, corner radius, auto-layout, component/instance info, text info). No analysis logic.
- **`src/rules/`** — each rule is a self-contained `evaluate(roots, context) → Finding[]` function. Adding a rule means adding one file and one registry entry.
- **`src/shared/`** — the typed message contract between the controller and the UI.
- **`src/ui/`** — React UI. Renders findings grouped by category with severity styling and a friendly empty state. Contains no analysis logic.

## Local development

Requirements: Node 18+, the Figma desktop app.

```
npm install
npm run build     # builds dist/code.js (controller) and dist/ui.html (UI)
```

In Figma: **Plugins → Development → Import plugin from manifest...** → select this repo's `manifest.json`. Re-run with `Cmd+Option+P` after any rebuild.

Other useful scripts:

```
npm run watch:main   # esbuild --watch for the controller
npm run watch:ui     # vite build --watch for the UI
npm run lint         # ESLint
npx tsc --noEmit     # typecheck
```

## Trying it with seeded demo data

`scripts/seed-demo/` is a throwaway, separate plugin (not part of the build) that generates a frame triggering all four rules at once — useful for a quick demo without hand-building a test file.

1. **Plugins → Development → Import plugin from manifest...** → select `scripts/seed-demo/manifest.json`
2. Run it once: **Plugins → Development → Proofread — Seed Demo Data**. It creates a `Proofread Demo Selection` frame, selects it, and closes itself.
3. Switch to **Plugins → Development → Proofread** and click **Analyze selection**.

## Non-goals (by design)

Proofread does not modify the file, redesign anything automatically, use AI to generate findings, require internet access, or replace human design review. It's a second set of eyes — not a second decision-maker.

## Status

MVP feature-complete: scaffold, extractor, findings model, rule engine, all four rules, and UI polish are done and demo-ready.
