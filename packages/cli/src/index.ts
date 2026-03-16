#!/usr/bin/env node

import { Command } from "commander";
import { recommendComponents, searchComponents } from "@repo/core";
import {
  formatLegacyResults,
  formatSearchJson,
  formatSearchText,
  type OutputFormat
} from "./format.js";

type SearchCommandOptions = {
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
  .action((query: string, options: SearchCommandOptions) => {
    validateAdapter(options.adapter);
    const results = searchComponents(query);

    if (options.format === "json") {
      console.log(formatSearchJson(query, options.adapter, results));
      return;
    }

    console.log(formatSearchText(results));
  });

program
  .command("recommend")
  .description("Recommend components for a page or flow")
  .argument("<pageType>", "page or flow description")
  .action((pageType: string) => {
    const results = recommendComponents(pageType);
    console.log(formatLegacyResults(results));
  });

program.parse();
