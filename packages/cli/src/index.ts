#!/usr/bin/env node

import { Command } from "commander";
import { generateUI, recommendComponents, searchComponents } from "@repo/core";
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

function validateAdapter(adapter: string): void {
  if (adapter !== "custom") {
    throw new Error(
      `Unsupported adapter "${adapter}". Only "custom" is currently available.`
    );
  }
}

const program = new Command();

program
  .name("ds-ai")
  .description("CLI for design-system metadata search and recommendation")
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
  .argument("<query>", "natural language recommendation query")
  .action((query: string, options: CommandOptions) => {
    validateAdapter(options.adapter);
    const results = recommendComponents(query);

    if (options.format === "json") {
      console.log(formatSearchLikeJson("recommend", query, options.adapter, results));
      return;
    }

    console.log(
      formatSearchLikeText("recommend", query, options.adapter, results)
    );
  });

program
  .command("generate")
  .description("Generate a UI composition from the active custom design system")
  .option("--adapter <name>", "design system adapter", "custom")
  .option("--format <type>", "output format: text or json", "text")
  .argument("<query>", "natural language generation query")
  .action((query: string, options: CommandOptions) => {
    validateAdapter(options.adapter);
    const result = createGenerateEnvelope(query, options.adapter, generateUI(query));

    if (options.format === "json") {
      console.log(formatGenerateJson(result));
      return;
    }

    console.log(formatGenerateText(result));
  });

program.parse();
