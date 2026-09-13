# Remaining MVP validation packet

Status: prepared, not executed. Owner: ConsoleFX maintainer coordinating the
participants/device operators; implementation agent reviews results and fixes
findings. This packet supplies no participant consent, device access or pass.

The [completion audit](../specs/mvp-completion-audit.md) identifies three missing
observations. They come from the accepted implementation scope of the
[value specification](../specs/website-value-story-spec.md#63-validation-commands-and-manual-scenarios)
and [experience specification](../specs/website-experience-redesign-spec.md#8-proposed-performance-and-loading-budgets).
ADR-0013 makes only representative screen-reader review nonblocking. Do not use
an agent simulation, desktop touch emulation or Playwright WebKit as participant,
physical-device or Safari evidence.

## Target and inputs

Use [public ConsoleFX](https://console-fx-servroxs-projects.vercel.app), its
[/studio/](https://console-fx-servroxs-projects.vercel.app/studio/) and
[/docs/](https://console-fx-servroxs-projects.vercel.app/docs/) routes.
The September 13 application checkpoint is main
`30fc38613277acabbe3ccec922bc4fc37c395642`, production
`dpl_29n1fHmSUmitbxUJ9CtfKFtQMBAd`. Its
[receipt](../evidence/website/2026-09-13-useful/release.json) identifies the tested
Git build and sampled served bytes. The sample fingerprint is not a complete
remote artifact hash. Main pushes now rebuild and advance the public domains,
including documentation-only pushes; do not assume the checkpoint is still live.

Before **and after** each session, the maintainer should record the public URL,
UTC time, its actual immutable Vercel deployment ID/URL, source commit and READY
state from the project's Production deployment/domain records. Ask operators
to record their session times and routes; they need no Vercel account access.
Use those times to reconcile their results with the hosted deployment records.
Record any known build-input changes from the checkpoint. If deployment identity
changes during a session, separate and recheck affected tasks against an
identified build; do not combine their results into one artifact pass. Preserve
preview/deployment URL authentication and keep any test-share credentials out of
results. Use deployment ID plus source SHA in the Artifact columns below; record
an additional artifact hash only when the complete artifact is actually available.

Use a fresh, dedicated browser profile/session and synthetic messages. The
[valid import](mvp-external/valid-scene.json) contains literal percent tokens and
Unicode; the [invalid import](mvp-external/invalid-scene.json) uses an unsupported
schema version. Download them before the recovery checks. Preserve any real
draft before testing storage/reset. Do not record unrelated tabs, credentials,
personal support data or participant names in the public result.

## Five-developer formative sessions

Recruit five web developers, including at least two unfamiliar with ConsoleFX.
Use anonymous IDs P1–P5. Obtain consent for manual task notes and timing before
starting. Screenshots, recordings or publication of quotes need their own consent;
they are not necessary for the task notes. Do not add analytics or session replay.

Record the date, artifact, browser/OS, input method, participant familiarity,
consent, moderator, and which page-effects condition came first. Alternate the
initial Effects on/off condition across participants. Record the order and
practice effect; five people do not establish a statistically significant result.

Give the initial desktop DevTools opening instructions, then ask these tasks
without explaining the product or suggesting an adoption choice:

1. Explain what ConsoleFX does and name a creative and a practical use.
2. Customize a message and use **Test in console**. Confirm one visible message.
   Time from the task instruction to the first successful result. Record any
   help, mistaken action or misunderstanding, including DevTools setup trouble.
3. Find a professional example and explain when its application should emit it.
4. Choose a standalone snippet or package integration for their intended use,
   explain the choice, and copy the intended format.
5. Identify a relevant limitation, such as supported console profiles, font
   variation, cached animation behavior or local draft storage.

Switch page effects and repeat the explain-product, customize/test,
professional-example and adoption/copy tasks with a different message. Ask
whether either condition obscured an action or distracted
them. Record errors and assistance rather than inferring preference from speed.
Keep the proposed composite target: four of five developers explain both use
types, choose an adoption path and complete a first desktop test within 90
seconds after initial DevTools instructions. It is not a claimed result or
marketing statistic. Review misunderstandings,
revise unclear copy/interaction, and verify affected tasks after any fix.

One result row per task and condition:

| Participant | Familiarity / consent | Effects / order | Task | Success / seconds | Assistance / error | Explanation or misunderstanding | Follow-up |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Record actual ID | Record actual result | Record actual condition | Record actual task | Not observed | Not observed | Not observed | Unassigned |

The final receipt must record the five sessions, unresolved gaps, copy decisions
and resulting fixes. Missing people or tasks remain **not observed**.

## Device performance recordings

Provide one actual integrated-GPU laptop and one representative physical phone.
An iPhone with Safari can also satisfy the Safari observation below; an Android
phone needs separate access to real Safari. Record model, CPU/GPU, physical device
confirmation, OS/browser builds, display refresh rate, viewport/DPR, power mode,
network/cache conditions, motion preference, visibility/focus and sample count.
Confirm the laptop's integrated GPU is actually used. Do not infer it from a
desktop viewport or a software-renderer string alone.

On each device, use its real browser and record a performance timeline with page
effects enabled and disabled under the same setup. Keep the page foregrounded.
For each condition capture initial load, at least **10 seconds idle**, and at
least **10 seconds active** while selecting Plain/Styled/examples, editing a
message and copying its output. Stop interacting during the idle interval.
Preserve raw traces and the actions/timestamps needed to identify those intervals.
Safari's connected Web Inspector or the platform's browser profiler may be used;
record any unavailable measurements honestly rather than substituting zero.

Compare attributable long tasks and recurring decorative callbacks between
effects on/off. The target is no new decoration-attributable long task over
**50 ms** during selection/copy, with a **16.7 ms p95 frame-interval target** on
the recorded laptop. Record observed values and attribution, including failures.
Check hidden/offscreen/Effects off/finished states for idle work; source scheduler
tests are supporting evidence, not a replacement for these device recordings.

The preserved [before/after bundle and desktop traces](../evidence/website/2026-09-12/README.md#local-performance)
remain dated evidence: gzip level 9, one sample per mode/viewport, initial
JavaScript reduced by 4,421 bytes. They do not describe these new devices. Record
the current entrypoint graph/gzip settings and compare the same build's effects
on/off on each device. If collecting a new pre-change comparison, use the
preserved baseline with a recorded hash and identical setup, and record its
different available actions. Do not invent an unavailable baseline observation.
The unchanged mandatory-decoration budget is at most **20 KiB gzip incremental
initial JavaScript**, with zero decoration-owned recurring work at idle. The
optional GPU exhibit is omitted. Lab traces are not field LCP/INP/CLS percentiles.

| Device / browser | Artifact | Effects | Interval / sample | Raw trace | Long tasks / attribution | Frame p95 | Idle callbacks | Verdict / limits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Record actual device | Record exact hash | Record condition | At least 10 seconds | Not observed | Not observed | Not observed | Not observed | Pending |

## Safari website journeys

Run in actual Safari on the recorded iPhone or a Mac. Identify Safari and OS
versions, viewport, touch/keyboard availability, motion preference, artifact and
storage/clipboard permissions. Record pass/fail/not observed for every step:

1. Open landing, studio and docs. Verify explanation, navigation, examples and
   actions are usable at the device's natural width and with larger text/zoom.
   With JavaScript disabled in actual Safari, verify initial explanation,
   navigation, static output and honest instructions remain available; then
   restore JavaScript before the interactive cases. Record unavailable Safari
   settings as not observed instead of substituting another browser.
2. Select Plain/Styled/examples by touch and by keyboard where available. Select
   immediately; page effects settle and leave Copy/Test usable. Effects off and
   reduced motion retain all content/actions. The focused studio stays quiet.
3. Edit `Safari 100% %c %s 👩🏽‍💻`. Select **Plain** in the hero or **Plain text ·
   any console** in the studio's Output renderer. Verify complete preview/source,
   no automatic emission, one explicit Test call and complete copied source.
   ConsoleFX does not detect Safari or automatically downgrade an explicitly
   selected Chromium profile. Record any rich-profile exploration separately;
   it does not establish supported native Safari decoration.
4. Edit a draft, import the valid fixture, then Undo/Redo. Import the invalid
   fixture and verify the valid work remains. Create a **Copy share link** for
   one scene, edit a distinct draft, and reload fragment-free `/studio/` to
   confirm that distinct draft was saved. Visit the copied link, cancel the
   conflicting replacement and retain the draft. Return to fragment-free
   `/studio/` and confirm recovery before testing draft deletion.
5. Open Reset and cancel it; preserve text and return focus where a keyboard is
   available. In the dedicated test session, clear the local draft twice; retain
   in-memory text and confirm the old queued draft does not return after a
   fragment-free reload. A retained `#scene=` link intentionally loads its shared
   scene on an empty draft; do not mistake that behavior for stale autosave.
6. Exercise clipboard/storage denial if supported by the actual setup. Verify
   complete selectable copy recovery and preserved editing/export on failure.
   Record unsupported permission setup as not observed, not a successful denial test.
7. Play/pause the 44.5-second walkthrough using available native controls; verify
   nine English caption cues and the transcript. It must not autoplay.
8. Navigate away and back during page effects and rapid selection. Record console
   errors, broken navigation, stale draft replacements, clipped actions or
   continuing decoration. Observe the effects-on/off performance pair above.

Return anonymized task rows, device inventory, journey verdicts and trace references
to the maintainer. The implementation agent will inspect evidence, fix findings,
run affected checks and update the completion audit. Public upload of raw traces
or participant material requires a separate content/privacy review; this packet
does not authorize contacting participants or publishing their data.
