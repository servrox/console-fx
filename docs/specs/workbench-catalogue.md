# Workbench catalogue: categories and existing examples

**Use jobs for navigation. Keep visual treatments as searchable variants.**

Status: Proposed. Companion to the [workbench proposal](workbench-proposal.md).
Inventory: main `4f93269`, inspected 2026-09-13.

## Category boundaries

| Stable category ID | Label | Includes | Put elsewhere |
| --- | --- | --- | --- |
| `brand` | Brand & signatures | Project identity, greetings without a task, credits, logos | A welcome containing instructions belongs in Guides. |
| `diagnostics` | Debugging & diagnostics | Investigation, requests, failures, warnings, recovery hints | A normal startup/context message belongs in Runtime. |
| `runtime` | Runtime & environment | Startup readiness, environment and service labels | Build history and delivery outcomes belong in Builds. |
| `releases` | Builds & releases | Build results, revisions, releases, milestones | A live request failure belongs in Diagnostics. |
| `guides` | Guides & onboarding | Commands, setup steps, next actions, SDK introductions | A purely decorative greeting belongs in Brand. |
| `delight` | Easter eggs & celebrations | Optional surprises and playful messages | Release facts stay in Builds; use a celebration tag to cross-link. |

- Classify by the sample's **primary purpose**, not its color or renderer.
- One primary category prevents duplicate sidebar identities. Search can use
  additional purpose tags such as `warning`, `startup`, `release` or `credits`.
- Style tags are editorial: `cinematic`, `ascii`, `neon`, `metal`, `minimal`,
  `card`. Supported-feature filters come from the resolver.
- All runtime values, endpoints and commands in examples are **sample data**.
  Selection does not collect telemetry, call an API or execute a shown command.

## Complete migration map

Namespaced IDs avoid collisions between today's three inventories. These IDs
are discovery references; saved documents contain complete recipes.

| Proposed example ID | Primary category | Discovery grouping |
| --- | --- | --- |
| `preset:badge` | brand | Badge greeting |
| `preset:neon` | brand | Styled signature |
| `preset:rgbSplit` | brand | Styled signature |
| `preset:extruded` | brand | Styled signature |
| `preset:holographic` | brand | Styled signature |
| `preset:gold` | brand | Styled signature |
| `preset:chrome` | brand | Styled signature |
| `preset:crt` | brand | Styled signature |
| `preset:rainbow` | brand | Styled signature |
| `preset:lightningMetal` | brand | Cinematic signature — hero default |
| `preset:iceCathedral` | brand | Cinematic signature |
| `preset:liquidChrome` | brand | Cinematic signature |
| `preset:moltenGold` | brand | Cinematic signature |
| `preset:buildReceipt` | releases | Build receipt |
| `preset:requestTrace` | diagnostics | Request trace |
| `preset:releaseBulletin` | releases | Release bulletin |
| `preset:commandCard` | guides | Next step |
| `preset:serviceReady` | runtime | Service readiness |
| `preset:blueprint` | brand | Artful signature |
| `preset:contourMap` | brand | Artful signature |
| `preset:letterpress` | brand | Artful signature |
| `preset:signalHalftone` | brand | Artful signature |
| `preset:orbital` | brand | Artful signature |
| `featured:signature` | brand | Styled signature |
| `featured:sdkWelcome` | guides | Next step — SDK variant |
| `featured:devContext` | releases | Build receipt — detailed context variant |
| `featured:milestone` | releases | Release bulletin — milestone variant |
| `featured:chromeTitle` | brand | Styled signature |
| `featured:quietEditorial` | brand | Quiet credits |
| `reference:neonText` | brand | Styled signature |
| `reference:asciiSignature` | brand | ASCII and logos |
| `reference:gradientText` | brand | Styled signature |
| `reference:boxedMessage` | brand | Framed greeting |
| `reference:successMessage` | releases | Completion notice |
| `reference:warningMessage` | diagnostics | Warning and next step |
| `reference:errorMessage` | diagnostics | Failure and recovery |
| `reference:animatedSvg` | delight | Decorative message |
| `reference:multilineLayout` | guides | Multiline instructions |
| `reference:tabularLayout` | guides | Renderer comparison |
| `reference:badgesAndLabels` | runtime | Environment labels |
| `reference:customBrand` | brand | ASCII and logos |
| `reference:asciiLogo` | brand | ASCII and logos |
| `reference:animatedDolphin` | delight | Dolphin surprise |

**Accounting:** Brand 27; Diagnostics 3; Runtime 2; Builds 5; Guides 4;
Easter eggs 2. Total **43**. Brand's many treatments are grouped variants,
not 27 equally prominent sidebar rows.

`featured:devContext` currently contains a build receipt, despite its old “Dev
context” label. Categorize its actual content under Builds and use an
`environment` tag. Add a true runtime snapshot later; do not relabel sample
build facts as live application information.

## What a visitor sees

1. Open a category to see a few example families with purpose-first names.
2. Choose an example; its variants appear beside the title or in a secondary
   list. Every current recipe remains reachable and searchable by its old name.
3. Edit meaningful fields and copy the output. The editor uses the current
   recipe's capabilities, including after an import.

Grouping is presentational. Selecting another variant is an explicit,
undoable recipe replacement. Do not guess how edited fields map between an
ordinary scene, a closed card and a cinematic profile.

## Grow without reshaping the sidebar

| Possible later example | Existing category | What would actually be new? |
| --- | --- | --- |
| Package signature with version and credits | Brand & signatures | A sample recipe using existing content primitives |
| Request failure with a correlation ID | Debugging & diagnostics | A request-trace variant; caller supplies the ID |
| Configuration summary | Runtime & environment | A labelled sample record; no environment inspection |
| Deployment result | Builds & releases | A build/release variant; no deployment integration |
| First API call walkthrough | Guides & onboarding | Instructions and code shown as text; no network call |
| Release-day mascot greeting | Easter eggs & celebrations | An original content recipe; any new motion needs real support |

These are extension examples, **not additional implementation commitments**.
Add a new primary category only when a recurring job cannot be understood in
an existing one. An extra visual effect alone never needs a category.

## Source inventory

- [23 public preset factories](../../packages/console-fx/src/presets/index.ts)
- [Six featured recipes](../../apps/studio/src/features/landing/examples.ts)
- [14 reference recipes](../../apps/studio/src/features/examples/reference-examples.ts)
- [Capability and navigation rules](workbench-contract.md)
