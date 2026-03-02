import * as vscode from "vscode";
import { CommandProvider } from "./CommandProvider";
import { DevDeckPanel } from "./DevDeckPanel";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const commandProvider = new CommandProvider(context.extensionUri);
  try {
    await commandProvider.initialize();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown initialization error";
    vscode.window.showErrorMessage(
      `DevDeck loaded with limited data: ${message}`
    );
  }

  const panel = new DevDeckPanel(context.extensionUri, commandProvider, context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(DevDeckPanel.viewId, panel)
  );
  context.subscriptions.push(panel.watchProjectCommands());

  context.subscriptions.push(
    vscode.commands.registerCommand("devdeck.openPanel", async () => panel.reveal())
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("devdeck.refresh", async () => panel.refresh())
  );
}

export function deactivate(): void {}
