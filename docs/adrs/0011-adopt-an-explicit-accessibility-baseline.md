# ADR-0011: Adopt an explicit accessibility baseline

Status: Accepted
Date: 2026-09-11
Owner: ConsoleFX maintainer
Applies when: Implementing or changing studio/documentation journeys, React preview controls, or readable console alternatives.
Supersedes: None
Superseded by: None
Approval: Maintainer approved ADR-0001 through ADR-0011 as written in the setup conversation on 2026-09-11.

## Context

The specification requires readable labels, keyboard controls, visible focus, reduced motion, and static output. The visual direction uses subtle dark surfaces whose shadows cannot alone identify controls. It does not yet name a web conformance baseline.

## Decision

Adopt [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/#conformance-reqs) for the project's studio, documentation interfaces, and React preview controls. This is a proposed product baseline, not a claim about current mockups or the browser vendor's DevTools interface.

Use semantic HTML, persistent field labels, perceivable errors/status, keyboard operation, visible focus, readable contrast, and usable zoom/reflow. Do not communicate meaning only through color, shadow, position, or motion. Preserve text alternatives for meaningful images. Critical flows include selecting/editing a scene, previewing, importing/exporting, copying, testing, and recovering from storage or clipboard failure.

Honor reduced motion and provide a static preview. Console image output retains its readable caption and bounded motion under [ADR-0006](0006-qualify-renderer-profiles-in-real-devtools.md). Decoration must not be the sole delivery channel for important application information.

Use deterministic automated checks plus manual keyboard, focus, zoom/reflow, reduced-motion, and representative screen-reader/browser checks for changed critical journeys. Record the exact artifact, setup, journey, result, and limitation. Include failure and recovery states. Automated scans alone do not establish conformance.

An exception identifies the affected criterion and journey, user impact, mitigation, maintainer approval, owner, resolution date, and verification plan. Block promotion of a changed critical journey with an unresolved accessibility failure unless that bounded exception is explicitly accepted.

## Consequences

The web implementation gains an explicit acceptance target beyond visual resemblance. Manual checks remain necessary, and accepting this ADR would extend the initial specification with the named baseline.

## Validation

Validate implemented journeys against the chosen baseline and record automation and manual observations separately. No accessibility, screen-reader, or browser interaction test was performed by this governance setup.

## Sources and lineage

- [Specification section 9](../specs/console-fx-spec.md#9-safety-accessibility-and-resource-budgets) and [current visual direction](../mockups/README.md#current-design-direction).
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/), consulted 2026-09-11.
- Adapts AC-ADR-024 to project-owned web interfaces and readable console alternatives; see [provider mapping](provider-mapping.md).
