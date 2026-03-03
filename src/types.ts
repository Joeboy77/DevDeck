export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface CommandParam {
  placeholder: string;
  label: string;
  description: string;
  required: boolean;
}

export interface CommandFlag {
  flag: string;
  description: string;
}

export interface DevDeckCommand {
  id: string;
  tool: string;
  category: string;
  title: string;
  description: string;
  command: string;
  params: CommandParam[];
  flags: CommandFlag[];
  tags: string[];
  difficulty: Difficulty;
  source: "builtin" | "project";
}

export interface SearchOptions {
  query: string;
  category?: string;
  limit?: number;
}

export interface CommandLoadDiagnostics {
  builtinFilesLoaded: number;
  builtinFilesFailed: number;
  invalidEntries: number;
  duplicatesSkipped: number;
  projectFileFound: boolean;
  projectEntriesLoaded: number;
  projectEntriesInvalid: number;
  warnings: string[];
}

export interface CommandProviderStats {
  total: number;
  builtin: number;
  project: number;
  categories: number;
}

export interface ProjectSignals {
  node: boolean;
  docker: boolean;
  python: boolean;
  java: boolean;
  git: boolean;
  kubernetes: boolean;
  react: boolean;
  reactNative: boolean;
  expo: boolean;
  flutter: boolean;
  terraform: boolean;
  firebase: boolean;
  vercel: boolean;
}
