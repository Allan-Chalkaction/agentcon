// PersonnelFileCard — Phase 3
// AC-021: labeled fields with monospace labels and values reading from agent prop.
// AC-022: REDACTED photo slot (inline SVG silhouette) + "REDACTED" caption.
// AC-023: CLASSIFIED stamp (inline SVG) overlaid on card, rotated -15deg, red accent.
// AC-024: all field values read from `agent` prop — no hardcoded agent data inside
//         this component (seam check).
// ADR §D5: both ClassifiedStamp and RedactedSilhouette are inline SVG components.

import type { Agent } from "../types";
import { ClassifiedStamp } from "./ClassifiedStamp";
import { RedactedSilhouette } from "./RedactedSilhouette";
import styles from "./PersonnelFileCard.module.css";

interface PersonnelFileCardProps {
  agent: Agent;
}

// Field rows for the dossier — AC-021 exact label set.
// Labels in uppercase mono, values in mono. Order matches AC-021.
const FIELD_LABELS: Array<{ label: string; key: keyof Agent }> = [
  { label: "ACTIVE FILE", key: "fileId" },
  { label: "CODENAME", key: "codename" },
  { label: "CALLSIGN", key: "callsign" },
  { label: "SPECIALTY", key: "specialty" },
  { label: "CLEARANCE", key: "clearance" },
  { label: "LAST SEEN", key: "lastSeen" },
  { label: "STATUS", key: "status" },
];

export function PersonnelFileCard({ agent }: PersonnelFileCardProps) {
  return (
    <article
      className={styles.card}
      data-testid="personnel-file-card"
      aria-label="Personnel file"
    >
      {/* Two-column layout: photo slot (left) + field table (right) */}
      <div className={styles.body}>
        {/* AC-022: REDACTED photo slot with inline SVG silhouette */}
        <RedactedSilhouette />

        {/* AC-021: labeled field table — all values from agent prop (AC-024 seam) */}
        <dl className={styles.fieldTable}>
          {FIELD_LABELS.map(({ label, key }) => (
            <div className={styles.fieldRow} key={label}>
              <dt className={styles.fieldLabel}>{label}</dt>
              <dd className={styles.fieldValue}>{agent[key]}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* AC-023: CLASSIFIED stamp — absolutely positioned over lower-right of card.
          ClassifiedStamp is an inline SVG component per ADR §D5.
          rotation (-15deg) is applied inside ClassifiedStamp.module.css. */}
      <div className={styles.stampWrapper} aria-hidden="true">
        <ClassifiedStamp />
      </div>
    </article>
  );
}
