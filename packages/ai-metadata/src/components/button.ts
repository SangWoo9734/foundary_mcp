import type { ComponentMetadata } from "../types.js";

export const buttonMetadata: ComponentMetadata = {
  name: "Button",
  category: "action",
  description:
    "Interactive control for primary, secondary, and tertiary user actions with size variants.",
  props: ["variant", "size", "disabled", "children", "type"],
  useCases: ["submit", "call to action", "confirm", "trigger action"],
  keywords: [
    "button",
    "cta",
    "action",
    "submit",
    "confirm",
    "primary button",
    "secondary button",
    "text button"
  ],
  relatedComponents: ["Card", "Layout"],
  tokens: {
    background: { ref: "color.primary.600", source: "local" },
    foreground: { ref: "color.base.white", source: "local" },
    radius: { ref: "radius.full", source: "local" },
    padding: { ref: "spacing.4", source: "local" }
  }
};
