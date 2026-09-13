# Distinct Useful homepage examples

Date: 2026-09-13. Source base: `485882a513d0da2e5545c89ea1e5565bec893232`.
Owner: ConsoleFX maintainer; implementation and verification by Codex.

The maintainer reported that the Useful messages looked alike. Native Windows
Chrome inspection of the public homepage reproduced three instances of the same
three-line badge composition. The approved utility profiles were available in the
playground, but the landing examples still used their earlier generic scenes.

The shared landing recipe now uses the public Command Card, Build Receipt and
Release Bulletin factories. The SDK card has an inset command, the receipt has
aligned build facts and a tear edge, and the bulletin uses an editorial headline
and two highlights. Facts are fictional and marked as sample data. The depicted
SDK command remains inert text. Preview, comparison, export and editor transfer
consume the same scene. The card's own surface replaces redundant preview padding.

These are the existing 720 × 240 profile algorithms. Gallery thumbnails scale to
their available page space; this does not promise native-size thumbnail text or
new compact fitting behavior. No shared schema, renderer, package, dependency,
accepted profile or storage behavior changed. ADR-0002, ADR-0004, ADR-0007,
ADR-0009, ADR-0010 and ADR-0014 materially govern this correction.

## Local verification

- Production build and Vercel artifact preparation passed (`pnpm run build:vercel`).
- Workspace typechecking, changed-file lint/format checks and diff checks passed.
- Both existing example contract tests passed: complete plain/styled text and
  one-call exports, including literal percent and Unicode handling.
- The fourteen existing homepage cases passed at desktop and phone-sized viewports.
  Six new card cases then passed after correcting their assertion to read the
  recipe key; the legacy draft key deliberately retains the earlier scene.
- The new cases verify each named profile, exact gallery/workflow SVG, plain text,
  both affected hero choices and heading edits, confirmed transfer, export, Undo,
  preserved legacy draft and no automatic emission.
- Independent Spec and Standards reviews reported zero actionable findings.

Environment: NixOS WSL2, Node 24.20.0, pnpm 12.3.4, Playwright 1.63.0; native
Windows Chrome 153.0.8010.36 in owned contexts. Viewports: 1440 × 1000 and
390 × 664 CSS pixels (Playwright iPhone 13 descriptor). This is local browser
evidence, not a physical-phone, Safari, user-study or new DevTools qualification.
Existing qualification of the unchanged presentation algorithms retains its
original scope. The original dirty checkout and index remain protected.

![Three distinct Useful examples at desktop width](desktop.png)

[Phone-sized capture](mobile.png). Captures contain only ConsoleFX synthetic
examples and interface content, with no browser chrome, credentials or user data.

Logs and hero captures are retained locally under `.artifacts/review/useful-examples/`
and `.artifacts/website/states/useful-*`. This is the pre-publication checkpoint;
exact-source CI, protected-preview and production observations will be recorded
in the correction's pull request. They are not claimed by this checkpoint.
