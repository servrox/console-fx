# Published 0.1.0 package pair

Both `@servrox/console-fx` and `@servrox/console-fx-react` are published under
`next`. Their public registry bytes match the explicitly approved SHA-256 values
`61672e00d7a57829085d71836ede22bbc99cfb8350b067bd3f2c17ced5886592` and
`eefa4f0b88114927efb52ad7eae1d4b3ef569e32685ad0c60db2b6939cb2483c`.
Both `next` and `latest` were observed at 0.1.0; these checks changed neither tag.

The [registry-consumer receipt](registry-consumers.json) records an isolated
installation by package name/version, without local overrides or lifecycle
scripts. JavaScript entrypoints, TypeScript declarations, React SSR/lifecycle,
Next.js production rendering, all displayed website recipes and three native
Edge consumer journeys passed. The exact verified first-release versions alone
were exempted from the dependency-age delay. Generated public configuration and
lockfiles are included with hashes; credentials and local installation paths
are omitted. Fixture and harness fingerprints identify the executed source.

The first full check reproduced a verifier bug: npm 12.0.2 returned a one-item
JSON array for an exact version. The corrected verifier accepts that array or an
object, rejects empty/ambiguous/malformed results, and retains package identity,
version, byte/integrity, registry-host and credential checks. The release/artifact
suite passes 29 tests. An initial sandboxed subprocess run failed; the same
existing fixture suite passed in the subprocess-capable NixOS environment.

An earlier full-metadata request returned 404 while the version and tarball
endpoints already served the approved React package. Full metadata and ordinary
registry installation subsequently succeeded. This receipt supersedes the
[earlier core-only scope](../2026-09-13-core/README.md); it does not broaden
separate DevTools qualification or other recorded observation limits.

Governing decisions: ADR-0004, ADR-0008, ADR-0009 and ADR-0010.
