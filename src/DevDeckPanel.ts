import * as vscode from "vscode";
import { CommandProvider } from "./CommandProvider";
import { detectProjectSignals } from "./ProjectDetector";
import { TerminalRunner } from "./TerminalRunner";

interface RunPayload {
  commandId: string;
  values: Record<string, string>;
}

interface FavoritePayload {
  commandId: string;
}

type WebviewMessage =
  | { type: "init" }
  | { type: "run"; payload: RunPayload }
  | { type: "copy"; payload: { command: string } }
  | { type: "favorite"; payload: FavoritePayload };

type HostToastType = "success" | "info" | "warning" | "error";

const VIEW_ID = "devdeck.sidebar";

export class DevDeckPanel implements vscode.WebviewViewProvider {
  public static readonly viewId = VIEW_ID;

  private view?: vscode.WebviewView;
  private readonly terminalRunner = new TerminalRunner();

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly commandProvider: CommandProvider,
    private readonly context: vscode.ExtensionContext
  ) {}

  public resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, "dist")]
    };
    view.webview.html = this.getHtml(view.webview);

    view.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      if (message.type === "init") {
        await this.postState();
      }

      if (message.type === "run") {
        await this.handleRun(message.payload);
      }

      if (message.type === "copy") {
        await vscode.env.clipboard.writeText(message.payload.command);
        this.postToast("success", "Command copied to clipboard.");
      }

      if (message.type === "favorite") {
        await this.toggleFavorite(message.payload);
        await this.postState();
        this.postToast("info", "Favorite updated.");
      }
    });
  }

  public async reveal(): Promise<void> {
    await vscode.commands.executeCommand("devdeck.sidebar.focus");
    await vscode.commands.executeCommand("workbench.view.extension.devdeck");
  }

  public async refresh(): Promise<void> {
    await this.commandProvider.reloadProjectCommands();
    await this.postState();
  }

  public watchProjectCommands(): vscode.Disposable {
    const watcher = vscode.workspace.createFileSystemWatcher("**/.devdeck.json");
    const refresh = async () => this.refresh();
    watcher.onDidChange(refresh);
    watcher.onDidCreate(refresh);
    watcher.onDidDelete(refresh);
    return watcher;
  }

  private get favorites(): string[] {
    return this.context.globalState.get<string[]>("devdeck.favorites", []);
  }

  private async toggleFavorite(payload: FavoritePayload): Promise<void> {
    const current = new Set(this.favorites);
    if (current.has(payload.commandId)) {
      current.delete(payload.commandId);
    } else {
      current.add(payload.commandId);
    }
    await this.context.globalState.update("devdeck.favorites", [...current]);
  }

  private async handleRun(payload: RunPayload): Promise<void> {
    const command = this.commandProvider
      .all()
      .find((item) => item.id === payload.commandId);
    if (!command) {
      this.postToast("error", "Command not found.");
      return;
    }

    const missingRequired = command.params.some((param) => {
      if (!param.required) {
        return false;
      }
      const value = (payload.values[param.placeholder] ?? "").trim();
      return value.length === 0;
    });
    if (missingRequired) {
      this.postToast("warning", "Fill all required parameters before running.");
      return;
    }

    const resolved = this.terminalRunner.resolveCommand(command, payload.values);
    if (this.terminalRunner.hasUnresolvedPlaceholders(resolved)) {
      this.postToast("warning", "Some placeholders are unresolved.");
      return;
    }
    this.terminalRunner.run(resolved);
    await this.pushHistory(payload.commandId);
    await this.postState();
    this.postToast("success", "Command sent to terminal.");
  }

  private async pushHistory(commandId: string): Promise<void> {
    const current = this.context.globalState.get<string[]>("devdeck.history", []);
    const deduped = [commandId, ...current.filter((item) => item !== commandId)];
    await this.context.globalState.update("devdeck.history", deduped.slice(0, 20));
  }

  private async postState(): Promise<void> {
    if (!this.view) {
      return;
    }

    const commands = this.commandProvider.all();
    const favorites = this.favorites;
    const history = this.context.globalState.get<string[]>("devdeck.history", []);
    const signals = await detectProjectSignals();
    this.view.webview.postMessage({
      type: "state",
      payload: {
        commands,
        categories: this.commandProvider.categories(),
        favorites,
        history,
        providerStats: this.commandProvider.stats(),
        providerDiagnostics: this.commandProvider.diagnostics(),
        signals
      }
    });
  }

  private getHtml(webview: vscode.Webview): string {
    const scriptUri = webview
      .asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "dist", "webview.js")
      )
      .toString();
    const nonce = String(Date.now());
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src ${
        webview.cspSource
      } 'unsafe-inline'; script-src 'nonce-${nonce}';"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DevDeck</title>
  </head>
  <body>
    <div id="root"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
  }

  private postToast(level: HostToastType, message: string): void {
    this.view?.webview.postMessage({
      type: "toast",
      payload: { level, message }
    });
  }
}
