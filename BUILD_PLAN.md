# DevDeck MVP Build Plan

## Product Goal
Ship a high-quality VS Code extension MVP that helps developers discover, understand, and run CLI commands without leaving the editor.

## Principles
- Speed first: responsive startup and search.
- Clarity first: clean UI hierarchy and readable command details.
- Safety first: parameter validation and predictable command execution.
- Extensibility: data-driven architecture for future tool packs.

## MVP Scope
- Sidebar panel with React webview.
- Fuzzy search across command data.
- Category filtering and command counts.
- Command cards with parameter input, copy, and run actions.
- Project-aware suggestions.
- `.devdeck.json` project commands with file watching.
- Favorites and history persistence.

## Architecture
- `src/extension.ts`: activation, registration, wiring.
- `src/DevDeckPanel.ts`: webview provider and message bridge.
- `src/CommandProvider.ts`: command loading, indexing, search.
- `src/TerminalRunner.ts`: command interpolation and execution.
- `src/ProjectDetector.ts`: workspace signal detection.
- `src/types.ts`: shared extension models.
- `webview/*`: UI and interaction logic.
- `data/*.json`: built-in command data by tool.

## Milestones
1. Foundation scaffold + tooling.
2. Data layer + validation + search scoring.
3. Core UI and interaction model.
4. Project signals, favorites, history, and team commands.
5. Performance and quality hardening.
6. Docs, CI, packaging, and release candidate.

## Quality Gates
- Type check clean.
- Lint clean.
- Build artifacts generated for extension and webview.
- Manual QA on macOS, Windows, and Linux shell behavior.
- MVP acceptance checklist complete.

## Immediate Next Steps
1. Finalize extension manifest and build scripts.
2. Scaffold TypeScript extension modules and webview app shell.
3. Add starter command datasets and schema-safe loader.
4. Build message protocol between webview and extension host.
