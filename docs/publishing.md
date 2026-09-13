# Publishing the reviewed packages

The manual [publishing workflow](../.github/workflows/publish.yml) and
[artifact verifier](../scripts/verify-release.mjs) are merged under ADR-0008 and
ADR-0010. Validation CI has run; the publishing workflow has not published a
package. Select evidence for the exact release candidate below rather than
reusing a successful check for an older source snapshot.

## First-publication bootstrap

Bootstrap completed on September 13, 2026: both approved 0.1.0 packages are
published under `next`, and their exact registry bytes and isolated consumers
passed the [pair verification](evidence/packages/2026-09-13/README.md). Do not
repeat publication of these versions. The initial bootstrap procedure below is
retained for context; OIDC configuration and execution remain separate future work.

Complete the required [release ledger](releasing.md) gates, including real CI,
and obtain approval for the exact packages, versions,
tarball hashes and distribution tag. The qualified studio preview does not grant
package publication authority. Representative screen-reader review is a
nonblocking follow-up under ADR-0013; its missing evidence is not a publication gate.

Both npm package names were absent at the initial bootstrap check. npm's
[trust prerequisites](https://docs.npmjs.com/cli/v11/commands/npm-trust/)
require an existing package, write access and account 2FA. Bootstrap the real
reviewed packages through an explicitly approved interactive npm publication;
keep 2FA and credentials out of chat. Publish the core before the adapter. Do not
create a placeholder package or a long-lived publishing token.

After publication, inspect the registry's exact versions, integrity and file
contents, then install those registry versions in fresh JS/TS/React/Next consumers
without the local tarball overrides. That observation remains separate from the
existing successful tarball tests.

Run `pnpm run test:registry-consumers` with the reviewed candidate tarballs and
`candidate.json` in `.artifacts/packages`. The runner checks the registry package
names, exact versions and SHA-512 integrity against those tarballs, downloads and
compares their SHA-256 bytes, then installs exact registry versions without local
overrides. Only these independently checked `name@version` pairs receive a
[version-scoped release-age exception](https://pnpm.io/settings/dependency-resolution#minimumreleaseageexclude)
for the first-release check. Other packages retain the one-day age gate and strict
peer/engine policy. A missing version or integrity mismatch stops before install.
This read-only command does not publish packages or configure npm authentication.

Both `test:consumers` (local tarballs) and `test:registry-consumers` archive their
effective manifest, generated public-registry configuration, pnpm configuration
and lockfile alongside the receipt in `.artifacts/packages`. Receipts include
their hashes, fixture/harness hashes and Node/pnpm versions. The archived `.npmrc`
contains only public registry URLs; user authentication configuration is never
copied. Registry results use `registry-consumers.json` and
`registry-consumer-environment/`, separate from the local-tarball evidence.

Consumer, bundle-size and release checks share the candidate reader in
`scripts/package-candidate.mjs`. It validates both package identities, source
versions, lockfile, regular tarball files, bytes and packed metadata before use.
Recorded runner paths are provenance; local tarballs resolve beside the receipt.
To recheck a downloaded candidate without rewriting its receipt, set
`CONSOLE_FX_PACKAGE_ARTIFACTS=/absolute/path/to/extracted/.artifacts/packages`
for `test:consumers`, `test:registry-consumers` or `check:bundle-size`. Result
receipts still go to this checkout's `.artifacts/packages`. Release verification
continues to require the separately reviewed hashes and distribution tag.

## Configure OIDC after bootstrap

The following account changes still require their exact-target approval. On
GitHub, configure an `npm-publish` environment with maintainer review and restrict
it to `main`. Review and merge the workflow through the normal source process.
On each package, configure this [npm trusted publisher](https://docs.npmjs.com/trusted-publishers/):

| Field | Value |
| --- | --- |
| Provider | GitHub Actions, GitHub-hosted runner |
| Owner / repository | `servrox` / `console-fx` |
| Workflow filename | `publish.yml` |
| Environment | `npm-publish` |
| Allowed operation | Direct `npm publish` |

The workflow grants OIDC permission to the publishing job and uses no npm write
token. npm also supports staged publishing; this prepared workflow explicitly
uses direct publication after the recorded approval gates. Read back the actual
trusted-publisher fields and environment protection before the first dispatch.

## Select the exact validated artifact

Run `Validate candidate` on the merged `main` commit and wait for success. Dispatch
`Publish reviewed packages` on that same commit with the following reviewed inputs:

| Input | Meaning |
| --- | --- |
| `validation_run_id` | Successful `validate.yml` run for the current `main` commit |
| `core_sha256` / `react_sha256` | Independently reviewed tarball SHA-256 values |
| `dist_tag` | Explicit `next` or `latest` authority; the default is `next` |
| `packages` | `both`, or the separately approved single package for recovery |

The verifier rejects wrong repositories/workflows/commits, PR runs, unfinished or
failed validation, and missing, ambiguous, expired or foreign artifacts. The
pinned download action retrieves the identified artifact with digest verification.
The next step compares both tarballs with the approved hashes, source versions and
lockfile, and checks their packed names and repository. It resolves paths inside
the downloaded artifact rather than trusting the original runner's absolute paths.

The read-only verification job completes before the `npm-publish` environment
approval. Its output identifies the versions and approved hashes for review.
The publishing job downloads that same immutable artifact and rechecks the bytes
after approval, then uses the tarballs without reinstalling or rebuilding them, with
public access, provenance and lifecycle scripts disabled. No push, PR, tag or
completed validation run starts publication automatically. Approval of the protected
environment must include the manual browser/accessibility and remaining ledger
evidence; passing the scripted verifier alone is not full release qualification.

If only the core publication succeeded, preserve the successful version and
investigate the adapter failure. An explicitly approved `packages: react` dispatch
can finish that same reviewed adapter without republishing the core. Use a
corrective version or an approved tag rollback for released defects; do not rely
on unpublishing. Reverify registry contents and consumer installs after recovery.

Local checks: `pnpm run test:release` covers altered package bytes, forged receipts,
source/filename drift and invalid CI/artifact metadata. Run the verification-only
`node scripts/verify-release.mjs artifacts` command against each selected
candidate using its explicitly reviewed hashes. The
[dated pair receipt](evidence/packages/2026-09-13/README.md) retains the approved
0.1.0 publication and registry observations; it does not validate or approve
later 0.1.1 candidates. Local verifier checks neither establish remote CI nor
exercise npm OIDC.
The final workflows also pass Nix-managed actionlint 1.7.12. The GitHub API metadata
shape was checked with API version `2026-03-10` against an official Actions artifact.
