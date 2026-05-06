// Hero — Phase 2
// AC-018: h1 with two lines — "Brief once." (serif roman, --lp-ink) and
//         "Deploy everywhere." (serif italic, --lp-accent-red).
//         EB Garamond Italic is bundled (EBGaramond-Italic.woff2 in Phase 1),
//         so font-style:italic resolves to the real italic file, not synthetic obliquing.
//         CONS-09 satisfied.
// AC-019: paragraph with exact body copy.
// AC-020: eyebrow kicker "PERSONNEL DIVISION" (mono) + metadata "№ 047 / NEW BRIEFING" (mono).

import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} data-testid="hero">
      {/* AC-020: eyebrow row with kicker and metadata */}
      <div className={styles.eyebrow}>
        <span className={styles.kicker}>PERSONNEL DIVISION</span>
        <span className={styles.meta}>№ 047 / NEW BRIEFING</span>
      </div>

      {/* AC-018: h1 with two display lines */}
      <h1 className={styles.headline}>
        <span className={styles.headlineLine1}>Brief once.</span>
        <span className={styles.headlineLine2}>Deploy everywhere.</span>
      </h1>

      {/* AC-019: body paragraph — exact literal text */}
      <p className={styles.body}>
        A roster of specialized Claude subagents for code review, test authoring,
        and documentation. Briefed on your project&apos;s conventions. Reusable
        across every operation.
      </p>
    </section>
  );
}
