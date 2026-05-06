// Landing-page data model
// All types used by seed modules and landing components.
// ADR: docs/pipeline/2026-05-03/test-run-landing-page/ADR.md §D4

export interface Agent {
  fileId: string;     // "0427-A"
  codename: string;   // "HAWKEYE"
  callsign: string;   // "code-review"
  specialty: string;  // "sonnet"
  clearance: string;  // "all tools"
  lastSeen: string;   // "~ 2d"
  status: string;     // "Active"
}

export interface Transmission {
  timestamp: string;  // "01:42:07"
  codename: string;   // "HAWKEYE"
  action: string;     // "flagged 3 issues in api/auth.ts"
}

export interface Operative {
  id: string;           // "hawkeye"
  index: string;        // "// 01 //"
  className: string;    // "Reviewer-class"
  status: string;       // "● Active"
  codename: string;     // "Hawkeye"
  callsignLine: string; // "CALLSIGN — CODE-REVIEWER"
  description: string;
  model: string;        // "MODEL sonnet"
  missions: string;     // "MISSIONS 47"
  disabled?: boolean;   // unused this run; seam for AC-035 (ADR §D12)
}

export interface ProjectOption {
  id: string;
  label: string;
}
