export const designTokens = {
  color: {
    primary: "var(--primary)",
    primaryStrong: "var(--primary-800)",
    primarySoft: "var(--primary-200)",
    surface: "var(--surface)",
    surfaceStrong: "var(--surface-strong)",
    border: "var(--border)",
    foreground: "var(--foreground)",
    mutedForeground: "var(--muted-foreground)"
  },
  radius: {
    pill: "9999px",
    card: "var(--radius-card)"
  },
  spacing: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    6: "1.5rem",
    8: "2rem"
  }
} as const;
