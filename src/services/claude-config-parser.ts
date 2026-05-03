/**
 * Parsers and serializers for Claude Code config files.
 *
 * All file IO goes through window.agentcon.fs (the renderer-side bridge), so
 * these functions accept and return strings/objects only. They never
 * touch disk directly.
 */

import yaml from "js-yaml";

// ---------- frontmatter helpers ----------
//
// gray-matter pulls in Node's Buffer and process and breaks under the
// renderer's bundling. We use js-yaml directly with a minimal regex-based
// splitter that handles the canonical Claude Code agent/skill/command
// frontmatter block.

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

interface FrontmatterSplit {
  data: Record<string, unknown>;
  content: string;
  parseError?: string;
}

function splitFrontmatter(raw: string): FrontmatterSplit {
  if (!raw) return { data: {}, content: "" };
  const m = raw.match(FRONTMATTER_RE);
  if (!m) return { data: {}, content: raw };
  const fmText = m[1];
  const body = m[2] ?? "";
  let data: Record<string, unknown> = {};
  let parseError: string | undefined;
  try {
    const loaded = yaml.load(fmText);
    if (loaded && typeof loaded === "object") {
      data = loaded as Record<string, unknown>;
    }
  } catch (e) {
    parseError = e instanceof Error ? e.message : String(e);
  }
  return { data, content: body, parseError };
}

function joinFrontmatter(
  data: Record<string, unknown>,
  content: string,
): string {
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null || v === "") continue;
    cleaned[k] = v;
  }
  const trailing = content.endsWith("\n") ? content : content + "\n";
  if (Object.keys(cleaned).length === 0) return trailing;
  const dumped = yaml.dump(cleaned, {
    noRefs: true,
    lineWidth: -1,
    quotingType: '"',
  });
  return `---\n${dumped}---\n${trailing}`;
}

// ---------- settings.json ----------

export interface ClaudePermissions {
  allow?: string[];
  ask?: string[];
  deny?: string[];
  defaultMode?: string;
  additionalDirectories?: string[];
}

export interface ClaudeHookEntry {
  type?: string;
  command?: string;
  url?: string;
  timeout?: number;
  if?: string;
  [k: string]: unknown;
}

export interface ClaudeHookGroup {
  matcher?: string;
  hooks?: ClaudeHookEntry[];
}

export type ClaudeHookMap = Record<string, ClaudeHookGroup[]>;

export interface ClaudeSettings {
  $schema?: string;
  model?: string;
  permissions?: ClaudePermissions;
  env?: Record<string, string>;
  hooks?: ClaudeHookMap;
  enabledPlugins?: Record<string, boolean>;
  extraKnownMarketplaces?: Record<string, unknown>;
  [k: string]: unknown;
}

const SETTINGS_SCHEMA_URL =
  "https://json.schemastore.org/claude-code-settings.json";

export function parseSettings(text: string | null): ClaudeSettings {
  if (!text || text.trim() === "") return {};
  return JSON.parse(text) as ClaudeSettings;
}

export function serializeSettings(value: ClaudeSettings): string {
  const ordered: ClaudeSettings = { $schema: SETTINGS_SCHEMA_URL, ...value };
  return JSON.stringify(ordered, null, 2) + "\n";
}

// ---------- hook presets ----------

export interface HookPreset {
  id: string;
  label: string;
  description: string;
  event: string;
  group: ClaudeHookGroup;
}

