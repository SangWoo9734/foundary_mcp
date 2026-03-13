export type TokenReference = {
  ref: string;
  source: "local";
};

export type ComponentTokenMap = Record<string, TokenReference>;

export type ComponentCategory =
  | "action"
  | "layout"
  | "surface"
  | "input"
  | "form"
  | "icon";

export type ComponentMetadata = {
  name: string;
  category: ComponentCategory;
  description: string;
  props: string[];
  useCases: string[];
  keywords: string[];
  relatedComponents: string[];
  tokens: ComponentTokenMap;
};

export type ComponentMetadataMap = Record<string, ComponentMetadata>;
