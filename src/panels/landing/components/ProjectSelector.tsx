// ProjectSelector — Phase 4 (full keyboard listbox + open/close state machine)
//
// Phase 2 established: trigger button, ARIA closed-state attributes, AC-007, AC-008.
// Phase 4 adds: open/close state, keyboard navigation, listbox rendering, click-outside.
//
// WAI-ARIA 1.2 Listbox pattern (single selection variant):
// https://www.w3.org/TR/wai-aria-practices-1.2/#Listbox
// - Focus stays on the trigger button at all times (we do NOT move DOM focus into options).
// - aria-activedescendant on the <ul role="listbox"> conveys keyboard highlight to AT.
// - aria-expanded on the trigger button reflects open/closed state.
// - aria-selected on each <li role="option"> reflects the committed selection (not highlight).
//
// AC-009: click-to-open always highlights the FIRST option (index 0).
// AC-011: keyboard-open (Space/Enter) highlights the previously-SELECTED option, or index 0
//         if nothing is selected. This asymmetry is intentional per CONS-08 (CTO Round 2 §4).
//
// Anti-patterns avoided:
// - Do NOT move DOM focus to listbox options (WAI-ARIA listbox does not require it).
// - Do NOT use aria-selected for keyboard highlight (that tracks committed selection).
// - Do NOT trap Tab inside the listbox — Tab closes and moves to next focusable element.
// - Do NOT wire onProjectChange to anything except the parent-provided state setter (AC-017).
// - Do NOT use onClick for options — use onMouseDown so the trigger's blur doesn't fire
//   and close the listbox before the selection is registered.

import { useEffect, useRef, useState, KeyboardEvent, MouseEvent } from "react";
import type { ProjectOption } from "../types";
import styles from "./ProjectSelector.module.css";

interface ProjectSelectorProps {
  projects: ProjectOption[];
  selectedProjectId: string | null | undefined;
  onProjectChange: (id: string) => void;
}

