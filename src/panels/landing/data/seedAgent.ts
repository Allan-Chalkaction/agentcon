// Seed agent record for the PersonnelFileCard (Hawkeye dossier).
// AC-021: exact field values consumed by PersonnelFileCard via the `agent` prop.
// AC-024 seam: no agent values are hardcoded inside PersonnelFileCard itself.
// Imported at the LandingPage route boundary and passed as prop.

import type { Agent } from "../types";

export const seedAgent: Agent = {
  fileId: "0427-A",
  codename: "HAWKEYE",
  callsign: "code-review",
  specialty: "sonnet",
  clearance: "all tools",
  lastSeen: "~ 2d",
  status: "Active",
};
