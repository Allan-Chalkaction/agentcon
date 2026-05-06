// OperativeCard — Phase 3
// AC-032: per-card content (index, class, status, codename h3, callsign, description,
//         model, missions, DEPLOY button).
// AC-033: top rule using single shared --lp-accent-red (CONS-12 — no per-card variants).
// AC-034: Deploy button — <button type="button">, aria-label="Deploy <codename>",
//         visible text "DEPLOY" in mono font.
// AC-036 seam: click invokes onDeploy(operative.id) if prop provided;
//              falls back to console.info per PRD §9 Phase 3 notes.
//              LandingPage.tsx does NOT pass onDeploy in this run (Phase 4 deferred).
// ADR §D12: disabled?: boolean prop declared; CSS for disabled state implemented;
//           no operative is disabled in seed data this run.
// Phase 3 also implements hover/focus-visible/active/disabled CSS states per
//   PRD §9 Phase 3 implementation notes (keyboard focus management = Phase 4).

import type { Operative } from "../types";
import styles from "./OperativeCard.module.css";

interface OperativeCardProps {
  operative: Operative;
  onDeploy?: (id: string) => void;
}

export function OperativeCard({ operative, onDeploy }: OperativeCardProps) {
  // AC-036 fallback: if no onDeploy prop, console.info with codename.
  // This is the only permitted effect when no real onDeploy is wired.
  function handleDeploy() {
    if (onDeploy) {
      onDeploy(operative.id);
    } else {
      // AC-036: "If no onDeploy prop is provided, the click invokes a single
      // console.info call containing the operative codename and otherwise has no effect."
      console.info(`Deploy: ${operative.codename}`);
    }
  }

  return (
    <article
      className={styles.card}
      data-testid={`operative-card-${operative.id}`}
      aria-label={`Operative: ${operative.codename}`}
    >
      {/* AC-033: top rule — single shared --lp-accent-red (CONS-12, ADR D8) */}
      <div className={styles.topRule} aria-hidden="true" />

      {/* Index label */}
      <div className={styles.indexLabel}>{operative.index}</div>

      {/* Class / status row */}
      <div className={styles.metaRow}>
        <span className={styles.className}>{operative.className}</span>
        {/* AC-032: "● Active" status with amber dot.
            The ● character is part of the status string in the Operative type. */}
        <span
          className={styles.status}
          data-testid="operative-status"
        >
          {operative.status}
        </span>
      </div>

      {/* AC-032: codename as h3 (heading hierarchy: h1 hero → h2 operatives section → h3 codename)
          AC-041: h3 is the correct heading level within the operatives section. */}
      <h3 className={styles.codename}>{operative.codename}</h3>

      {/* Callsign line */}
      <div className={styles.callsign}>{operative.callsignLine}</div>

      {/* Description */}
      <p className={styles.description}>{operative.description}</p>

      {/* Card footer: model + missions (left) + Deploy button (right) */}
      <div className={styles.cardFooter}>
        <div className={styles.footerMeta}>
          <span className={styles.footerMetaItem}>{operative.model}</span>
          <span className={styles.footerMetaItem}>{operative.missions}</span>
        </div>

        {/* AC-034: Deploy button — button type="button", aria-label="Deploy <codename>",
            visible text "DEPLOY" in mono font.
            ADR §D12: disabled state is styled via aria-disabled; seam is present
            even though no operative is disabled in this run's seed data. */}
        <button
          type="button"
          className={styles.deployButton}
          aria-label={`Deploy ${operative.codename}`}
          aria-disabled={operative.disabled === true ? "true" : undefined}
          disabled={operative.disabled === true}
          onClick={operative.disabled ? undefined : handleDeploy}
          data-testid={`deploy-button-${operative.id}`}
        >
          DEPLOY
        </button>
      </div>
    </article>
  );
}
