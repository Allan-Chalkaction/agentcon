// StatusBar — Phase 2
// AC-005: four segments in order (SECURE CHANNEL / CONNECTION ESTABLISHED /
//         NODE: ~/.CLAUDE / 3 OPERATIVES ON STANDBY) in mono font.
// AC-006: sub-line "Status: standby — Awaiting deployment orders" in mono font.
// No props: literals are static per PRD §9 Phase 2 implementation notes.

import styles from "./StatusBar.module.css";

export function StatusBar() {
  return (
    <div className={styles.statusBar} data-testid="status-bar">
      <div className={styles.segmentRow}>
        <span className={styles.segment}>SECURE CHANNEL</span>
        <span className={styles.separator} aria-hidden="true">|</span>
        <span className={styles.segment}>CONNECTION ESTABLISHED</span>
        <span className={styles.separator} aria-hidden="true">|</span>
        <span className={styles.segment}>NODE: ~/.CLAUDE</span>
        <span className={styles.separator} aria-hidden="true">|</span>
        <span className={styles.segment}>3 OPERATIVES ON STANDBY</span>
      </div>
      <div className={styles.subLine}>
        Status: standby — Awaiting deployment orders
      </div>
    </div>
  );
}