export function ProjectSelector({
  projects,
  selectedProjectId,
  onProjectChange,
}: ProjectSelectorProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  // highlightedIndex: -1 means nothing highlighted (initial/reset state).
  // When open, ≥0 means the option at that index is visually highlighted.
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // ── Refs ───────────────────────────────────────────────────────────────────
  // wrapperRef: used for click-outside detection (contains trigger + listbox).
  const wrapperRef = useRef<HTMLDivElement>(null);
  // triggerRef: used to return focus after close (AC-013, AC-014, AC-015).
  const triggerRef = useRef<HTMLButtonElement>(null);

  // ── Derived values ─────────────────────────────────────────────────────────
  const selected = projects.find((p) => p.id === selectedProjectId);
  const valueLabel = selected ? selected.label : "- unassigned -";
  const selectedIndex = projects.findIndex((p) => p.id === selectedProjectId);

  const listboxId = "project-selector-listbox";

  // ── Open / close helpers ───────────────────────────────────────────────────

  // openViaClick: AC-009 — always highlight index 0 (first option).
  function openViaClick() {
    setIsOpen(true);
    setHighlightedIndex(0);
  }

  // openViaKeyboard: AC-011 — highlight selected option, or index 0 if none selected.
  function openViaKeyboard() {
    setIsOpen(true);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }

  function close(returnFocus = true) {
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (returnFocus) {
      triggerRef.current?.focus();
    }
  }

  // ── Trigger click handler (AC-009) ─────────────────────────────────────────
  function handleTriggerClick() {
    if (isOpen) {
      // Clicking trigger while open closes it (no selection change).
      close();
    } else {
      openViaClick();
    }
  }

  // ── Trigger keyboard handler (AC-011, AC-012, AC-013, AC-014) ─────────────
  // All keyboard handling is on the trigger button (WAI-ARIA listbox pattern).
  // The listbox <ul> has no keyboard handlers.
  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case " ":
      case "Enter":
        e.preventDefault(); // prevent scroll / form submission
        if (!isOpen) {
          // AC-011: open with selected-or-first highlighted
          openViaKeyboard();
        } else if (e.key === "Enter" && highlightedIndex >= 0) {
          // AC-013: Enter selects highlighted option, closes, returns focus
          onProjectChange(projects[highlightedIndex].id);
          close();
        }
        break;

      case "ArrowDown":
        e.preventDefault(); // prevent page scroll
        if (!isOpen) {
          // ArrowDown when closed opens the dropdown (common UX pattern per WAI-ARIA)
          openViaKeyboard();
        } else {
          // AC-012: advance highlight, wrapping from last to first
          setHighlightedIndex((prev) =>
            prev < 0 ? 0 : (prev + 1) % projects.length
          );
        }
        break;

      case "ArrowUp":
        e.preventDefault(); // prevent page scroll
        if (!isOpen) {
          openViaKeyboard();
        } else {
          // AC-012: move highlight back, wrapping from first to last
          setHighlightedIndex((prev) =>
            prev <= 0
              ? projects.length - 1
              : (prev - 1 + projects.length) % projects.length
          );
        }
        break;

      case "Escape":
        if (isOpen) {
          // AC-014: close without selecting, return focus
          close();
        }
        break;

      case "Tab":
        // Tab while open: close without selecting, let focus move to next element
        // (no focus trap in listbox per WAI-ARIA listbox pattern and PRD anti-pattern)
        if (isOpen) {
          // Don't call close(returnFocus=true) — Tab needs to move naturally
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
        break;

      default:
        break;
    }
  }

  // ── Option click handler (AC-010) ─────────────────────────────────────────
  // Uses onMouseDown instead of onClick: this fires before the trigger's onBlur,
  // preventing the listbox from closing before the selection is registered.
  function handleOptionMouseDown(
    e: MouseEvent<HTMLLIElement>,
    projectId: string
  ) {
    e.preventDefault(); // prevent focus moving away from trigger
    onProjectChange(projectId);
    close(); // AC-010: close, onProjectChange called, focus returned to trigger
  }

  // ── Click-outside detection (AC-015) ──────────────────────────────────────
  // Registers a document mousedown listener while the dropdown is open.
  // If the click is outside wrapperRef, close without selecting.
  useEffect(() => {
    if (!isOpen) return;

    function handleDocumentMouseDown(e: globalThis.MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        // AC-015: outside click — close, no onProjectChange, aria-expanded → false
        setIsOpen(false);
        setHighlightedIndex(-1);
        // Do NOT return focus to trigger on outside click (user clicked elsewhere)
      }
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [isOpen]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      data-testid="project-selector"
    >
      {/* Trigger button — handles all keyboard events per WAI-ARIA listbox pattern */}
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger}${isOpen ? ` ${styles.triggerOpen}` : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen ? "true" : "false"}
        aria-controls={listboxId}
        aria-label={`Project — ${valueLabel}`}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        data-testid="project-selector-trigger"
      >
        <span className={styles.label}>
          PROJECT <span className={styles.bracket}>[</span>{" "}
          <span className={styles.value}>{valueLabel}</span>{" "}
          <span className={styles.bracket}>]</span>
        </span>
        {/* Chevron rotates on open — CSS transition gated by prefers-reduced-motion */}
        <span
          className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ""}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {/* Listbox panel — rendered only when open (AC-009, AC-011) */}
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className={styles.listbox}
          // aria-activedescendant on the listbox tracks keyboard highlight (AC-012).
          // This is the WAI-ARIA listbox pattern: AT reads the activedescendant to
          // announce which option the keyboard is on, without moving DOM focus.
          aria-activedescendant={
            highlightedIndex >= 0
              ? `project-option-${projects[highlightedIndex].id}`
              : undefined
          }
          data-testid="project-selector-listbox"
        >
          {projects.map((project, index) => (
            <li
              key={project.id}
              id={`project-option-${project.id}`}
              role="option"
              // aria-selected reflects committed selection (not keyboard highlight).
              // Per WAI-ARIA: aria-selected is distinct from the keyboard highlight
              // conveyed by aria-activedescendant. Both may be true simultaneously
              // when the selected item is also highlighted.
              aria-selected={project.id === selectedProjectId ? "true" : "false"}
              className={
                index === highlightedIndex
                  ? `${styles.option} ${styles.optionHighlighted}`
                  : styles.option
              }
              onMouseDown={(e) => handleOptionMouseDown(e, project.id)}
              data-testid={`project-option-${project.id}`}
            >
              {project.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