export const HOOK_PRESETS: HookPreset[] = [
  {
    id: "notify-on-bash",
    label: "Desktop notification on Bash",
    description:
      "Pop a macOS notification every time Claude runs a shell command.",
    event: "PreToolUse",
    group: {
      matcher: "Bash",
      hooks: [
        {
          type: "command",
          command:
            "osascript -e 'display notification \"Claude is running bash\" with title \"Claude Code\"' &",
          timeout: 5,
        },
      ],
    },
  },
  {
    id: "lint-on-edit",
    label: "Run linter after every Edit",
    description:
      "Run your linter after Claude edits a file. Adjust the command for your stack.",
    event: "PostToolUse",
    group: {
      matcher: "Edit|Write|MultiEdit",
      hooks: [
        {
          type: "command",
          command: "npm run lint --silent || true",
          timeout: 30,
        },
      ],
    },
  },
  {
    id: "test-on-stop",
    label: "Run tests when session ends",
    description:
      "Run the test suite when the session stops. Useful for catching regressions before walking away.",
    event: "Stop",
    group: {
      hooks: [
        {
          type: "command",
          command: "npm test --silent",
          timeout: 300,
        },
      ],
    },
  },
  {
    id: "slack-on-session-end",
    label: "Slack ping on session end",
    description:
      "POST to a Slack webhook when a session finishes. Replace the URL with your webhook.",
    event: "Stop",
    group: {
      hooks: [
        {
          type: "http",
          url: "https://hooks.slack.com/services/REPLACE/ME",
          headers: { "Content-Type": "application/json" },
        },
      ],
    },
  },
  {
    id: "block-dangerous-bash",
    label: "Block dangerous shell commands",
    description:
      "Run a script to verify and reject specific dangerous commands before they execute.",
    event: "PreToolUse",
    group: {
      matcher: "Bash",
      hooks: [
        {
          type: "command",
          command: "~/.claude/hooks/block-dangerous.sh",
          timeout: 10,
          if: "Bash(rm -rf /*)",
        },
      ],
    },
  },
];

// Matcher dropdown templates — common matcher strings
export const MATCHER_TEMPLATES: { value: string; label: string }[] = [
  { value: "", label: "All tools" },
  { value: "Bash", label: "Bash only" },
  { value: "Edit|Write|MultiEdit", label: "All file writes" },
  { value: "Read", label: "Reads only" },
  { value: "WebFetch|WebSearch", label: "Web tools" },
  { value: "Task", label: "Subagent dispatch" },
];

// Hook event metadata for nicer UI labels
export const HOOK_EVENT_META: { id: string; label: string; hint: string }[] = [
  { id: "SessionStart", label: "Session start", hint: "Fires when a session starts" },
  { id: "SessionEnd", label: "Session end", hint: "Fires when a session ends" },
  { id: "UserPromptSubmit", label: "User prompt submit", hint: "Before a user prompt is sent to Claude" },
  { id: "PreToolUse", label: "Before tool use", hint: "Before any tool call (filterable by matcher)" },
  { id: "PostToolUse", label: "After tool use", hint: "After a tool call succeeds" },
  { id: "PostToolUseFailure", label: "Tool failure", hint: "After a tool call fails" },
  { id: "PreCompact", label: "Before compaction", hint: "Before context compaction" },
  { id: "Stop", label: "Stop", hint: "When the session stops" },
  { id: "SubagentStop", label: "Subagent stop", hint: "When a subagent stops" },
  { id: "Notification", label: "Notification", hint: "On notification events" },
];

// ---------- env var presets + categories ----------

export interface EnvPreset {
  id: string;
  label: string;
  description: string;
  vars: Record<string, string>;
}

export const ENV_PRESETS: EnvPreset[] = [
  {
    id: "boost-tool-budget",
    label: "Increase tool description budget",
    description:
      "Raise the budget for tool descriptions. Helpful when many skills/commands cause descriptions to truncate.",
    vars: { SLASH_COMMAND_TOOL_CHAR_BUDGET: "30000" },
  },
  {
    id: "system-ripgrep",
    label: "Use system ripgrep",
    description:
      "Fall back to the system ripgrep instead of the bundled one. Useful with custom .ignore configs.",
    vars: { USE_BUILTIN_RIPGREP: "0" },
  },
];

export interface EnvVarCategory {
  id: string;
  label: string;
  vars: { key: string; hint: string }[];
}

export const ENV_VAR_CATEGORIES: EnvVarCategory[] = [
  {
    id: "models",
    label: "Model overrides",
    vars: [
      { key: "ANTHROPIC_MODEL", hint: "Override the active model id" },
      {
        key: "ANTHROPIC_DEFAULT_OPUS_MODEL",
        hint: "Override the Opus alias",
      },
      {
        key: "ANTHROPIC_DEFAULT_SONNET_MODEL",
        hint: "Override the Sonnet alias",
      },
      {
        key: "ANTHROPIC_DEFAULT_HAIKU_MODEL",
        hint: "Override the Haiku alias",
      },
    ],
  },
  {
    id: "behavior",
    label: "Behavior",
    vars: [
      {
        key: "SLASH_COMMAND_TOOL_CHAR_BUDGET",
        hint: "Raise when many skills/commands truncate",
      },
      {
        key: "USE_BUILTIN_RIPGREP",
        hint: "Set to 0 to fall back to system ripgrep",
      },
    ],
  },
];

