# UI interaction sources

**The workbench uses small app-owned React/CSS adaptations. No animation package was added.**

## Ownership

| Source | Implementation | Deliberate adaptation |
| --- | --- | --- |
| amicro AnimatedButton | [CopyMark](../../apps/studio/src/features/experience/action-feedback.tsx), `.micro-arrow` in [workbench CSS](../../apps/studio/src/styles/workbench.css) | Actual clipboard success drives the check; hover only moves the CTA arrow |
| amicro TabBar | [TabList](../../apps/studio/src/features/experience/tab-list.tsx) | All labels remain visible; roving keyboard focus and tab/panel relationships |
| amicro FadeIn/FadeUp | Workbench CSS panel treatment | Opacity and a 3 px landing offset; no editor offset, hidden initial content or Motion runtime |
| Aceternity Compare/Tabs/sidebar | [Cinematic hero](../../apps/studio/src/features/landing/cinematic-hero.tsx), [catalogue sidebar](../../apps/studio/src/features/examples/catalogue-sidebar.tsx) | Native draggable range plus complete Output/Code views; mobile panels and search |

## Provenance and license

- amicro revision: `86b55340bfb939b8e93bb53aa46ba017c3449f1c`.
- Exact source links and reviewed demo behavior: [interaction contract](../specs/workbench-interactions.md#pinned-sources).
- Retained upstream [MIT notice](amicro-license.txt), copyright 2026 SYED SUBHAN UDDIN.
- The [notice generator](../../scripts/third-party-notices.mjs) includes this notice in the built `/licenses.txt`.
- Aceternity is a structural reference; its component implementation is not copied into this checkout.

These are source-derived adaptations, not pixel-identical ports. Page effects and reduced-motion preferences control decorative transitions. Copy, navigation and fitting remain owned by their existing features. Published packages have no amicro, Motion, Framer Motion, Tailwind or icon dependency.
