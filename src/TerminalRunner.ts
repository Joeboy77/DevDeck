import * as vscode from "vscode";
import { DevDeckCommand } from "./types";

export class TerminalRunner {
  private terminal?: vscode.Terminal;

  private getTerminal(): vscode.Terminal {
    if (!this.terminal || this.terminal.exitStatus) {
      this.terminal = vscode.window.createTerminal("DevDeck");
    }
    this.terminal.show(true);
    return this.terminal;
  }

  public resolveCommand(
    command: DevDeckCommand,
    values: Record<string, string>
  ): string {
    let resolved = command.command;
    for (const param of command.params) {
      const value = (values[param.placeholder] ?? "").trim();
      resolved = resolved.replaceAll(param.placeholder, value);
    }
    return resolved;
  }

  public hasUnresolvedPlaceholders(command: string): boolean {
    return /\[[A-Z0-9_]+\]/.test(command);
  }

  public run(command: string): void {
    this.getTerminal().sendText(command, true);
  }
}
