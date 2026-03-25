const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "build",
  "create",
  "do",
  "for",
  "from",
  "how",
  "i",
  "in",
  "into",
  "is",
  "it",
  "make",
  "me",
  "my",
  "need",
  "of",
  "on",
  "or",
  "please",
  "show",
  "that",
  "the",
  "this",
  "to",
  "want",
  "with"
]);

const TOKEN_EXPANSIONS: Record<string, string[]> = {
  login: ["auth", "signin", "form", "password"],
  signin: ["login", "auth", "form"],
  signup: ["register", "auth", "form", "input"],
  register: ["signup", "auth", "form", "input"],
  auth: ["login", "signin"],
  user: ["profile", "account"],
  profile: ["user", "account", "edit"],
  account: ["profile", "edit", "settings"],
  settings: ["setting", "profile", "account", "form"],
  list: ["collection", "section", "page"],
  table: ["list", "section", "page"],
  dashboard: ["page", "layout", "section"],
  collection: ["list", "section"],
  search: ["find", "filter", "query"],
  find: ["search", "filter"],
  filter: ["search", "find"],
  query: ["search", "find"],
  edit: ["update", "form"],
  update: ["edit", "form"],
  submit: ["button", "action", "save"],
  save: ["submit", "button"],
  password: ["input", "auth"],
  field: ["input", "form"],
  form: ["input", "submit"]
};

function singularize(token: string): string {
  if (token.length > 4 && token.endsWith("s")) {
    return token.slice(0, -1);
  }

  return token;
}

function unique(tokens: string[]): string[] {
  return Array.from(new Set(tokens));
}

export function normalizeText(value: string): string[] {
  const baseTokens = value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3)
    .filter((token) => !STOPWORDS.has(token));

  const expandedTokens = [...baseTokens];

  for (const token of baseTokens) {
    const singular = singularize(token);
    if (singular !== token && singular.length >= 3 && !STOPWORDS.has(singular)) {
      expandedTokens.push(singular);
    }

    const aliases = TOKEN_EXPANSIONS[token] ?? [];
    for (const alias of aliases) {
      if (alias.length >= 3 && !STOPWORDS.has(alias)) {
        expandedTokens.push(alias);
      }
    }
  }

  return unique(expandedTokens);
}

export function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}
