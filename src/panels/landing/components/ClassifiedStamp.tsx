// ClassifiedStamp — Phase 3 (a11y fix in Phase 4)
// AC-023: CLASSIFIED stamp overlaid on PersonnelFileCard.
//   - Inline SVG component (ADR §D5 — no raster, no external SVG file).
//   - CSS rotation transform between -20deg and -10deg (using -15deg per PRD §8).
//   - Red accent color from --lp-accent-red token.
//   - Literal text content "CLASSIFIED" (verifiable in DOM per ADR §D5).
//   - Stroked rect border, no fill. Centered text with wide letter-spacing.
// Tokenable: fill references var(--lp-accent-red) via CSS custom property on the SVG.
//
// Phase 4 a11y fix (Reviewer HIGH): removed role="img" from <svg> — it was contradictory
// with aria-hidden="true". aria-hidden removes the element from the AT; role="img" would
// declare it to the AT. The parent <div aria-hidden="true"> in PersonnelFileCard already
// hides the stamp from AT. Keep aria-hidden="true" on the SVG; remove role="img".

import styles from "./ClassifiedStamp.module.css";

export function ClassifiedStamp() {
  return (
    // rotation applied at the SVG element level per PRD §9 Phase 3 implementation notes
    // transform: rotate(-15deg) is within the AC-023 range of -20 to -10 degrees
    <svg
      viewBox="0 0 240 80"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.stamp}
      aria-hidden="true"
    >
      {/* Stroked rect border — 3px stroke, no fill, red accent */}
      <rect
        x="4"
        y="4"
        width="232"
        height="72"
        fill="none"
        stroke="var(--lp-accent-red)"
        strokeWidth="3"
      />
      {/* Inner rect for double-border effect matching dossier stamp aesthetic */}
      <rect
        x="9"
        y="9"
        width="222"
        height="62"
        fill="none"
        stroke="var(--lp-accent-red)"
        strokeWidth="1"
        opacity="0.6"
      />
      {/* CLASSIFIED text — literal string for AC-023 DOM verifiability */}
      <text
        x="120"
        y="48"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--lp-accent-red)"
        fontSize="22"
        fontWeight="600"
        letterSpacing="8"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        CLASSIFIED
      </text>
    </svg>
  );
}
