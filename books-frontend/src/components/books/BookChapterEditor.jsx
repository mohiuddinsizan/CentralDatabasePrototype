import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Eye,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import api from "../../api/axios";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import BoardAnalysisEditor from "./BoardAnalysisEditor";
import TableEditor from "./TableEditor";
import FormulaEditor from "./FormulaEditor";
import MediaEditor from "./MediaEditor";
import ArchiveQuestionPicker from "./ArchiveQuestionPicker";

const TAB_LABELS = {
  boardAnalysis: "Board Analysis",
  tables: "Tables",
  formulas: "Formulas",
  videos: "Videos",
  figures: "Figures",
  selectedQuestions: "Questions",
};

function TypeBadge({ type }) {
  const t = type?.toUpperCase();
  const cfg =
    t === "MCQ"
      ? {
          bg: "rgba(34,211,238,0.10)",
          border: "rgba(34,211,238,0.28)",
          text: "#22d3ee",
        }
      : t === "CQ"
      ? {
          bg: "rgba(168,85,247,0.10)",
          border: "rgba(168,85,247,0.28)",
          text: "#c084fc",
        }
      : {
          bg: "rgba(100,116,139,0.10)",
          border: "#334155",
          text: "#94a3b8",
        };

  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 800,
        padding: "3px 9px",
        borderRadius: 5,
        border: `1px solid ${cfg.border}`,
        background: cfg.bg,
        color: cfg.text,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        flexShrink: 0,
      }}
    >
      {t}
    </span>
  );
}

function Tag({ label }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 4,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid #1e293b",
        color: "#64748b",
      }}
    >
      {label}
    </span>
  );
}

