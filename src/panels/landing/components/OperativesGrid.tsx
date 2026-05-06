// OperativesGrid — Phase 3
// AC-030: section header — "QUICK START TEMPLATES" kicker + h2 "Field-ready operatives"
//         in serif italic (--lp-font-display italic, --lp-text-lg).
// AC-031: exactly 3 operative cards in order (Hawkeye, Echo, Ghost) from props.
// AC-032: per-card content matches exact table in PRD §5 AC-032 (satisfied via seedOperatives).
// AC-037: operatives prop drives render — no data hardcoded inside this component (seam check).
// AC-041: h2 here + h3 per card codename — heading hierarchy maintained.
//
// PRD §9 Phase 3: "The grid does NOT internally filter or sort."
//
// onDeploy? prop: LandingPage.tsx does NOT pass onDeploy in this run.
// Each OperativeCard falls back to console.info per AC-036.

import type { Operative } from "../types";
import { OperativeCard } from "./OperativeCard";
import styles from "./OperativesGrid.module.css";

interface OperativesGridProps {
  operatives: Operative[];
  onDeploy?: (id: string) => void;
}

export function OperativesGrid({ operatives, onDeploy }: OperativesGridProps) {
  return (
    <div className={styles.section} data-testid="operatives-grid">
      {/* AC-030: section header */}
      <div className={styles.sectionHeader}>
        <div className={styles.kicker}>QUICK START TEMPLATES</div>
        {/* AC-030: h2 in serif italic.
            AC-041: h2 is the correct heading level (h1 is in Hero). */}
        <h2 className={styles.heading}>Field-ready operatives</h2>
      </div>

      {/* AC-031: CSS grid — 3 columns, operatives rendered in array order (no sorting/filtering) */}
      <div className={styles.grid}>
        {operatives.map((operative) => (
          <OperativeCard
            key={operative.id}
            operative={operative}
            onDeploy={onDeploy}
          />
        ))}
      </div>
    </div>
  );
}
