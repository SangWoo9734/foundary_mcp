# Project Overview

## 1. Project Summary

### Goal

Build an MCP (Model Context Protocol) based design system tooling layer so an AI agent can understand and use a specific design system effectively.

### Problems to Solve

#### Problem 1 - Too many components make selection difficult

Examples:

- Button
- PrimaryButton
- SecondaryButton
- IconButton
- GhostButton

The AI has difficulty deciding which component should be used in which situation.

#### Problem 2 - Design system documentation exceeds the context window

Design system documentation is usually large.

Examples:

- Storybook docs
- Component API docs
- Usage guides

An LLM cannot reliably consume the full documentation set and will only use part of it.

#### Problem 3 - Non-frontend developers should still be able to compose UI quickly

Examples:

- Backend developers
- AI engineers
- PMs

At the POC stage, the team still needs UI that preserves the product look and feel.

## 2. Solution Strategy

> Instead of making the AI read the design system documentation directly, provide structured design system information as tools at runtime based on the selected design system.

### Existing Flow

AI

↓

Design System Docs

↓

Code Generation

### Proposed Flow

AI

↓

MCP Server

↓

Active Design System Adapter

↓

Component Metadata

↓

Design System

### Core Idea

The AI does not read raw documentation directly. It calls tools, and those tools operate based on the currently selected design system.

## 3. Project Objectives

Build an MCP server that provides the following three capabilities.

### 1) Component Search

Search related components inside the currently selected design system using a natural language query.

Example:

query: find form input components

Result:

- Input
- Textarea
- Select

### 2) Component Recommendation

Recommend components for a page goal based on the currently selected design system.

Example:

query: recommend components for a login page

Result:

- Form
- Input
- PasswordInput
- Button

### 3) UI Generation

Generate code by composing components from the currently selected design system based on a description.

Example:

```tsx
<Form>
  <Input />
  <PasswordInput />
  <Button>Login</Button>
</Form>
```

## 4. System Architecture

AI Agent

↓

MCP Server

↓

Design System Registry

↓

Active Design System Adapter

↓

Normalized Component Metadata

(frontend component metadata + design token references)

↓

UI Library / Token Source

(source differs by adapter)

Examples:

- Custom / Company -> Figma Variables
- Shadcn -> theme / CSS variables
- External Library -> token JSON / theme config

## 5. Repository Structure

```text
apps/
  web-demo

packages/
  ui
  ai-metadata
  mcp-server
```

### apps/web-demo

A Next.js demo app that renders generated UI.

### packages/ui

Design system components.

Examples:

- Button
- Input
- Card
- Modal

(about 10 components)

### packages/ai-metadata

Component metadata used by the AI.

### packages/mcp-server

Provides the AI tool interface.

## 6. Component Metadata Design

Example:

```json
{
  "Button": {
    "category": "action",
    "description": "Button for executing a user action",
    "props": ["variant", "size", "disabled"],
    "usage": "<Button variant='primary'>Save</Button>",
    "relatedComponents": ["IconButton"],
    "useCases": ["submit", "cta", "confirm"],
    "keywords": ["click", "submit", "action"],
    "tokens": {
      "color": {
        "ref": "color.primary",
        "source": "figma"
      },
      "radius": {
        "ref": "radius.sm",
        "source": "figma"
      }
    }
  }
}
```

### Metadata Purpose

When the AI selects a component, it should understand:

- semantic meaning
- usage context
- supported props
- design token references

### Metadata Principles

Component metadata should include two layers of information.

#### Frontend Metadata

Defines the meaning and usage rules of a component.

Examples:

- props
- useCases
- relatedComponents

#### Design Token References

Do not include raw token values directly. Only keep references.

Example:

```json
{
  "color": {
    "ref": "color.primary",
    "source": "figma"
  }
}
```

The actual token source can vary depending on the adapter and design system.

## 7. Design System Adapter Structure

Use the Adapter pattern to connect multiple design systems.

### Background

Existing shadcn MCP implementations usually target only shadcn registry based components.

That creates several limitations:

- tied to shadcn naming conventions
- tied to shadcn prop structures
- unable to understand internal product components

### Real Product Constraint

In real services, external UI libraries and internal domain components are often used together.

Examples:

#### External UI Library

- Dialog
- Tabs
- Accordion
- Select

#### Internal Design System

- ProductCard
- CheckoutButton
- PaymentSummary
- CouponBox

When the AI generates a page, it should understand components in the context of the current project design system.

For example, for a checkout page, these internal components may be more appropriate than a generic button:

- PaymentSummary
- CheckoutButton
- CouponBox

That is why it is more accurate to explicitly select the current design system first rather than search across multiple systems at once.

### Direction

Design an adapter based abstraction layer that is not tied to a single design system, but at runtime select one active adapter and limit search, recommendation, and generation to that adapter only.

### Structure

```text
DesignSystemRegistry
 ├── CustomAdapter
 ├── ShadcnAdapter
 └── CompanyAdapter (extensible)

Active Adapter
 └── one of the registered adapters
```

