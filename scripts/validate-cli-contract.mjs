import { spawnSync } from "node:child_process";
import { join } from "node:path";

const workspaceRoot = "/Users/sangwoo/foundary_mcp";
const cliEntry = join(workspaceRoot, "packages/cli/dist/index.js");

const ALLOWED_COMMANDS = new Set(["search", "recommend", "generate"]);
const ALLOWED_ADAPTERS = new Set(["custom"]);
const ALLOWED_RESULT_CATEGORIES = new Set([
  "action",
  "layout",
  "surface",
  "input",
  "form",
  "icon"
]);
const ALLOWED_PRIORITIES = new Set(["high", "medium", "low"]);
const ALLOWED_INTENT_SOURCES = new Set(["ai", "fallback"]);
const ALLOWED_PROVIDERS = new Set(["gemini", "openai"]);
const ALLOWED_QUERY_TYPES = new Set(["component", "section", "page"]);
const ALLOWED_SCOPES = new Set([
  "component",
  "standalone_section",
  "page_section",
  "page"
]);
const ALLOWED_STRATEGIES = new Set([
  "single_component",
  "form_flow",
  "listing",
  "scaffold"
]);
const ALLOWED_SEARCH_RECOMMEND_STATUS = new Set(["ok", "no_match"]);
const ALLOWED_GENERATE_STATUS = new Set(["ok", "fallback", "error"]);

const CASES = [
  { command: "search", query: "login input" },
  { command: "recommend", query: "login page" },
  { command: "generate", query: "login page" }
];

function fail(message) {
  throw new Error(message);
}

function isString(value) {
  return typeof value === "string";
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function runCli(command, query) {
  const args = [cliEntry, command, "--adapter", "custom", "--format", "json", query];
  const result = spawnSync(process.execPath, args, {
    cwd: workspaceRoot,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    fail(`CLI execution failed for "${command} ${query}": ${result.stderr || result.stdout}`);
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    fail(
      `Invalid JSON output for "${command} ${query}": ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

function validateCommonEnvelope(payload, command, query) {
  if (!payload || typeof payload !== "object") {
    fail(`[${command}] payload must be an object`);
  }

  if (!ALLOWED_COMMANDS.has(payload.command)) {
    fail(`[${command}] invalid command field: ${payload.command}`);
  }

  if (payload.command !== command) {
    fail(`[${command}] command mismatch. expected=${command}, actual=${payload.command}`);
  }

  if (!ALLOWED_ADAPTERS.has(payload.adapter)) {
    fail(`[${command}] invalid adapter: ${payload.adapter}`);
  }

  if (!isString(payload.query) || payload.query !== query) {
    fail(`[${command}] invalid query field`);
  }
}

function validateMeta(meta, command) {
  if (meta == null) {
    return;
  }

  if (typeof meta !== "object") {
    fail(`[${command}] meta must be an object when provided`);
  }

  if (meta.intentSource && !ALLOWED_INTENT_SOURCES.has(meta.intentSource)) {
    fail(`[${command}] invalid meta.intentSource: ${meta.intentSource}`);
  }

  if (meta.provider && !ALLOWED_PROVIDERS.has(meta.provider)) {
    fail(`[${command}] invalid meta.provider: ${meta.provider}`);
  }

  if (meta.queryType && !ALLOWED_QUERY_TYPES.has(meta.queryType)) {
    fail(`[${command}] invalid meta.queryType: ${meta.queryType}`);
  }

  if (meta.scope && !ALLOWED_SCOPES.has(meta.scope)) {
    fail(`[${command}] invalid meta.scope: ${meta.scope}`);
  }

  if (
    meta.needsLayout &&
    !["true", "false"].includes(String(meta.needsLayout))
  ) {
    fail(`[${command}] invalid meta.needsLayout: ${meta.needsLayout}`);
  }

  if (meta.confidence && Number.isNaN(Number(meta.confidence))) {
    fail(`[${command}] invalid meta.confidence: ${meta.confidence}`);
  }

  if (meta.strategy && !ALLOWED_STRATEGIES.has(meta.strategy)) {
    fail(`[${command}] invalid meta.strategy: ${meta.strategy}`);
  }

  if (meta.intentTags) {
    if (!isString(meta.intentTags)) {
      fail(`[${command}] meta.intentTags must be a comma-separated string`);
    }
  }

  if (meta.model && !isString(meta.model)) {
    fail(`[${command}] meta.model must be a string`);
  }

  if (meta.note && !isString(meta.note)) {
    fail(`[${command}] meta.note must be a string`);
  }
}

function validateSearchRecommend(payload, command) {
  if (!ALLOWED_SEARCH_RECOMMEND_STATUS.has(payload.status)) {
    fail(`[${command}] invalid status: ${payload.status}`);
  }

  if (!Array.isArray(payload.results)) {
    fail(`[${command}] results must be an array`);
  }

  for (const item of payload.results) {
    if (!isString(item.name)) {
      fail(`[${command}] result.name must be a string`);
    }

    if (!ALLOWED_RESULT_CATEGORIES.has(item.category)) {
      fail(`[${command}] invalid result.category: ${item.category}`);
    }

    if (!ALLOWED_PRIORITIES.has(item.priority)) {
      fail(`[${command}] invalid result.priority: ${item.priority}`);
    }

    if (!isString(item.description)) {
      fail(`[${command}] result.description must be a string`);
    }

    if (!isStringArray(item.reasons)) {
      fail(`[${command}] result.reasons must be string[]`);
    }
  }

  if (command === "recommend") {
    if (!payload.meta || payload.meta.intentSource == null) {
      fail(`[${command}] meta.intentSource is required`);
    }
  }

  validateMeta(payload.meta, command);
}

function validateGenerate(payload) {
  if (!ALLOWED_GENERATE_STATUS.has(payload.status)) {
    fail(`[generate] invalid status: ${payload.status}`);
  }

  if (!isStringArray(payload.selectedComponents)) {
    fail("[generate] selectedComponents must be string[]");
  }

  if (!isString(payload.jsx)) {
    fail("[generate] jsx must be a string");
  }

  if (!isStringArray(payload.rationale)) {
    fail("[generate] rationale must be string[]");
  }

  validateMeta(payload.meta, "generate");
}

let failed = 0;

for (const testCase of CASES) {
  try {
    const payload = runCli(testCase.command, testCase.query);
    validateCommonEnvelope(payload, testCase.command, testCase.query);

    if (testCase.command === "generate") {
      validateGenerate(payload);
    } else {
      validateSearchRecommend(payload, testCase.command);
    }

    console.log(`[PASS] contract ${testCase.command} "${testCase.query}"`);
  } catch (error) {
    failed += 1;
    console.log(`[FAIL] contract ${testCase.command} "${testCase.query}"`);
    console.log(`  ${(error instanceof Error ? error.message : String(error)).trim()}`);
  }
}

if (failed > 0) {
  console.error(`\nCLI contract validation failed: ${failed} case(s).`);
  process.exit(1);
}

console.log("\nCLI contract validation passed.");
