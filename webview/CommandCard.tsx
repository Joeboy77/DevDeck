import { Fragment, type CSSProperties, type ReactElement, useMemo, useState } from "react";
import { DevDeckCommand } from "./types";

interface CommandCardProps {
  command: DevDeckCommand;
  favorite: boolean;
  query: string;
  active: boolean;
  compact: boolean;
  onRun: (commandId: string, values: Record<string, string>) => void;
  onCopy: (command: string) => void;
  onFavorite: (commandId: string) => void;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({
  text,
  query
}: {
  text: string;
  query: string;
}): ReactElement {
  const terms = query
    .trim()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 1);

  if (terms.length === 0) {
    return <>{text}</>;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const chunks = text.split(pattern);
  return (
    <>
      {chunks.map((chunk, index) => {
        const isMatch = terms.some(
          (term) => chunk.toLowerCase() === term.toLowerCase()
        );
        if (!isMatch) {
          return <Fragment key={`${chunk}-${index}`}>{chunk}</Fragment>;
        }

        return (
          <mark
            key={`${chunk}-${index}`}
            style={{
              background: "var(--vscode-editor-findMatchHighlightBackground)",
              color: "var(--vscode-editor-foreground)",
              padding: 0
            }}
          >
            {chunk}
          </mark>
        );
      })}
    </>
  );
}

export function CommandCard({
  command,
  favorite,
  query,
  active,
  compact,
  onRun,
  onCopy,
  onFavorite
}: CommandCardProps): ReactElement {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const resolved = useMemo(() => {
    let output = command.command;
    for (const param of command.params) {
      output = output.replaceAll(param.placeholder, values[param.placeholder] ?? "");
    }
    return output;
  }, [command.command, command.params, values]);

  const missingRequired = command.params.some(
    (param) => param.required && !(values[param.placeholder] ?? "").trim()
  );

  const secondaryButtonStyle: CSSProperties = {
    border: "1px solid var(--vscode-button-border)",
    borderRadius: 8,
    padding: "6px 10px",
    background: "var(--vscode-editor-background)",
    color: "var(--vscode-foreground)",
    cursor: "pointer",
    fontSize: 12
  };

  return (
    <div
      id={`command-card-${command.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${
          active
            ? "var(--vscode-focusBorder)"
            : "var(--vscode-panel-border)"
        }`,
        borderRadius: 12,
        padding: compact ? 9 : 11,
        marginBottom: compact ? 8 : 10,
        background: "var(--vscode-editor-background)",
        boxShadow: active ? "0 0 0 1px var(--vscode-focusBorder) inset" : "none",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "all 120ms ease"
      }}
    >
      <button
        id={`command-card-toggle-${command.id}`}
        onClick={() => setExpanded((prev) => !prev)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "none",
          background: "transparent",
          color: "var(--vscode-foreground)",
          cursor: "pointer",
          padding: 0,
          textAlign: "left"
        }}
      >
        <span style={{ fontWeight: 600, fontSize: compact ? 12 : 13, lineHeight: 1.3 }}>
          <Highlight text={command.title} query={query} />
        </span>
        <span style={{ opacity: 0.8, fontSize: 11 }}>
          {expanded ? "Collapse" : "Expand"}
        </span>
      </button>

      <div
        style={{
          marginTop: 7,
          fontSize: compact ? 10 : 11,
          opacity: 0.85,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap"
        }}
      >
        <span
          style={{
            border: "1px solid var(--vscode-panel-border)",
            borderRadius: 999,
            padding: "2px 8px"
          }}
        >
          {command.tool}
        </span>
        <span>{command.category}</span>
        <span>{command.difficulty}</span>
        <span>{command.params.length} params</span>
      </div>

      {expanded && (
        <div style={{ marginTop: compact ? 8 : 10, display: "grid", gap: compact ? 7 : 9 }}>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 12, lineHeight: 1.35 }}>
            {command.description}
          </p>
          <code
            style={{
              display: "block",
              background: "var(--vscode-textCodeBlock-background)",
              padding: compact ? 8 : 9,
              borderRadius: 8,
              border: "1px solid var(--vscode-panel-border)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: compact ? 11 : 12
            }}
          >
            <Highlight text={resolved} query={query} />
          </code>

          {command.params.map((param) => (
            <label key={param.placeholder} style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>
                {param.label} {param.required ? "*" : ""}
              </span>
              <input
                value={values[param.placeholder] ?? ""}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    [param.placeholder]: event.target.value
                  }))
                }
                placeholder={param.description}
                style={{
                  border: "1px solid var(--vscode-input-border)",
                  borderRadius: 8,
                  background: "var(--vscode-input-background)",
                  color: "var(--vscode-input-foreground)",
                  padding: "7px 9px"
                }}
              />
            </label>
          ))}

          {command.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {command.tags.slice(0, 6).map((tag) => (
                <span
                  key={`${command.id}-${tag}`}
                  style={{
                    border: "1px solid var(--vscode-panel-border)",
                    borderRadius: 999,
                    padding: "2px 7px",
                    fontSize: 10,
                    opacity: 0.85
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button
              disabled={missingRequired}
              onClick={() => onRun(command.id, values)}
              style={{
                border: "none",
                borderRadius: 8,
                padding: "7px 11px",
                background: "var(--vscode-button-background)",
                color: "var(--vscode-button-foreground)",
                opacity: missingRequired ? 0.65 : 1,
                cursor: missingRequired ? "not-allowed" : "pointer",
                fontSize: 12,
                fontWeight: 600
              }}
            >
              Run in Terminal
            </button>
            <button onClick={() => onCopy(resolved)} style={secondaryButtonStyle}>
              Copy
            </button>
            <button onClick={() => onFavorite(command.id)} style={secondaryButtonStyle}>
              {favorite ? "Unstar" : "Star"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
