import { useEffect, useRef, useState } from "react";
import { useClaudeConfigStore, type Scope } from "../../stores/claudeConfigStore";
import { usePreferencesStore } from "../../stores/preferencesStore";
import { ScopeSwitcher } from "./ScopeSwitcher";
import { ScaffoldBanner } from "./ScaffoldBanner";
import { AgentsTab } from "./AgentsTab";
import { HooksTab } from "./HooksTab";
import { SkillsTab } from "./SkillsTab";
import { CommandsTab } from "./CommandsTab";
import { PluginsTab } from "./PluginsTab";
import { PermissionsTab } from "./PermissionsTab";
import { EnvTab } from "./EnvTab";
import { ClaudeMdTab } from "./ClaudeMdTab";
import { RawJsonTab } from "./RawJsonTab";
import styles from "./ClaudeSettingsPanel.module.css";

type Surface =
  | "agents"
  | "skills"
  | "commands"
  | "claudeMd"
  | "hooks"
  | "permissions"
  | "env"
  | "plugins"
  | "rawJson";

const SURFACES: {
  id: Surface;
  label: string;
  scopes: Scope[];
  expertOnly?: true;
}[] = [
  { id: "agents", label: "Agents", scopes: ["user", "project"] },
  { id: "skills", label: "Skills", scopes: ["user", "project"] },
  { id: "commands", label: "Commands", scopes: ["user", "project"] },
  { id: "claudeMd", label: "CLAUDE.md", scopes: ["user", "project"] },
  { id: "hooks", label: "Hooks", scopes: ["user", "project", "local"], expertOnly: true },
  { id: "permissions", label: "Permissions", scopes: ["user", "project", "local"], expertOnly: true },
  { id: "env", label: "Env", scopes: ["user", "project", "local"], expertOnly: true },
  { id: "plugins", label: "Plugins", scopes: ["user", "project", "local"], expertOnly: true },
  { id: "rawJson", label: "Raw JSON", scopes: ["user", "project", "local"], expertOnly: true },
];

// Derived at module load from the expertOnly flags above — single source of truth.
// Adding a new expert-only tab requires only setting expertOnly: true in SURFACES.
const EXPERT_ONLY_SURFACES = new Set(
  SURFACES.filter((s) => s.expertOnly).map((s) => s.id)
);

const PROJECT_PATH_KEY = "lastProjectPath";

