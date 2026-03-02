# Contributing to DevDeck

## Development Workflow
- Use `yarn` for dependency management.
- Run `yarn check`, `yarn lint`, and `yarn build` before opening a pull request.
- Keep comments minimal and only where logic is non-obvious.

## Command Data Contributions
- Add commands to the relevant file in `data/`.
- Every command must follow the shared schema:
  - `id`, `tool`, `category`, `title`, `description`, `command`
  - `params`, `flags`, `tags`, `difficulty`
- Prefer concise titles and practical descriptions.
- Validate parameter placeholders and required fields.

## UX Standards
- Maintain strong visual hierarchy.
- Keep interactions keyboard-friendly.
- Respect VS Code theme tokens for foreground/background and buttons.

## Pull Request Expectations
- Include a short summary and test notes.
- Mention any schema or architecture changes explicitly.

## Contributor Recognition
- Merged PRs are recognized with an automated DevDeck contributor badge comment.
- Badge tiers are based on total merged PRs:
  - First Contribution
  - Bronze Contributor (3+)
  - Silver Contributor (7+)
  - Gold Contributor (15+)
