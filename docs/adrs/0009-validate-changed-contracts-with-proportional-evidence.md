# ADR-0009: Validate changed contracts with proportional evidence

Status: Accepted
Date: 2026-09-11
Owner: ConsoleFX maintainer
Applies when: Selecting tests, validating a bounded change, reusing evidence, or reporting completion.
Supersedes: None
Superseded by: None
Approval: Maintainer approved ADR-0001 through ADR-0011 as written in the setup conversation on 2026-09-11.

## Context

The product has distinct compilation, generated-source, browser, DevTools, and npm-consumer boundaries. Repeating broad tests cannot substitute for proving the owning contract, and a mockup or build result cannot establish a later evidence stage.

## Decision

Identify mandatory user/repository/accepted-ADR gates, changed observable contracts, and unresolved diagnosis needs. Deduplicate by proof obligation and assign one owner per obligation. Use pure-unit checks for pure logic, contract/integration checks for serializers and adapters, and production-like browser or actual DevTools observations for the behavior those environments own. Tests control mutable state, time, randomness, and network behavior; assertions target outputs and user behavior.

Classify the highest changed-contract risk before choosing an observation environment:

| Risk | Trigger |
| --- | --- |
| low | Non-behavioral or established local adjustment; deterministic acceptance, one owner boundary, easy reversal/diagnosis, no changed external-runtime, infrastructure, public, trust, or data contract |
| moderate | Reversible behavior within one boundary that misses a low condition and has no higher trigger |
| high | Public contract, multiple boundaries, material framework/I/O/runtime/infrastructure/third-party behavior, or a critical UI flow |
| critical | Security/privacy, authorization, data integrity/loss, migrations, credentials, destructive/irreversible behavior, or broad scope without proved recovery |

Choose `reuse` for fully reconciled evidence, `final-batch` for a cohesive low-risk slice, `checkpointed` for uncertain/coupled/critical boundaries, or `reproduce-first` for a reported defect or necessary diagnosis. Observation location alone does not lower or raise risk. Governance document checks do not prove the runtime contracts they describe.

Add persistent tests for a changed observable contract, reproduced defect, critical journey, trust/data/compatibility/public boundary, demonstrated recurring regression, or mandatory gate. Do not add ceremonial tests or duplicate baseline/aggregate runs. Promote structural guidance into blocking automation only after deterministic detection, scope, negative fixtures, owned exceptions, and advisory evidence establish its value.

Each reusable receipt records obligation, owner, subject and content/artifact fingerprint, command/scenario, harness/config/fixtures/lockfile/toolchain, exactly one evidence stage, separate environment, status/result, observation time, covered contracts, limitations, invalidators, and repository-native location. Use `source/static`, `local`, `CI`, `publication/install`, `deployed/production`, or `external/third-party`; use `verified`, `failed`, `not run`, `unavailable`, or `stale` for receipt status. Never promote a claim across stages.

Reuse only when all material inputs and the governing contract still match and no newer contradictory result exists. Immutable deterministic evidence has no arbitrary expiry; volatile environment evidence is historical without a defined freshness rule. Store reusable evidence alongside the relevant spec or its explicitly chosen evidence location. The [setup receipt](setup-receipt.md) is specific to governance setup.

Complete mandatory earlier gates before checking an exact candidate in a representative Preview. Record representativeness gaps. Production observation requires separate exact-target authority and may only observe an already-present, already-authorized, low-risk artifact when Preview is unavailable/non-representative, earlier gates passed, safe data and bounded read-only/idempotent actions are used, and stop/rollback conditions are explicit. It cannot test a changed external-runtime, infrastructure, public, trust, or data contract or substitute for missing mandatory proof. Higher-risk work waits for a safe representative environment.

Freeze the candidate and run the required final gate once. On failure, localize with the smallest owning check, repair within scope, freeze again, and rerun the final gate. Classify findings as fix-and-prove-now, verify-now, defer-recorded with owner/trigger, explicitly authorized accept-risk, or evidence-backed not-applicable. Required security, data, accessibility, compatibility, and recovery failures cannot be silently deferred.

## Consequences

Each claim has an inspectable proof boundary and repeated validation needs a reason. Missing required evidence remains an explicit completion gap; no receipt grants external-action authority.

## Validation

Check each changed contract against one named obligation and owner. Verify receipt identity before reuse and invalidate only affected proof. Apply the specification's acceptance matrix when the relevant implementation exists; planned commands are not runnable gates yet.

## Sources and lineage

- [Specification sections 2 and 11](../specs/console-fx-spec.md).
- Adapts AC-ADR-018 and AC-ADR-049; AC-ADR-047 is superseded provider history, not an adoption candidate. See [provider mapping](provider-mapping.md).
