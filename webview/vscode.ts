declare function acquireVsCodeApi(): {
  postMessage: (message: unknown) => void;
};

export const vscode = acquireVsCodeApi();
