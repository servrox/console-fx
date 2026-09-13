# Published core registry verification

Observed on 2026-09-13 after the maintainer confirmed completing the approved
core publication. Public npm metadata and downloaded bytes identify
`@servrox/console-fx` **0.1.0**, SHA-256
`61672e00d7a57829085d71836ede22bbc99cfb8350b067bd3f2c17ced5886592`.
The SHA-512 integrity also matches the reviewed tarball. Both `next` and `latest`
were present in the registry; this verification changed neither tag. Website
instructions deliberately select the approved `next` preview channel.

The [installation receipt](registry-install.json) records a fresh registry-only
pnpm installation and the existing JavaScript consumer fixture. It verifies
scene/recipe round trips, public entrypoints, exact emission/export behavior,
cinematic profiles, card presentations, fitting, and private-subpath rejection.
The generated lock contains the verified registry integrity and no local package
protocols. No local tarball override or copied authentication configuration was used.
The exact first-release version was exempted from the dependency-age delay;
installation lifecycle scripts remained disabled.

The receipt identifies the reviewed source revision, executed fixture and verifier,
commands, generated configuration and lockfile fingerprints, Node/pnpm versions,
and NixOS WSL environment. Its later recheck used the preserved installation and
frozen lock, confirmed unchanged inputs, fetched the same approved registry bytes,
and passed both the lock verifier and JavaScript fixture again. The original fresh
installation time remains recorded separately. Reuse requires matching material
inputs and no newer contradictory result.

That observation reproduced a release-check defect: `lock.includes("file:")`
matched pnpm's ordinary `excludeLinksFromLockfile: false` setting. The corrected
verifier recognizes dependency-protocol values and still rejects `file:`/`link:`
resolutions and missing approved integrity. Four regression cases and the actual
registry-generated lock pass. The full release/artifact suite passes 29 tests.

This is core-only publication/install evidence. The React adapter remains
unpublished pending browser verification; the complete JS/TS/React/Next registry
consumer matrix is not claimed. Earlier packed-consumer checks retain their
separate scope. Website package wording must follow these distinct states.

Governing decisions: ADR-0004, ADR-0008, ADR-0009 and ADR-0010.
