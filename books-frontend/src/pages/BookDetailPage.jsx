import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, BookOpen, Hash, Layers } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import SectionBadge from "../components/ui/SectionBadge";
import BookChapterEditor from "../components/books/BookChapterEditor";

const SECTION_COLORS = {
  boardAnalysis: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.22)", text: "#fbbf24" },
  tables: { bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.22)", text: "#22d3ee" },
  formulas: { bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.22)", text: "#a855f7" },
  videos: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.22)", text: "#f87171" },
  figures: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.22)", text: "#4ade80" },
  selectedQuestions: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.22)", text: "#60a5fa" },
};

function SectionTag({ value }) {
  const cfg = SECTION_COLORS[value] || {
    bg: "rgba(100,116,139,0.10)",
    border: "#334155",
    text: "#94a3b8",
  };
  const label = {
    boardAnalysis: "Board Analysis",
    tables: "Tables",
    formulas: "Formulas",
    videos: "Videos",
    figures: "Figures",
    selectedQuestions: "Q&A",
  }[value] || value;

  return (
    <span style={{
      display: "inline-block",
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 6,
      padding: "3px 10px",
      fontSize: 11,
      fontWeight: 700,
      color: cfg.text,
      letterSpacing: "0.04em",
    }}>
      {label}
    </span>
  );
}

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [chapterForm, setChapterForm] = useState({ title: "", order: 1 });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadData = async () => {
    try {
      const [bookRes, chaptersRes] = await Promise.all([
        api.get(`/books/${id}`),
        api.get(`/book-chapters?bookId=${id}`),
      ]);
      setBook(bookRes.data);
      setChapters(chaptersRes.data || []);
      if ((chaptersRes.data || []).length > 0) {
        setSelectedChapterId((prev) => {
          const stillExists = chaptersRes.data.some((c) => c._id === prev);
          return stillExists ? prev : chaptersRes.data[0]._id;
        });
      } else {
        setSelectedChapterId("");
      }
    } catch (err) {
      toast.error("Failed to load book");
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const selectedChapter = chapters.find((c) => c._id === selectedChapterId) || null;

  const createChapter = async (e) => {
    e.preventDefault();
    if (!chapterForm.title.trim()) {
      toast.error("Chapter title is required");
      return;
    }
    try {
      await api.post("/book-chapters", {
        bookId: id,
        title: chapterForm.title.trim(),
        order: Number(chapterForm.order) || 1,
      });
      toast.success("Chapter created");
      setChapterForm({ title: "", order: 1 });
      setShowCreateForm(false);
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create chapter");
    }
  };

  if (!book) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#475569", fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="stack-lg">

      {/* ── Book Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #0d1929 0%, #0f172a 100%)",
        border: "1px solid #1e293b",
        borderRadius: 14,
        padding: "24px 28px",
        display: "flex",
        alignItems: "flex-start",
        gap: 24,
      }}>
        {/* Icon */}
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: "rgba(37,99,235,0.12)",
          border: "1px solid rgba(37,99,235,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <BookOpen size={24} color="#3b82f6" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.3 }}>
            {book.title}
          </h1>

          {/* Meta row */}
          <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
              <Hash size={12} />
              Class {book.className}
            </span>
            {book.subject && (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
                <Layers size={12} />
                {book.subject}
              </span>
            )}
            <span style={{ fontSize: 12, color: "#475569" }}>
              {chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
            </span>
          </div>

          {book.description && (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
              {book.description}
            </p>
          )}

          {/* Section tags */}
          {(book.enabledSections || []).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {(book.enabledSections || []).map((s) => (
                <SectionTag key={s} value={s} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: 16,
        alignItems: "start",
      }}>

        {/* ── Left: Chapter sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, position: "sticky", top: 16 }}>

          {/* Chapter list card */}
          <div style={{
            background: "#0d1929",
            border: "1px solid #1e293b",
            borderRadius: 12,
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderBottom: "1px solid #1e293b",
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Chapters
              </span>
              <button
                type="button"
                onClick={() => setShowCreateForm((p) => !p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: showCreateForm ? "rgba(239,68,68,0.1)" : "rgba(37,99,235,0.12)",
                  border: showCreateForm ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(37,99,235,0.25)",
                  borderRadius: 6,
                  color: showCreateForm ? "#f87171" : "#60a5fa",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                <Plus size={11} />
                {showCreateForm ? "Cancel" : "New"}
              </button>
            </div>

            {/* Create form inline */}
            {showCreateForm && (
              <form
                onSubmit={createChapter}
                style={{
                  borderBottom: "1px solid #1e293b",
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  background: "#0f1f36",
                }}
              >
                <input
                  placeholder="Chapter title…"
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm((p) => ({ ...p, title: e.target.value }))}
                  style={{
                    background: "#0d1929",
                    border: "1px solid #1e293b",
                    borderRadius: 7,
                    color: "#e2e8f0",
                    fontSize: 13,
                    padding: "7px 10px",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  autoFocus
                />
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    type="number"
                    placeholder="Order"
                    value={chapterForm.order}
                    onChange={(e) => setChapterForm((p) => ({ ...p, order: e.target.value }))}
                    style={{
                      width: 64,
                      background: "#0d1929",
                      border: "1px solid #1e293b",
                      borderRadius: 7,
                      color: "#94a3b8",
                      fontSize: 12,
                      padding: "6px 8px",
                      outline: "none",
                      flexShrink: 0,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      background: "#1d4ed8",
                      border: "none",
                      borderRadius: 7,
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "7px 0",
                      cursor: "pointer",
                    }}
                  >
                    Create
                  </button>
                </div>
              </form>
            )}

            {/* Chapter items */}
            <div style={{ padding: "6px 0" }}>
              {chapters.length === 0 ? (
                <div style={{ padding: "20px 14px", textAlign: "center", color: "#334155", fontSize: 12 }}>
                  No chapters yet.
                </div>
              ) : (
                chapters.map((chapter, idx) => {
                  const isSelected = selectedChapterId === chapter._id;
                  return (
                    <button
                      key={chapter._id}
                      type="button"
                      onClick={() => setSelectedChapterId(chapter._id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 14px",
                        background: isSelected ? "rgba(37,99,235,0.12)" : "transparent",
                        borderLeft: isSelected ? "3px solid #3b82f6" : "3px solid transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.12s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {/* Order number */}
                      <span style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: isSelected ? "rgba(59,130,246,0.2)" : "#0f172a",
                        border: `1px solid ${isSelected ? "rgba(59,130,246,0.4)" : "#1e293b"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 800,
                        color: isSelected ? "#60a5fa" : "#475569",
                        flexShrink: 0,
                      }}>
                        {chapter.order || idx + 1}
                      </span>

                      <span style={{
                        fontSize: 12,
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? "#e2e8f0" : "#94a3b8",
                        lineHeight: 1.4,
                        flex: 1,
                        minWidth: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {chapter.title}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Chapter editor ── */}
        <div>
          {selectedChapter ? (
            <BookChapterEditor
              key={selectedChapter._id}
              chapter={selectedChapter}
              onUpdated={loadData}
            />
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "64px 24px",
              background: "#0d1929",
              border: "1px dashed #1e293b",
              borderRadius: 12,
              textAlign: "center",
            }}>
              <BookOpen size={36} color="#1e3a5f" style={{ marginBottom: 12 }} />
              <p style={{ margin: 0, fontWeight: 600, color: "#334155", fontSize: 14 }}>
                Select a chapter to start editing
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#1e3a5f" }}>
                Choose from the list on the left
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}