import type { ReactNode } from "react";

type CardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function Card({ title, description, children }: CardProps) {
  return (
    <section
      style={{
        width: "min(720px, 100%)",
        padding: 24,
        borderRadius: 16,
        background: "#111827",
        color: "#f9fafb",
        boxShadow: "0 12px 40px rgba(15, 23, 42, 0.18)"
      }}
    >
      <h1 style={{ margin: 0, fontSize: 32 }}>{title}</h1>
      <p style={{ margin: "12px 0 0", lineHeight: 1.6 }}>{description}</p>
      {children ? <div style={{ marginTop: 20 }}>{children}</div> : null}
    </section>
  );
}

