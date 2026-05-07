// Footer — Phase 3
// AC-038: footer with "v0.1 · ~/.CLAUDE" left-aligned and "ENCRYPTED AT REST"
//         right-aligned, both in the monospace UI token (--font-mono).

import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer} data-testid="footer">
      {/* AC-038: left-aligned — version + config path */}
      <span className={styles.left}>v0.1 · ~/.CLAUDE</span>
      {/* AC-038: right-aligned — encryption notice */}
      <span className={styles.right}>ENCRYPTED AT REST</span>
    </footer>
  );
}
