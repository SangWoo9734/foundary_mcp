import type { LayoutProps } from "../types";

export function Layout({
  eyebrow = "Design System Template",
  title,
  description,
  className = "",
  children,
  ...props
}: LayoutProps) {
  return (
    <div
      className={[
        "mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 md:px-10 md:py-14",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <header className="rounded-[calc(var(--radius-card)+0.5rem)] bg-surface px-8 py-8 shadow-[var(--shadow-soft)] md:px-12 md:py-12">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>
      <div className="grid gap-6">{children}</div>
    </div>
  );
}
