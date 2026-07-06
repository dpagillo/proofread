# Proofread

**A second set of eyes for every design.**

Proofread is a Figma plugin that gives designers a thoughtful second set of eyes before design review or engineering handoff. It scans a selected design for consistency, accessibility, and design-system issues, then provides clear, actionable suggestions that help improve quality without disrupting the designer's workflow.

Proofread is not a linter. Instead of "Detached component," it explains why that matters and what to do about it:

> This component has been detached from the design system. If this wasn't intentional, reconnecting it will make future updates easier and help maintain consistency across the product.

## MVP scope

- Runs as a local Figma plugin — no backend, hosting, database, or AI API
- Analyzes the current Figma selection
- Deterministic, rule-based checks (consistency, accessibility, design-system adherence)
- Findings displayed in a React UI, grouped by category and severity

## Status

Early planning / scaffolding stage.
