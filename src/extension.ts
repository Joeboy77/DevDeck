import * as vscode from "vscode";
import { CommandProvider } from "./CommandProvider";
import { DevDeckPanel } from "./DevDeckPanel";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const commandProvider = new CommandProvider(context.extensionUri);
  await commandProvider.initialize();

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
