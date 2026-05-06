// HeaderBar — Phase 2
// AC-004: header bar with AGENTCON / FILE 0427-A / 2026-04-30 in mono font.
// No props: literals are static per PRD §9 Phase 2 implementation notes.

import styles from "./HeaderBar.module.css";

export function HeaderBar() {
  return (
    <header className={styles.header} data-testid="header-bar">
      <span className={styles.appName}>AGENTCON</span>
      <span className={styles.fileId}>FILE 0427-A</span>
      <span className={styles.date}>2026-04-30</span>
    </header>
  );
}
