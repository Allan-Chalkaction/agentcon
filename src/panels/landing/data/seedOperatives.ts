// Seed operatives array for OperativesGrid.
// AC-031: exactly 3 cards in order: Hawkeye, Echo, Ghost.
// AC-032: per-card content matches the exact table in PRD §5 AC-032.
// AC-037 seam: no operative data hardcoded inside OperativeCard or OperativesGrid.
// Imported at the LandingPage route boundary and passed as prop.

import type { Operative } from "../types";

export const seedOperatives: Operative[] = [
  {
    id: "hawkeye",
    index: "// 01 //",
    className: "Reviewer-class",
    status: "● Active",
    codename: "Hawkeye",
    callsignLine: "CALLSIGN — CODE-REVIEWER",
    description:
      "Reads diffs and PRs for correctness, security, and maintainability. Flags what matters, skips the pedantic.",
    model: "MODEL sonnet",
    missions: "MISSIONS 47",
    disabled: false,
  },
  {
    id: "echo",
    index: "// 02 //",
    className: "Analyst-class",
    status: "● Active",
    codename: "Echo",
    callsignLine: "CALLSIGN — TEST-WRITER",
    description:
      "Detects your test framework, mirrors existing conventions, covers the happy path and the edges that bite.",
    model: "MODEL default",
    missions: "MISSIONS 23",
    disabled: false,
  },
  {
    id: "ghost",
    index: "// 03 //",
    className: "Archivist-class",
    status: "● Active",
    codename: "Ghost",
    callsignLine: "CALLSIGN — DOC-WRITER",
    description:
      "Reads existing docs to match voice and structure. Leads with the why, then the how. Leaves no trace.",
    model: "MODEL default",
    missions: "MISSIONS 11",
    disabled: false,
  },
];
