import { spawnSync } from "node:child_process";
import { join } from "node:path";

const workspaceRoot = "/Users/sangwoo/foundary_mcp";
const cliEntry = join(workspaceRoot, "packages/cli/dist/index.js");

/**
 * Keep this set aligned with docs/example-query-set.md.
 * These are baseline checks, not exhaustive quality tests.
 */
const CASES = [
  {
    command: "search",
    query: "login form input",
    status: "ok",
    mustInclude: ["Input", "Form"]
  },
  {
    command: "search",
    query: "button for submit",
    status: "ok",
    mustInclude: ["Button"]
  },
  {
    command: "search",
    query: "for the and",
    status: "no_match",
    mustInclude: []
  },
  {
    command: "recommend",
    query: "login page",
    status: "ok",
    mustInclude: ["Form", "Input", "Button"]
  },
  {
    command: "recommend",
    query: "profile edit",
    status: "ok",
    mustInclude: ["Layout", "Card", "Form", "Input", "Button"]
  },
  {
    command: "recommend",
    query: "search field",
    status: "ok",
    mustInclude: ["Input"]
  },
  {
    command: "generate",
    query: "password input",
    status: "ok",
    mustInclude: ["Input"]
  },
  {
    command: "generate",
    query: "button for submit",
    status: "ok",
    mustInclude: ["Button"]
  },
  {
    command: "generate",
    query: "form section",
    status: "ok",
    mustInclude: ["Card", "Form", "Input", "Button"]
  },
  {
    command: "generate",
    query: "page layout",
    status: "ok",
    mustInclude: ["Layout", "Card"]
  }
];

function runCli(command, query, extraArgs = []) {
  const args = [
    cliEntry,
    command,
    "--adapter",
    "custom",
    "--format",
    "json",
    ...extraArgs,
    query
  ];
  const result = spawnSync(process.execPath, args, {
    cwd: workspaceRoot,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(
      `CLI execution failed for "${command} ${query}": ${result.stderr || result.stdout}`
    );
  }

  return JSON.parse(result.stdout);
}

function extractNames(payload, command) {
  if (command === "generate") {
    return payload.selectedComponents ?? [];
  }

  return (payload.results ?? []).map((item) => item.name);
}

let failed = 0;

for (const testCase of CASES) {
  const payload = runCli(testCase.command, testCase.query, testCase.args ?? []);
  const names = extractNames(payload, testCase.command);

  const statusOk = payload.status === testCase.status;
  const includesOk = testCase.mustInclude.every((name) => names.includes(name));
  const passed = statusOk && includesOk;

  if (!passed) {
    failed += 1;
  }

  const statusLabel = passed ? "PASS" : "FAIL";
  console.log(`[${statusLabel}] ${testCase.command} "${testCase.query}"`);

  if (!passed) {
    console.log(`  expected status: ${testCase.status}`);
    console.log(`  actual status:   ${payload.status}`);
    console.log(`  expected names:  ${testCase.mustInclude.join(", ") || "(none)"}`);
    console.log(`  actual names:    ${names.join(", ") || "(none)"}`);
  }
}

if (failed > 0) {
  console.error(`\nQuery set evaluation failed: ${failed} case(s).`);
  process.exit(1);
}

console.log("\nQuery set evaluation passed.");
