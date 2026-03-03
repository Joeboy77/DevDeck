# DevDeck - Developer Command Hub

Universal command discovery and execution hub for VS Code.  
Search commands in plain English, understand flags, fill parameters safely, and run directly in terminal without leaving your editor.

**Developed by Joe.**

## Why DevDeck
- No context switching between browser docs and terminal.
- 2100+ ready commands across major developer ecosystems.
- Fast fuzzy search with intent-friendly ranking.
- Project-aware suggestions for the tools you use.

## What You Can Do
- Search commands like `undo last commit`, `docker logs`, `expo start`.
- Filter by tool category.
- Expand command cards to see description, params, and tags.
- Fill placeholders and run directly in terminal.
- Copy resolved commands.
- Star favorites and revisit recent commands.

## Keyboard Shortcuts
- `Ctrl/Cmd + K`: focus search
- `Arrow Up/Down`: move active result
- `Enter`: expand active command card
- `Esc`: clear search

## Team Workflow Support
DevDeck auto-loads project commands from a `.devdeck.json` file at workspace root and refreshes when it changes.

## Example `.devdeck.json`
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

## Included Tool Ecosystems
`git`, `docker`, `kubernetes`, `aws`, `terraform`, `github`, `linux`, `npm`, `yarn`, `pnpm`, `python`, `pip`, `react`, `react-native`, `expo`, `flutter`, `firebase`, `vercel`, `postgresql`, `redis`, `springboot`

## Feedback & Support
- Issues: https://github.com/Joeboy77/DevDeck/issues
- Source: https://github.com/Joeboy77/DevDeck
