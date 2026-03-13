import { componentMetadata } from "@repo/ai-metadata";
import { searchComponents } from "@repo/core";
import { Button, Card, Form, FormField, Icon, Input, Layout } from "@repo/ui";

const searchPreview = searchComponents("login form input");

export default function HomePage() {
  return (
    <Layout
      title="Custom Design System"
      description="Initial custom design system MVP based on local tokens, metadata, and metadata-driven search."
    >
      <Card
        title="Button Variants"
        description="Primary, secondary, and tertiary buttons follow the captured visual direction and use shared local design tokens."
      >
        <div className="flex flex-wrap gap-3">
          <Button size="sm">Default</Button>
          <Button>Continue</Button>
          <Button size="lg">Create Project</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>
      <Card
        title="Form Inputs"
        description="Input states follow the captured direction: default, search, password, disabled, focus, typing, and error."
      >
        <div className="grid gap-3 lg:max-w-xl">
          <Input defaultValue="Default" />
          <Input defaultValue="Default" leadingIcon="search" />
          <Input defaultValue="Default" trailingIcon="eye" />
          <Input defaultValue="Disable" disabled />
          <Input placeholder="Placeholder" />
          <Input defaultValue="Focus" autoFocus />
          <Input defaultValue="Typing" />
          <Input defaultValue="Error" invalid />
          <Input defaultValue="Focus" invalid />
          <Input defaultValue="Typing" invalid />
        </div>
      </Card>
      <Card
        title="Form Composition"
        description="A lightweight form layer for grouping labels, fields, helper messages, and submission actions."
      >
        <Form className="max-w-xl">
          <FormField label="Email" message="Use your work email address.">
            <Input placeholder="name@company.com" leadingIcon="search" />
          </FormField>
          <FormField
            label="Password"
            message="At least 8 characters with one symbol."
          >
            <Input placeholder="Enter password" trailingIcon="eye" />
          </FormField>
          <div className="flex gap-3">
            <Button type="submit">Continue</Button>
            <Button variant="secondary">Cancel</Button>
          </div>
        </Form>
      </Card>
      <Card
        title="Icon Set"
        description="The default system starts with a compact icon set for input and action affordances."
      >
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-3">
            <Icon name="search" />
            <span className="text-sm text-foreground">search</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-3">
            <Icon name="eye" />
            <span className="text-sm text-foreground">eye</span>
          </div>
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card
          title="Component Metadata"
          description="Metadata defines semantic meaning, keywords, use cases, and token references for the default custom design system."
        >
          <pre className="overflow-x-auto rounded-2xl bg-muted p-4 text-sm leading-6 text-foreground">
            {JSON.stringify(componentMetadata, null, 2)}
          </pre>
        </Card>
        <Card
          title="Search Preview"
          description='Query: "login form input"'
        >
          <ul className="space-y-3">
            {searchPreview.map((result) => (
              <li
                className="rounded-2xl border border-border bg-muted px-4 py-4"
                key={result.component.name}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-foreground">
                    {result.component.name}
                  </h3>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    score {result.score}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {result.component.description}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {result.reasons.join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Layout>
  );
}
