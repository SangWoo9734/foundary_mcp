import { normalizeText } from "./normalize.js";
import { recommendComponentsWithMode } from "./recommend.js";
import type {
  GenerateOptions,
  GenerateResult,
  QueryTypeHint,
  RecommendationResult
} from "./types.js";

function buildSelectedComponents(
  queryType: QueryTypeHint,
  queryTokens: string[],
  results: RecommendationResult[]
): string[] {
  const ranked = Array.from(new Set(results.map((result) => result.component.name)));
  const available = new Set(ranked);
  const selected: string[] = [];

  function pick(name: string): void {
    if (available.has(name) && !selected.includes(name)) {
      selected.push(name);
    }
  }

  if (queryType === "page") {
    pick("Layout");
    pick("Card");
    if (queryTokens.some((token) => ["login", "auth", "edit", "profile", "form"].includes(token))) {
      pick("Form");
      pick("Input");
      pick("Button");
    } else {
      pick("Input");
      pick("Button");
    }
  }

  if (queryType === "section") {
    pick("Card");
    pick("Form");
    pick("Input");
    pick("Button");
  }

  if (queryType === "component") {
    if (queryTokens.includes("password")) {
      pick("Input");
      pick("Icon");
    } else if (queryTokens.includes("search")) {
      pick("Input");
      pick("Icon");
    } else if (queryTokens.includes("button") || queryTokens.includes("submit")) {
      pick("Button");
    } else {
      pick("Input");
      pick("Button");
      pick("Card");
    }
  }

  for (const name of ranked) {
    if (selected.length >= 5) {
      break;
    }

    pick(name);
  }

  return selected.slice(0, 5);
}

function inferQueryTypeFromTokens(tokens: string[]): QueryTypeHint {
  if (tokens.some((token) => ["page", "screen", "layout"].includes(token))) {
    return "page";
  }

  if (tokens.some((token) => ["section", "card", "block"].includes(token))) {
    return "section";
  }

  return "component";
}

function buildComponentLevelJsx(query: string, selected: Set<string>): string {
  const lower = query.toLowerCase();

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

function buildSectionLevelJsx(selected: Set<string>): string {
  const inputBlock = selected.has("Input")
    ? `    <Input placeholder="Field value" />\n`
    : "";
  const actionBlock = selected.has("Button")
    ? `    <Button type="submit">Submit</Button>\n`
    : "";
  const formBlock = selected.has("Form")
    ? `<Form>\n${inputBlock}${actionBlock}  </Form>`
    : `<Card title="Section">\n  Content\n</Card>`;

  if (selected.has("Card")) {
    return `<Card title="Section">
  ${formBlock.replace(/\n/g, "\n  ")}
</Card>`;
  }

  return formBlock;
}

function buildPageLevelJsx(selected: Set<string>): string {
  const section = buildSectionLevelJsx(selected);

  if (selected.has("Layout")) {
    return `<Layout title="Generated Page">
  ${section.replace(/\n/g, "\n  ")}
</Layout>`;
  }

  return section;
}

function buildRationale(
  queryType: QueryTypeHint,
  selectedComponents: string[],
  aiRationale: string[],
  intentSource: "ai" | "fallback"
): string[] {
  const rationale = [...aiRationale];

  if (rationale.length === 0) {
    rationale.push(
      intentSource === "ai"
        ? "The component selection was provided by the AI intent layer."
        : "AI intent was unavailable, so metadata matching was used as fallback."
    );
  }

  rationale.push(`Query type interpreted as ${queryType}.`);
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
  const tokens = normalizeText(query);
  const inferredType = recommendation.queryType ?? inferQueryTypeFromTokens(tokens);
  const selectedComponents = buildSelectedComponents(
    inferredType,
    tokens,
    recommendation.results
  );

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
        queryType: inferredType,
        note: recommendation.note
      }
    };
  }

  const selectedSet = new Set(selectedComponents);
  const jsx =
    inferredType === "page"
      ? buildPageLevelJsx(selectedSet)
      : inferredType === "section"
        ? buildSectionLevelJsx(selectedSet)
        : buildComponentLevelJsx(query, selectedSet);

  return {
    query,
    status: "ok",
    selectedComponents,
    jsx,
    rationale: buildRationale(
      inferredType,
      selectedComponents,
      recommendation.rationale ?? [],
      recommendation.intentSource
    ),
    meta: {
      intentSource: recommendation.intentSource,
      provider: recommendation.provider,
      model: recommendation.model,
      queryType: inferredType,
      note: recommendation.note
    }
  };
}
