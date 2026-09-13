# Workbench interactions: use amicro selectively

**Use amicro for action feedback and small transitions. Keep the cinematic
console output as the main visual attraction.**

Status: selected source direction, 2026-09-13. The maintainer explicitly requested
[amicro](https://amicro.vercel.app/) after reviewing the workbench proposal.
This extends that proposal; product UI implementation still awaits its existing
review checkpoint. No additional approval is needed merely to select amicro.

## 1. Use these four adaptations

| ConsoleFX location | amicro source | Adaptation |
| --- | --- | --- |
| **Open workbench** and **Edit this example** | `AnimatedButton`, `slide-arrow` treatment | Short directional icon movement on hover/focus; stable label, hit area and link semantics |
| **Copy console.log / Copy recipe** | `AnimatedButton`, copy/check morph | Animate between ready and confirmed-success icons; ConsoleFX's clipboard result owns the state |
| Hero use-case tabs and mobile Edit/Output/Code tabs | `TabBar` selected-item treatment | Subtle selected background/indicator; keep every label visible and add complete tab semantics |
| User-selected preview/code panel changes | `FadeIn` / `FadeUp` opacity, offset and easing | Short opacity transition; at most a small offset in the landing hero, with no editor remount or hidden initial content |

- Adapt the selected source into **app-owned components** with attribution.
  Do not import the entire demo's configurable `AnimatedButton` switch tree.
- Keep Aceternity's Compare/Tabs as structural references. amicro supplies
  their visual interaction treatment; there is still one shared tab primitive.
- Keep sidebar categories readable and stationary. Selecting a category may
  change its indicator, but must not move the click target or hide other labels.
- Keep the Compare handle directly controlled by the pointer/keyboard; no
  spring delay, automatic sweep or animation of its hit target.
- Cinematic profiles remain static. Website transitions never enable console
  motion, change a recipe, log, or affect the capability resolver.

## 2. Correct the demo behavior during adaptation

| Observed source behavior | ConsoleFX requirement |
| --- | --- |
| Copy treatment changes to “Copied” on hover/touch | Ready → copying → copied/error follows the real clipboard promise. Hover cannot report success; errors retain recovery instructions. |
| TabBar renders text only for the selected item and lacks a complete tab contract | Keep visible labels, `tablist`/`tab`/`tabpanel` relationships, arrow/Home/End navigation and visible focus. |
| Entrance components start at opacity zero | Base/SSR/no-JS content stays visible. Enhance only after activation; optional animation failure leaves content usable. |
| Selected components do not consult the reduced-motion preference | Reuse ConsoleFX's page-effects policy and reduced-motion handling. State changes remain immediate when effects are off. |
| Demo buttons own hover timers and illustrative icon states | Existing app actions own success/error and cleanup. Adapted presentation components receive state and emit no side effects. |

The Copy observation was reproduced on the public demo with **hover only**;
no Copy click or clipboard write was performed. The matching source uses
`hasInteracted || isHovered` to select the success presentation. This is a demo
behavior to replace, not an application contract to import.
[Pinned button source](https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/86b55340bfb939b8e93bb53aa46ba017c3449f1c/src/components/AnimatedButton.tsx).

## 3. Keep dependencies and ownership small

- Use source-derived adaptations with existing React and CSS. Translate the
  selected opacity/transform treatments; record deliberate differences from
  the original Motion spring animations. Do not claim pixel-identical ports.
- Keep them under the app's existing experience/shared UI ownership. Core and
  the published React adapter gain no amicro, Motion, Tailwind or icon dependency.
- Do not run an unpinned installation command from the demo. The inspected
  repository manifest's entrypoint is `dist/index.html`, and its dependencies
  include the website/chart stack. It is not the runtime boundary proposed here.
- Do not introduce both `motion/react` and `framer-motion`: the inspected demo
  and entrance registry use different import styles. These small adaptations
  do not require either runtime.
- Retain the upstream MIT copyright/permission notice with any copied or
  substantially adapted source, and include it in the deployed
  `apps/studio/public/licenses.txt` notice workflow when implementation lands.

The [pinned package manifest](https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/86b55340bfb939b8e93bb53aa46ba017c3449f1c/package.json)
and [MIT license](https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/86b55340bfb939b8e93bb53aa46ba017c3449f1c/LICENSE)
were inspected. This document does not install or ship upstream source.

## 4. Use a restrained motion policy

| Interaction | Starting design value | When effects are off |
| --- | --- | --- |
| Button icon/press feedback | 120–180 ms; stable button geometry | Immediate state change |
| Active tab indicator | About 180 ms; animate its decoration only | Immediate selected state |
| Output/Code panel opacity | About 160 ms; zero positional movement in the editor | Immediate panel change |
| Landing-only panel entrance | At most 4 px over 200 ms | Visible immediately |

These are design starting values, not measured performance claims. Use the
existing effects preference, clean up pending timers/animations on replacement,
and never replay entrance animation on every text edit. Keep captions,
diagnostics, keyboard focus and copy controls readable throughout.

Card fans, 3D carousels, magnetic targets, blur-on-hover links and ambient
loaders are outside this selection. They do not help the requested persistent
editor workflow. A loader is appropriate only for an actual pending operation.

## 5. Verify at the owning milestone

1. **Action controls:** extend the existing copy failure/success journey;
   hovering must remain silent and must not report a completed copy.
2. **Tabs and reveal:** one representative keyboard/pointer journey plus the
   narrow layout; retain the mounted editing session and complete readable code.
3. **Motion policy:** effects off, reduced motion and no-JS content remain usable;
   rapid selection or unmount leaves no running decoration.
4. **Final integration:** inspect the app dependency/bundle change, deployed
   notice and actual rendered states. Renderer qualification is needed only if
   a renderer/output contract changes.

Use the [existing milestone testing strategy](testing-strategy.md), not one
test per animation or timing constant. The completed test-cleanup results are
unchanged by this documentation update; adapted components are not yet tested
or implemented.

## Pinned sources

Revision: `86b55340bfb939b8e93bb53aa46ba017c3449f1c`, retrieved 2026-09-13.
The live demo was inspected separately; its build is not claimed identical to
that repository revision.

- [AnimatedButton](https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/86b55340bfb939b8e93bb53aa46ba017c3449f1c/src/components/AnimatedButton.tsx): directional CTA and copy/check presentation.
- [TabBar](https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/86b55340bfb939b8e93bb53aa46ba017c3449f1c/src/components/css-animations/TabBar.tsx): selected-item visual treatment.
- [FadeIn](https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/86b55340bfb939b8e93bb53aa46ba017c3449f1c/registry/ui/entrance/fade-in.tsx) and [FadeUp](https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/86b55340bfb939b8e93bb53aa46ba017c3449f1c/registry/ui/entrance/fade-up.tsx): opacity/offset and easing references.
- [Preset values](https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/86b55340bfb939b8e93bb53aa46ba017c3449f1c/registry/lib/presets.ts): inspected for transition vocabulary; no spring runtime selected.
- [License](https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/86b55340bfb939b8e93bb53aa46ba017c3449f1c/LICENSE): MIT, copyright 2026 SYED SUBHAN UDDIN.

Retrieved source hashes and local browser observations are under
`.artifacts/workbench-plan/amicro/`. They establish source selection and demo
behavior, not ConsoleFX runtime acceptance or a publication claim.
