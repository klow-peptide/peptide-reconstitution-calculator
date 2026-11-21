# Security and privacy

The library in `src/index.js` does local arithmetic only: concentration, draw volume and insulin-syringe units from the numbers you pass in. It does not open network connections, does not send telemetry or analytics, and does not read credentials or environment variables.

The tests are equally offline. The README links to the calculators on klow-peptide.com and to an optional iframe embed; loading those pages is a choice of the person who opens the README or pastes the embed, not something this package does at install or runtime.
