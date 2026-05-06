import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    // css: true enables Vite's real CSS pipeline for tests (including CSS Modules).
    // This means `import styles from "*.module.css"` returns a real object with
    // enumerable keys (not a Proxy). Without this, Vitest intercepts CSS modules
    // and returns a Proxy where Object.keys() returns [] even though property
    // access works. Per ADR D4 / PRD §8.6, CSS Modules must produce non-empty
    // exports objects (AC-049 CONS-01 binding).
    //
    // The css.modules.classNameStrategy: "stable" makes generated class names
    // deterministic across runs (original class name preserved in the output),
    // which makes test assertions on classnames reproducible.
    css: {
      include: [/\.module\.css$/],
      modules: {
        classNameStrategy: "stable",
      },
    },
    globals: false,
  },
});
