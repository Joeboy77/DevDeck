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

export interface AppState {
  commands: DevDeckCommand[];
  categories: Record<string, number>;
  favorites: string[];
  history: string[];
  signals: {
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
  };
}
