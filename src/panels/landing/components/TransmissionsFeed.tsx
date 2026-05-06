// TransmissionsFeed — Phase 3
// AC-025: header with "// RECENT TRANSMISSIONS" (mono, dark surface) + "● LIVE" indicator (green).
// AC-026: rows — timestamp (mono, on-dark-soft), codename (green), action (mono, on-dark).
// AC-027: 4 exact seed rows in exact order when seeded array is the default.
// AC-028: empty state — "// NO TRANSMISSIONS" placeholder; LIVE indicator still renders.
// AC-029 NO-OP: NO useEffect, NO setInterval, NO setTimeout, NO socket, NO IPC.
//   The feed renders transmissions prop exactly once. LIVE indicator is purely visual CSS.
//   Verification: git grep useEffect src/panels/landing/components/TransmissionsFeed.tsx
//   must return nothing.

import type { Transmission } from "../types";
import styles from "./TransmissionsFeed.module.css";

interface TransmissionsFeedProps {
  transmissions: Transmission[];
}

export function TransmissionsFeed({ transmissions }: TransmissionsFeedProps) {
  return (
    <div className={styles.feed} data-testid="transmissions-feed">
      {/* Inner content column — centered within the full-width dark band */}
      <div className={styles.inner}>
        {/* AC-025: header row with title + LIVE indicator */}
        <div className={styles.header}>
          <span className={styles.title}>// RECENT TRANSMISSIONS</span>
          {/* AC-025: LIVE indicator — CSS-only pulse, no JS timer (AC-029) */}
          <span className={styles.liveIndicator} aria-label="Live feed indicator">
            <span className={styles.liveDot} aria-hidden="true">●</span>
            {" "}LIVE
          </span>
        </div>

        {/* Row container */}
        <div className={styles.rows} role="list" aria-label="Recent transmissions">
          {transmissions.length === 0 ? (
            /* AC-028: empty state placeholder — LIVE indicator remains rendered above */
            <div className={styles.emptyState} role="listitem">
              // NO TRANSMISSIONS
            </div>
          ) : (
            transmissions.map((tx, i) => (
              /* AC-026: each row — timestamp, codename, action */
              <div
                className={styles.row}
                key={`${tx.timestamp}-${i}`}
                role="listitem"
                data-testid="transmission-row"
              >
                <span className={styles.timestamp}>{tx.timestamp}</span>
                <span className={styles.separator} aria-hidden="true"> — </span>
                <span className={styles.codename}>{tx.codename}</span>
                <span className={styles.separator} aria-hidden="true"> — </span>
                <span className={styles.action}>{tx.action}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
