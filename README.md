# DevDeck - Developer Command Hub

<p align="center">
  <img src="./assets/devdeck-hero.png" alt="DevDeck Hero Banner" />
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=DevDeck.devdeck"><img src="https://img.shields.io/visual-studio-marketplace/v/DevDeck.devdeck?style=for-the-badge" alt="Marketplace Version" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=DevDeck.devdeck"><img src="https://img.shields.io/visual-studio-marketplace/i/DevDeck.devdeck?style=for-the-badge" alt="Installs" /></a>
  <a href="https://github.com/Joeboy77/DevDeck/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Joeboy77/DevDeck/ci.yml?style=for-the-badge&label=CI" alt="CI Status" /></a>
  <a href="https://github.com/Joeboy77/DevDeck/graphs/contributors"><img src="https://img.shields.io/github/contributors/Joeboy77/DevDeck?style=for-the-badge" alt="Contributors" /></a>
</p>

Universal command discovery and execution hub for VS Code.  
Search commands in natural language, understand flags instantly, fill parameters safely, and run directly in terminal without leaving your editor.

**Developed by Joe.**

## Why DevDeck
- **No context switching:** find and run commands inside VS Code.
- **Cross-stack coverage:** built-in command packs for major ecosystems.
- **Fast retrieval:** fuzzy search and intent-friendly ranking.
- **Safe execution:** required parameter checks before run.
- **Team-friendly:** supports workspace commands via `.devdeck.json`.

## UI Preview

<p align="center">
  <img src="./assets/devdeck-ui-preview.png" alt="DevDeck UI Preview" />
</p>

## Core Features
- Sticky search with debounced updates and highlighted matches.
- Suggested commands based on detected project signals.
- Favorites and recent command history.
- Category filtering by tool ecosystem.
- Command cards with:
  - description
  - placeholders/params
  - resolved preview
  - copy/run actions
- Keyboard support:
  - `Ctrl/Cmd + K` focus search
  - `Arrow Up/Down` navigate
  - `Enter` expand active card
  - `Esc` clear search

## How to Use
1. Install **DevDeck** from VS Code Marketplace.
2. Open panel:
   - Activity Bar → DevDeck icon
   - or Command Palette → `DevDeck: Open Panel`
3. Search command intent (examples):
   - `undo last commit`
   - `docker logs`
   - `expo start`
4. Expand a command card.
5. Fill required placeholders (if any).
6. Click **Run in Terminal** or **Copy**.

## Team Commands (`.devdeck.json`)
Create a `.devdeck.json` in your workspace root to add project-specific commands.

Example:
```json
[
  {
    "id": "project-quick-1",
    "tool": "project-commands",
    "category": "Project",
    "title": "Start dev server",
    "description": "Runs local development server.",
    "command": "yarn dev",
    "params": [],
    "flags": [],
    "tags": ["project", "dev"],
    "difficulty": "beginner"
  }
]
```

DevDeck watches this file and reloads automatically when it changes.

## Supported Tool Packs
`git`, `docker`, `kubernetes`, `aws`, `terraform`, `github`, `linux`, `npm`, `yarn`, `pnpm`, `python`, `pip`, `react`, `react-native`, `expo`, `flutter`, `firebase`, `vercel`, `postgresql`, `redis`, `springboot`

## Feedback and Support
- Issues: https://github.com/Joeboy77/DevDeck/issues
- Source: https://github.com/Joeboy77/DevDeck

## Contributing
If you want to contribute, read `CONTRIBUTING.md` for coding standards, structure, and workflow.
