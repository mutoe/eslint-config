Sync the local main branch with the upstream antfu/eslint-config repository by rebasing our custom commits on top of the latest upstream.

## Custom Commits Reference

We maintain exactly 2 custom commits on top of upstream (in order):

### 1. `feat(mutoe): update package info`

Changes package metadata only:

- Package name: `@antfu/eslint-config` → `@mutoe/eslint-config`
- Description, author, contributors, homepage → mutoe's info

**Conflict resolution strategy**: Always keep our metadata (name, description, author, contributors, homepage). Take upstream's `version` and `packageManager`.

### 2. `feat(mutoe): add mutoe preferred rules`

Core customization layer:

- `src/configs/mutoe.ts` — opinionated rule overrides (import sorting, Vue attribute ordering, TypeScript strictness, etc.)
- `defineConfig` rename (upstream uses `antfu`)
- `@mutoe/eslint-plugin-perfectionist-vue` dependency
- Patches in `patches/` (may become stale as upstream updates dependencies — check if still needed)
- Test fixtures and snapshots reflecting our rule changes

**Conflict resolution strategy**: Keep all rule customizations and the `defineConfig` rename. For generated/derived files (`src/cli/constants-generated.ts`, `pnpm-lock.yaml`, fixture outputs, snapshots), take upstream's version then regenerate with `pnpm gen`, `pnpm build`, and `pnpm vitest run -u`.

## Steps

1. **Pre-flight check**: Run `git status` to ensure the working tree is clean. If not, abort and ask the user to commit or stash changes first.

2. **Fetch upstream**: Run `git fetch upstream`.

3. **Show what's new**: Run `git log --oneline HEAD..upstream/main` to show the user what new commits are coming from upstream. If there are no new commits, inform the user and stop.

4. **Identify custom commits**: Run `git log --oneline upstream/main..HEAD` to list our commits on top of upstream. The meaningful custom commits are prefixed with `feat(mutoe):`. Any `chore: release vX.X.X` commits are old release tags that must be dropped before rebasing.

5. **Drop release commits**: If there are `chore: release` commits, use `git rebase --onto upstream/main` with the appropriate base to drop them. Specifically, reset to upstream/main and cherry-pick only the `feat(mutoe):` commits:

   ```
   git reset --hard upstream/main
   git cherry-pick <feat(mutoe) commit SHAs in order>
   ```

   This cleanly drops the release commits and replays only the custom ones.

6. **Handle conflicts**: If the rebase encounters conflicts:
   - Run `git diff` to show the conflicting files and conflict markers
   - Analyze each conflict using the conflict resolution strategies above
   - Apply the resolution autonomously for straightforward cases (metadata, generated files)
   - Ask the user only for ambiguous cases (e.g., upstream changed a rule that our mutoe config also overrides)
   - Run `git rebase --continue` and repeat until complete

7. **Post-rebase cleanup**:
   - Check `patchedDependencies` in `pnpm-workspace.yaml` — if a patch targets an older version than what's in the catalog, verify if the fix is upstream and remove the stale patch
   - Update catalog version for `@antfu/eslint-config` to match the latest upstream release version

8. **Verify**: After successful rebase:
   - Run `git log --oneline -5` to show the result
   - Run `pnpm install` to update dependencies
   - Run `pnpm gen` to regenerate types
   - Run `pnpm build` to verify the build succeeds
   - Run `pnpm test -- --run` to verify tests pass (update snapshots with `-u` if needed, but show the diff first and ask for confirmation)

9. **Summarize changes**: After all tests pass, provide a summary of what changed in this sync:
   - New upstream features and breaking changes
   - Rule changes: new rules added, rules removed, rules whose default severity changed
   - For each changed rule, explain what the rule does and why it was likely added/removed/changed (check the plugin changelog or rule docs if needed, e.g. via `node_modules/<plugin>/docs/rules/<rule>.md` or the plugin's CHANGELOG)
   - Dependency version bumps (major/minor only)
   - Any impact on our mutoe custom rules

10. **Publish preparation**: Ask the user if they want to:
    - Amend the `feat(mutoe): add mutoe preferred rules` commit with snapshot/lockfile updates
    - Force push to origin (`git push origin main --force-with-lease`)
    - Update version and publish to npm (`pnpm release`)

Important: At each major step, report progress. If anything fails unexpectedly, stop and ask the user before proceeding.
