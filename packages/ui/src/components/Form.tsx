import type { FormFieldProps, FormProps } from "../types";

export function Form({ className = "", children, ...props }: FormProps) {
  return (
    <form
      className={["grid gap-4", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </form>
  );
}

export function FormField({
  className = "",
  label,
  message,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div
      className={["grid gap-2", className].filter(Boolean).join(" ")}
      {...props}
    >
      {label ? (
        <label className="text-sm font-semibold tracking-tight text-foreground">
          {label}
        </label>
      ) : null}
      {children}
      {message ? (
        <p className="text-sm leading-6 text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}
