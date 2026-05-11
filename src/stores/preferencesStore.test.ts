/**
 * Unit tests for preferencesStore.
 *
 * Uses installAgentconMock() to provide the in-memory window.agentcon.settings
 * seam (ADR D5). Three test cases per AC-5:
 *   (a) hydrate() reads a persisted "expert" value
 *   (b) hydrate() defaults to "beginner" when the key is absent
 *   (c) setExpertMode("expert") writes through to settings.set
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { installAgentconMock } from "../../tests/mocks/agentconMock";
import { usePreferencesStore } from "./preferencesStore";

describe("preferencesStore", () => {
  beforeEach(() => {
    // Reset Zustand store to initial state before each test.
    usePreferencesStore.setState({ expertMode: "beginner", loaded: false });
  });

  it("(a) hydrate() reads persisted expert value", async () => {
    // Install a fresh mock with "expertMode" pre-seeded to "expert".
    const mock = installAgentconMock();
    // The mock's settings API uses its internal fakeSettings Map.
    // We reach into the settings bridge to seed the value.
    await window.agentcon.settings.set("expertMode", "expert");
    // Silence the return value — we care about the Map, not this call.

    await usePreferencesStore.getState().hydrate();

    const state = usePreferencesStore.getState();
    expect(state.expertMode).toBe("expert");
    expect(state.loaded).toBe(true);

    // Suppress unused variable warning — mock is returned for potential
    // direct Map manipulation but is not needed for this assertion path.
    void mock;
  });

  it("(b) hydrate() defaults to beginner when key is absent", async () => {
    // Fresh mock — no expertMode entry in fakeSettings.
    installAgentconMock();

    await usePreferencesStore.getState().hydrate();

    const state = usePreferencesStore.getState();
    expect(state.expertMode).toBe("beginner");
    expect(state.loaded).toBe(true);
  });

  it("(c) setExpertMode writes through to settings.set", async () => {
    installAgentconMock();

    // Spy on the settings.set method.
    const setSpy = vi.spyOn(window.agentcon.settings, "set");

    usePreferencesStore.getState().setExpertMode("expert");

    // Give the microtask queue a tick so the void Promise resolves.
    await Promise.resolve();

    expect(setSpy).toHaveBeenCalledWith("expertMode", "expert");
  });
});