export function applyEnvPreset(
  preset: EnvPreset,
  current: Record<string, string>,
): Record<string, string> {
  return { ...current, ...preset.vars };
}

export function isEnvPresetApplied(
  preset: EnvPreset,
  current: Record<string, string>,
): boolean {
  return Object.entries(preset.vars).every(([k, v]) => current[k] === v);
}

export function removeEnvPreset(
  preset: EnvPreset,
  current: Record<string, string>,
): Record<string, string> {
  const next = { ...current };
  for (const k of Object.keys(preset.vars)) delete next[k];
  return next;
}

// ---------- agent definitions (.md with YAML frontmatter) ----------

export interface AgentFrontmatter {
  name?: string;
  description?: string;
  model?: string;
  tools?: string | string[];
  color?: string;
  [k: string]: unknown;
}

export interface AgentDefinition {
  filename: string;
  frontmatter: AgentFrontmatter;
  body: string;
  raw: string;
  parseError?: string;
}

export function parseAgent(filename: string, raw: string): AgentDefinition {
  const split = splitFrontmatter(raw);
  return {
    filename,
    frontmatter: split.data as AgentFrontmatter,
    body: split.content,
    raw,
    parseError: split.parseError,
  };
}

export function serializeAgent(
  frontmatter: AgentFrontmatter,
  body: string,
): string {
  return joinFrontmatter(frontmatter as Record<string, unknown>, body);
}

export function deriveAgentName(filename: string): string {
  return filename.replace(/\.md$/i, "");
}

// ---------- skills (dir-per-skill with SKILL.md) ----------

export interface SkillFrontmatter {
  name?: string;
  description?: string;
  "allowed-tools"?: string;
  "disable-model-invocation"?: boolean;
  "user-invocable"?: boolean;
  model?: string;
  effort?: string;
  context?: string;
  agent?: string;
  "argument-hint"?: string;
  [k: string]: unknown;
}

export interface SkillDefinition {
  dirname: string;
  frontmatter: SkillFrontmatter;
  body: string;
  raw: string;
  parseError?: string;
}

export function parseSkill(dirname: string, raw: string): SkillDefinition {
  const split = splitFrontmatter(raw);
  return {
    dirname,
    frontmatter: split.data as SkillFrontmatter,
    body: split.content,
    raw,
    parseError: split.parseError,
  };
}

export function serializeSkill(fm: SkillFrontmatter, body: string): string {
  return joinFrontmatter(fm as Record<string, unknown>, body);
}

// ---------- legacy slash commands (commands/<name>.md) ----------

export interface CommandDefinition {
  filename: string;
  frontmatter: SkillFrontmatter;
  body: string;
  raw: string;
  parseError?: string;
}

export function parseCommand(filename: string, raw: string): CommandDefinition {
  const split = splitFrontmatter(raw);
  return {
    filename,
    frontmatter: split.data as SkillFrontmatter,
    body: split.content,
    raw,
    parseError: split.parseError,
  };
}

export function serializeCommand(
  fm: SkillFrontmatter,
  body: string,
): string {
  return serializeSkill(fm, body);
}

// ---------- CLAUDE.md ----------

const IMPORT_RE = /^@([^\s]+)\s*$/gm;
const MAX_IMPORT_DEPTH = 5;

export interface ClaudeMdImport {
  path: string;
  resolved?: string;
  contents?: string;
  error?: string;
}

export function extractImports(text: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(text)) !== null) {
    out.push(m[1]);
  }
  return out;
}

/**
 * Inline `@import` references for preview. The `loadFile` callback returns
 * the contents of an imported path, or null if not found. Recursion is
 * capped at MAX_IMPORT_DEPTH per Claude Code's spec.
 */
