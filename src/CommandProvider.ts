import * as path from "path";
import * as vscode from "vscode";
import Fuse from "fuse.js";
import { DevDeckCommand, SearchOptions } from "./types";

export class CommandProvider {
  private commands: DevDeckCommand[] = [];
  private fuse: Fuse<DevDeckCommand> = new Fuse([]);

  constructor(private readonly extensionUri: vscode.Uri) {}

  public async initialize(): Promise<void> {
    const builtin = await this.loadBuiltInCommands();
    const project = await this.loadProjectCommands();
    this.commands = [...builtin, ...project];
    this.buildIndex();
  }

  public all(): DevDeckCommand[] {
    return [...this.commands];
  }

  public search(options: SearchOptions): DevDeckCommand[] {
    const limit = options.limit ?? 100;
    const base = options.category
      ? this.commands.filter((item) => item.tool === options.category)
      : this.commands;

    if (!options.query.trim()) {
      return base.slice(0, limit);
    }

    const ids = new Set(base.map((item) => item.id));
    return this.fuse
      .search(options.query)
      .map((entry) => entry.item)
      .filter((item) => ids.has(item.id))
      .slice(0, limit);
  }

  public categories(): Record<string, number> {
    return this.commands.reduce<Record<string, number>>((acc, command) => {
      acc[command.tool] = (acc[command.tool] ?? 0) + 1;
      return acc;
    }, {});
  }

  public async reloadProjectCommands(): Promise<void> {
    const builtin = this.commands.filter((item) => item.source === "builtin");
    const project = await this.loadProjectCommands();
    this.commands = [...builtin, ...project];
    this.buildIndex();
  }

  private buildIndex(): void {
    this.fuse = new Fuse(this.commands, {
      includeScore: true,
      threshold: 0.35,
      ignoreLocation: true,
      keys: ["title", "description", "tags", "tool", "category"]
    });
  }

  private async loadBuiltInCommands(): Promise<DevDeckCommand[]> {
    const commands: DevDeckCommand[] = [];
    const dataDir = vscode.Uri.joinPath(this.extensionUri, "data");
    const entries = await vscode.workspace.fs.readDirectory(dataDir);
    const files = entries
      .filter(
        ([name, type]) =>
          type === vscode.FileType.File && name.toLowerCase().endsWith(".json")
      )
      .map(([name]) => name)
      .sort((a, b) => a.localeCompare(b));

    for (const file of files) {
      const uri = vscode.Uri.joinPath(this.extensionUri, "data", file);
      try {
        const raw = await vscode.workspace.fs.readFile(uri);
        const parsed = JSON.parse(Buffer.from(raw).toString("utf8")) as unknown;
        if (!Array.isArray(parsed)) {
          continue;
        }
        for (const item of parsed) {
          if (!this.isCommandShape(item)) {
            continue;
          }
          commands.push({
            ...item,
            source: "builtin"
          });
        }
      } catch {
        // Ignore malformed data files and continue loading the rest.
      }
    }
    return commands;
  }

  private async loadProjectCommands(): Promise<DevDeckCommand[]> {
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace) {
      return [];
    }

    const projectFile = path.join(workspace.uri.fsPath, ".devdeck.json");
    try {
      const raw = await vscode.workspace.fs.readFile(vscode.Uri.file(projectFile));
      const parsed = JSON.parse(Buffer.from(raw).toString("utf8")) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((item): item is Omit<DevDeckCommand, "source"> =>
          this.isCommandShape(item)
        )
        .map((item) => ({
          ...item,
          tool: "project-commands",
          source: "project"
        }));
    } catch {
      return [];
    }
  }

  private isCommandShape(value: unknown): value is Omit<DevDeckCommand, "source"> {
    if (!value || typeof value !== "object") {
      return false;
    }
    const candidate = value as Record<string, unknown>;
    if (
      typeof candidate.id !== "string" ||
      typeof candidate.tool !== "string" ||
      typeof candidate.category !== "string" ||
      typeof candidate.title !== "string" ||
      typeof candidate.description !== "string" ||
      typeof candidate.command !== "string" ||
      !Array.isArray(candidate.params) ||
      !Array.isArray(candidate.flags) ||
      !Array.isArray(candidate.tags) ||
      !["beginner", "intermediate", "advanced"].includes(
        String(candidate.difficulty)
      )
    ) {
      return false;
    }

    return true;
  }
}
