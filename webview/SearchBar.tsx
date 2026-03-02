import type { ReactElement } from "react";

interface SearchBarProps {
  query: string;
  onChange: (value: string) => void;
  resultCount: number;
  placeholder?: string;
}

export function SearchBar({
  query,
  onChange,
  resultCount,
  placeholder = "Search commands (e.g. undo last commit)"
}: SearchBarProps): ReactElement {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        background: "var(--vscode-sideBar-background)",
        paddingBottom: 10,
        paddingTop: 4,
        zIndex: 2
      }}
    >
      <input
        id="devdeck-search-input"
        autoFocus
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          border: "1px solid var(--vscode-input-border)",
          borderRadius: 8,
          background: "var(--vscode-input-background)",
          color: "var(--vscode-input-foreground)",
          padding: "9px 11px",
          outline: "none"
        }}
      />
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
