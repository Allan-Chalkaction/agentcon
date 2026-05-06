// Seed project options for the ProjectSelector dropdown.
// Three sample options per PRD §7 Data Lifecycle (seedProjects.ts — ≥3 options).
// Imported at the LandingPage route boundary and passed as props — no data hardcoded
// inside ProjectSelector itself.

import type { ProjectOption } from "../types";

export const seedProjects: ProjectOption[] = [
  { id: "agentcon", label: "agentcon" },
  { id: "api-service", label: "api-service" },
  { id: "payments-core", label: "payments-core" },
];
