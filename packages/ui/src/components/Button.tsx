import type { ButtonProps, ButtonSize, ButtonVariant } from "../types";

const buttonVariantClassNames: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[inset_0_-1px_0_rgba(0,0,0,0.12)] hover:bg-primary-800 active:bg-primary-900 disabled:bg-primary-200 disabled:text-primary-foreground/80",
  secondary:
    "border border-border bg-surface text-foreground hover:border-primary-300 hover:bg-primary-100 active:bg-primary-200 disabled:border-border/70 disabled:bg-surface disabled:text-muted-foreground",
  tertiary:
    "bg-transparent text-primary underline-offset-4 hover:text-primary-800 hover:underline active:text-primary-900 disabled:text-muted-foreground"
};

const buttonSizeClassNames: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-6 text-base"
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200 disabled:cursor-not-allowed",
        buttonVariantClassNames[variant],
        buttonSizeClassNames[size],
        className
      ]
        .filter(Boolean)
        .join(" ")}
      type={type}
      {...props}
    />
  );
}
