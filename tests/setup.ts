/**
 * Global test setup.
 *
 * - Imports @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
 * - Installs the window.agentcon IPC mock before each test so the settings
 *   panel and any component that touches the IPC bridge runs cleanly under jsdom.
 */

import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";
import { installAgentconMock } from "./mocks/agentconMock";

beforeEach(() => {
  installAgentconMock();
});
