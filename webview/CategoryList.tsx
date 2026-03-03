import type { CSSProperties, ReactElement } from "react";

interface CategoryListProps {
  categories: Record<string, number>;
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryList({
  categories,
  selected,
  onSelect
}: CategoryListProps): ReactElement {
  const ordered = Object.entries(categories).sort((a, b) => a[0].localeCompare(b[0]));

  const chipStyle = (active: boolean): CSSProperties => ({
    border: "1px solid var(--vscode-button-border)",
    background: active
      ? "var(--vscode-button-background)"
      : "var(--vscode-editor-background)",
    color: active
      ? "var(--vscode-button-foreground)"
      : "var(--vscode-foreground)",
    borderRadius: 9999,
    padding: "6px 11px",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: active ? 600 : 500
  });

  return (
    <div
      style={{
        marginBottom: 14,
        borderBottom: "1px solid var(--vscode-panel-border)",
        paddingBottom: 12
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.72, marginBottom: 7 }}>Tool Categories</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <button onClick={() => onSelect("all")} style={chipStyle(selected === "all")}>
        All
      </button>
      {ordered.map(([name, count]) => (
        <button key={name} onClick={() => onSelect(name)} style={chipStyle(selected === name)}>
          {name} ({count})
        </button>
      ))}
      </div>
    </div>
  );
}
