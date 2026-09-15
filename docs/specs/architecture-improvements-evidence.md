# Architecture improvement evidence

All findings from the [six architecture passes](architecture-improvements.md)
are fixed in separate commits. Subsequent Standards and Spec reviews have zero
remaining actionable findings. The requested [usage video](usage-video-evidence.md)
is implemented with native playback, captions and a transcript.

Baseline: `e80f1fc51ab4eec7543039c6a957da48ac8587fd`.
Reviewed source: `97757174941d589201fafd2554865644847e3eba` on
`feat/console-fx-architecture-passes`, in `.worktrees/console-fx-integration`.
The original checkout, index and all 205 recorded files remain unchanged.

The [durable receipt](../evidence/architecture/2026-09-13/README.md) preserves
116 independently hash-verified evidence files. Local validation passes:

| Obligation | Result |
| --- | --- |
| Source and production builds | Format, lint, TypeScript, packages/studio builds, package inspection and original bundle budgets pass |
| Core, adapter and studio contracts | 292 unit tests pass |
| Package/artifact ownership and recovery | 25 release/artifact tests pass, including actual mid-replacement failure recovery |
| Fresh packed consumers | JS, TS, React and Next installation/build checks plus three native Edge browser journeys pass |
| Final native Chrome studio | All 74 desktop/mobile cases pass, including editing, recovery, accessibility, effects and video |
| Firefox | The full 72-case architecture suite passed; both new video playback/caption cases pass separately |
| Native Edge | All 38 affected architecture/recovery cases passed; both new video playback/caption cases pass separately |
| Unchanged console output | 411 compiled-output, standalone-export and font-preflight comparisons across 187 fixtures match the prior approved package |
| Native diagnostic ownership | Repeated screenshot journeys pass; a deliberate failure retains one owned trace context without screencast frames or imported-tab page snapshots |

The first video-inclusive Chrome run exposed three native screenshot timeouts.
Controlled isolation identified trace screencasting as the trigger; existing
imported tabs were also being traced. The harness now records only the owned
context with action/DOM/source evidence. Native error-prompt fallback capture is
disabled because it could inspect an imported tab after the owned page closes.
Ordinary CI tracing remains unchanged. No app layout, screenshot assertion or
timeout was relaxed. The final complete 74-case run passes.

| Candidate | SHA-256 |
| --- | --- |
| Core 0.1.0 tarball | `1eb78826242f9cb7561ee7df23ba33557f46cb277908f33c33b175d3d6a7c02a` |
| React 0.1.0 tarball | `eefa4f0b88114927efb52ad7eae1d4b3ef569e32685ad0c60db2b6939cb2483c` |
| Lockfile | `a9aeac3691f826646112a9e7ba3ecc45e0fac8e5d0c3a90a0c46bda7a13c0497` |
| Prepared 50-file studio fingerprint | `a2c2b4ebc70773259faa9676dc2e8fc3932e3b3706edd1f5bda9af5b9ffea0e7` |

The studio fingerprint hashes compact JSON of its ordered `files` and
`configSha256`. [PR #11](https://github.com/servrox/console-fx/pull/11) owns remote
CI and merge evidence. PR #11 merged as `d009dece260e52da8cbbb0b94f9b10666779b2dd`;
its tree exactly matches the reviewed source. [Main CI 34727966672](https://github.com/servrox/console-fx/actions/runs/34727966672)
passed. The downloaded artifact's ZIP digest, both package hashes, four consumer
environment files and six harness hashes were independently verified against that
frozen source. Its rebuilt studio fingerprint `33953e8e…` is separate from the tested
local preview `a2c2b4eb…` and was not substituted for it.

An ensuing artifact review found that the native packed-consumer config still
enabled automatic tracing alongside the shared fixture's manual trace. The
[follow-up](https://github.com/servrox/console-fx/pull/12) at `322e013` shares one
native policy between both configs and records that helper as the seventh harness
file. Fresh packed-consumer checks, all three native Edge consumer journeys, both
affected Chrome studio journeys and source checks pass. Both review axes report
zero findings. [PR CI 34728536169](https://github.com/servrox/console-fx/actions/runs/34728536169)
also passed. PR #12 merged as `5d969822c4a841859289e31a029b30e81c57d4af`;
[main CI 34728723330](https://github.com/servrox/console-fx/actions/runs/34728723330)
passed and its tree matches reviewed `322e013` exactly. No PRs remain open at this
checkpoint. This later evidence remains outside the frozen 116-file archive;
the archive's earlier three consumer journeys retain their original revision.

No package publication, registry installation or deployment of this newer
architecture/video candidate is claimed.

The separately approved PR #10 studio `298aaa32…` is now a
[verified protected preview](../evidence/hosting/2026-09-13/README.md).
Its exact npm tarballs remain unpublished after npm authentication/publication
failures. They are not replaced by this new core tarball. Public promotion,
physical mobile, integrated-GPU laptop, Safari and the five-developer study remain
separate observations/decisions. Narrator/NVDA review is nonblocking under ADR-0013.

Governing decisions: ADR-0002–0010, ADR-0013 and ADR-0015. The accepted visual
contracts in ADR-0012/0014 remain unchanged; no new ADR was required.