export async function resolveImports(
  text: string,
  loadFile: (importPath: string) => Promise<string | null>,
  depth = 0,
): Promise<string> {
  if (depth >= MAX_IMPORT_DEPTH) return text;
  const imports = extractImports(text);
  if (imports.length === 0) return text;
  let result = text;
  for (const imp of imports) {
    let block: string;
    try {
      const loaded = await loadFile(imp);
      if (loaded == null) {
        block = `[@${imp} — not found]`;
      } else {
        const inner = await resolveImports(loaded, loadFile, depth + 1);
        block = `<!-- @${imp} -->\n${inner}\n<!-- end @${imp} -->`;
      }
    } catch (e) {
      block = `[@${imp} — ${e instanceof Error ? e.message : String(e)}]`;
    }
    result = result.replace(new RegExp(`^@${escapeRe(imp)}\\s*$`, "m"), block);
  }
  return result;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------- permission rule helpers ----------

export const SECRETS_DENY_TEMPLATE: string[] = [
  "Read(./.env)",
  "Read(./.env.*)",
  "Read(./**/.env)",
  "Read(./**/.env.*)",
  "Write(./.env)",
  "Write(./.env.*)",
  "Read(./**/credentials.json)",
  "Read(./**/secrets.*)",
];

export interface RuleParts {
  tool: string;
  arg?: string;
}

export function parseRule(rule: string): RuleParts | null {
  const m = rule.match(/^([A-Za-z][A-Za-z0-9]*)(?:\((.*)\))?$/);
  if (!m) return null;
  return { tool: m[1], arg: m[2] };
}

export function isValidRule(rule: string): boolean {
  return parseRule(rule.trim()) !== null;
}

// ---------- known tools + arg hints (for the rule builder UI) ----------

export interface ToolMeta {
  id: string;
  label: string;
  argHint: string;
  argPlaceholder: string;
  examples: string[];
}

export const KNOWN_TOOLS: ToolMeta[] = [
  {
    id: "Bash",
    label: "Bash — shell commands",
    argHint:
      "Command pattern. Use * for wildcards. Leave blank to match any Bash call.",
    argPlaceholder: "git push --force *",
    examples: ["git *", "rm -rf *", "npm test", "git push --force *"],
  },
  {
    id: "Read",
    label: "Read — file reads",
    argHint:
      "Path or glob. ./ is the project root. Use ** for recursive directories.",
    argPlaceholder: "./.env",
    examples: ["./.env", "./.env.*", "./**/.env", "./**/credentials.json"],
  },
  {
    id: "Write",
    label: "Write — file writes",
    argHint: "Path or glob restricting where Claude can create files.",
    argPlaceholder: "./prod.config.*",
    examples: ["./prod.config.*", "./.env", "./production.*"],
  },
  {
    id: "Edit",
    label: "Edit — file edits",
    argHint: "Path or glob restricting where Claude can modify files.",
    argPlaceholder: "./src/**",
    examples: ["./src/**", "./*.config.*"],
  },
  {
    id: "MultiEdit",
    label: "MultiEdit — batch edits",
    argHint: "Path or glob.",
    argPlaceholder: "./src/**",
    examples: ["./src/**"],
  },
  {
    id: "Grep",
    label: "Grep — search",
    argHint: "Usually allowed unrestricted. Leave blank to match any Grep.",
    argPlaceholder: "",
    examples: [],
  },
  {
    id: "WebFetch",
    label: "WebFetch — HTTP fetches",
    argHint:
      "Use domain:example.com to scope by host, or leave blank to match any WebFetch.",
    argPlaceholder: "domain:github.com",
    examples: ["domain:github.com", "domain:docs.anthropic.com"],
  },
  {
    id: "WebSearch",
    label: "WebSearch — search the web",
    argHint: "Leave blank to match any WebSearch.",
    argPlaceholder: "",
    examples: [],
  },
  {
    id: "Task",
    label: "Task — subagent dispatch",
    argHint: "Leave blank to match any Task call.",
    argPlaceholder: "",
    examples: [],
  },
  {
    id: "TodoWrite",
    label: "TodoWrite — todo list updates",
    argHint: "Usually allowed. Leave blank to match any TodoWrite.",
    argPlaceholder: "",
    examples: [],
  },
];

export function findTool(toolId: string): ToolMeta | null {
  return KNOWN_TOOLS.find((t) => t.id === toolId) ?? null;
}

// ---------- best-practice presets (one-click apply) ----------

export type PermBucket = "allow" | "ask" | "deny";

export interface PresetRule {
  bucket: PermBucket;
  rule: string;
  description: string;
}

export interface PermissionPreset {
  id: string;
  label: string;
  description: string;
  rules: PresetRule[];
}

export const PERMISSION_PRESETS: PermissionPreset[] = [
  {
    id: "block-secrets",
    label: "Block secrets",
    description:
      "Deny reads of .env files, credential JSON, and common secret patterns. Recommended for any project.",
    rules: [
      { bucket: "deny", rule: "Read(./.env)", description: "Read project .env" },
      { bucket: "deny", rule: "Read(./.env.*)", description: "Read .env variants" },
      { bucket: "deny", rule: "Read(./**/.env)", description: "Read nested .env files" },
      { bucket: "deny", rule: "Read(./**/.env.*)", description: "Read nested .env variants" },
      { bucket: "deny", rule: "Write(./.env)", description: "Write project .env" },
      { bucket: "deny", rule: "Write(./.env.*)", description: "Write .env variants" },
      { bucket: "deny", rule: "Read(./**/credentials.json)", description: "Read credentials.json" },
      { bucket: "deny", rule: "Read(./**/secrets.*)", description: "Read secrets.* files" },
    ],
  },
  {
    id: "confirm-destructive",
    label: "Confirm destructive operations",
    description:
      "Ask before running rm, git push --force, and git reset --hard.",
    rules: [
      { bucket: "ask", rule: "Bash(rm *)", description: "Any rm command" },
      { bucket: "ask", rule: "Bash(rm -rf *)", description: "Recursive rm" },
      { bucket: "ask", rule: "Bash(git push --force *)", description: "Force push" },
      { bucket: "ask", rule: "Bash(git push -f *)", description: "Force push (-f)" },
      { bucket: "ask", rule: "Bash(git reset --hard *)", description: "Hard reset" },
      { bucket: "ask", rule: "Bash(git clean *)", description: "git clean" },
    ],
  },
  {
    id: "block-prod-writes",
    label: "Block production writes",
    description: "Deny writes to common production config and credential files.",
    rules: [
      { bucket: "deny", rule: "Write(./prod.config.*)", description: "Write prod.config.*" },
      { bucket: "deny", rule: "Write(./production.*)", description: "Write production.*" },
      { bucket: "deny", rule: "Write(./**/prod.config.*)", description: "Write nested prod configs" },
    ],
  },
  {
    id: "restrict-web",
    label: "Ask before any web fetch",
    description:
      "Useful when working with sensitive code — every WebFetch becomes an explicit prompt.",
    rules: [
      { bucket: "ask", rule: "WebFetch", description: "Any web fetch" },
    ],
  },
];

export function isPresetFullyApplied(
  preset: PermissionPreset,
  perms: ClaudePermissions,
): boolean {
  return preset.rules.every((r) =>
    (perms[r.bucket] ?? []).includes(r.rule),
  );
}

export function presetCoverage(
  preset: PermissionPreset,
  perms: ClaudePermissions,
): { applied: number; total: number } {
  let applied = 0;
  for (const r of preset.rules) {
    if ((perms[r.bucket] ?? []).includes(r.rule)) applied++;
  }
  return { applied, total: preset.rules.length };
}

export function applyPreset(
  preset: PermissionPreset,
  perms: ClaudePermissions,
): ClaudePermissions {
  const next: ClaudePermissions = {
    allow: [...(perms.allow ?? [])],
    ask: [...(perms.ask ?? [])],
    deny: [...(perms.deny ?? [])],
  };
  for (const r of preset.rules) {
    const bucket = next[r.bucket] ?? [];
    if (!bucket.includes(r.rule)) bucket.push(r.rule);
    next[r.bucket] = bucket;
  }
  return next;
}

export function removePreset(
  preset: PermissionPreset,
  perms: ClaudePermissions,
): ClaudePermissions {
  const next: ClaudePermissions = {
    allow: [...(perms.allow ?? [])],
    ask: [...(perms.ask ?? [])],
    deny: [...(perms.deny ?? [])],
  };
  for (const r of preset.rules) {
    next[r.bucket] = (next[r.bucket] ?? []).filter((x) => x !== r.rule);
  }
  return next;
}

// ---------- humanize a rule for display ----------

// ---------- agent / skill / CLAUDE.md templates ----------

export interface AgentTemplate {
  id: string;
  label: string;
  description: string;
  filename: string;
  frontmatter: AgentFrontmatter;
  body: string;
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "code-reviewer",
    label: "Code reviewer",
    description:
      "Reviews diffs and PRs for correctness, security, and maintainability concerns.",
    filename: "code-reviewer.md",
    frontmatter: {
      name: "code-reviewer",
      description:
        "Reviews changes for correctness, security, and maintainability. Use after writing or modifying code.",
      model: "sonnet",
    },
    body: `You are a senior code reviewer. Read the changes carefully and surface:
- Correctness bugs or logic issues
- Security risks (injection, secret leakage, auth)
- Maintainability concerns (unclear naming, dead code, duplication)
- Missing tests or edge cases

Be specific. Cite file paths and line numbers. Don't be pedantic — flag what matters.
`,
  },
  {
    id: "test-writer",
    label: "Test writer",
    description:
      "Generates tests that match the project's existing test conventions.",
    filename: "test-writer.md",
    frontmatter: {
      name: "test-writer",
      description:
        "Writes tests for new or existing code. Detects the project's test framework and follows existing conventions.",
    },
    body: `You write tests. Process:
1. Read existing tests in this project. Match the framework, structure, and assertion style you find.
2. For the target code, identify the public surface and the behaviors that matter.
3. Write tests covering the happy path and meaningful edge cases. Don't over-test internals.
4. Run the tests. Fix anything that fails.
`,
  },
  {
    id: "doc-writer",
    label: "Doc writer",
    description: "Drafts documentation matching the project's voice and structure.",
    filename: "doc-writer.md",
    frontmatter: {
      name: "doc-writer",
      description:
        "Drafts documentation matching project conventions. Use when adding or updating docs.",
    },
    body: `You write project documentation. Always:
- Read existing docs first to match voice, structure, and depth
- Lead with the why, then the how
- Show concrete examples
- Keep paragraphs short
- Avoid duplicating reference material that already exists in the codebase
`,
  },
];

