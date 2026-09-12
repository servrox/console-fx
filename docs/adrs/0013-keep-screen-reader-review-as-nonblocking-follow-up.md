# ADR-0013: Keep screen-reader review as nonblocking follow-up

Status: Accepted
Date: 2026-09-12
Owner: ConsoleFX maintainer
Applies when: Accessibility validation, launch readiness, and follow-up review of the studio, documentation, or React preview controls.
Supersedes: [ADR-0011](0011-adopt-an-explicit-accessibility-baseline.md)
Superseded by: None
Approval: On 2026-09-12 the maintainer instructed “ADR-0011 screen-reader check should not be a launch blocker” and then explicitly answered “Approve ADR-0012 and ADR-0013” when asked to accept the prepared records.

## Context

ADR-0011 made representative screen-reader/browser observations part of the required critical-journey validation. The maintainer has explicitly moved that manual observation to follow-up work. Its missing results must not prevent launch; an unperformed check must not be reported as a pass.

## Decision

Retain WCAG 2.2 AA as the product accessibility target for the studio, documentation interfaces, and React preview controls. Retain semantic HTML, persistent labels, perceivable errors/status, keyboard operation, visible focus, readable contrast, text alternatives, usable zoom/reflow, and reduced-motion/static behavior. These requirements cover selecting/editing, previewing, importing/exporting, copying, testing, and storage/clipboard failure and recovery. They do not claim conformance for vendor-owned DevTools.

Required launch validation continues to include deterministic automated checks and manual keyboard, focus, zoom/reflow, and reduced-motion observations of changed critical journeys. Representative Narrator/NVDA and browser testing remains recommended follow-up work owned by the ConsoleFX maintainer; absence of this specific manual evidence is not a launch or publication blocker. Track it as not run until actual setup, artifact, journey, and results are available. Revisit it during the next accessibility review or when assistive-technology feedback is received. Do not repeatedly request it after the maintainer defers it.

An observed unresolved accessibility failure in a changed critical journey still blocks its promotion unless an explicit bounded exception identifies the affected criterion/journey, impact, mitigation, owner, resolution date, and verification plan. Deferring an unperformed screen-reader check does not waive known failures or the other validation requirements. Automated scans alone do not establish complete conformance; documentation must identify missing manual evidence honestly.

Console image captions, bounded motion, explicit logging, actual DevTools qualification, artifact identity, and external-action authority remain governed by their existing ADRs. This decision grants no deployment or package-publication permission.

## Consequences

Launch can proceed once its other required gates and explicit release authority are satisfied. Screen-reader results remain an open follow-up, and any later findings receive their own fix and verification. ADR-0011 is retained unchanged apart from its status and reciprocal successor link.

## Validation

Check active release/specification documents for agreement: missing screen-reader observations must be described as follow-up, not a failed launch gate or completed test. Preserve other automated/manual critical-journey requirements and historical receipts. Record actual execution stages separately in the implementation evidence.

## Sources and lineage

- The maintainer's explicit 2026-09-12 instruction quoted above.
- [ADR-0011](0011-adopt-an-explicit-accessibility-baseline.md), which supplies the retained baseline.
- [ADR-0009](0009-validate-changed-contracts-with-proportional-evidence.md) and [ADR-0010](0010-deliver-reversible-phases-with-publication-gates.md) for evidence and release authority.
