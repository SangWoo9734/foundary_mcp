import { EyeIcon } from "../icons/EyeIcon";
import { SearchIcon } from "../icons/SearchIcon";
import type { IconProps, IconSize } from "../types";

const iconSizeClassNames: Record<IconSize, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6"
};

export function Icon({ name, size = "md", className = "" }: IconProps) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center text-muted-foreground",
        iconSizeClassNames[size],
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {name === "search" ? <SearchIcon /> : <EyeIcon />}
    </span>
  );
}
