import { type ReactElement, useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { CategoryList } from "./CategoryList";
import { CommandCard } from "./CommandCard";
import { SearchBar } from "./SearchBar";
import { AppState, DevDeckCommand } from "./types";
import { vscode } from "./vscode";

const MAX_RESULTS = 120;
const SEARCH_INPUT_ID = "devdeck-search-input";
type ViewMode = "all" | "favorites" | "history";
type DensityMode = "comfortable" | "compact";
type ToastLevel = "success" | "info" | "warning" | "error";
interface ToastItem {
  id: string;
  level: ToastLevel;
  message: string;
}

function isTextInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName.toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    target.isContentEditable ||
    target.getAttribute("role") === "textbox"
  );
}

const EMPTY_STATE: AppState = {
  commands: [],
  categories: {},
  favorites: [],
  history: [],
  signals: {
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
  }
};

const SIGNAL_TOOLS: Record<keyof AppState["signals"], string[]> = {
  node: ["npm", "yarn", "pnpm"],
  docker: ["docker"],
  python: ["python", "pip"],
  java: ["springboot"],
  git: ["git", "github"],
  kubernetes: ["kubernetes", "terraform"],
  react: ["react", "npm", "yarn"],
  reactNative: ["react-native"],
  expo: ["expo"],
  flutter: ["flutter"],
  terraform: ["terraform", "aws"],
  firebase: ["firebase"],
  vercel: ["vercel"]
};

function scoreCommand(
  command: DevDeckCommand,
  query: string,
  fuseScore: number | undefined,
  favorites: Set<string>,
  history: Set<string>,
  suggestedTools: Set<string>
): number {
  const q = query.trim().toLowerCase();
  const title = command.title.toLowerCase();
  const description = command.description.toLowerCase();
  const cmd = command.command.toLowerCase();
  const tags = command.tags.map((tag) => tag.toLowerCase());

  let score = (1 - (fuseScore ?? 1)) * 100;
  if (!q) {
    score = 20;
  }

  if (q) {
    if (title === q) {
      score += 40;
    }
    if (title.includes(q)) {
      score += 20;
    }
    if (cmd.includes(q)) {
      score += 16;
    }
    if (description.includes(q)) {
      score += 8;
    }
    if (tags.some((tag) => tag.includes(q))) {
      score += 14;
    }
    if (command.tool.includes(q) || command.category.toLowerCase().includes(q)) {
      score += 10;
    }
  }

  if (favorites.has(command.id)) {
    score += 12;
  }
  if (history.has(command.id)) {
    score += 6;
  }
  if (suggestedTools.has(command.tool)) {
    score += 10;
  }

  return score;
}