export interface SkillTemplate {
  id: string;
  label: string;
  description: string;
  dirname: string;
  frontmatter: SkillFrontmatter;
  body: string;
}

export const SKILL_TEMPLATES: SkillTemplate[] = [
  {
    id: "ship",
    label: "Ship a feature",
    description:
      "End-to-end shipping checklist: tests pass, lint clean, push branch, open PR.",
    dirname: "ship",
    frontmatter: {
      name: "ship",
      description:
        "Run the project's test + lint + build, push the branch, open a PR. Use when work is ready to ship.",
      "allowed-tools": "Bash",
    },
    body: `Process:
1. Run \`npm test\` (or the project's test script). Fix anything that fails.
2. Run \`npm run lint\` and \`npm run typecheck\` if they exist.
3. Run \`npm run build\` to confirm the build passes.
4. \`git push\` the current branch.
5. Open a PR with \`gh pr create\`. Generate a tight title and description from the diff.
`,
  },
  {
    id: "explain-this",
    label: "Explain this code",
    description: "Walk through a file: purpose, key patterns, integration points.",
    dirname: "explain-this",
    frontmatter: {
      name: "explain-this",
      description:
        "Explain what a file or function does, the patterns it uses, and how it integrates with the rest of the codebase.",
    },
    body: `Given a file or symbol:
1. Read it.
2. Trace what calls into it and what it calls out to.
3. Explain in 3-5 paragraphs:
   - Purpose
   - Key patterns
   - Integration points
   - Anything unusual or surprising

Keep it concrete. Cite file paths.
`,
  },
  {
    id: "summarize-pr",
    label: "Summarize PR",
    description:
      "Generate a tight summary of a PR's diff for changelogs or release notes.",
    dirname: "summarize-pr",
    frontmatter: {
      name: "summarize-pr",
      description:
        "Generate a tight summary of a PR's diff. Use when writing changelog entries or release notes.",
    },
    body: `Given a PR diff or branch:
1. Read the diff.
2. Group changes by intent (new feature / bug fix / refactor / docs).
3. Write 2-5 bullets capturing what changed and why it matters to a user.
4. Keep it under 100 words. No filler.
`,
  },
];