### Adapter Responsibility

Each adapter transforms the structure of its design system into a shared metadata format.

The AI uses one consistent tool interface, but actual behavior is determined by the currently active adapter.

Each adapter should also return both frontend metadata and design token references, while normalizing token sources into a common structure.

### Shared Structure Returned by an Adapter

```json
{
  "name": "Button",
  "category": "action",
  "description": "Button for executing a user action",
  "props": ["variant", "size"],
  "useCases": ["submit", "confirm"],
  "tokens": {
    "color": {
      "ref": "color.primary",
      "source": "figma"
    }
  }
}
```

### Adapter Roles

#### CustomAdapter

Transforms a custom UI library into metadata.

Example token sources:

- Figma Variables
- local token files

#### ShadcnAdapter

Transforms shadcn registry data into metadata.

Example token sources:

- theme files
- CSS variables

#### CompanyAdapter (extensible)

Designed to transform an internal company design system into metadata.

Example token sources:

- internal token registry
- design token JSON

### Registry Responsibility

Manages the list of adapters available to the MCP server.

Examples:

- shadcn
- custom
- company

At runtime, the user selects one of them and that selection becomes the active adapter.

### Why This Matters

This allows the MCP server to behave as a design system abstraction layer rather than a thin wrapper around one UI library.

It also avoids mixing multiple design systems during search and generation, which reduces component conflicts and improves recommendation accuracy.

By storing only token references instead of raw token values in metadata, the design keeps LLM context usage smaller and lets each adapter manage token sources flexibly.

### Differentiation

This project is not just reusing an existing MCP implementation. It is designed for real product environments where internal and external design systems are mixed.

It supports multiple design systems as an abstraction, while still focusing on exactly one active design system at runtime for more accurate results.

## 8. MCP Tool Definitions

### search_components(query)

Description:

Search related components based on the current active adapter.

Example:

```json
{
  "adapter": "shadcn",
  "query": "input for login"
}
```

Result:

```json
["Input", "PasswordInput"]
```

### recommend_components(pageType)

Description:

Recommend components for a page goal based on the current active adapter.

Example:

```json
{
  "adapter": "custom",
  "pageType": "profile page"
}
```

Result:

```json
["Avatar", "Input", "Button"]
```

### generate_ui(description)

Description:

Generate UI code based on the current active adapter.

Example:

```json
{
  "adapter": "company",
  "description": "profile edit screen"
}
```

Result:

```tsx
<Card>
  <Avatar />
  <Input />
  <Button>Save</Button>
</Card>
```

## 9. Demo Scenario

User selects a design system

Example: shadcn

↓

User enters a prompt

Create a login page

↓

MCP tools are called

↓

Components are searched and recommended based on the selected adapter

↓

React code is generated

↓

The demo app renders the result

## 10. Technology Stack

### Frontend

- React
- TypeScript
- Next.js

### Design System

- Storybook
- Tailwind CSS
- Figma Variables (for custom/company adapter token sources)

### Infra

- Turborepo
- Vitest
- GitHub Actions

### AI Layer

- OpenAI API
- Embedding Search (optional)

### MCP

- Model Context Protocol SDK

### Monitoring

- Sentry

Use Sentry to track the runtime status of the MCP server and demo application.

- web-demo: track UI rendering errors
- mcp-server: track tool execution failures and adapter errors

Record the active adapter and tool name as tags so issues can be traced back to the exact environment.

## Shared Timeline

| Phase | Duration | Goal | Main Deliverables |
| --- | --- | --- | --- |
| Phase 1 | Week 1 | Project structure and core data design | monorepo setup, ui package, metadata schema, adapter interface |
| Phase 2 | Week 2 | MCP tool MVP implementation | working search / recommend / generate tools |
| Phase 3 | Week 3 | Demo app integration and end-to-end flow | prompt input -> tool call -> UI rendering |
| Phase 4 | Week 4 | Structural hardening and operations support | adapter extension structure, monitoring, README |

## Detailed Goals by Phase

| Phase | Details |
| --- | --- |
| Phase 1 | Turborepo packages/apps setup, custom UI components, component metadata design |
| Phase 2 | active adapter based component search / recommendation / UI generation |
| Phase 3 | adapter selection, prompt input, and generated UI rendering in web-demo |
| Phase 4 | extension-friendly adapter structure, Sentry integration, documentation |

## Expected MVP Timing

```text
End-to-end MVP completion in 2 to 3 weeks, assuming 4 hours of available time per day
```

The timeline may extend depending on available time.

## Planned Extensions

| Item | Description |
| --- | --- |
| Search improvement | keyword based -> semantic search |
| Adapter expansion | custom -> shadcn / company adapter |
| Metadata automation | manual authoring -> docs-based extraction |
| Design token integration | connect adapter-specific token sources |

## Current Execution Strategy

```text
Initially focus on one custom design system,
stabilize the metadata-driven tool flow first,
then expand adapters and improve search incrementally.

Keep only token references in metadata,
and separate actual token sources by adapter and design system structure.
```
