import { recommendComponentsWithMode } from "./recommend.js";
import type {
  GenerateOptions,
  GenerateResult,
  GenerationStrategy,
  QueryScopeHint,
  QueryTypeHint
} from "./types.js";

function renderComponentJsx(query: string, selected: Set<string>): string {
  const lower = query.toLowerCase();
  const wantsAction = lower.includes("button") || lower.includes("submit");

  if (wantsAction && selected.has("Button")) {
    return `<Button type="submit">Submit</Button>`;
  }

  if (selected.has("Input") && lower.includes("password")) {
    return `<Input placeholder="Password" trailingIcon="eye" />`;
  }

  if (selected.has("Input") && lower.includes("search")) {
    return `<Input placeholder="Search..." leadingIcon="search" />`;
  }

  if (selected.has("Button") && !selected.has("Input") && !selected.has("Form")) {
    return `<Button type="button">Action</Button>`;
  }

  if (selected.has("Card") && !selected.has("Form")) {
    return `<Card title="Card">
  Content
</Card>`;
  }

  if (selected.has("Input")) {
    return `<Input placeholder="Value" />`;
  }

  return `<Button type="button">Continue</Button>`;
}

function renderSectionJsx(selected: Set<string>): string {
  const inputBlock = selected.has("Input")
    ? `    <Input placeholder="Field value" />\n`
    : "";
  const actionBlock = selected.has("Button")
    ? `    <Button type="submit">Submit</Button>\n`
    : "";
  const formBlock = selected.has("Form")
    ? `<Form>\n${inputBlock}${actionBlock}  </Form>`
    : `Content`;

  if (selected.has("Card") && selected.has("Form")) {
    return `<Card title="Section">
  ${formBlock.replace(/\n/g, "\n  ")}
</Card>`;
  }

  if (selected.has("Card")) {
    return `<Card title="Section">
  Content
</Card>`;
  }

  return formBlock;
}

function renderPageJsx(selected: Set<string>, query: string): string {
  const section = renderSectionJsx(selected);

  if (selected.has("Layout")) {
    return `<Layout title="Generated Page">
  ${section.replace(/\n/g, "\n  ")}
</Layout>`;
  }

  return renderComponentJsx(query, selected);
}

function renderListingJsx(
  scope: QueryScopeHint,
  selected: Set<string>
): string {
  const listingBody = `<div className="grid gap-4">
  <Card title="Product Item 1">...</Card>
  <Card title="Product Item 2">...</Card>
  <Card title="Product Item 3">...</Card>
  {/* repeat card items */}
</div>`;

  if (scope === "component") {
    return `<Card title="Product Item">...</Card>`;
  }

  if (selected.has("Layout")) {
    return `<Layout title="Generated Listing Page">
  ${listingBody.replace(/\n/g, "\n  ")}
</Layout>`;
  }

  return listingBody;
}

function renderByQueryType(
  queryType: QueryTypeHint,
  scope: QueryScopeHint,
  strategy: GenerationStrategy,
  query: string,
  selected: Set<string>
): string {
  if (strategy === "listing") {
    return renderListingJsx(scope, selected);
  }

  if (scope === "page_section") {
    return renderPageJsx(selected, query);
  }

  if (queryType === "page") {
    return renderPageJsx(selected, query);
  }

  if (queryType === "section") {
    return renderSectionJsx(selected);
  }

  return renderComponentJsx(query, selected);
}

function extractUsedComponents(selectedComponents: string[], jsx: string): string[] {
  const used = selectedComponents.filter((name) => jsx.includes(`<${name}`));
  return used.length > 0 ? used : selectedComponents;
}

function buildRationale(
  queryType: QueryTypeHint,
  selectedComponents: string[],
  strategy: GenerationStrategy,
  aiRationale: string[],
  intentSource: "ai" | "fallback"
): string[] {
  const selectedSet = new Set(selectedComponents.map((name) => name.toLowerCase()));
  const normalizedAiRationale = aiRationale.filter((line) => {
    const lower = line.toLowerCase();

    if (lower.includes("layout") && !selectedSet.has("layout")) {
      return false;
    }

    if (lower.includes("form") && !selectedSet.has("form")) {
      return false;
    }

    if (lower.includes("input") && !selectedSet.has("input")) {
      return false;
    }

    if (lower.includes("button") && !selectedSet.has("button")) {
      return false;
    }

    return true;
  });
  const rationale = [
    intentSource === "ai"
      ? "The component selection was provided by the AI intent layer."
      : "AI intent was unavailable, so fallback composition selected components."
  ];
  rationale.push(...normalizedAiRationale);

  rationale.push(`Query type interpreted as ${queryType}.`);
  rationale.push(`Generation strategy: ${strategy}.`);
  rationale.push(
    `Generated composition is built from: ${selectedComponents.join(", ")}.`
  );

  return rationale.slice(0, 5);
}

export async function generateUI(
  query: string,
  options: GenerateOptions = {}
): Promise<GenerateResult> {
  const recommendation = await recommendComponentsWithMode(query, options);
  const queryType = recommendation.queryType ?? "component";
  const scope =
    recommendation.scope ??
    (queryType === "page"
      ? "page"
      : queryType === "section"
        ? "standalone_section"
        : "component");
  const selectedComponents = recommendation.selectedComponents;
  const strategy = recommendation.strategy ?? "scaffold";

  if (selectedComponents.length === 0) {
    return {
      query,
      status: "fallback",
      selectedComponents: ["Layout", "Card", "Button"],
      jsx: `<Layout title="Generated UI">
  <Card title="Suggested Section">
    <Button>Continue</Button>
  </Card>
</Layout>`,
      rationale: [
        "No reliable component match was found for this query.",
        "A minimal layout/card/button scaffold is returned as a safe fallback."
      ],
      meta: {
        intentSource: recommendation.intentSource,
        provider: recommendation.provider,
        model: recommendation.model,
        queryType,
        scope,
        needsLayout: recommendation.needsLayout,
        confidence: recommendation.confidence,
        intentTags: recommendation.intentTags,
        strategy,
        note: recommendation.note
      }
    };
  }

  const selectedSet = new Set(selectedComponents);
  const jsx = renderByQueryType(queryType, scope, strategy, query, selectedSet);
  const usedComponents = extractUsedComponents(selectedComponents, jsx);

  return {
    query,
    status: "ok",
    selectedComponents: usedComponents,
    jsx,
    rationale: buildRationale(
      queryType,
      usedComponents,
      strategy,
      recommendation.rationale ?? [],
      recommendation.intentSource
    ),
    meta: {
      intentSource: recommendation.intentSource,
      provider: recommendation.provider,
      model: recommendation.model,
      queryType,
      scope,
      needsLayout: recommendation.needsLayout,
      confidence: recommendation.confidence,
      intentTags: recommendation.intentTags,
      strategy,
      note: recommendation.note
    }
  };
}