function MCQOptions({ options }) {
  if (!options?.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {options.map((opt) => {
        const isCorrect = opt.isCorrect || opt.correct;

        return (
          <div
            key={opt.key || opt._id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "7px 11px",
              borderRadius: 8,
              background: isCorrect ? "rgba(34,197,94,0.07)" : "#0f172a",
              border: `1px solid ${
                isCorrect ? "rgba(34,197,94,0.28)" : "#1e293b"
              }`,
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 800,
                background: isCorrect
                  ? "rgba(34,197,94,0.18)"
                  : "#1a2744",
                color: isCorrect ? "#4ade80" : "#475569",
                border: `1px solid ${
                  isCorrect ? "rgba(34,197,94,0.35)" : "#1e293b"
                }`,
              }}
            >
              {opt.key}
            </span>
            <span
              style={{
                flex: 1,
                fontSize: 12,
                color: isCorrect ? "#86efac" : "#94a3b8",
                lineHeight: 1.5,
              }}
            >
              {opt.text}
            </span>
            {isCorrect && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#4ade80",
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: 4,
                  padding: "1px 7px",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                ✓ Correct
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CQParts({ parts }) {
  if (!parts?.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {parts.map((part, i) => (
        <div
          key={i}
          style={{
            borderRadius: 9,
            background: "#0f172a",
            border: "1px solid #1e293b",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "8px 12px",
              borderBottom: part.answer ? "1px solid #1e293b" : "none",
              background: "rgba(168,85,247,0.04)",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#c084fc",
                background: "rgba(168,85,247,0.12)",
                border: "1px solid rgba(168,85,247,0.25)",
                borderRadius: 5,
                padding: "2px 8px",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              Part {part.label}
            </span>
            <span
              style={{
                fontSize: 12,
                color: "#e2e8f0",
                flex: 1,
                lineHeight: 1.55,
              }}
            >
              {part.question}
            </span>
          </div>

          {part.answer && (
            <div style={{ padding: "8px 12px" }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#4ade80",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 4,
                }}
              >
                Answer
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                }}
              >
                {part.answer}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function QuestionDetailModal({ question: q, onClose }) {
  if (!q) return null;

  return (
    <Modal open={!!q} title="Question Details" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            alignItems: "center",
          }}
        >
          <TypeBadge type={q.type} />
          {q.tags?.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>

        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 800,
              color: "#f1f5f9",
              lineHeight: 1.4,
            }}
          >
            {q.title}
          </h3>

          <div
            style={{
              marginTop: 6,
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            {q.archive?.name && (
              <span style={{ fontSize: 12, color: "#475569" }}>
                <span style={{ color: "#334155" }}>Archive </span>
                {q.archive.name}
              </span>
            )}
            {q.chapter?.name && (
              <span style={{ fontSize: 12, color: "#475569" }}>
                <span style={{ color: "#334155" }}>Chapter </span>
                {q.chapter.name}
              </span>
            )}
          </div>
        </div>

        {q.stem && (
          <div
            style={{
              padding: "12px 14px",
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 9,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#475569",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Stem
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#cbd5e1",
                lineHeight: 1.75,
                whiteSpace: "pre-wrap",
              }}
            >
              {q.stem}
            </div>
          </div>
        )}

        {q.type?.toUpperCase() === "MCQ" && q.mcqOptions?.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#475569",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Options
            </div>
            <MCQOptions options={q.mcqOptions} />
          </div>
        )}

        {q.type?.toUpperCase() === "CQ" && q.cqParts?.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#475569",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Parts &amp; Answers
            </div>
            <CQParts parts={q.cqParts} />
          </div>
        )}

        {q.explanation && (
          <div
            style={{
              padding: "12px 14px",
              background: "rgba(245,158,11,0.05)",
              border: "1px solid rgba(245,158,11,0.18)",
              borderRadius: 9,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#fbbf24",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Explanation
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#94a3b8",
                lineHeight: 1.75,
                whiteSpace: "pre-wrap",
              }}
            >
              {q.explanation}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function QuestionCard({ item, onRemove }) {
  const q = item?.sourceQuestion;
  const topic = item?.topic;
  const [expanded, setExpanded] = useState(false);
  const [viewQ, setViewQ] = useState(null);

  if (!q) return null;

  const hasMCQ = q.type?.toUpperCase() === "MCQ" && q.mcqOptions?.length > 0;
  const hasCQ = q.type?.toUpperCase() === "CQ" && q.cqParts?.length > 0;
  const hasContent = hasMCQ || hasCQ || q.explanation;

  return (
    <>
      <div
        style={{
          background: "#0d1929",
          border: "1px solid #1e293b",
          borderRadius: 11,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <TypeBadge type={q.type} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  lineHeight: 1.45,
                  marginBottom: 4,
                }}
              >
                {q.title || "Untitled Question"}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: q.tags?.length ? 5 : 0,
                }}
              >
                {q.archive?.name && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "#475569",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <BookOpen size={10} /> {q.archive.name}
                  </span>
                )}

                {q.chapter?.name && (
                  <span style={{ fontSize: 11, color: "#334155" }}>·</span>
                )}

                {q.chapter?.name && (
                  <span style={{ fontSize: 11, color: "#475569" }}>
                    {q.chapter.name}
                  </span>
                )}

                {topic?.name && (
                  <>
                    <span style={{ fontSize: 11, color: "#334155" }}>·</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: topic.isDefault ? "#60a5fa" : "#f59e0b",
                      }}
                    >
                      {topic.name}
                    </span>
                  </>
                )}
              </div>

              {q.tags?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {q.tags.map((t) => (
                    <Tag key={t} label={t} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                title="View details"
                onClick={() => setViewQ(q)}
                style={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "1px solid #1e293b",
                  borderRadius: 6,
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                <Eye size={13} />
              </button>

              <button
                type="button"
                title="Remove from topic"
                onClick={() => onRemove?.(item)}
                style={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 6,
                  color: "#f87171",
                  cursor: "pointer",
                }}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {q.stem && (
            <div
              style={{
                marginTop: 9,
                padding: "8px 11px",
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 7,
                fontSize: 12,
                color: "#64748b",
                lineHeight: 1.65,
              }}
            >
              {q.stem}
            </div>
          )}
        </div>

        {hasContent && (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "6px 0",
              background: "transparent",
              border: "none",
              borderTop: "1px solid #1e293b",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: 800,
              color: "#334155",
              letterSpacing: "0.06em",
            }}
          >
            {expanded ? (
              <>
                <ChevronUp size={11} /> HIDE ANSWER
              </>
            ) : (
              <>
                <ChevronDown size={11} /> SHOW ANSWER
              </>
            )}
          </button>
        )}

        {expanded && hasContent && (
          <div
            style={{
              padding: "12px 14px 14px",
              borderTop: "1px solid #1e293b",
              background: "#0a1220",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {hasMCQ && <MCQOptions options={q.mcqOptions} />}
            {hasCQ && <CQParts parts={q.cqParts} />}
            {q.explanation && (
              <div
                style={{
                  padding: "9px 12px",
                  borderRadius: 8,
                  background: "rgba(245,158,11,0.05)",
                  border: "1px solid rgba(245,158,11,0.15)",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#fbbf24",
                    letterSpacing: "0.08em",
                    marginBottom: 4,
                  }}
                >
                  EXPLANATION
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {q.explanation}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <QuestionDetailModal question={viewQ} onClose={() => setViewQ(null)} />
    </>
  );
}

function TopicManager({
  topics,
  activeTopicId,
  onSelectTopic,
  onCreateTopic,
  onRenameTopic,
  onDeleteTopic,
}) {
  const [newTopicName, setNewTopicName] = useState("");
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editingName, setEditingName] = useState("");

  return (
    <Card>
      <div
        className="row-between"
        style={{ marginBottom: 14, alignItems: "flex-start" }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Topics</h3>
          <p className="muted small" style={{ marginTop: 2 }}>
            Topics are optional. Questions without a custom topic stay in the
            default topic.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {topics.map((topic) => {
          const active = activeTopicId === topic._id;
          const isEditing = editingTopicId === topic._id;

          return (
            <div
              key={topic._id}
              style={{
                minWidth: 180,
                maxWidth: 260,
                background: active
                  ? "rgba(37,99,235,0.10)"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${
                  active ? "rgba(37,99,235,0.30)" : "#1e293b"
                }`,
                borderRadius: 10,
                padding: 10,
              }}
            >
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: 7,
                      color: "#e2e8f0",
                      fontSize: 12,
                      padding: "7px 10px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button
                      onClick={() => {
                        onRenameTopic(topic, editingName);
                        setEditingTopicId(null);
                        setEditingName("");
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingTopicId(null);
                        setEditingName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onSelectTopic(topic._id)}
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: active ? "#93c5fd" : "#e2e8f0",
                          lineHeight: 1.4,
                        }}
                      >
                        {topic.name}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: topic.isDefault ? "#60a5fa" : "#f59e0b",
                          background: topic.isDefault
                            ? "rgba(59,130,246,0.10)"
                            : "rgba(245,158,11,0.10)",
                          border: `1px solid ${
                            topic.isDefault
                              ? "rgba(59,130,246,0.25)"
                              : "rgba(245,158,11,0.25)"
                          }`,
                          borderRadius: 999,
                          padding: "2px 7px",
                          flexShrink: 0,
                        }}
                      >
                        {topic.isDefault ? "Default" : "Custom"}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 11,
                        color: "#64748b",
                      }}
                    >
                      {topic.questionCount || 0} question
                      {topic.questionCount !== 1 ? "s" : ""}
                    </div>
                  </button>

                  {!topic.isDefault && (
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        marginTop: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTopicId(topic._id);
                          setEditingName(topic.name);
                        }}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          background: "transparent",
                          border: "1px solid #1e293b",
                          borderRadius: 7,
                          color: "#cbd5e1",
                          padding: "6px 8px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <Pencil size={12} />
                        Rename
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteTopic(topic)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          background: "transparent",
                          border: "1px solid rgba(239,68,68,0.25)",
                          borderRadius: 7,
                          color: "#f87171",
                          padding: "6px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          borderTop: "1px solid #1e293b",
          paddingTop: 14,
        }}
      >
        <input
          placeholder="New topic name…"
          value={newTopicName}
          onChange={(e) => setNewTopicName(e.target.value)}
          style={{
            flex: 1,
            minWidth: 180,
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: 7,
            color: "#e2e8f0",
            fontSize: 12,
            padding: "8px 10px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <Button
          onClick={() => {
            onCreateTopic(newTopicName);
            setNewTopicName("");
          }}
        >
          <Plus size={14} style={{ marginRight: 6 }} />
          Add Topic
        </Button>
      </div>
    </Card>
  );
}

function QuestionsSection({
  activeTopic,
  chapterQuestions,
  onOpenPicker,
  onRemoveQuestion,
}) {
  const [openModal, setOpenModal] = useState(null);

  const allQ = chapterQuestions.filter((i) => i?.sourceQuestion);
  const mcqQ = allQ.filter(
    (i) => i.sourceQuestion?.type?.toUpperCase() === "MCQ"
  );
  const cqQ = allQ.filter(
    (i) => i.sourceQuestion?.type?.toUpperCase() === "CQ"
  );

  const TYPE_BTNS = [
    {
      key: "all",
      label: "All Questions",
      count: allQ.length,
      color: "#94a3b8",
      borderColor: "#334155",
      bg: "rgba(100,116,139,0.08)",
      hoverBorder: "#475569",
      description: "View all question types together",
    },
    {
      key: "mcq",
      label: "MCQ",
      count: mcqQ.length,
      color: "#22d3ee",
      borderColor: "rgba(34,211,238,0.25)",
      bg: "rgba(34,211,238,0.07)",
      hoverBorder: "rgba(34,211,238,0.5)",
      description: "Multiple choice questions",
    },
    {
      key: "cq",
      label: "Written (CQ)",
      count: cqQ.length,
      color: "#c084fc",
      borderColor: "rgba(168,85,247,0.25)",
      bg: "rgba(168,85,247,0.07)",
      hoverBorder: "rgba(168,85,247,0.5)",
      description: "Creative / written questions",
    },
  ];

  const activeCfg = TYPE_BTNS.find((b) => b.key === openModal);

  const getItemsForModal = (key) => {
    if (key === "all") return allQ;
    if (key === "mcq") return mcqQ;
    if (key === "cq") return cqQ;
    return [];
  };

  return (
    <>
      <Card>
        <div className="row-between" style={{ marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0 }}>Questions</h3>
            <p className="muted small" style={{ marginTop: 2 }}>
              Active topic: <strong>{activeTopic?.name || "Default"}</strong>
            </p>
          </div>
          <Button onClick={onOpenPicker}>Select Questions</Button>
        </div>

        {allQ.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              border: "1px dashed #1e293b",
              borderRadius: 8,
              color: "#475569",
            }}
          >
            <p style={{ margin: 0, fontSize: 13 }}>
              No questions selected in this topic yet.
            </p>
            <p className="muted small" style={{ marginTop: 4 }}>
              Click "Select Questions" to assign questions to this topic.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                marginBottom: 18,
              }}
            >
              {TYPE_BTNS.map((btn) => (
                <TypeSelectorBtn
                  key={btn.key}
                  {...btn}
                  onClick={() => setOpenModal(btn.key)}
                />
              ))}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {allQ.map((item) => (
                <QuestionCard
                  key={item._id}
                  item={item}
                  onRemove={onRemoveQuestion}
                />
              ))}
            </div>
          </>
        )}
      </Card>

      {activeCfg && (
        <QuestionListModal
          open={!!openModal}
          onClose={() => setOpenModal(null)}
          title={activeCfg.label}
          items={getItemsForModal(openModal)}
          color={activeCfg.color}
          borderColor={activeCfg.borderColor}
          bg={activeCfg.bg}
        />
      )}
    </>
  );
}

function QuestionListModal({ open, onClose, title, items, color, borderColor, bg }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      {items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 0",
            color: "#475569",
            fontSize: 13,
          }}
        >
          No questions in this category.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 12px",
              borderRadius: 7,
              background: bg,
              border: `1px solid ${borderColor}`,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color,
                letterSpacing: "0.06em",
              }}
            >
              {title.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color,
                background: bg,
                border: `1px solid ${borderColor}`,
                borderRadius: 5,
                padding: "1px 8px",
              }}
            >
              {items.length}
            </span>
            <div style={{ flex: 1, height: 1, background: borderColor }} />
          </div>

          {items.map((item) => (
            <QuestionCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </Modal>
  );
}

function TypeSelectorBtn({
  label,
  count,
  color,
  borderColor,
  bg,
  hoverBorder,
  description,
  onClick,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        padding: "16px 16px",
        background: hovered ? bg : "transparent",
        border: `1px solid ${hovered ? hoverBorder : borderColor}`,
        borderRadius: 10,
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s ease",
      }}
    >
      <span
        style={{
          fontSize: 22,
          fontWeight: 900,
          color,
          lineHeight: 1,
        }}
      >
        {count}
      </span>

      <span
        style={{
          fontSize: 12,
          fontWeight: 800,
          color,
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>

      <span style={{ fontSize: 11, color: "#475569", lineHeight: 1.4 }}>
        {description}
      </span>

      <span
        style={{
          fontSize: 10,
          color: hovered ? color : "#334155",
          fontWeight: 700,
          letterSpacing: "0.06em",
          transition: "color 0.15s ease",
        }}
      >
        VIEW →
      </span>
    </button>
  );
}

export default function BookChapterEditor({ chapter, onUpdated }) {
  const enabled = chapter.book?.enabledSections || [];

  const [form, setForm] = useState({
    boardAnalysis: [],
    customTables: [],
    formulas: [],
    videos: [],
    figures: [],
  });

  const [topics, setTopics] = useState([]);
  const [activeTopicId, setActiveTopicId] = useState("");
  const [chapterQuestions, setChapterQuestions] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(enabled[0] || null);

  useEffect(() => {
    setForm({
      boardAnalysis: chapter.boardAnalysis || [],
      customTables: chapter.customTables || [],
      formulas: chapter.formulas || [],
      videos: chapter.videos || [],
      figures: chapter.figures || [],
    });

    setActiveTab((prev) => (enabled.includes(prev) ? prev : enabled[0] || null));
  }, [chapter, enabled]);

  const loadTopics = async () => {
    if (!enabled.includes("selectedQuestions")) {
      setTopics([]);
      setActiveTopicId("");
      return;
    }

    try {
      const { data } = await api.get(`/book-chapter-topics?chapterId=${chapter._id}`);
      const list = Array.isArray(data) ? data : [];
      setTopics(list);

      setActiveTopicId((prev) => {
        const stillExists = list.some((t) => t._id === prev);
        if (stillExists) return prev;
        return list[0]?._id || "";
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load topics");
    }
  };

  const loadChapterQuestions = async (topicId) => {
    if (!enabled.includes("selectedQuestions")) {
      setChapterQuestions([]);
      return;
    }

    if (!topicId) {
      setChapterQuestions([]);
      return;
    }

    try {
      const { data } = await api.get(
        `/book-chapter-questions?chapterId=${chapter._id}&topicId=${topicId}`
      );
      setChapterQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load chapter questions");
    }
  };

  useEffect(() => {
  setActiveTopicId("");   
  loadTopics();
}, [chapter._id, enabled.join(",")]);

  useEffect(() => {
  if (!activeTopicId) return;   
  loadChapterQuestions(activeTopicId);
}, [chapter._id, activeTopicId]);

  const activeTopic = useMemo(
    () => topics.find((t) => t._id === activeTopicId) || null,
    [topics, activeTopicId]
  );

  const selectedIds = chapterQuestions
    .map((i) => i.sourceQuestion?._id)
    .filter(Boolean);

  const saveContent = async () => {
    try {
      setSaving(true);

      const payload = {};
      if (enabled.includes("boardAnalysis")) payload.boardAnalysis = form.boardAnalysis;
      if (enabled.includes("tables")) payload.customTables = form.customTables;
      if (enabled.includes("formulas")) payload.formulas = form.formulas;
      if (enabled.includes("videos")) payload.videos = form.videos;
      if (enabled.includes("figures")) payload.figures = form.figures;

      await api.put(`/book-chapters/${chapter._id}`, payload);

      toast.success("Chapter content updated");
      onUpdated?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update chapter");
    } finally {
      setSaving(false);
    }
  };

  const saveSelectedQuestions = async (ids) => {
    if (!activeTopicId) {
        toast.error("No topic selected");
        return;
      }
    try {
      await api.post("/book-chapter-questions/replace", {
        chapterId: chapter._id,
        topicId: activeTopicId,
        sourceQuestionIds: ids,
      });

      await Promise.all([loadChapterQuestions(activeTopicId), loadTopics()]);
      toast.success("Selected questions updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save questions");
    }
  };

  const removeQuestionFromActiveTopic = async (item) => {
    try {
      const nextIds = selectedIds.filter((id) => id !== item.sourceQuestion?._id);
      await saveSelectedQuestions(nextIds);
    } catch (err) {
      console.error(err);
    }
  };

  const createTopic = async (name) => {
    if (!name?.trim()) {
      toast.error("Topic name is required");
      return;
    }

    try {
      const { data } = await api.post("/book-chapter-topics", {
        chapterId: chapter._id,
        name: name.trim(),
      });

      toast.success("Topic created");
      await loadTopics();
      if (data?._id) {
        setActiveTopicId(data._id);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create topic");
    }
  };

  const renameTopic = async (topic, name) => {
    if (!name?.trim()) {
      toast.error("Topic name is required");
      return;
    }

    try {
      await api.put(`/book-chapter-topics/${topic._id}`, {
        name: name.trim(),
      });
      toast.success("Topic updated");
      await loadTopics();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update topic");
    }
  };

  const deleteTopic = async (topic) => {
    const ok = window.confirm(
      `Delete topic "${topic.name}"?\n\nAll questions inside it will be moved to the default topic.`
    );

    if (!ok) return;

    try {
      await api.delete(`/book-chapter-topics/${topic._id}`);
      toast.success("Topic deleted");
      await loadTopics();
      setActiveTopicId("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete topic");
    }
  };

  const renderActiveSection = () => {
    if (!activeTab) return <Card>No enabled section for this chapter.</Card>;

    if (activeTab === "boardAnalysis") {
      return (
        <BoardAnalysisEditor
          value={form.boardAnalysis}
          onChange={(n) => setForm((p) => ({ ...p, boardAnalysis: n }))}
        />
      );
    }

    if (activeTab === "tables") {
      return (
        <TableEditor
          value={form.customTables}
          onChange={(n) => setForm((p) => ({ ...p, customTables: n }))}
        />
      );
    }

    if (activeTab === "formulas") {
      return (
        <FormulaEditor
          value={form.formulas}
          onChange={(n) => setForm((p) => ({ ...p, formulas: n }))}
        />
      );
    }

    if (activeTab === "videos") {
      return (
        <MediaEditor
          title="Videos"
          value={form.videos}
          onChange={(n) => setForm((p) => ({ ...p, videos: n }))}
        />
      );
    }

    if (activeTab === "figures") {
      return (
        <MediaEditor
          title="Figures"
          value={form.figures}
          onChange={(n) => setForm((p) => ({ ...p, figures: n }))}
        />
      );
    }

    if (activeTab === "selectedQuestions") {
      return (
        <>
          <TopicManager
            topics={topics}
            activeTopicId={activeTopicId}
            onSelectTopic={setActiveTopicId}
            onCreateTopic={createTopic}
            onRenameTopic={renameTopic}
            onDeleteTopic={deleteTopic}
          />

          <QuestionsSection
            activeTopic={activeTopic}
            chapterQuestions={chapterQuestions}
            onOpenPicker={() => setPickerOpen(true)}
            onRemoveQuestion={removeQuestionFromActiveTopic}
          />

          <ArchiveQuestionPicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            selectedIds={selectedIds}
            topicName={activeTopic?.name || "Default"}
            onApply={saveSelectedQuestions}
          />
        </>
      );
    }

    return null;
  };

  return (
    <div className="stack">
      <Card>
        <div className="row-between">
          <div>
            <h2 style={{ margin: 0 }}>{chapter.title}</h2>
            <p className="muted small" style={{ marginTop: 2 }}>
              Order {chapter.order}
            </p>
          </div>

          {activeTab && activeTab !== "selectedQuestions" && (
            <Button onClick={saveContent} disabled={saving}>
              {saving ? "Saving…" : "Save Section"}
            </Button>
          )}
        </div>

        {enabled.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              marginTop: 16,
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 10,
              padding: 4,
            }}
          >
            {enabled.map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setActiveTab(section)}
                style={{
                  flex: "0 0 auto",
                  background:
                    activeTab === section ? "#1e3a5f" : "transparent",
                  border:
                    activeTab === section
                      ? "1px solid #2563eb"
                      : "1px solid transparent",
                  borderRadius: 7,
                  color:
                    activeTab === section ? "#93c5fd" : "#64748b",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "6px 16px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {TAB_LABELS[section] || section}
              </button>
            ))}
          </div>
        )}
      </Card>

      {renderActiveSection()}
    </div>
  );
}