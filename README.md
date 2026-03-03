# DevDeck (GitHub)

<p align="center">
  <img src="./assets/devdeck-hero.png" alt="DevDeck Hero Banner" />
</p>

<p align="center">
  <a href="https://github.com/Joeboy77/DevDeck/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Joeboy77/DevDeck/ci.yml?style=for-the-badge&label=CI" alt="CI Status" /></a>
  <a href="https://github.com/Joeboy77/DevDeck/graphs/contributors"><img src="https://img.shields.io/github/contributors/Joeboy77/DevDeck?style=for-the-badge" alt="Contributors" /></a>
  <a href="https://img.shields.io/visual-studio-marketplace/v/DevDeck.devdeck?style=for-the-badge"><img src="https://img.shields.io/visual-studio-marketplace/v/DevDeck.devdeck?style=for-the-badge" alt="Marketplace Version" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=DevDeck.devdeck"><img src="https://img.shields.io/badge/Install-Marketplace-blue?style=for-the-badge" alt="Install from Marketplace" /></a>
</p>

DevDeck is an open-source VS Code extension for fast command discovery and execution.

This GitHub README is focused on contributors and maintainers.  
For end-user usage docs (the Marketplace page content), see `README.marketplace.md`.

## Repository Guide
- `src/`: extension-host logic (provider, panel bridge, terminal runner, project detection)
- `webview/`: React UI for sidebar panel
- `data/`: generated command catalogs
- `scripts/`: dataset generation utilities
- `.github/workflows/`: CI, publish, contributor badge automation

## Local Development
1. Install dependencies:
   - `yarn`
2. Generate command data:
   - `yarn generate:data`
3. Validate:
   - `yarn check`
   - `yarn lint`
4. Build:
   - `yarn build`
5. Run in Extension Development Host from VS Code.

## Publishing Notes
- User-facing Marketplace docs are sourced from:
  - `README.marketplace.md`
- Publish commands already target that file via:
  - `yarn publish:patch`
  - `yarn publish:minor`
  - `yarn publish:major`

## Contributor Recognition
- Merged PRs receive automated contributor badge comments.
- Tiering:
  - First Contribution
  - Bronze (3+)
  - Silver (7+)
  - Gold (15+)

## Contributing
Read `CONTRIBUTING.md` before opening a PR.