export function App(): ReactElement {
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [initialized, setInitialized] = useState(false);
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [density, setDensity] = useState<DensityMode>("comfortable");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onMessage = (
      event: MessageEvent<{
        type: string;
        payload:
          | AppState
          | {
              level: ToastLevel;
              message: string;
            };
      }>
    ) => {
      if (event.data.type === "state") {
        setState(event.data.payload as AppState);
        setInitialized(true);
        return;
      }

      if (event.data.type === "toast") {
        const payload = event.data.payload as { level: ToastLevel; message: string };
        const item: ToastItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          level: payload.level,
          message: payload.message
        };
        setToasts((prev) => [...prev.slice(-2), item]);
      }
    };
    window.addEventListener("message", onMessage);
    vscode.postMessage({ type: "init" });
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [toasts]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setQuery(rawQuery), 150);
    return () => window.clearTimeout(timeout);
  }, [rawQuery]);

  const favorites = useMemo(() => new Set(state.favorites), [state.favorites]);
  const history = useMemo(() => new Set(state.history), [state.history]);

  const suggestedTools = useMemo(() => {
    const tools = new Set<string>();
    for (const [signal, enabled] of Object.entries(state.signals) as Array<
      [keyof AppState["signals"], boolean]
    >) {
      if (!enabled) {
        continue;
      }
      for (const tool of SIGNAL_TOOLS[signal]) {
        tools.add(tool);
      }
    }
    return tools;
  }, [state.signals]);

  const ranked = useMemo(() => {
    const categoryFiltered =
      category === "all"
        ? state.commands
        : state.commands.filter((item) => item.tool === category);
    const modeFiltered =
      viewMode === "favorites"
        ? categoryFiltered.filter((item) => favorites.has(item.id))
        : viewMode === "history"
          ? categoryFiltered.filter((item) => history.has(item.id))
          : categoryFiltered;

    if (!query.trim()) {
      return [...modeFiltered]
        .map((command) => ({
          command,
          rank: scoreCommand(
            command,
            "",
            undefined,
            favorites,
            history,
            suggestedTools
          )
        }))
        .sort((a, b) => b.rank - a.rank)
        .map((item) => item.command)
        .slice(0, MAX_RESULTS);
    }

    const fuse = new Fuse(categoryFiltered, {
      includeScore: true,
      threshold: 0.35,
      ignoreLocation: true,
      keys: ["title", "description", "tags", "tool", "category"]
    });
    return fuse
      .search(query)
      .map((entry) => ({
        command: entry.item,
        rank: scoreCommand(
          entry.item,
          query,
          entry.score,
          favorites,
          history,
          suggestedTools
        )
      }))
      .sort((a, b) => b.rank - a.rank)
      .map((item) => item.command)
      .filter((item) =>
        viewMode === "favorites"
          ? favorites.has(item.id)
          : viewMode === "history"
            ? history.has(item.id)
            : true
      )
      .slice(0, MAX_RESULTS);
  }, [category, favorites, history, query, state.commands, suggestedTools, viewMode]);

  const suggested = useMemo(() => {
    if (query.trim() || category !== "all") {
      return [];
    }

    return ranked
      .filter((command) => suggestedTools.has(command.tool))
      .slice(0, 8);
  }, [category, query, ranked, suggestedTools]);

  const commandById = useMemo(() => {
    const map = new Map<string, DevDeckCommand>();
    for (const item of state.commands) {
      map.set(item.id, item);
    }
    return map;
  }, [state.commands]);

  const quickFavorites = useMemo(() => {
    if (viewMode !== "all" || query.trim() || category !== "all") {
      return [];
    }
    const suggestedIds = new Set(suggested.map((item) => item.id));
    return ranked
      .filter((item) => favorites.has(item.id) && !suggestedIds.has(item.id))
      .slice(0, 6);
  }, [category, favorites, query, ranked, suggested, viewMode]);

  const quickHistory = useMemo(() => {
    if (viewMode !== "all" || query.trim() || category !== "all") {
      return [];
    }
    const excluded = new Set([
      ...suggested.map((item) => item.id),
      ...quickFavorites.map((item) => item.id)
    ]);
    const recent = state.history
      .map((id) => commandById.get(id))
      .filter((item): item is DevDeckCommand => Boolean(item));
    return recent.filter((item) => !excluded.has(item.id)).slice(0, 6);
  }, [
    category,
    commandById,
    query,
    quickFavorites,
    state.history,
    suggested,
    viewMode
  ]);

  const visibleRanked = useMemo(() => {
    if (suggested.length === 0) {
      const excluded = new Set([
        ...quickFavorites.map((item) => item.id),
        ...quickHistory.map((item) => item.id)
      ]);
      return ranked.filter((item) => !excluded.has(item.id));
    }
    const suggestedIds = new Set(suggested.map((item) => item.id));
    const excluded = new Set([
      ...suggestedIds,
      ...quickFavorites.map((item) => item.id),
      ...quickHistory.map((item) => item.id)
    ]);
    return ranked.filter((item) => !excluded.has(item.id));
  }, [quickFavorites, quickHistory, ranked, suggested]);

  const keyboardOrder = useMemo(
    () => [...suggested, ...quickFavorites, ...quickHistory, ...visibleRanked],
    [quickFavorites, quickHistory, suggested, visibleRanked]
  );

  useEffect(() => {
    if (keyboardOrder.length === 0) {
      setActiveIndex(-1);
      return;
    }
    if (activeIndex >= keyboardOrder.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, keyboardOrder]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const input = document.getElementById(SEARCH_INPUT_ID) as HTMLInputElement | null;
        input?.focus();
        input?.select();
        return;
      }

      if (event.key === "Escape") {
        setRawQuery("");
        setActiveIndex(-1);
        return;
      }

      if (isTextInputTarget(event.target)) {
        return;
      }

      if (keyboardOrder.length === 0) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1 + keyboardOrder.length) % keyboardOrder.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) =>
          prev <= 0 ? keyboardOrder.length - 1 : prev - 1
        );
        return;
      }

      if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        const activeCommand = keyboardOrder[activeIndex];
        const toggle = document.getElementById(
          `command-card-toggle-${activeCommand.id}`
        ) as HTMLButtonElement | null;
        toggle?.click();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, keyboardOrder]);

  useEffect(() => {
    if (activeIndex < 0 || activeIndex >= keyboardOrder.length) {
      return;
    }
    const activeCommand = keyboardOrder[activeIndex];
    const card = document.getElementById(`command-card-${activeCommand.id}`);
    card?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex, keyboardOrder]);

  const allCount = state.commands.length;
  const favoriteCount = state.favorites.length;
  const historyCount = state.history.length;

  const viewButton = (mode: ViewMode, label: string, count: number): ReactElement => (
    <button
      key={mode}
      onClick={() => setViewMode(mode)}
      style={{
        border: "1px solid var(--vscode-button-border)",
        borderRadius: 999,
        padding: "5px 10px",
        fontSize: 11,
        cursor: "pointer",
        background:
          viewMode === mode
            ? "var(--vscode-button-background)"
            : "var(--vscode-editor-background)",
        color:
          viewMode === mode
            ? "var(--vscode-button-foreground)"
            : "var(--vscode-foreground)"
      }}
    >
      {label} ({count})
    </button>
  );

  const renderSection = (
    title: string,
    commands: DevDeckCommand[],
    subtitle?: string
  ): ReactElement | null => {
    if (commands.length === 0) {
      return null;
    }

    return (
      <section style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 12, opacity: 0.92, marginBottom: 4 }}>
          {title}
        </div>
        {subtitle && <div style={{ fontSize: 11, opacity: 0.72, marginBottom: 8 }}>{subtitle}</div>}
        {commands.map((command) => (
          <CommandCard
            key={`${title}-${command.id}`}
            command={command}
            query={query}
            favorite={favorites.has(command.id)}
            active={activeIndex >= 0 && keyboardOrder[activeIndex]?.id === command.id}
            compact={density === "compact"}
            onRun={(commandId, values) =>
              vscode.postMessage({ type: "run", payload: { commandId, values } })
            }
            onCopy={(resolvedCommand) =>
              vscode.postMessage({ type: "copy", payload: { command: resolvedCommand } })
            }
            onFavorite={(commandId) =>
              vscode.postMessage({ type: "favorite", payload: { commandId } })
            }
          />
        ))}
      </section>
    );
  };

  return (
    <main style={{ padding: 12, color: "var(--vscode-foreground)", lineHeight: 1.35 }}>
      {toasts.length > 0 && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 4,
            display: "grid",
            gap: 6,
            marginBottom: 8
          }}
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              style={{
                borderRadius: 8,
                padding: "7px 9px",
                fontSize: 11,
                border: "1px solid var(--vscode-panel-border)",
                background:
                  toast.level === "error"
                    ? "var(--vscode-inputValidation-errorBackground)"
                    : toast.level === "warning"
                      ? "var(--vscode-inputValidation-warningBackground)"
                      : "var(--vscode-editorInfo-background)",
                color:
                  toast.level === "error"
                    ? "var(--vscode-inputValidation-errorForeground)"
                    : toast.level === "warning"
                      ? "var(--vscode-inputValidation-warningForeground)"
                      : "var(--vscode-foreground)"
              }}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}

      {!initialized && (
        <section
          style={{
            border: "1px solid var(--vscode-panel-border)",
            borderRadius: 10,
            padding: 12,
            marginBottom: 10
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.85 }}>Loading command index...</div>
          <div style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>
            Building searchable results for all tools.
          </div>
        </section>
      )}

      <SearchBar query={rawQuery} onChange={setRawQuery} resultCount={ranked.length} />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {viewButton("all", "All", allCount)}
        {viewButton("favorites", "Favorites", favoriteCount)}
        {viewButton("history", "History", historyCount)}
        <button
          onClick={() =>
            setDensity((prev) => (prev === "comfortable" ? "compact" : "comfortable"))
          }
          style={{
            border: "1px solid var(--vscode-button-border)",
            borderRadius: 999,
            padding: "5px 10px",
            fontSize: 11,
            cursor: "pointer",
            background: "var(--vscode-editor-background)",
            color: "var(--vscode-foreground)"
          }}
        >
          Density: {density === "comfortable" ? "Comfortable" : "Compact"}
        </button>
      </div>

      <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 10 }}>
        Arrow Up/Down navigates results. Enter expands active command.
      </div>

      <CategoryList
        categories={state.categories}
        selected={category}
        onSelect={setCategory}
      />

      {renderSection("Suggested for this project", suggested)}
      {renderSection(
        "Favorites",
        quickFavorites,
        "Pinned quick access based on your starred commands."
      )}
      {renderSection(
        "Recent commands",
        quickHistory,
        "Pinned from your latest executed command history."
      )}

      {visibleRanked.length === 0 ? (
        <div
          style={{
            opacity: 0.9,
            border: "1px dashed var(--vscode-panel-border)",
            borderRadius: 10,
            padding: 12
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 5 }}>No commands found</div>
          <div style={{ fontSize: 12 }}>
            Try: "undo last commit", "docker logs", "expo start", or clear filters.
          </div>
        </div>
      ) : (
        visibleRanked.map((command: DevDeckCommand) => (
          <CommandCard
            key={command.id}
            command={command}
            query={query}
            favorite={favorites.has(command.id)}
            active={activeIndex >= 0 && keyboardOrder[activeIndex]?.id === command.id}
            compact={density === "compact"}
            onRun={(commandId, values) =>
              vscode.postMessage({ type: "run", payload: { commandId, values } })
            }
            onCopy={(resolvedCommand) =>
              vscode.postMessage({ type: "copy", payload: { command: resolvedCommand } })
            }
            onFavorite={(commandId) =>
              vscode.postMessage({ type: "favorite", payload: { commandId } })
            }
          />
        ))
      )}
    </main>
  );
}
