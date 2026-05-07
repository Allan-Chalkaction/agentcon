// RedactedSilhouette — Phase 3
// AC-022: redacted-photo element (inline SVG silhouette) + "REDACTED" caption.
//   - Inline SVG component (ADR §D5 — no raster image, no external SVG file).
//   - Human-bust silhouette (head + shoulders) as <path>, filled with --ink-soft.
//   - Slightly desaturated rectangle background (photo-slot background via CSS class).
//   - "REDACTED" caption is a SEPARATE DOM element adjacent to the SVG (not inside it),
//     so QA can query it as text content per PRD §9 Phase 3 implementation notes.

import styles from "./RedactedSilhouette.module.css";

export function RedactedSilhouette() {
  return (
    <div className={styles.photoSlot}>
      {/* Dark desaturated background for the photo slot */}
      <div className={styles.photoBackground}>
        {/* Human bust silhouette SVG — head + shoulders path, filled via currentColor */}
        <svg
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.silhouette}
          aria-hidden="true"
        >
          {/* Head — circle */}
          <circle cx="60" cy="38" r="22" fill="currentColor" />
          {/* Shoulders — simplified torso arc */}
          <path
            d="M10 120 C10 78 28 62 60 62 C92 62 110 78 110 120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
      {/* AC-022: "REDACTED" caption as a separate DOM element adjacent to the SVG.
          This is a plain DOM text node so QA can grep for it in the DOM,
          satisfying the AC requirement for a visible "REDACTED" label. */}
      <p className={styles.caption}>REDACTED</p>
    </div>
  );
}
