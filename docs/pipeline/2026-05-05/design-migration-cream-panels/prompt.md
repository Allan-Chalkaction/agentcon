Apply the cream-panels-on-dark-chrome design treatment across the entire Agentcon app, including the existing settings panel and any future panels. Functionality unchanged: this is purely a visual / design-system migration.

Current state: the app has two visual languages running in parallel. The landing page uses a cream/dark/red dossier aesthetic with EB Garamond serif display + JetBrains Mono UI text. The settings panel uses a CLI-dark aesthetic with light text on dark surfaces. The two languages were intentionally bifurcated during the landing page run (per ADR D2 of docs/pipeline/2026-05-03/test-run-landing-page/ADR.md) so the landing experiment wouldn't break the settings panel.

Goal: unify the app on the cream-panel-on-dark-chrome language. Dark stays as outer canvas chrome (the body background, the title bar treatment, anything outside content surfaces). Content panels (the project scope cards, the settings tabs, form panels, preset cards, lifecycle event chips, alerts, buttons) flip to cream surfaces with dark text. The result should read as one cohesive product: spy/dossier.

Scope:
- All claude-settings/ components and CSS modules
- The dev-switch button on the landing page (currently picks up CLI-dark from the global --accent-primary)
- Any other surfaces in the app that haven't been converted yet
- Token namespace cleanup: rename --lp-* (currently landing-only) to a shared neutral namespace (--surface-cream, --ink, --accent-red, etc) so future panels inherit the language without prefix confusion
- Consolidate the two token files (tokens.css + tokens-landing.css) into a clean structure where dark chrome tokens and content tokens are clearly separated

Out of scope: any change to the app's functionality. Settings still loads, edits, saves Claude Code config exactly as today. Hooks tab works exactly as today. Etc.

Panel borders: all cream content panels should have a visible darker border to make them stand out from the dark chrome. Current landing page hairline borders (1px, low contrast) are too subtle for the new treatment. Increase border weight and contrast for cream panels: aim for 1.5px to 2px borders in a darker neutral that creates clear separation between panels and chrome. The borders should feel architectural and intentional, not faint. Add a new token (e.g. --border-panel-strong) for this purpose, distinct from any existing border tokens.

Reference: the landing page (already correctly themed) is the visual target for typography, accent usage, and panel surface treatment. Match its monospace UI text, hairline-but-stronger borders treatment, accent red usage, alert/error treatment, and button states.

The mockup at .claude/run-assets/settings-cream-mockup.png shows the rough direction for the settings panel's Hooks tab. It's directionally correct but has issues to fix during planning: serif italic on tab section titles is too heavy (reserve serif italic for hero treatments only), lifecycle event chips lost their selection state, dashed empty-state border too heavy on cream, dev-switch button hard to read on dark chrome.

This is a design-system migration, not a feature add. Treat it accordingly. Risk profile: regression risk on existing settings panel (functionality must not break), not "will it work at all."
