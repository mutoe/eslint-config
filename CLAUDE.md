# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fork of `antfu/eslint-config` with Mutoe-specific opinionated enhancements. A single-package ESLint flat config aggregator that composes 30+ plugins into a type-safe, auto-detecting configuration system. Published as `@mutoe/eslint-config`.

### Git Structure

- `origin` = `mutoe/eslint-config`, `upstream` = `antfu/eslint-config`
- Custom commits (prefixed `feat(mutoe):`) are rebased on top of upstream main
- Use `/sync-upstream` command to sync with upstream

## Commands

- **Install:** `pnpm install`
- **Build:** `pnpm build` (runs type generation then tsdown bundler)
- **Test:** `pnpm test` (vitest, runs all tests)
- **Test single file:** `pnpm vitest run test/fixtures.test.ts`
- **Update snapshots:** `pnpm vitest run -u`
- **Lint:** `pnpm lint`
- **Type check:** `pnpm typecheck`
- **Generate types:** `pnpm gen` (regenerates `src/typegen.d.ts` and version constants)
- **Dev inspector:** `pnpm dev` (opens ESLint config inspector UI)

Note: `nr` is from `@antfu/ni` — equivalent to `pnpm run`.

## Architecture

### Core Pattern: Factory Composition

`src/factory.ts` — `defineConfig()` is the main entry point. It composes individual config modules from `src/configs/` into a `FlatConfigComposer` (from `eslint-flat-config-utils`). Configs are auto-detected based on installed packages (e.g., Vue enabled if `vue` is in dependencies).

### Config Modules (`src/configs/`)

Each file exports a function returning `TypedFlatConfigItem[]`. They follow a consistent pattern:
- Accept an options object for customization
- Return one or more named config items (e.g., `mutoe/typescript/rules`)
- Plugins are renamed for cleaner rule prefixes (`@typescript-eslint` → `ts`, `@stylistic` → `style`)

### Mutoe Custom Layer (`src/configs/mutoe.ts`)

The key differentiator from upstream antfu/eslint-config. Contains opinionated rule overrides, import sorting groups, Vue attribute ordering, TypeScript strictness additions, and package.json field ordering.

### Type Generation

`scripts/typegen.ts` generates `src/typegen.d.ts` with full rule type definitions. Run `pnpm gen` after adding/removing plugins to regenerate.

### Testing Strategy

- **Snapshot tests** (`test/factory-snap.test.ts`): Verify factory output for config presets (default, full-on, full-off, etc.)
- **Fixture tests** (`test/fixtures.test.ts`): Run ESLint on files in `fixtures/input/`, compare against expected output in `fixtures/output/{scenario}/`
- **60s timeout** configured in vitest.config.ts (fixture tests can be slow)

When modifying rules or configs, update snapshots with `pnpm vitest run -u` and verify the diffs are expected.

### Build

Uses `tsdown` to bundle `src/` into `dist/` as ESM (`.mjs`). Two entry points: `index.ts` (library) and `cli.ts` (CLI tool). Type definitions generated as `.d.mts`.
