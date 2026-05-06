// Seed transmissions array for TransmissionsFeed.
// AC-027: exactly 4 rows in exact order, exact text per PRD §5.
// ADR D9: cardinality locked at 4 — no extras, no fewer.
// AC-029 seam: no source connection; TransmissionsFeed renders this array once via prop.
// Imported at the LandingPage route boundary and passed as prop.

import type { Transmission } from "../types";

export const seedTransmissions: Transmission[] = [
  {
    timestamp: "01:42:07",
    codename: "HAWKEYE",
    action: "flagged 3 issues in api/auth.ts",
  },
  {
    timestamp: "01:38:14",
    codename: "ECHO",
    action: "authored 12 tests for payments/processor.ts",
  },
  {
    timestamp: "01:31:55",
    codename: "GHOST",
    action: "updated docs/getting-started.md",
  },
  {
    timestamp: "01:24:02",
    codename: "ECHO",
    action: "cleared PR #2247",
  },
];