export function ClaudeSettingsPanel() {
  const init = useClaudeConfigStore((s) => s.init);
  const setActiveProjectPath = useClaudeConfigStore(
    (s) => s.setActiveProjectPath,
  );
  const activeScope = useClaudeConfigStore((s) => s.activeScope);
  const setScope = useClaudeConfigStore((s) => s.setScope);
  const roots = useClaudeConfigStore((s) => s.roots);
  const loadScope = useClaudeConfigStore((s) => s.loadScope);
  const scopeData = useClaudeConfigStore((s) => s[s.activeScope]);
  const ready = useClaudeConfigStore((s) => s.ready);
  const initError = useClaudeConfigStore((s) => s.initError);

  // Preferences: expertMode and loaded flag from preferencesStore.
  // Hydration is triggered from App.tsx; this component only subscribes.
  const expertMode = usePreferencesStore((s) => s.expertMode);
  const prefsLoaded = usePreferencesStore((s) => s.loaded);
  const setExpertMode = usePreferencesStore((s) => s.setExpertMode);

  // Project root is now persisted via window.agentcon.settings under
  // PROJECT_PATH_KEY. Loaded once on mount, then mirrored into the main
  // process whenever it changes.
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const [pathLoaded, setPathLoaded] = useState(false);

  const [surface, setSurface] = useState<Surface>("agents");

  // Snap-back: when expertMode is "beginner" and the stored surface is Expert-only,
  // derive "agents" purely during render (ADR D7 — same render pass, no intermediate frame).
  // Beginner → Expert does NOT change the active tab.
  const effectiveSurface =
    expertMode === "beginner" && EXPERT_ONLY_SURFACES.has(surface)
      ? "agents"
      : surface;

  // State sync: if effectiveSurface diverges from surface (i.e., the user was on
  // an Expert-only tab and toggled to Beginner), lazily update surface so that
  // toggling back to Expert does not silently resume the previous Expert tab.
  useEffect(() => {
    if (surface !== effectiveSurface) {
      setSurface(effectiveSurface);
    }
  }, [expertMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    let cancelled = false;
    void window.agentcon.settings
      .get<string | null>(PROJECT_PATH_KEY)
      .then((p) => {
        if (cancelled) return;
        setProjectPath(p ?? null);
        setPathLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pathLoaded) return;
    void setActiveProjectPath(projectPath);
  }, [pathLoaded, projectPath, setActiveProjectPath]);

  // Scope auto-switch: keep the user looking at something useful.
  //   - No project root + on project/local → switch to user
  //   - User picks a folder → switch to project
  const lastEffectiveRoot = useRef<string | null>(null);
  useEffect(() => {
    const prev = lastEffectiveRoot.current;
    lastEffectiveRoot.current = projectPath;
    if (!projectPath && activeScope !== "user") {
      setScope("user");
      return;
    }
    if (projectPath && !prev) {
      setScope("project");
    }
  }, [projectPath, activeScope, setScope]);

  useEffect(() => {
    if (!roots) return;
    if (!scopeData.loaded && !scopeData.loading) {
      void loadScope(activeScope);
    }
  }, [roots, activeScope, scopeData.loaded, scopeData.loading, loadScope]);

  async function pickFolder() {
    const result = await window.agentcon.dialog.open({
      directory: true,
      title: "Pick a project folder for Claude Code config",
    });
    if (!result || Array.isArray(result)) return;
    await window.agentcon.settings.set(PROJECT_PATH_KEY, result);
    await window.agentcon.settings.save();
    setProjectPath(result);
  }

  async function clearFolder() {
    await window.agentcon.settings.delete(PROJECT_PATH_KEY);
    await window.agentcon.settings.save();
    setProjectPath(null);
  }

  const surfaceMeta = SURFACES.find((s) => s.id === effectiveSurface);
  const scopeAllowed = surfaceMeta?.scopes.includes(activeScope) ?? true;

  const showScaffold =
    activeScope === "project" &&
    projectPath &&
    scopeData.loaded &&
    scopeData.settings == null &&
    scopeData.settingsRaw == null;

  const surfaceError = scopeData.error;
  const banner = initError ?? surfaceError;

  // Filter rail entries based on current expertMode. Hidden tabs are absent
  // from the DOM — not disabled, not aria-hidden (ADR D6).
  // Deferred until prefsLoaded to avoid a flash of wrong rail on cold start.
  const visibleSurfaces = prefsLoaded
    ? SURFACES.filter((s) => expertMode === "expert" || !s.expertOnly)
    : [];

  return (
    <div className={styles.shell}>
      <ScopeSwitcher
        scope={activeScope}
        onChange={setScope}
        projectRoot={projectPath}
        onPickFolder={pickFolder}
        onClearFolder={clearFolder}
        expertMode={expertMode}
        prefsLoaded={prefsLoaded}
        onSetExpertMode={setExpertMode}
      />
      {banner && (
        <div className={styles.errorBanner}>
          <strong>Could not load Claude Code config:</strong> {banner}
          <button
            type="button"
            className={styles.buttonSecondary}
            style={{ marginLeft: 12, padding: "2px 10px", fontSize: "var(--text-xs)" }}
            onClick={() => void loadScope(activeScope)}
          >
            Reload
          </button>
        </div>
      )}

      {showScaffold && projectPath && (
        <ScaffoldBanner projectRoot={projectPath} />
      )}
      <div className={styles.body}>
        <nav className={styles.rail}>
          {visibleSurfaces.map((s) => {
            const disabled = !s.scopes.includes(activeScope);
            return (
              <button
                key={s.id}
                type="button"
                className={
                  effectiveSurface === s.id ? styles.railItemActive : styles.railItem
                }
                disabled={disabled}
                onClick={() => setSurface(s.id)}
                title={
                  disabled
                    ? `${s.label} is not available at ${activeScope} scope`
                    : undefined
                }
              >
                {s.label}
              </button>
            );
          })}
        </nav>
        <div className={styles.editor}>
          {!ready ? (
            <EmptyState
              title="Loading Claude Code config…"
              hint="Reading ~/.claude and your selected project."
            />
          ) : !scopeAllowed ? (
            <EmptyState
              title={`${surfaceMeta?.label ?? "This surface"} is not available at ${activeScope} scope`}
              hint="Switch to a different scope above."
            />
          ) : (
            <SurfaceView surface={effectiveSurface} />
          )}
        </div>
      </div>
    </div>
  );
}

function SurfaceView({ surface }: { surface: Surface }) {
  switch (surface) {
    case "agents":
      return <AgentsTab />;
    case "skills":
      return <SkillsTab />;
    case "commands":
      return <CommandsTab />;
    case "claudeMd":
      return <ClaudeMdTab />;
    case "hooks":
      return <HooksTab />;
    case "permissions":
      return <PermissionsTab />;
    case "env":
      return <EnvTab />;
    case "plugins":
      return <PluginsTab />;
    case "rawJson":
      return <RawJsonTab />;
  }
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyTitle}>{title}</div>
      <p className={styles.emptyHint}>{hint}</p>
    </div>
  );
}
