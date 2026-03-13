import type { ComponentMetadata } from "../types.js";

export const layoutMetadata: ComponentMetadata = {
  name: "Layout",
  category: "layout",
  description:
    "Page-level structure component that sets the layout grid, header area, and spacing rhythm.",
  props: ["eyebrow", "title", "description", "children"],
  useCases: ["page shell", "screen scaffold", "dashboard section", "content layout"],
  keywords: [
    "layout",
    "page",
    "grid",
    "screen",
    "container",
    "section",
    "page shell"
  ],
  relatedComponents: ["Card", "Button"],
  tokens: {
    gap: { ref: "spacing.6", source: "local" },
    background: { ref: "color.neutral.100", source: "local" },
    foreground: { ref: "color.neutral.900", source: "local" }
  }
};
