/**
 * Global test setup.
 *
 * - Imports @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
 * - Installs the window.agentcon IPC mock before each test so the settings
 *   panel and any component that touches the IPC bridge runs cleanly under jsdom.
 * - Resets preferencesStore to a fully-hydrated Expert state so existing tests
 *   that check all nine rail tabs remain unaffected. Tests that specifically
 *   exercise Beginner mode must call usePreferencesStore.setState() themselves.
 */

import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";
import { installAgentconMock } from "./mocks/agentconMock";
import { usePreferencesStore } from "../src/stores/preferencesStore";

beforeEach(() => {
  installAgentconMock();
  // Reset to a loaded, Expert state so the full nine-tab rail is visible.
  // Existing tests were authored before the expert-mode feature and expect all
  // tabs in the DOM. Tests for the Beginner rail must override this explicitly.
  usePreferencesStore.setState({ expertMode: "expert", loaded: true });
});
