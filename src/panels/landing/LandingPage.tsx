// Landing-page root component — Phase 4 (ProjectSelector state wired)
// Mounts the .landing-root scroll container and regions.
// Phase 1 established: scroll container, region stubs, tokens import.
// Phase 2 wired: HeaderBar, StatusBar, ProjectSelector trigger, Hero.
// Phase 3 wired: PersonnelFileCard, TransmissionsFeed, OperativesGrid, Footer.
// Phase 4 wires: ProjectSelector open/close (selectedProjectId local state + onProjectChange).
//
// AC-017 (no-op on selection): onProjectChange is wired ONLY to setSelectedProjectId.
// No claudeConfigStore, no IPC, no navigation, no side effects. This is the explicit
// no-op seam per PRD §9 Phase 4 anti-patterns and ADR §D1.
//
// ADR: docs/pipeline/2026-05-03/test-run-landing-page/ADR.md §D1, §D3, §D4

import { useState } from "react";
import "../../styles/tokens-landing.css";
import styles from "./LandingPage.module.css";

import { HeaderBar } from "./components/HeaderBar";
import { StatusBar } from "./components/StatusBar";
import { ProjectSelector } from "./components/ProjectSelector";
import { Hero } from "./components/Hero";
import { PersonnelFileCard } from "./components/PersonnelFileCard";
import { TransmissionsFeed } from "./components/TransmissionsFeed";
import { OperativesGrid } from "./components/OperativesGrid";
import { Footer } from "./components/Footer";

import { seedProjects } from "./data/seedProjects";
import { seedAgent } from "./data/seedAgent";
import { seedTransmissions } from "./data/seedTransmissions";
import { seedOperatives } from "./data/seedOperatives";

export function LandingPage() {
  // AC-017 (no-op seam): local UI state only.
  // onProjectChange updates this state and nothing else.
  // No integration with claudeConfigStore or any real project-loading flow.
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  return (
    // .landing-root is a plain class string (not a CSS module class).
    // tokens-landing.css scopes all --lp-* tokens under .landing-root and
    // declares position:absolute/inset:0/overflow-y:auto so the landing
    // surface can scroll while the global overflow:hidden stays untouched.
    // ADR §D2 (token scoping), §D3 (overflow scoping).
    <div className="landing-root" data-testid="landing-page">
      <div className={styles.page}>
        {/* Header bar region — Phase 2 */}
        <section
          className={styles.regionHeader}
          data-testid="region-header"
          aria-label="Header"
        >
          <HeaderBar />
        </section>

        {/* Secure-channel status bar region — Phase 2 */}
        <section
          className={styles.regionStatus}
          data-testid="region-status"
          aria-label="Status"
        >
          <StatusBar />
        </section>

        {/* Project selector region — Phase 4 (full open/close wired)
            AC-017: onProjectChange wired only to setSelectedProjectId.
            No IPC, no navigation, no store mutation. */}
        <section
          className={styles.regionProject}
          data-testid="region-project-selector"
          aria-label="Project selector"
        >
          <ProjectSelector
            projects={seedProjects}
            selectedProjectId={selectedProjectId}
            onProjectChange={setSelectedProjectId}
          />
        </section>

        {/* Hero region — Phase 2 */}
        <section
          className={styles.regionHero}
          data-testid="region-hero"
          aria-label="Hero"
        >
          <Hero />
        </section>

        {/* Personnel file region — Phase 3.
            AC-024: seedAgent imported here and passed as prop — no data hardcoded
            inside PersonnelFileCard. */}
        <section
          className={styles.regionPersonnel}
          data-testid="region-personnel-file"
          aria-label="Personnel file"
        >
          <PersonnelFileCard agent={seedAgent} />
        </section>

        {/* Recent transmissions feed region — Phase 3.
            AC-029: no onData prop or effect needed — feed renders seeded array once.
            seedTransmissions imported here and passed as prop. */}
        <section
          className={styles.regionTransmissions}
          data-testid="region-transmissions-feed"
          aria-label="Recent transmissions"
        >
          <TransmissionsFeed transmissions={seedTransmissions} />
        </section>

        {/* Field-ready operatives grid region — Phase 3.
            AC-037: seedOperatives imported here and passed as prop — no data hardcoded
            inside OperativesGrid or OperativeCard.
            AC-036: onDeploy is NOT passed — each card falls to console.info fallback. */}
        <section
          className={styles.regionOperatives}
          data-testid="region-operatives-grid"
          aria-label="Field-ready operatives"
        >
          <OperativesGrid operatives={seedOperatives} />
        </section>

        {/* Footer region — Phase 3 */}
        <section
          className={styles.regionFooter}
          data-testid="region-footer"
          aria-label="Footer"
        >
          <Footer />
        </section>
      </div>
    </div>
  );
}
