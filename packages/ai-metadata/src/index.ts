import { buttonMetadata } from "./components/button.js";
import { cardMetadata } from "./components/card.js";
import { formMetadata } from "./components/form.js";
import { iconMetadata } from "./components/icon.js";
import { inputMetadata } from "./components/input.js";
import { layoutMetadata } from "./components/layout.js";
import type { ComponentMetadataMap } from "./types.js";

export type {
  ComponentCategory,
  ComponentMetadata,
  ComponentMetadataMap,
  ComponentTokenMap,
  TokenReference
} from "./types.js";

export const componentMetadata: ComponentMetadataMap = {
  Button: buttonMetadata,
  Card: cardMetadata,
  Layout: layoutMetadata,
  Input: inputMetadata,
  Form: formMetadata,
  Icon: iconMetadata
};

export const searchableComponents = Object.values(componentMetadata);
