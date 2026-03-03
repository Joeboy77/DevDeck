# Contributing to DevDeck

Thanks for helping improve DevDeck.

This guide is for code, data, UX, and docs contributors.

## Project Structure
- `src/` - extension host logic (activation, provider bridge, terminal run flow)
- `webview/` - React UI for DevDeck sidebar experience
- `data/` - generated command datasets by tool ecosystem
- `scripts/` - generation and tooling scripts
- `resources/` - extension icons/assets
- `.github/workflows/` - CI, publish, contributor automation

## Local Setup
1. Install dependencies:
   - `yarn`
2. Generate command data (if needed):
   - `yarn generate:data`
3. Validate:
   - `yarn check`
   - `yarn lint`
4. Build:
   - `yarn build`
5. Run using VS Code Extension Development Host.

## Branch and PR Workflow
- Create a feature branch from `main`.
- Keep PRs focused (single concern when possible).
- Include:
  - what changed
  - why it changed
  - how you tested
- Reference issues when applicable.

## Code Standards
- Keep logic readable and maintainable.
- Add comments only where they add real clarity.
- Preserve VS Code theme compatibility (`var(--vscode-...)` tokens).
- Ensure keyboard accessibility is not degraded.

## UI/UX Contribution Principles
- Prioritize scanability and low cognitive load.
- Preserve quick command execution flow.
- Keep interactions responsive and predictable.
- Test in dark and light themes.

## Command Data Standards
Each command must follow the schema:
- `id`, `tool`, `category`, `title`, `description`, `command`
- `params`, `flags`, `tags`, `difficulty`

### Data quality checklist
- Titles should be concise and action-oriented.
- Descriptions should explain practical use.
- Placeholders must be consistent and meaningful.
- Required params should be correctly marked.
- Tags should improve findability.

## Testing Checklist Before PR
- `yarn check` passes
- `yarn lint` passes
- `yarn build` passes
- Manual smoke test:
  - panel opens
  - search works
  - run/copy work
  - favorites/history update

## Documentation
- `README.md` is user-facing and marketplace-facing.
- Keep usage instructions accurate after feature changes.
- Update examples when command behavior changes.

## Contributor Recognition
Merged PRs are recognized automatically with DevDeck contributor badges.

Badge tiers:
- First Contribution
- Bronze Contributor (3+ merged PRs)
- Silver Contributor (7+ merged PRs)
- Gold Contributor (15+ merged PRs)
