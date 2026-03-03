import type { ReactElement } from "react";

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
  onClear: () => void;
  resultCount: number;
  placeholder?: string;
}

export function SearchBar({
  query,
  onChange,
  onClear,
  resultCount,
  placeholder = "Search commands (e.g. undo last commit)"
}: SearchBarProps): ReactElement {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        background: "var(--vscode-sideBar-background)",
        paddingBottom: 12,
        paddingTop: 6,
        zIndex: 2
      }}
    >
      <div
        style={{
          border: "1px solid var(--vscode-panel-border)",
          borderRadius: 12,
          background: "var(--vscode-editorWidget-background)",
          padding: "8px 10px"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "18px 1fr auto",
            gap: 8,
            alignItems: "center"
          }}
        >
          <span style={{ opacity: 0.75, fontSize: 12 }}>⌕</span>
          <input
            id="devdeck-search-input"
            autoFocus
            value={query}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              color: "var(--vscode-input-foreground)",
              padding: "3px 0",
              fontSize: 13,
              outline: "none"
            }}
          />
          <button
            onClick={onClear}
            disabled={!query}
            style={{
              border: "1px solid var(--vscode-button-border)",
              borderRadius: 8,
              background: "var(--vscode-editor-background)",
              color: "var(--vscode-foreground)",
              fontSize: 11,
              padding: "2px 7px",
              cursor: query ? "pointer" : "not-allowed",
              opacity: query ? 0.95 : 0.45
            }}
          >
            Clear
          </button>
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          opacity: 0.75,
          marginTop: 5,
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <span>{resultCount.toLocaleString()} results</span>
        <span>Ctrl/Cmd+K to focus</span>
      </div>
    </div>
  );
}
