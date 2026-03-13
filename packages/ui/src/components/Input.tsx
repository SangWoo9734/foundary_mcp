import { Icon } from "./Icon";
import type { InputProps } from "../types";

export function Input({
  className = "",
  disabled,
  invalid = false,
  leadingIcon,
  trailingIcon,
  ...props
}: InputProps) {
  return (
    <div
      className={[
        "flex h-14 items-center rounded-2xl border bg-surface px-4 shadow-sm transition-colors",
        invalid
          ? "border-[#ff9100] focus-within:border-[#ff9100]"
          : "border-border focus-within:border-[#1473ff]",
        disabled ? "bg-muted text-muted-foreground" : "text-foreground",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {leadingIcon ? (
        <span className="mr-3 flex items-center">
          <Icon name={leadingIcon} />
        </span>
      ) : null}
      <input
        className={[
          "h-full w-full border-0 bg-transparent text-[1.05rem] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
          disabled ? "text-muted-foreground" : "text-foreground"
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled}
        {...props}
      />
      {trailingIcon ? (
        <span className="ml-3 flex items-center">
          <Icon name={trailingIcon} />
        </span>
      ) : null}
    </div>
  );
}