export interface ClaudeMdSnippet {
  id: string;
  label: string;
  description: string;
  body: string;
}

export const CLAUDE_MD_SNIPPETS: ClaudeMdSnippet[] = [
  {
    id: "architecture",
    label: "Architecture section",
    description: "Heading + skeleton for describing project structure.",
    body: `## Architecture

<!-- Describe the major components, the directory layout, and how data flows. -->
`,
  },
  {
    id: "conventions",
    label: "Conventions",
    description: "Coding style, naming, error handling, testing approach.",
    body: `## Conventions

<!-- Coding style, naming, error handling, testing approach. -->
`,
  },
  {
    id: "tool-prefs",
    label: "Tool preferences",
    description: "Preferred libraries and commands.",
    body: `## Tool preferences

- Tests: \`npm test\`
- Lint: \`npm run lint\`
- Type check: \`npm run typecheck\`
- Build: \`npm run build\`
`,
  },
  {
    id: "ban-list",
    label: "Things to avoid",
    description: "Patterns or libraries the team has decided to avoid.",
    body: `## Things to avoid

<!-- Patterns or libraries that have caused regressions. -->
-
`,
  },
  {
    id: "agent-guidance",
    label: "Working in this repo",
    description: "Tell Claude how to operate in this repo.",
    body: `## Working in this repo

- Default branch: \`main\`
- Open a PR with \`gh pr create\` rather than pushing to main directly
- Match existing code style — no big refactors when fixing a bug
- Run tests before saying work is done
`,
  },
  {
    id: "data-model",
    label: "Data model",
    description: "Where data lives and how it's shaped.",
    body: `## Data model

<!-- Tables, schemas, important columns, and the relationships between them. -->
`,
  },
];

