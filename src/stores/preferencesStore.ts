/**
 * User preferences store.
 *
 * Persists preferences to the existing window.agentcon.settings IPC bridge
 * (same seam as lastProjectPath in ClaudeSettingsPanel).
 *
 * State:
 *   expertMode: "beginner" | "expert"  — default "beginner" until hydrated
 *   loaded: boolean                    — false until first hydrate() resolves
 *
 * Actions:
 *   setExpertMode(mode) — updates state synchronously + writes through to IPC
 *   hydrate()           — reads persisted value, falls back to "beginner" if absent
 *
 * Usage: call usePreferencesStore.getState().hydrate() once from App.tsx useEffect.
 * Consumers subscribe via usePreferencesStore(s => s.expertMode) in components.
 */

import { create } from "zustand";

export type ExpertMode = "beginner" | "expert";

const STORAGE_KEY = "expertMode";

interface PreferencesState {
  expertMode: ExpertMode;
  loaded: boolean;
  setExpertMode: (mode: ExpertMode) => void;
  hydrate: () => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  expertMode: "beginner",
  loaded: false,

  setExpertMode(mode: ExpertMode) {
    set({ expertMode: mode });
    void window.agentcon.settings.set(STORAGE_KEY, mode);
  },

  async hydrate() {
    const raw = await window.agentcon.settings.get<ExpertMode>(STORAGE_KEY);
    const mode: ExpertMode =
      raw === "beginner" || raw === "expert" ? raw : "beginner";
    set({ expertMode: mode, loaded: true });
  },
}));
