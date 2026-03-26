import { spawnSync } from "node:child_process";
import { join } from "node:path";

const workspaceRoot = "/Users/sangwoo/foundary_mcp";
const cliEntry = join(workspaceRoot, "packages/cli/dist/index.js");

const CASES = [
  {
    command: "recommend",
    query: "profile edit",
    requiredMeta: { queryType: "page", strategy: "form_flow" },
    mustIncludeAny: ["Form", "Input"]
  },
  {
    command: "recommend",
    query: "dashboard section",
    requiredMeta: { scope: "page_section" },
    mustIncludeAny: ["Layout", "Card"]
  },
  {
    command: "generate",
    query: "shopping page with a lot of products",
    requiredMeta: { strategy: "listing" },
    mustIncludeAny: ["Layout", "Card"]
  }
];

function runCli(command, query) {
  const args = [cliEntry, command, "--adapter", "custom", "--format", "json", query];
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

function checkMeta(payload, requiredMeta) {
  const meta = payload.meta ?? {};

  return Object.entries(requiredMeta).every(([key, value]) => String(meta[key]) === String(value));
}

let failed = 0;
let skipped = 0;

for (const testCase of CASES) {
  try {
    const payload = runCli(testCase.command, testCase.query);
    const intentSource = String(payload?.meta?.intentSource ?? "");

    if (intentSource !== "ai") {
      skipped += 1;
      console.log(`[SKIP] ai ${testCase.command} "${testCase.query}"`);
      console.log(`  intentSource=${intentSource || "unknown"} (AI path not active)`);
      continue;
    }

    const names = extractNames(payload, testCase.command);
    const statusOk = payload.status === "ok";
    const metaOk = checkMeta(payload, testCase.requiredMeta);
    const namesOk = testCase.mustIncludeAny.some((name) => names.includes(name));
    const passed = statusOk && metaOk && namesOk;

    console.log(`[${passed ? "PASS" : "FAIL"}] ai ${testCase.command} "${testCase.query}"`);

    if (!passed) {
      failed += 1;
      console.log(`  meta required: ${JSON.stringify(testCase.requiredMeta)}`);
      console.log(`  meta actual:   ${JSON.stringify(payload.meta ?? {})}`);
      console.log(`  expected any:  ${testCase.mustIncludeAny.join(", ")}`);
      console.log(`  actual names:  ${names.join(", ") || "(none)"}`);
    }
  } catch (error) {
    failed += 1;
    console.log(`[FAIL] ai ${testCase.command} "${testCase.query}"`);
    console.log(`  ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed > 0) {
  console.error(`\nAI semantic evaluation failed: ${failed} case(s).`);
  process.exit(1);
}

if (skipped > 0) {
  console.log(`\nAI semantic evaluation passed with ${skipped} skipped case(s).`);
} else {
  console.log("\nAI semantic evaluation passed.");
}
