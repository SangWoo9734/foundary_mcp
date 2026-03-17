import type { ComponentCategory } from "@repo/ai-metadata";

export type RecommendScenario = "auth" | "form-edit" | "search";

export type RecommendRole =
  | "page-structure"
  | "content-group"
  | "input-group"
  | "entry-field"
  | "editable-field"
  | "primary-action"
  | "supporting-affordance";

type ScenarioRule = {
  categoryBias: Partial<Record<ComponentCategory, number>>;
  roles: RecommendRole[];
};

type RoleRule = {
  componentBias: Record<string, number>;
  reasons: Record<string, string>;
};

const SCENARIO_TRIGGERS: Record<RecommendScenario, string[]> = {
  auth: ["auth", "login", "signin", "sign", "signup", "register", "password"],
  "form-edit": ["edit", "profile", "settings", "update", "account"],
  search: ["search", "find", "filter"]
};

export const SCENARIO_RULES: Record<RecommendScenario, ScenarioRule> = {
  auth: {
    categoryBias: {
      form: 16,
      input: 14,
      action: 10,
      layout: 4,
      surface: 2,
      icon: -4
    },
    roles: ["input-group", "entry-field", "primary-action"]
  },
  "form-edit": {
    categoryBias: {
      layout: 12,
      surface: 12,
      form: 14,
      input: 12,
      action: 8,
      icon: -6
    },
    roles: ["page-structure", "content-group", "input-group", "editable-field", "primary-action"]
  },
  search: {
    categoryBias: {
      input: 16,
      icon: 4,
      action: -2,
      form: -8,
      layout: -2,
      surface: -2
    },
    roles: ["entry-field", "supporting-affordance"]
  }
};

export const ROLE_RULES: Record<RecommendRole, RoleRule> = {
  "page-structure": {
    componentBias: {
      Layout: 16,
      Card: 6
    },
    reasons: {
      Layout: "this scenario benefits from explicit page structure",
      Card: "this scenario may need grouped sections"
    }
  },
  "content-group": {
    componentBias: {
      Card: 16,
      Layout: 4
    },
    reasons: {
      Card: "this scenario benefits from grouped content",
      Layout: "this scenario may group content by section"
    }
  },
  "input-group": {
    componentBias: {
      Form: 18,
      Input: 6
    },
    reasons: {
      Form: "this scenario needs grouped field handling",
      Input: "this scenario uses grouped entry fields"
    }
  },
  "entry-field": {
    componentBias: {
      Input: 18,
      Icon: 4
    },
    reasons: {
      Input: "this scenario needs a field for user input",
      Icon: "this scenario may use a supporting field affordance"
    }
  },
  "editable-field": {
    componentBias: {
      Input: 16,
      Form: 6
    },
    reasons: {
      Input: "this scenario needs editable fields",
      Form: "this scenario may organize multiple editable fields"
    }
  },
  "primary-action": {
    componentBias: {
      Button: 16
    },
    reasons: {
      Button: "this scenario needs a primary action"
    }
  },
  "supporting-affordance": {
    componentBias: {
      Icon: 8,
      Input: 6
    },
    reasons: {
      Icon: "this scenario may use a supporting visual affordance",
      Input: "this scenario still centers on an input control"
    }
  }
};

export function detectScenarios(tokens: string[]): RecommendScenario[] {
  const matches = new Set<RecommendScenario>();

  for (const [scenario, triggers] of Object.entries(SCENARIO_TRIGGERS) as Array<
    [RecommendScenario, string[]]
  >) {
    if (triggers.some((trigger) => tokens.includes(trigger))) {
      matches.add(scenario);
    }
  }

  return Array.from(matches);
}
