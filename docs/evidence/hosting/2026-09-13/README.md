# Approved improvement preview

The maintainer explicitly approved “Publish both under next and upload protected
preview” for the PR #10 packet: core `61672e00…`, React `eefa4f0b…`, studio
`298aaa32…`. This receipt records execution of that approval under ADR-0009/0010.
The later architecture/video candidate is a separate artifact.

## Protected preview

[The verified deployment](https://console-d4hj55d43-servroxs-projects.vercel.app)
is READY in the personal `servroxs-projects/console-fx` project. Its
[Vercel inspector](https://vercel.com/servroxs-projects/console-fx/GVuSXcTqLDQLkJdmMjUzR68X2XzS)
identifies deployment `dpl_GVuSXcTqLDQLkJdmMjUzR68X2XzS`. It is an authenticated
preview, with no public production promotion.

- Studio fingerprint: `298aaa327fe4fbd0f8ca0e61a36bf332c70d637b0ae1a9ab768ff688a2cf23f3`.
- Uploaded archive SHA-256: `a77c6c799febe3d576abceac15aa5e2b7b92aa8e95505e6e299ca4afdc4b36ab`.
- [Upload readback](upload-readback.json): all 47 uploaded files match the approved
  archive by SHA-1 and SHA-256, including routing configuration.
- [Hosted verification](preview.json): 45 static responses match SHA-256 and all
  expected security headers. The remaining source map returns 403 over HTTP; its
  exact bytes were separately verified through the authenticated Vercel file API.
- Unauthenticated access redirects to Vercel sign-in. Authenticated native Edge
  **153.0.4234.32** passed routes/404, edit/copy/test-once, invalid-import recovery,
  import/Undo, Reset cancellation/focus, draft reload, complete clipboard export,
  local font measurements and documentation navigation. No app exception or CSP
  violation occurred. The worker test explicitly applies a fitting width first.

The first improved preview was left unpromoted after its runtime file differed:
Vercel Toolbar appended a script that also conflicted with the existing CSP.
Only this project's `enablePreviewFeedback` setting was changed to `false`;
the same approved artifact was then redeployed. The
[project readback](project.json) confirms authentication still covers all URLs.
The previous setting was `null` (inherited), retained as the recovery value.
The CSP was not weakened. Earlier protected deployments remain available.

## npm publication

Neither package is published. The authenticated identity and scope ownership were
verified before attempting publication. npm first returned `EOTP`; subsequent
interactive-terminal attempts returned `E404` without completing publication.
The [fresh public registry readback](npm-registry.json) reports both exact names
as absent. Authentication URLs and codes are not included in this receipt.

The maintainer has been asked to complete the approved core publication through
their own terminal and browser verification. The exact reviewed input remains:

```bash
npm publish /home/servrox/dev/console-fx/.worktrees/console-fx-integration/.artifacts/review/main-ci/34716690235/extracted/.artifacts/packages/servrox-console-fx-0.1.0.tgz --access public --tag next --ignore-scripts --registry=https://registry.npmjs.org
```

Core SHA-256 is `61672e00d7a57829085d71836ede22bbc99cfb8350b067bd3f2c17ced5886592`;
React is `eefa4f0b88114927efb52ad7eae1d4b3ef569e32685ad0c60db2b6939cb2483c`.
On success, verify registry integrity/downloaded bytes, finish only the approved
adapter, then run registry-consumer checks against these same tarballs. Do not
substitute the newer architecture tarball, republish core, or assign `latest`.
Registry installation remains unobserved until publication succeeds.

Public promotion still needs its exact-target decision and explicit treatment of
the physical-mobile, integrated-GPU laptop, Safari and five-developer observations.
Screen-reader review is nonblocking under Accepted ADR-0013.
