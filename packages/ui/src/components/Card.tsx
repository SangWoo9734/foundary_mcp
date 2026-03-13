import type { CardProps } from "../types";

export function Card({ title, description, children }: CardProps) {
  return (
    <section className="w-full rounded-[var(--radius-card)] border border-border bg-surface px-6 py-6 text-foreground shadow-[var(--shadow-soft)] md:px-8 md:py-8">
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
