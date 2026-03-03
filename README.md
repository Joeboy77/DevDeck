# DevDeck: Developer Command Hub.
# Developer: Joe

Universal command discovery and execution hub for VS Code.

DevDeck helps you search, understand, and run commands directly from the VS Code sidebar so you can stay in flow.

## Why DevDeck
- Find commands without leaving your editor.
- Run commands safely with required parameter checks.
- Get relevant suggestions based on your project stack.
- Keep your own project commands in one place.

## Key Features
- Fast command search and filtering by tool.
- Suggested, Favorites, and Recent command sections.
- Command cards with:
  - plain-English description
  - parameter inputs
  - one-click copy
  - one-click run in terminal
- Keyboard-friendly interactions:
  - `Ctrl/Cmd + K` focus search
  - `Arrow Up/Down` move result focus
  - `Enter` expand active command
  - `Esc` clear search

## How To Use
1. Install **DevDeck** from the VS Code Marketplace.
2. Open the panel:
   - Activity Bar → DevDeck icon, or
   - Command Palette → `DevDeck: Open Panel`
3. Type what you want in search:
   - `undo last commit`
   - `docker logs`
   - `expo start`
4. Expand a card and fill required params.
5. Click **Run in Terminal** or **Copy**.

## Project Commands (`.devdeck.json`)
Add a `.devdeck.json` file to your workspace root to define team/project commands.

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

DevDeck automatically reloads this file when it changes.

## Included Tool Ecosystems
`git`, `docker`, `kubernetes`, `aws`, `terraform`, `github`, `linux`, `npm`, `yarn`, `pnpm`, `python`, `pip`, `react`, `react-native`, `expo`, `flutter`, `firebase`, `vercel`, `postgresql`, `redis`, `springboot`

## Support
- Issues: https://github.com/Joeboy77/DevDeck/issues
- Repository: https://github.com/Joeboy77/DevDeck

## Contributing
Want to contribute? Read `CONTRIBUTING.md`.
