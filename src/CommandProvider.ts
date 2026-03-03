import * as path from "path";
import * as vscode from "vscode";
import Fuse from "fuse.js";
import {
  CommandLoadDiagnostics,
  CommandProviderStats,
  DevDeckCommand,
  Difficulty,
  SearchOptions
} from "./types";

function createEmptyDiagnostics(): CommandLoadDiagnostics {
  return {
    builtinFilesLoaded: 0,
    builtinFilesFailed: 0,
    invalidEntries: 0,
    duplicatesSkipped: 0,
    projectFileFound: false,
    projectEntriesLoaded: 0,
    projectEntriesInvalid: 0,
    warnings: []
  };
}

export class CommandProvider {
  private commands: DevDeckCommand[] = [];
  private fuse: Fuse<DevDeckCommand> = new Fuse([]);
  private diagnosticsState: CommandLoadDiagnostics = createEmptyDiagnostics();

  constructor(private readonly extensionUri: vscode.Uri) {}

  public async initialize(): Promise<void> {
    this.diagnosticsState = createEmptyDiagnostics();
    const seenIds = new Set<string>();
    const seenFingerprints = new Set<string>();

    const builtin = await this.loadBuiltInCommands(seenIds, seenFingerprints);
    const project = await this.loadProjectCommands(seenIds, seenFingerprints);
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

  public diagnostics(): CommandLoadDiagnostics {
    return {
      ...this.diagnosticsState,
      warnings: [...this.diagnosticsState.warnings]
    };
  }

  public stats(): CommandProviderStats {
    const builtin = this.commands.filter((item) => item.source === "builtin").length;
    const project = this.commands.filter((item) => item.source === "project").length;
    return {
      total: this.commands.length,
      builtin,
      project,
      categories: Object.keys(this.categories()).length
    };
  }

  public async reloadProjectCommands(): Promise<void> {
    const builtin = this.commands.filter((item) => item.source === "builtin");
    this.resetProjectDiagnostics();
    const seenIds = new Set(builtin.map((item) => item.id));
    const seenFingerprints = new Set(
      builtin.map((item) => this.commandFingerprint(item.tool, item.command))
    );
    const project = await this.loadProjectCommands(seenIds, seenFingerprints);
    this.commands = [...builtin, ...project];
    this.buildIndex();
  }

  private resetProjectDiagnostics(): void {
    this.diagnosticsState.projectFileFound = false;
    this.diagnosticsState.projectEntriesLoaded = 0;
    this.diagnosticsState.projectEntriesInvalid = 0;
    this.diagnosticsState.warnings = this.diagnosticsState.warnings.filter(
      (warning) => !warning.includes(".devdeck.json")
    );
  }

  private buildIndex(): void {
    this.fuse = new Fuse(this.commands, {
      includeScore: true,
      threshold: 0.35,
      ignoreLocation: true,
      keys: ["title", "description", "tags", "tool", "category"]
    });
  }

  private async loadBuiltInCommands(
    seenIds: Set<string>,
    seenFingerprints: Set<string>
  ): Promise<DevDeckCommand[]> {
    const commands: DevDeckCommand[] = [];
    const dataDir = vscode.Uri.joinPath(this.extensionUri, "data");
    let entries: [string, vscode.FileType][] = [];
    try {
      entries = await vscode.workspace.fs.readDirectory(dataDir);
    } catch {
      this.diagnosticsState.builtinFilesFailed += 1;
      this.diagnosticsState.warnings.push("Unable to read built-in data directory.");
      return commands;
    }

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
          this.diagnosticsState.builtinFilesFailed += 1;
          this.diagnosticsState.warnings.push(
            `Skipped ${file}: expected a JSON array of commands.`
          );
          continue;
        }
        this.diagnosticsState.builtinFilesLoaded += 1;

        for (const item of parsed) {
          const candidate = this.normalizeCommand(item);
          if (!candidate) {
            this.diagnosticsState.invalidEntries += 1;
            continue;
          }
          if (
            this.isDuplicate(candidate.id, candidate.tool, candidate.command, seenIds, seenFingerprints)
          ) {
            this.diagnosticsState.duplicatesSkipped += 1;
            continue;
          }
          commands.push({ ...candidate, source: "builtin" });
        }
      } catch {
        this.diagnosticsState.builtinFilesFailed += 1;
        this.diagnosticsState.warnings.push(`Failed to parse built-in data file: ${file}`);
      }
    }
    return commands;
  }

  private async loadProjectCommands(
    seenIds: Set<string>,
    seenFingerprints: Set<string>
  ): Promise<DevDeckCommand[]> {
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace) {
      this.diagnosticsState.projectFileFound = false;
      return [];
    }

    const projectFile = path.join(workspace.uri.fsPath, ".devdeck.json");
    try {
      const raw = await vscode.workspace.fs.readFile(vscode.Uri.file(projectFile));
      this.diagnosticsState.projectFileFound = true;
      const parsed = JSON.parse(Buffer.from(raw).toString("utf8")) as unknown;
      if (!Array.isArray(parsed)) {
        this.diagnosticsState.projectEntriesInvalid += 1;
        this.diagnosticsState.warnings.push("Skipped .devdeck.json: expected a JSON array.");
        return [];
      }

      const projectCommands: DevDeckCommand[] = [];
      for (const item of parsed) {
        const candidate = this.normalizeCommand(item);
        if (!candidate) {
          this.diagnosticsState.projectEntriesInvalid += 1;
          continue;
        }

        const tool = "project-commands";
        if (this.isDuplicate(candidate.id, tool, candidate.command, seenIds, seenFingerprints)) {
          this.diagnosticsState.duplicatesSkipped += 1;
          continue;
        }

        projectCommands.push({
          ...candidate,
          tool,
          source: "project"
        });
        this.diagnosticsState.projectEntriesLoaded += 1;
      }

      return projectCommands;
    } catch {
      this.diagnosticsState.projectFileFound = false;
      return [];
    }
  }

  private normalizeCommand(value: unknown): Omit<DevDeckCommand, "source"> | null {
    if (!value || typeof value !== "object") {
      return null;
    }
    const candidate = value as Record<string, unknown>;
    const difficulty = this.normalizeDifficulty(candidate.difficulty);
    const id = this.requiredString(candidate.id);
    const tool = this.requiredString(candidate.tool);
    const category = this.requiredString(candidate.category);
    const title = this.requiredString(candidate.title);
    const description = this.requiredString(candidate.description);
    const command = this.requiredString(candidate.command);
    const params = this.normalizeParams(candidate.params);
    const flags = this.normalizeFlags(candidate.flags);
    const tags = this.normalizeTags(candidate.tags);

    if (
      !id ||
      !tool ||
      !category ||
      !title ||
      !description ||
      !command ||
      !difficulty ||
      !params ||
      !flags ||
      !tags
    ) {
      return null;
    }

    return {
      id,
      tool,
      category,
      title,
      description,
      command,
      params,
      flags,
      tags,
      difficulty
    };
  }

  private requiredString(value: unknown): string | null {
    if (typeof value !== "string") {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private normalizeDifficulty(value: unknown): Difficulty | null {
    if (value === "beginner" || value === "intermediate" || value === "advanced") {
      return value;
    }
    return null;
  }

  private normalizeParams(value: unknown): DevDeckCommand["params"] | null {
    if (!Array.isArray(value)) {
      return null;
    }
    const params: DevDeckCommand["params"] = [];
    for (const item of value) {
      if (!item || typeof item !== "object") {
        return null;
      }
      const candidate = item as Record<string, unknown>;
      const placeholder = this.requiredString(candidate.placeholder);
      const label = this.requiredString(candidate.label);
      const description = this.requiredString(candidate.description);
      const required = candidate.required;

      if (!placeholder || !label || !description || typeof required !== "boolean") {
        return null;
      }
      params.push({ placeholder, label, description, required });
    }
    return params;
  }

  private normalizeFlags(value: unknown): DevDeckCommand["flags"] | null {
    if (!Array.isArray(value)) {
      return null;
    }
    const flags: DevDeckCommand["flags"] = [];
    for (const item of value) {
      if (!item || typeof item !== "object") {
        return null;
      }
      const candidate = item as Record<string, unknown>;
      const flag = this.requiredString(candidate.flag);
      const description = this.requiredString(candidate.description);
      if (!flag || !description) {
        return null;
      }
      flags.push({ flag, description });
    }
    return flags;
  }

  private normalizeTags(value: unknown): string[] | null {
    if (!Array.isArray(value)) {
      return null;
    }
    const normalized = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
    const unique = [...new Set(normalized)];
    return unique.length > 0 ? unique : null;
  }

  private commandFingerprint(tool: string, command: string): string {
    return `${tool.toLowerCase()}|${command.toLowerCase()}`;
  }

  private isDuplicate(
    id: string,
    tool: string,
    command: string,
    seenIds: Set<string>,
    seenFingerprints: Set<string>
  ): boolean {
    if (seenIds.has(id)) {
      return true;
    }
    const fingerprint = this.commandFingerprint(tool, command);
    if (seenFingerprints.has(fingerprint)) {
      return true;
    }
    seenIds.add(id);
    seenFingerprints.add(fingerprint);
    return false;
  }
}
