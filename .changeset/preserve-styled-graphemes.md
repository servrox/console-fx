---
"@servrox/console-fx": patch
---

Prevent `fit/v2` from wrapping inside graphemes that span styled text runs. Preserve canonical text and explicit failure/fallback when a complete cluster cannot fit. Legacy `fit/v1` output remains unchanged.
