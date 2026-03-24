#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Command } from "commander";
import {
  generateUI,
  recommendComponentsWithMode,
  searchComponents,
  type AIProvider
} from "@repo/core";
import {
  createGenerateEnvelope,
  formatGenerateJson,
  formatGenerateText,
  formatSearchLikeJson,
  formatSearchLikeText,
  type OutputFormat
} from "./format.js";

type CommandOptions = {
  adapter: string;
  format: OutputFormat;
};

type RecommendCommandOptions = CommandOptions & {
  model?: string;
  provider?: string;
};

type GlobalAIOptions = {
  model?: string;
  provider?: string;
};

function validateAdapter(adapter: string): void {
  if (adapter !== "custom") {
    throw new Error(
      `Unsupported adapter "${adapter}". Only "custom" is currently available.`
    );
  }
}

function loadDotEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function validateProvider(provider: string): asserts provider is AIProvider {
  if (!["gemini", "openai"].includes(provider)) {
    throw new Error(
      `Unsupported provider "${provider}". Allowed values: "gemini", "openai".`
    );
  }
}

const program = new Command();
loadDotEnvLocal();

program
  .name("ds-ai")
  .description("CLI for design-system metadata search and recommendation")
  .option("--provider <name>", "global AI provider: gemini or openai")
  .option("--model <name>", "global model for AI calls")
  .showHelpAfterError()
  .version("0.0.0");

program
  .command("search")
  .description("Search components from the active custom design system")
  .option("--adapter <name>", "design system adapter", "custom")
  .option("--format <type>", "output format: text or json", "text")
  .argument("<query>", "natural language search query")
  .action((query: string, options: CommandOptions) => {
    validateAdapter(options.adapter);
    const results = searchComponents(query);

    if (options.format === "json") {
      console.log(formatSearchLikeJson("search", query, options.adapter, results));
      return;
    }

    console.log(formatSearchLikeText("search", query, options.adapter, results));
  });

program
  .command("recommend")
  .description("Recommend components for a page or flow")
  .option("--adapter <name>", "design system adapter", "custom")
  .option("--format <type>", "output format: text or json", "text")
  .option("--provider <name>", "AI provider override: gemini or openai")
  .option("--model <name>", "model override for AI recommendation")
  .argument("<query>", "natural language recommendation query")
  .action(async (query: string, options: RecommendCommandOptions) => {
    const globalOptions = program.opts<GlobalAIOptions>();
    validateAdapter(options.adapter);
    const provider = options.provider ?? globalOptions.provider ?? "gemini";
    const model = options.model ?? globalOptions.model;
    validateProvider(provider);

    const output = await recommendComponentsWithMode(query, {
      model,
      provider
    });
    const meta: Record<string, string> = {
      intentSource: output.intentSource
    };

    if (output.model) {
      meta.model = output.model;
    }

    if (output.provider) {
      meta.provider = output.provider;
    }

    if (output.note) {
      meta.note = output.note;
    }

    if (output.queryType) {
      meta.queryType = output.queryType;
    }

    if (options.format === "json") {
      console.log(
        formatSearchLikeJson(
          "recommend",
          query,
          options.adapter,
          output.results,
          meta
        )
      );
      return;
    }

    console.log(
      formatSearchLikeText(
        "recommend",
        query,
        options.adapter,
        output.results,
        meta
      )
    );
  });

program
  .command("generate")
  .description("Generate a UI composition from the active custom design system")
  .option("--adapter <name>", "design system adapter", "custom")
  .option("--format <type>", "output format: text or json", "text")
  .option("--provider <name>", "AI provider override: gemini or openai")
  .option("--model <name>", "model override for AI recommendation")
  .argument("<query>", "natural language generation query")
  .action(async (query: string, options: RecommendCommandOptions) => {
    const globalOptions = program.opts<GlobalAIOptions>();
    validateAdapter(options.adapter);
    const provider = options.provider ?? globalOptions.provider ?? "gemini";
    const model = options.model ?? globalOptions.model;
    validateProvider(provider);
    const result = createGenerateEnvelope(
      query,
      options.adapter,
      await generateUI(query, { provider, model })
    );

    if (options.format === "json") {
      console.log(formatGenerateJson(result));
      return;
    }

    console.log(formatGenerateText(result));
  });

program.parse();