export function describeRule(rule: string): string {
  const parts = parseRule(rule);
  if (!parts) return rule;
  const t = parts.tool;
  const a = parts.arg ?? "";
  if (t === "Bash") {
    if (!a) return "Any shell command";
    if (a === "rm *") return "Any rm command";
    if (a === "rm -rf *") return "Recursive rm";
    if (a.startsWith("git push --force") || a.startsWith("git push -f"))
      return "git force push";
    if (a.startsWith("git reset --hard")) return "git reset --hard";
    if (a.startsWith("git clean")) return "git clean";
    if (a.startsWith("git push")) return "git push";
    if (a.startsWith("git ")) return `git ${a.slice(4).replace(/\*/g, "…")}`;
    if (a.startsWith("npm ")) return `npm ${a.slice(4).replace(/\*/g, "…")}`;
    return `Shell: ${a}`;
  }
  if (t === "Read" || t === "Write" || t === "Edit" || t === "MultiEdit") {
    const verb = t === "Read" ? "Read" : t === "Write" ? "Write" : "Edit";
    if (!a) return `Any file ${verb.toLowerCase()}`;
    if (a.includes(".env")) return `${verb} .env files (${a})`;
    if (a.includes("credentials")) return `${verb} credential files (${a})`;
    if (a.includes("secrets")) return `${verb} secret files (${a})`;
    if (a.includes("prod")) return `${verb} production files (${a})`;
    return `${verb} ${a}`;
  }
  if (t === "WebFetch") {
    if (!a) return "Any web fetch";
    if (a.startsWith("domain:")) return `Web fetches from ${a.slice(7)}`;
    return `Web fetch matching ${a}`;
  }
  if (t === "WebSearch") return a ? `Web search ${a}` : "Any web search";
  if (t === "Task") return a ? `Task ${a}` : "Any subagent dispatch";
  return rule;
}
