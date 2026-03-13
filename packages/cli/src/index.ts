#!/usr/bin/env node

import { Command } from "commander";
import { recommendComponents, searchComponents } from "@repo/core";
import { formatResults } from "./format.js";

const program = new Command();

program
  .name("ds-ai")
  .description("CLI for design-system metadata search and recommendation")
  .version("0.0.0");

program
  .command("search")
  .description("Search components from the active custom design system")
  .argument("<query>", "natural language search query")
  .action((query: string) => {
    const results = searchComponents(query);
    console.log(formatResults(results));
  });

program
  .command("recommend")
  .description("Recommend components for a page or flow")
  .argument("<pageType>", "page or flow description")
  .action((pageType: string) => {
    const results = recommendComponents(pageType);
    console.log(formatResults(results));
  });

program.parse();
