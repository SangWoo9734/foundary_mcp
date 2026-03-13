# Project Overview

## 1. Project Summary

### Goal

Build a CLI-based design system tooling layer so an AI agent can understand and use a specific design system effectively.

The system should also be designed so the same core logic can later be extended to an MCP (Model Context Protocol) interface.

### Problems to Solve

#### Problem 1 - Too many components make selection difficult

Examples:

- Button
- PrimaryButton
- SecondaryButton
- IconButton
- GhostButton

The AI has difficulty deciding which component should be selected in which situation.

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

> Instead of making the AI read design system documentation directly, provide the selected design system information through structured commands at runtime.

### Existing Flow

AI

↓

Design System Docs

↓

Code Generation

### Proposed Flow

AI / User

↓

CLI Command

↓

Active Design System Adapter

↓

Component Metadata

↓

Design System

### Core Idea

The AI does not read raw documentation directly. It calls commands, and those commands operate based on the currently selected design system.

The core logic should remain separate from the interface so the same logic can later be exposed through MCP tools.

## 3. Project Objectives

Build a CLI tool that provides the following three capabilities.

### 1) Component Search

Search related components inside the currently selected design system using a natural language query.

Example:

```bash
ds-ai search --adapter custom "form input component"
```

Result:

```text
Input
Textarea
Select
```

### 2) Component Recommendation

Recommend components for a page goal based on the currently selected design system.

Example:

```bash
ds-ai recommend --adapter custom "login page"
```

Result:

```text
Form
Input
PasswordInput
Button
```

### 3) UI Generation

Generate code by composing components from the currently selected design system based on a description.

Example:

```bash
ds-ai generate --adapter custom "login page"
```

Result:

```tsx
<Form>
  <Input />
  <PasswordInput />
  <Button>Login</Button>
</Form>
```

## 4. System Architecture

User / AI Agent

↓

CLI Interface

↓

Core Engine

↓

Design System Registry

↓

Active Design System Adapter

↓

Normalized Component Metadata

(frontend component metadata + design token references)

↓

UI Library / Token Source

### Design Principles

The core engine must not depend on a specific interface.

Search, recommend, and generate logic should be reusable across both CLI and future MCP interfaces.

## 5. Repository Structure

```text
apps/
  web-demo

packages/
  ui
  ai-metadata
  core
  cli
```

### apps/web-demo

A Next.js demo app that renders generated UI.

### packages/core

Core business logic.

Examples:

- searchComponents()
- recommendComponents()
- generateUI()

### packages/cli

Provides the CLI command interface.

### packages/ai-metadata

Component metadata used by the AI.

### packages/ui

Design system components.

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

Existing shadcn-based tooling usually targets only shadcn registry components.

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

Design an adapter-based abstraction layer that is not tied to a single design system, but at runtime select one active adapter and limit search, recommendation, and generation to that adapter only.

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

The core engine uses one consistent interface, but actual behavior is determined by the currently active adapter.

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

Manages the list of adapters available to the system.

Examples:

- shadcn
- custom
- company

At runtime, the user selects one of them and that selection becomes the active adapter.

### Why This Matters

This allows the project to behave as a design system abstraction layer rather than a thin wrapper around one UI library.

It also avoids mixing multiple design systems during search and generation, which reduces component conflicts and improves recommendation accuracy.

By storing only token references instead of raw token values in metadata, the design keeps LLM context usage smaller and lets each adapter manage token sources flexibly.

## 8. CLI Command Definitions

### search

Description:

Search related components based on the current active adapter.

Example:

```bash
ds-ai search --adapter shadcn "input for login"
```

### recommend

Description:

Recommend components for a page goal based on the current active adapter.

Example:

```bash
ds-ai recommend --adapter custom "profile page"
```

### generate

Description:

Generate UI code based on the current active adapter.

Example:

```bash
ds-ai generate --adapter company "profile edit screen"
```

## 9. Demo Scenario

The user selects a design system.

Example: custom

↓

The user runs a CLI command.

```bash
ds-ai generate --adapter custom "login page"
```

↓

Components are searched and recommended based on the selected adapter.

↓

React code is generated.

↓

The demo app renders the result.

## 10. Technology Stack

### Frontend

- React
- TypeScript
- Next.js

### CLI

- Node.js
- Commander.js

### Design System

- Storybook
- Tailwind CSS
- Figma Variables

### Infra

- Turborepo
- Vitest
- GitHub Actions

### AI Layer

- OpenAI API

### Monitoring

- Sentry

## Planned Extensions

| Item                | Description                        |
| ------------------- | ---------------------------------- |
| MCP interface       | wrap the core logic as MCP tools   |
| Search improvement  | keyword based -> semantic search   |
| Adapter expansion   | custom -> shadcn / company adapter |
| Metadata automation | docs-based extraction              |

## Current Execution Strategy

```text
Initially focus on one custom design system,
validate the CLI-based search / recommend / generate flow first.

Once the core logic is stable,
extend the same core through an MCP interface.
```
