import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import api from "../../api/axios";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const TYPE_TABS = [
  { key: "all", label: "All" },
  { key: "mcq", label: "MCQ" },
  { key: "cq", label: "Written (CQ)" },
];

const TYPE_BADGE = {
  mcq: {
    bg: "rgba(34,211,238,0.10)",
    border: "rgba(34,211,238,0.25)",
    text: "#22d3ee",
  },
  cq: {
    bg: "rgba(168,85,247,0.10)",
    border: "rgba(168,85,247,0.25)",
    text: "#a855f7",
  },
};

function typeBadge(type) {
  const t = type?.toLowerCase();
  const cfg = TYPE_BADGE[t] || {
    bg: "rgba(100,116,139,0.12)",
    border: "#334155",
    text: "#94a3b8",
  };

  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "1px 7px",
        borderRadius: 5,
        border: `1px solid ${cfg.border}`,
        background: cfg.bg,
        color: cfg.text,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {t === "cq" ? "CQ" : type || "?"}
    </span>
  );
}

export default function ArchiveQuestionPicker({
  open,
  onClose,
  selectedIds = [],
  onApply,
  topicName = "Default",
}) {
  const [archives, setArchives] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [localSelected, setLocalSelected] = useState(selectedIds);
  const [openArchives, setOpenArchives] = useState({});
  const [openChapters, setOpenChapters] = useState({});
  const [typeTab, setTypeTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLocalSelected(selectedIds);
  }, [selectedIds]);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        const [archivesRes, questionsRes] = await Promise.all([
          api.get("/archives"),
          api.get("/questions"),
        ]);

        setArchives(Array.isArray(archivesRes.data) ? archivesRes.data : []);
        setQuestions(Array.isArray(questionsRes.data) ? questionsRes.data : []);
      } catch (err) {
        console.error("Failed to load archive questions:", err);
      }
    };

    load();
  }, [open]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchType =
        typeTab === "all" ||
        (typeTab === "mcq" && q.type?.toLowerCase() === "mcq") ||
        (typeTab === "cq" && q.type?.toLowerCase() === "cq");

      const s = search.trim().toLowerCase();

      const matchSearch =
        !s ||
        q.title?.toLowerCase().includes(s) ||
        q.stem?.toLowerCase().includes(s) ||
        q.tags?.some((t) => t.toLowerCase().includes(s));

      return matchType && matchSearch;
    });
  }, [questions, typeTab, search]);

  const groupedArchives = useMemo(() => {
    return archives
      .map((archive) => {
        const archiveQuestions = filteredQuestions.filter(
          (q) => (q.archive?._id || q.archive) === archive._id
        );

        const chapterMap = new Map();

        archiveQuestions.forEach((q) => {
          const chapterId = q.chapter?._id || q.chapter || "unknown";
          const chapterName = q.chapter?.name || "No Chapter";

          if (!chapterMap.has(chapterId)) {
            chapterMap.set(chapterId, {
              chapterId,
              chapterName,
              questions: [],
            });
          }

          chapterMap.get(chapterId).questions.push(q);
        });

        const chapters = Array.from(chapterMap.values()).sort((a, b) =>
          a.chapterName.localeCompare(b.chapterName)
        );

        return { ...archive, chapters, total: archiveQuestions.length };
      })
      .filter((a) => a.total > 0);
  }, [archives, filteredQuestions]);

  const toggleArchive = (id) =>
    setOpenArchives((p) => ({ ...p, [id]: !p[id] }));

  const toggleChapter = (id) =>
    setOpenChapters((p) => ({ ...p, [id]: !p[id] }));

  const toggleQuestion = (id) =>
    setLocalSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );

  const toggleAllInChapter = (chapterQuestions) => {
    const ids = chapterQuestions.map((q) => q._id);
    const allSelected = ids.every((id) => localSelected.includes(id));

    if (allSelected) {
      setLocalSelected((p) => p.filter((id) => !ids.includes(id)));
    } else {
      setLocalSelected((p) => [...new Set([...p, ...ids])]);
    }
  };

  const selectedCount = localSelected.length;

  return (
    <Modal open={open} title="Select Questions" onClose={onClose}>
      <div className="stack">
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.22)",
            color: "#93c5fd",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Applying selection to topic: <strong>{topicName}</strong>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 8,
              padding: 3,
            }}
          >
            {TYPE_TABS.map((tab) => {
              const count =
                tab.key === "all"
                  ? questions.length
                  : questions.filter(
                      (q) => q.type?.toLowerCase() === tab.key
                    ).length;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTypeTab(tab.key)}
                  style={{
                    background: typeTab === tab.key ? "#1e3a5f" : "transparent",
                    border:
                      typeTab === tab.key
                        ? "1px solid #2563eb"
                        : "1px solid transparent",
                    borderRadius: 6,
                    color: typeTab === tab.key ? "#93c5fd" : "#64748b",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "5px 14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                  <span
                    style={{
                      background:
                        typeTab === tab.key
                          ? "rgba(147,197,253,0.15)"
                          : "rgba(255,255,255,0.04)",
                      borderRadius: 4,
                      padding: "0 5px",
                      fontSize: 10,
                      fontWeight: 700,
                      color:
                        typeTab === tab.key ? "#93c5fd" : "#475569",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, minWidth: 160, position: "relative" }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#475569",
                pointerEvents: "none",
              }}
            />
            <input
              placeholder="Search questions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 7,
                color: "#cbd5e1",
                fontSize: 12,
                padding: "7px 10px 7px 30px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            maxHeight: 440,
            overflowY: "auto",
            paddingRight: 2,
          }}
        >
          {groupedArchives.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "#475569",
              }}
            >
              <p style={{ margin: 0, fontSize: 13 }}>
                No questions match this filter.
              </p>
            </div>
          ) : (
            groupedArchives.map((archive) => {
              const isOpen = !!openArchives[archive._id];
              const selectedInArchive = archive.chapters
                .flatMap((c) => c.questions)
                .filter((q) => localSelected.includes(q._id)).length;

              return (
                <div
                  key={archive._id}
                  style={{
                    border: "1px solid #1e293b",
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "#0d1929",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleArchive(archive._id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ color: "#475569", lineHeight: 0 }}>
                      {isOpen ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </span>

                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#e2e8f0",
                        }}
                      >
                        {archive.name}
                      </span>
                      <span className="muted small" style={{ marginLeft: 8 }}>
                        Class {archive.className}
                      </span>
                    </div>

                    {selectedInArchive > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#4ade80",
                          background: "rgba(74,222,128,0.1)",
                          border: "1px solid rgba(74,222,128,0.25)",
                          borderRadius: 5,
                          padding: "1px 7px",
                        }}
                      >
                        {selectedInArchive} selected
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: 11,
                        color: "#475569",
                        background: "#0f172a",
                        border: "1px solid #1e293b",
                        borderRadius: 5,
                        padding: "2px 8px",
                      }}
                    >
                      {archive.total} Q
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        borderTop: "1px solid #1e293b",
                        padding: "10px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {archive.chapters.map((chapter) => {
                        const isChOpen = !!openChapters[chapter.chapterId];
                        const selectedInChapter = chapter.questions.filter((q) =>
                          localSelected.includes(q._id)
                        ).length;
                        const allChapterSelected =
                          chapter.questions.length > 0 &&
                          selectedInChapter === chapter.questions.length;

                        return (
                          <div
                            key={chapter.chapterId}
                            style={{
                              border: "1px solid #1e293b",
                              borderRadius: 8,
                              overflow: "hidden",
                              background: "#0f172a",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 12px",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => toggleChapter(chapter.chapterId)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  flex: 1,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  textAlign: "left",
                                  padding: 0,
                                }}
                              >
                                <span
                                  style={{ color: "#334155", lineHeight: 0 }}
                                >
                                  {isChOpen ? (
                                    <ChevronDown size={13} />
                                  ) : (
                                    <ChevronRight size={13} />
                                  )}
                                </span>
                                <span
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#cbd5e1",
                                  }}
                                >
                                  {chapter.chapterName}
                                </span>

                                {selectedInChapter > 0 && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      color: "#4ade80",
                                      background:
                                        "rgba(74,222,128,0.08)",
                                      border:
                                        "1px solid rgba(74,222,128,0.2)",
                                      borderRadius: 4,
                                      padding: "0 6px",
                                    }}
                                  >
                                    {selectedInChapter}/{chapter.questions.length}
                                  </span>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  toggleAllInChapter(chapter.questions)
                                }
                                style={{
                                  background: "none",
                                  border: "1px solid #1e293b",
                                  borderRadius: 5,
                                  color: allChapterSelected
                                    ? "#4ade80"
                                    : "#475569",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  cursor: "pointer",
                                  flexShrink: 0,
                                }}
                              >
                                {allChapterSelected
                                  ? "Deselect All"
                                  : "Select All"}
                              </button>
                            </div>

                            {isChOpen && (
                              <div
                                style={{
                                  borderTop: "1px solid #1e293b",
                                  padding: "8px 10px",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 4,
                                }}
                              >
                                {chapter.questions.map((q) => {
                                  const checked = localSelected.includes(q._id);

                                  return (
                                    <label
                                      key={q._id}
                                      style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 10,
                                        padding: "8px 10px",
                                        borderRadius: 7,
                                        cursor: "pointer",
                                        background: checked
                                          ? "rgba(37,99,235,0.07)"
                                          : "transparent",
                                        border: `1px solid ${
                                          checked
                                            ? "rgba(37,99,235,0.3)"
                                            : "transparent"
                                        }`,
                                        transition: "all 0.12s ease",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() =>
                                          toggleQuestion(q._id)
                                        }
                                        style={{
                                          marginTop: 2,
                                          accentColor: "#3b82f6",
                                          flexShrink: 0,
                                        }}
                                      />

                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                          style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: "#e2e8f0",
                                            marginBottom: 2,
                                          }}
                                        >
                                          {q.title || "Untitled Question"}
                                        </div>

                                        <div
                                          style={{
                                            display: "flex",
                                            gap: 6,
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                          }}
                                        >
                                          {typeBadge(q.type)}
                                          {q.tags?.length > 0 && (
                                            <span className="muted small">
                                              {q.tags
                                                .slice(0, 3)
                                                .join(", ")}
                                            </span>
                                          )}
                                        </div>

                                        {q.stem && (
                                          <div
                                            style={{
                                              fontSize: 11,
                                              color: "#64748b",
                                              marginTop: 4,
                                              lineHeight: 1.5,
                                              display: "-webkit-box",
                                              WebkitLineClamp: 2,
                                              WebkitBoxOrient: "vertical",
                                              overflow: "hidden",
                                            }}
                                          >
                                            {q.stem}
                                          </div>
                                        )}
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #1e293b",
            paddingTop: 14,
          }}
        >
          <span style={{ fontSize: 12, color: "#64748b" }}>
            {selectedCount > 0 ? (
              <span style={{ color: "#4ade80", fontWeight: 700 }}>
                {selectedCount} question{selectedCount !== 1 ? "s" : ""} selected
              </span>
            ) : (
              "No questions selected"
            )}
          </span>

          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onApply(localSelected);
                onClose();
              }}
            >
              Apply Selection
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}