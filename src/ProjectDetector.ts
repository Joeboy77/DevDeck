import * as vscode from "vscode";
import { ProjectSignals } from "./types";

const SIGNAL_FILES: Record<keyof ProjectSignals, string[]> = {
  node: ["package.json"],
  docker: ["Dockerfile", "docker-compose.yml", "docker-compose.yaml"],
  python: ["requirements.txt", "pyproject.toml"],
  java: ["pom.xml", "build.gradle", "build.gradle.kts"],
  git: [".git"],
  kubernetes: ["k8s.yml", "k8s.yaml", "deployment.yaml", "deployment.yml"],
  react: ["src/App.tsx", "src/App.jsx", "next.config.js", "next.config.mjs"],
  reactNative: ["android/build.gradle", "ios/Podfile", "metro.config.js"],
  expo: ["app.json", "app.config.js", "app.config.ts", "eas.json"],
  flutter: ["pubspec.yaml", "lib/main.dart"],
  terraform: ["main.tf", "terraform.tfvars", "providers.tf"],
  firebase: ["firebase.json", ".firebaserc"],
  vercel: ["vercel.json"]
};

export async function detectProjectSignals(): Promise<ProjectSignals> {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  if (!workspace) {
    return {
      node: false,
      docker: false,
      python: false,
      java: false,
      git: false,
      kubernetes: false,
      react: false,
      reactNative: false,
      expo: false,
      flutter: false,
      terraform: false,
      firebase: false,
      vercel: false
    };
  }

  const hasAny = async (patterns: string[]): Promise<boolean> => {
    for (const pattern of patterns) {
      const found = await vscode.workspace.findFiles(
        new vscode.RelativePattern(workspace, pattern),
        undefined,
        1
      );
      if (found.length > 0) {
        return true;
      }
    }
    return false;
  };

  return {
    node: await hasAny(SIGNAL_FILES.node),
    docker: await hasAny(SIGNAL_FILES.docker),
    python: await hasAny(SIGNAL_FILES.python),
    java: await hasAny(SIGNAL_FILES.java),
    git: await hasAny(SIGNAL_FILES.git),
    kubernetes: await hasAny(SIGNAL_FILES.kubernetes),
    react: await hasAny(SIGNAL_FILES.react),
    reactNative: await hasAny(SIGNAL_FILES.reactNative),
    expo: await hasAny(SIGNAL_FILES.expo),
    flutter: await hasAny(SIGNAL_FILES.flutter),
    terraform: await hasAny(SIGNAL_FILES.terraform),
    firebase: await hasAny(SIGNAL_FILES.firebase),
    vercel: await hasAny(SIGNAL_FILES.vercel)
  };
}
