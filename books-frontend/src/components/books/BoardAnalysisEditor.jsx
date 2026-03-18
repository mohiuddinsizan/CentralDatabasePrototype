import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card from "../ui/Card";

export default function BoardAnalysisEditor({ value = [], onChange }) {
  const [openYears, setOpenYears] = useState({});

  const toggleYear = (i) =>
    setOpenYears((prev) => ({ ...prev, [i]: !prev[i] }));

  const addYear = () => {
    const next = [...value, { year: new Date().getFullYear(), boards: [] }];
    onChange(next);
    setOpenYears((prev) => ({ ...prev, [next.length - 1]: true }));
  };

  const removeYear = (i) => {
    const next = value.filter((_, idx) => idx !== i);
    onChange(next);
  };

  const updateYear = (i, field, v) => {
    const next = [...value];
    next[i] = { ...next[i], [field]: v };
    onChange(next);
  };

  const addBoard = (yi) => {
    const next = [...value];
    next[yi] = {
      ...next[yi],
      boards: [...next[yi].boards, { boardName: "", questionCount: 0 }],
    };
    onChange(next);
  };

  const updateBoard = (yi, bi, field, v) => {
    const next = [...value];
    const boards = [...next[yi].boards];
    boards[bi] = { ...boards[bi], [field]: v };
    next[yi] = { ...next[yi], boards };
    onChange(next);
  };

  const removeBoard = (yi, bi) => {
    const next = [...value];
    next[yi] = {
      ...next[yi],
      boards: next[yi].boards.filter((_, idx) => idx !== bi),
    };
    onChange(next);
  };

  const totalQuestions = (entry) =>
    entry.boards.reduce((s, b) => s + (Number(b.questionCount) || 0), 0);

  return (
    <Card>
      {/* Header */}
      <div className="row-between" style={{ marginBottom: value.length ? 16 : 0 }}>
        <div>
          <h3 style={{ margin: 0 }}>Board Analysis</h3>
          <p className="muted small" style={{ marginTop: 2 }}>
            {value.length} year{value.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Button onClick={addYear}>
          <Plus size={14} style={{ marginRight: 4 }} />
          Add Year
        </Button>
      </div>

      {/* Year entries */}
      {value.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "28px 0",
            color: "#475569",
            border: "1px dashed #1e293b",
            borderRadius: 8,
            marginTop: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: 13 }}>No years added yet.</p>
          <p className="muted small" style={{ marginTop: 4 }}>
            Click "Add Year" to start tracking board questions.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {value.map((entry, i) => {
            const isOpen = !!openYears[i];
            const total = totalQuestions(entry);

            return (
              <div
                key={i}
                style={{
                  border: "1px solid #1e293b",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#0d1929",
                }}
              >
                {/* Year row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={() => toggleYear(i)}
                >
                  <span style={{ color: "#475569", lineHeight: 0 }}>
                    {isOpen ? (
                      <ChevronDown size={15} />
                    ) : (
                      <ChevronRight size={15} />
                    )}
                  </span>

                  {/* Inline year input — stop propagation so clicking it doesn't toggle */}
                  <div onClick={(e) => e.stopPropagation()} style={{ width: 90 }}>
                    <input
                      type="number"
                      value={entry.year}
                      onChange={(e) => updateYear(i, "year", e.target.value)}
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px solid #334155",
                        color: "#e2e8f0",
                        fontSize: 14,
                        fontWeight: 700,
                        padding: "2px 0",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ flex: 1 }} />

                  {/* Stats */}
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      background: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: 6,
                      padding: "2px 8px",
                    }}
                  >
                    {entry.boards.length} board{entry.boards.length !== 1 ? "s" : ""}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#22d3ee",
                      background: "rgba(34,211,238,0.08)",
                      border: "1px solid rgba(34,211,238,0.2)",
                      borderRadius: 6,
                      padding: "2px 8px",
                    }}
                  >
                    {total} Q
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeYear(i);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: 4,
                      lineHeight: 0,
                      borderRadius: 4,
                      opacity: 0.7,
                    }}
                    title="Remove year"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Boards section */}
                {isOpen && (
                  <div
                    style={{
                      borderTop: "1px solid #1e293b",
                      padding: "12px 14px 14px",
                    }}
                  >
                    {/* Board grid */}
                    {entry.boards.length > 0 && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(260px, 1fr))",
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        {entry.boards.map((board, j) => (
                          <div
                            key={j}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              background: "#0f172a",
                              border: "1px solid #1e293b",
                              borderRadius: 8,
                              padding: "8px 10px",
                            }}
                          >
                            <input
                              placeholder="Board name"
                              value={board.boardName}
                              onChange={(e) =>
                                updateBoard(i, j, "boardName", e.target.value)
                              }
                              style={{
                                flex: 1,
                                background: "transparent",
                                border: "none",
                                borderBottom: "1px solid #1e293b",
                                color: "#cbd5e1",
                                fontSize: 13,
                                padding: "2px 0",
                                outline: "none",
                                minWidth: 0,
                              }}
                            />
                            <input
                              type="number"
                              placeholder="0"
                              value={board.questionCount}
                              onChange={(e) =>
                                updateBoard(
                                  i,
                                  j,
                                  "questionCount",
                                  e.target.value
                                )
                              }
                              style={{
                                width: 52,
                                background: "rgba(34,211,238,0.06)",
                                border: "1px solid rgba(34,211,238,0.15)",
                                borderRadius: 5,
                                color: "#22d3ee",
                                fontSize: 13,
                                fontWeight: 700,
                                padding: "3px 6px",
                                outline: "none",
                                textAlign: "center",
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeBoard(i, j)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                                padding: 2,
                                lineHeight: 0,
                                borderRadius: 4,
                                opacity: 0.6,
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {entry.boards.length === 0 && (
                      <p
                        className="muted small"
                        style={{ margin: "0 0 10px", textAlign: "center" }}
                      >
                        No boards yet — click below to add one.
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => addBoard(i)}
                      style={{
                        background: "none",
                        border: "1px dashed #334155",
                        borderRadius: 6,
                        color: "#64748b",
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "5px 12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Plus size={12} />
                      Add Board
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}