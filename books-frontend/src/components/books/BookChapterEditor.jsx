import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, BookOpen, Eye, X } from "lucide-react";
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

// ─── Type Badge ────────────────────────────────────────────────
function TypeBadge({ type }) {
  const t = type?.toUpperCase();
  const cfg =
    t === "MCQ"
      ? { bg: "rgba(34,211,238,0.10)", border: "rgba(34,211,238,0.28)", text: "#22d3ee" }
      : t === "CQ"
      ? { bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.28)", text: "#c084fc" }
      : { bg: "rgba(100,116,139,0.10)", border: "#334155", text: "#94a3b8" };
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: "3px 9px",
      borderRadius: 5, border: `1px solid ${cfg.border}`,
      background: cfg.bg, color: cfg.text,
      textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0,
    }}>
      {t}
    </span>
  );
}

function Tag({ label }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: "2px 8px",
      borderRadius: 4, background: "rgba(255,255,255,0.05)",
      border: "1px solid #1e293b", color: "#64748b",
    }}>
      {label}
    </span>
  );
}

// ─── MCQ Options ───────────────────────────────────────────────
function MCQOptions({ options }) {
  if (!options?.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {options.map((opt) => {
        const isCorrect = opt.isCorrect || opt.correct;
        return (
          <div key={opt.key || opt._id} style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "7px 11px", borderRadius: 8,
            background: isCorrect ? "rgba(34,197,94,0.07)" : "#0f172a",
            border: `1px solid ${isCorrect ? "rgba(34,197,94,0.28)" : "#1e293b"}`,
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 800,
              background: isCorrect ? "rgba(34,197,94,0.18)" : "#1a2744",
              color: isCorrect ? "#4ade80" : "#475569",
              border: `1px solid ${isCorrect ? "rgba(34,197,94,0.35)" : "#1e293b"}`,
            }}>
              {opt.key}
            </span>
            <span style={{ flex: 1, fontSize: 12, color: isCorrect ? "#86efac" : "#94a3b8", lineHeight: 1.5 }}>
              {opt.text}
            </span>
            {isCorrect && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: "#4ade80",
                background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: 4, padding: "1px 7px", flexShrink: 0, marginTop: 1,
              }}>
                ✓ Correct
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── CQ Parts ─────────────────────────────────────────────────
function CQParts({ parts }) {
  if (!parts?.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {parts.map((part, i) => (
        <div key={i} style={{
          borderRadius: 9, background: "#0f172a",
          border: "1px solid #1e293b", overflow: "hidden",
        }}>
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "8px 12px",
            borderBottom: part.answer ? "1px solid #1e293b" : "none",
            background: "rgba(168,85,247,0.04)",
          }}>
            <span style={{
              fontSize: 10, fontWeight: 800, color: "#c084fc",
              background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)",
              borderRadius: 5, padding: "2px 8px", flexShrink: 0, marginTop: 1,
            }}>
              Part {part.label}
            </span>
            <span style={{ fontSize: 12, color: "#e2e8f0", flex: 1, lineHeight: 1.55 }}>
              {part.question}
            </span>
          </div>
          {part.answer && (
            <div style={{ padding: "8px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Answer
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {part.answer}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Question Detail Modal ─────────────────────────────────────
function QuestionDetailModal({ question: q, onClose }) {
  if (!q) return null;
  return (
    <Modal open={!!q} title="Question Details" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <TypeBadge type={q.type} />
          {q.tags?.map((tag) => <Tag key={tag} label={tag} />)}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.4 }}>
            {q.title}
          </h3>
          <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 14 }}>
            {q.archive?.name && (
              <span style={{ fontSize: 12, color: "#475569" }}>
                <span style={{ color: "#334155" }}>Archive </span>{q.archive.name}
              </span>
            )}
            {q.chapter?.name && (
              <span style={{ fontSize: 12, color: "#475569" }}>
                <span style={{ color: "#334155" }}>Chapter </span>{q.chapter.name}
              </span>
            )}
          </div>
        </div>
        {q.stem && (
          <div style={{ padding: "12px 14px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 9 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
              Stem
            </div>
            <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
              {q.stem}
            </div>
          </div>
        )}
        {q.type?.toUpperCase() === "MCQ" && q.mcqOptions?.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              Options
            </div>
            <MCQOptions options={q.mcqOptions} />
          </div>
        )}
        {q.type?.toUpperCase() === "CQ" && q.cqParts?.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              Parts &amp; Answers
            </div>
            <CQParts parts={q.cqParts} />
          </div>
        )}
        {q.explanation && (
          <div style={{ padding: "12px 14px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: 9 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#fbbf24", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
              Explanation
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
              {q.explanation}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Single Question Card (inside the list modal) ──────────────
function QuestionCard({ q }) {
  const [expanded, setExpanded] = useState(false);
  const [viewQ, setViewQ] = useState(null);

  const hasMCQ = q.type?.toUpperCase() === "MCQ" && q.mcqOptions?.length > 0;
  const hasCQ  = q.type?.toUpperCase() === "CQ"  && q.cqParts?.length  > 0;
  const hasContent = hasMCQ || hasCQ || q.explanation;

  return (
    <>
      <div style={{
        background: "#0d1929", border: "1px solid #1e293b",
        borderRadius: 11, overflow: "hidden",
      }}>
        <div style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <TypeBadge type={q.type} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.45, marginBottom: 4 }}>
                {q.title || "Untitled Question"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: q.tags?.length ? 5 : 0 }}>
                {q.archive?.name && (
                  <span style={{ fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 4 }}>
                    <BookOpen size={10} /> {q.archive.name}
                  </span>
                )}
                {q.chapter?.name && <span style={{ fontSize: 11, color: "#334155" }}>·</span>}
                {q.chapter?.name && <span style={{ fontSize: 11, color: "#475569" }}>{q.chapter.name}</span>}
              </div>
              {q.tags?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {q.tags.map((t) => <Tag key={t} label={t} />)}
                </div>
              )}
            </div>
            <button
              type="button"
              title="View details"
              onClick={() => setViewQ(q)}
              style={{
                width: 28, height: 28, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "1px solid #1e293b",
                borderRadius: 6, color: "#475569", cursor: "pointer",
                transition: "all 0.12s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
                e.currentTarget.style.background = "rgba(59,130,246,0.1)";
                e.currentTarget.style.color = "#60a5fa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#1e293b";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#475569";
              }}
            >
              <Eye size={13} />
            </button>
          </div>

          {q.stem && (
            <div style={{
              marginTop: 9, padding: "8px 11px",
              background: "#0f172a", border: "1px solid #1e293b",
              borderRadius: 7, fontSize: 12, color: "#64748b", lineHeight: 1.65,
            }}>
              {q.stem}
            </div>
          )}
        </div>

        {hasContent && (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 5, padding: "6px 0",
              background: "transparent", border: "none",
              borderTop: "1px solid #1e293b",
              cursor: "pointer", fontSize: 10, fontWeight: 800,
              color: "#334155", letterSpacing: "0.06em", transition: "color 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#64748b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}
          >
            {expanded ? <><ChevronUp size={11} /> HIDE ANSWER</> : <><ChevronDown size={11} /> SHOW ANSWER</>}
          </button>
        )}

        {expanded && hasContent && (
          <div style={{
            padding: "12px 14px 14px", borderTop: "1px solid #1e293b",
            background: "#0a1220", display: "flex", flexDirection: "column", gap: 10,
          }}>
            {hasMCQ && <MCQOptions options={q.mcqOptions} />}
            {hasCQ  && <CQParts  parts={q.cqParts} />}
            {q.explanation && (
              <div style={{
                padding: "9px 12px", borderRadius: 8,
                background: "rgba(245,158,11,0.05)",
                border: "1px solid rgba(245,158,11,0.15)",
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#fbbf24", letterSpacing: "0.08em", marginBottom: 4 }}>
                  EXPLANATION
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
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

// ─── Question List Modal ───────────────────────────────────────
// Opens when user clicks All / MCQ / Written button
function QuestionListModal({ open, onClose, title, questions, color, borderColor, bg }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      {questions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#475569", fontSize: 13 }}>
          No questions in this category.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Count bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "6px 12px", borderRadius: 7,
            background: bg, border: `1px solid ${borderColor}`,
            marginBottom: 4,
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: "0.06em" }}>
              {title.toUpperCase()}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, color,
              background: bg, border: `1px solid ${borderColor}`,
              borderRadius: 5, padding: "1px 8px",
            }}>
              {questions.length}
            </span>
            <div style={{ flex: 1, height: 1, background: borderColor }} />
          </div>

          {questions.map((q) => (
            <QuestionCard key={q._id} q={q} />
          ))}
        </div>
      )}
    </Modal>
  );
}

// ─── Questions Section (type selector cards on the page) ───────
function QuestionsSection({ chapterQuestions, onOpenPicker }) {
  // null = closed, "all" | "mcq" | "cq" = open that modal
  const [openModal, setOpenModal] = useState(null);

  const allQ = chapterQuestions.map((i) => i.sourceQuestion).filter(Boolean);
  const mcqQ = allQ.filter((q) => q.type?.toUpperCase() === "MCQ");
  const cqQ  = allQ.filter((q) => q.type?.toUpperCase() === "CQ");

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

  const getQuestionsForModal = (key) => {
    if (key === "all") return allQ;
    if (key === "mcq") return mcqQ;
    if (key === "cq") return cqQ;
    return [];
  };

  const activeCfg = TYPE_BTNS.find((b) => b.key === openModal);

  return (
    <>
      <Card>
        {/* Header */}
        <div className="row-between" style={{ marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0 }}>Questions</h3>
            <p className="muted small" style={{ marginTop: 2 }}>
              {allQ.length} total · {mcqQ.length} MCQ · {cqQ.length} Written
            </p>
          </div>
          <Button onClick={onOpenPicker}>Select Questions</Button>
        </div>

        {allQ.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "32px 0",
            border: "1px dashed #1e293b", borderRadius: 8, color: "#475569",
          }}>
            <p style={{ margin: 0, fontSize: 13 }}>No questions selected yet.</p>
            <p className="muted small" style={{ marginTop: 4 }}>
              Click "Select Questions" to add MCQ or Written questions.
            </p>
          </div>
        ) : (
          /* ── Three type-selector buttons ── */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {TYPE_BTNS.map((btn) => (
              <TypeSelectorBtn
                key={btn.key}
                {...btn}
                onClick={() => setOpenModal(btn.key)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* List modal — only one can be open */}
      {activeCfg && (
        <QuestionListModal
          open={!!openModal}
          onClose={() => setOpenModal(null)}
          title={activeCfg.label}
          questions={getQuestionsForModal(openModal)}
          color={activeCfg.color}
          borderColor={activeCfg.borderColor}
          bg={activeCfg.bg}
        />
      )}
    </>
  );
}

// ─── Type Selector Button ──────────────────────────────────────
function TypeSelectorBtn({ label, count, color, borderColor, bg, hoverBorder, description, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        gap: 8, padding: "16px 16px",
        background: hovered ? bg : "transparent",
        border: `1px solid ${hovered ? hoverBorder : borderColor}`,
        borderRadius: 10, cursor: "pointer", textAlign: "left",
        transition: "all 0.15s ease",
      }}
    >
      {/* Count bubble */}
      <span style={{
        fontSize: 22, fontWeight: 900, color,
        lineHeight: 1,
      }}>
        {count}
      </span>
      {/* Label */}
      <span style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: "0.04em" }}>
        {label}
      </span>
      {/* Description */}
      <span style={{ fontSize: 11, color: "#475569", lineHeight: 1.4 }}>
        {description}
      </span>
      {/* Arrow hint */}
      <span style={{
        fontSize: 10, color: hovered ? color : "#334155",
        fontWeight: 700, letterSpacing: "0.06em",
        transition: "color 0.15s ease",
      }}>
        VIEW →
      </span>
    </button>
  );
}

// ─── Main Editor ───────────────────────────────────────────────
export default function BookChapterEditor({ chapter, onUpdated }) {
  const enabled = chapter.book?.enabledSections || [];

  const [form, setForm] = useState({
    boardAnalysis: [], customTables: [], formulas: [], videos: [], figures: [],
  });
  const [chapterQuestions, setChapterQuestions] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(enabled[0] || null);

  useEffect(() => {
    setForm({
      boardAnalysis: chapter.boardAnalysis || [],
      customTables:  chapter.customTables  || [],
      formulas:      chapter.formulas      || [],
      videos:        chapter.videos        || [],
      figures:       chapter.figures       || [],
    });
    setActiveTab((prev) => (enabled.includes(prev) ? prev : enabled[0] || null));
  }, [chapter]);

  const loadShadowQuestions = async () => {
    if (!enabled.includes("selectedQuestions")) { setChapterQuestions([]); return; }
    try {
      const { data } = await api.get(`/book-chapter-questions?chapterId=${chapter._id}`);
      setChapterQuestions(data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadShadowQuestions(); }, [chapter]);

  const selectedIds = chapterQuestions.map((i) => i.sourceQuestion?._id).filter(Boolean);

  const saveContent = async () => {
    try {
      setSaving(true);
      const payload = {};
      if (enabled.includes("boardAnalysis")) payload.boardAnalysis = form.boardAnalysis;
      if (enabled.includes("tables"))         payload.customTables  = form.customTables;
      if (enabled.includes("formulas"))       payload.formulas      = form.formulas;
      if (enabled.includes("videos"))         payload.videos        = form.videos;
      if (enabled.includes("figures"))        payload.figures       = form.figures;
      await api.put(`/book-chapters/${chapter._id}`, payload);
      toast.success("Chapter content updated");
      onUpdated?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update chapter");
    } finally { setSaving(false); }
  };

  const saveSelectedQuestions = async (ids) => {
    try {
      await api.post("/book-chapter-questions/replace", { chapterId: chapter._id, sourceQuestionIds: ids });
      await loadShadowQuestions();
      toast.success("Selected questions updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save questions");
    }
  };

  const renderActiveSection = () => {
    if (!activeTab) return <Card>No enabled section for this chapter.</Card>;
    if (activeTab === "boardAnalysis") return <BoardAnalysisEditor value={form.boardAnalysis} onChange={(n) => setForm((p) => ({ ...p, boardAnalysis: n }))} />;
    if (activeTab === "tables")        return <TableEditor value={form.customTables} onChange={(n) => setForm((p) => ({ ...p, customTables: n }))} />;
    if (activeTab === "formulas")      return <FormulaEditor value={form.formulas} onChange={(n) => setForm((p) => ({ ...p, formulas: n }))} />;
    if (activeTab === "videos")        return <MediaEditor title="Videos" value={form.videos} onChange={(n) => setForm((p) => ({ ...p, videos: n }))} />;
    if (activeTab === "figures")       return <MediaEditor title="Figures" value={form.figures} onChange={(n) => setForm((p) => ({ ...p, figures: n }))} />;
    if (activeTab === "selectedQuestions") return (
      <>
        <QuestionsSection
          chapterQuestions={chapterQuestions}
          onOpenPicker={() => setPickerOpen(true)}
        />
        <ArchiveQuestionPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          selectedIds={selectedIds}
          onApply={saveSelectedQuestions}
        />
      </>
    );
    return null;
  };

  return (
    <div className="stack">
      <Card>
        <div className="row-between">
          <div>
            <h2 style={{ margin: 0 }}>{chapter.title}</h2>
            <p className="muted small" style={{ marginTop: 2 }}>Order {chapter.order}</p>
          </div>
          {activeTab && activeTab !== "selectedQuestions" && (
            <Button onClick={saveContent} disabled={saving}>
              {saving ? "Saving…" : "Save Section"}
            </Button>
          )}
        </div>

        {enabled.length > 0 && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 4, marginTop: 16,
            background: "#0f172a", border: "1px solid #1e293b",
            borderRadius: 10, padding: 4,
          }}>
            {enabled.map((section) => (
              <button
                key={section} type="button"
                onClick={() => setActiveTab(section)}
                style={{
                  flex: "0 0 auto",
                  background: activeTab === section ? "#1e3a5f" : "transparent",
                  border: activeTab === section ? "1px solid #2563eb" : "1px solid transparent",
                  borderRadius: 7, color: activeTab === section ? "#93c5fd" : "#64748b",
                  fontSize: 12, fontWeight: 700, padding: "6px 16px",
                  cursor: "pointer", transition: "all 0.15s ease", whiteSpace: "nowrap",
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