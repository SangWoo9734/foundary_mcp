import { Card } from "@repo/ui";
import { defaultAiMetadata } from "@repo/ai-metadata";

export default function HomePage() {
  return (
    <main className="page">
      <Card
        title="Turborepo + Next.js"
        description="apps/web-demo is wired to shared workspace packages."
      />
      <section className="panel">
        <h2>AI Metadata</h2>
        <pre>{JSON.stringify(defaultAiMetadata, null, 2)}</pre>
      </section>
    </main>
  );
}

