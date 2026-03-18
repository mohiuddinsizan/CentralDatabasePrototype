import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookOpen, Plus, X } from "lucide-react";
import api from "../api/axios";
import BookForm from "../components/books/BookForm";

// ── Cover images ───────────────────────────────────────────────
const BOOK_COVERS = [
  "1.png",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
  "6.png",
  "7.png",
  "8.png",
];
const getCover = (i) => BOOK_COVERS[i % BOOK_COVERS.length];

// ── Category definitions (order matters — displayed in this order) ──
const CATEGORIES = [
  {
    key: "9",
    label: "Class 9",
    color: "#22d3ee",
    borderColor: "rgba(34,211,238,0.3)",
    bg: "rgba(34,211,238,0.06)",
    plankColor: "rgba(34,211,238,0.12)",
    match: (c) => String(c).trim() === "9",
  },
  {
    key: "10",
    label: "Class 10",
    color: "#38bdf8",
    borderColor: "rgba(56,189,248,0.3)",
    bg: "rgba(56,189,248,0.06)",
    plankColor: "rgba(56,189,248,0.12)",
    match: (c) => String(c).trim() === "10",
  },
  {
    key: "SSC",
    label: "SSC",
    color: "#60a5fa",
    borderColor: "rgba(96,165,250,0.3)",
    bg: "rgba(96,165,250,0.06)",
    plankColor: "rgba(96,165,250,0.12)",
    match: (c) => /^ssc$/i.test(String(c).trim()),
  },
  {
    key: "11",
    label: "Class 11",
    color: "#a78bfa",
    borderColor: "rgba(167,139,250,0.3)",
    bg: "rgba(167,139,250,0.06)",
    plankColor: "rgba(167,139,250,0.12)",
    match: (c) => String(c).trim() === "11",
  },
  {
    key: "12",
    label: "Class 12",
    color: "#c084fc",
    borderColor: "rgba(192,132,252,0.3)",
    bg: "rgba(192,132,252,0.06)",
    plankColor: "rgba(192,132,252,0.12)",
    match: (c) => String(c).trim() === "12",
  },
  {
    key: "HSC",
    label: "HSC",
    color: "#e879f9",
    borderColor: "rgba(232,121,249,0.3)",
    bg: "rgba(232,121,249,0.06)",
    plankColor: "rgba(232,121,249,0.12)",
    match: (c) => /^hsc$/i.test(String(c).trim()),
  },
  {
    key: "Admission",
    label: "Admission",
    color: "#fb923c",
    borderColor: "rgba(251,146,60,0.3)",
    bg: "rgba(251,146,60,0.06)",
    plankColor: "rgba(251,146,60,0.12)",
    match: (c) => /^admission$/i.test(String(c).trim()),
  },
  {
    key: "Engineering",
    label: "Engineering",
    color: "#facc15",
    borderColor: "rgba(250,204,21,0.3)",
    bg: "rgba(250,204,21,0.06)",
    plankColor: "rgba(250,204,21,0.12)",
    match: (c) => /^engineering$/i.test(String(c).trim()),
  },
  {
    key: "Varsity",
    label: "Varsity",
    color: "#4ade80",
    borderColor: "rgba(74,222,128,0.3)",
    bg: "rgba(74,222,128,0.06)",
    plankColor: "rgba(74,222,128,0.12)",
    match: (c) => /^varsity$/i.test(String(c).trim()),
  },
  {
    key: "Medical",
    label: "Medical",
    color: "#f87171",
    borderColor: "rgba(248,113,113,0.3)",
    bg: "rgba(248,113,113,0.06)",
    plankColor: "rgba(248,113,113,0.12)",
    match: (c) => /^medical$/i.test(String(c).trim()),
  },
  {
    key: "__other__",
    label: "Other",
    color: "#94a3b8",
    borderColor: "#334155",
    bg: "rgba(100,116,139,0.06)",
    plankColor: "rgba(100,116,139,0.12)",
    match: () => false, // catch-all
  },
];

// Assign each book to its category
function categorizeBooks(books) {
  const result = CATEGORIES.map((cat) => ({ ...cat, books: [] }));

  books.forEach((book) => {
    const cls = book.className || "";
    const matched = result.find(
      (cat) => cat.key !== "__other__" && cat.match(cls)
    );
    if (matched) {
      matched.books.push(book);
    } else {
      result.find((c) => c.key === "__other__").books.push(book);
    }
  });

  // Only return categories that have books
  return result.filter((cat) => cat.books.length > 0);
}

// ─────────────────────────────────────────────────────────────
// BookCard
// ─────────────────────────────────────────────────────────────
function BookCard({ book, globalIndex, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: 140, flexShrink: 0, cursor: "pointer", userSelect: "none" }}
    >
      <div style={{
        position: "relative",
        height: 200,
        borderRadius: 9,
        overflow: "hidden",
        transition: "transform 0.26s ease, box-shadow 0.26s ease",
        transform: hovered ? "translateY(-10px) scale(1.04)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? "8px 16px 36px rgba(0,0,0,0.85), -3px 0 0 rgba(255,255,255,0.09)"
          : "4px 8px 20px rgba(0,0,0,0.6), -2px 0 0 rgba(255,255,255,0.04)",
      }}>
        <img
          src={getCover(globalIndex)}
          alt={book.title}
          draggable={false}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        {/* Spine shadow */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: 0, width: 16,
          background: "linear-gradient(to right, rgba(0,0,0,0.72), transparent)",
          pointerEvents: "none",
        }} />
        {/* Bottom gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
          pointerEvents: "none",
        }} />
        {/* Bottom info */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "8px 9px 9px 11px",
        }}>
          {book.subject && (
            <div style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.10)",
              borderRadius: 5, padding: "1px 6px",
              fontSize: 9, fontWeight: 600, color: "#94a3b8", marginBottom: 4,
            }}>
              {book.subject}
            </div>
          )}
          {book.enabledSections?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {book.enabledSections.slice(0, 2).map((s) => (
                <span key={s} style={{
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 3, padding: "1px 4px",
                  fontSize: 8, fontWeight: 600, color: "#64748b",
                }}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.18s ease",
          pointerEvents: hovered ? "auto" : "none",
        }}>
          <span style={{
            background: "#fff", color: "#0f172a",
            borderRadius: 8, padding: "6px 18px",
            fontSize: 11, fontWeight: 800,
          }}>
            Open
          </span>
        </div>
      </div>
      {/* Title */}
      <div style={{ marginTop: 8, padding: "0 2px", textAlign: "center" }}>
        <p style={{
          margin: 0, fontSize: 11, fontWeight: 600, color: "#e2e8f0",
          lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {book.title}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shelf carousel
// ─────────────────────────────────────────────────────────────
function BookShelf({ books, color, startIndex, navigate }) {
  const ref = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const check = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    check();
    const el = ref.current;
    el?.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el?.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [books.length]);

  const scroll = (dir) =>
    ref.current?.scrollBy({ left: dir * 500, behavior: "smooth" });

  const arrowStyle = (side) => ({
    position: "absolute",
    [side]: -14,
    top: 85,
    zIndex: 10,
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    border: `1px solid ${color}33`,
    background: "#0b1220",
    cursor: "pointer",
    color,
    boxShadow: "0 4px 18px rgba(0,0,0,0.6)",
  });

  return (
    <div style={{ position: "relative" }}>
      {canLeft && (
        <button onClick={() => scroll(-1)} style={arrowStyle("left")}>
          <ChevronLeft size={14} />
        </button>
      )}
      <div
        ref={ref}
        style={{
          display: "flex", gap: 18,
          overflowX: "auto", padding: "14px 4px 8px",
          scrollbarWidth: "none", msOverflowStyle: "none",
        }}
      >
        {books.map((book, i) => (
          <BookCard
            key={book._id}
            book={book}
            globalIndex={startIndex + i}
            onClick={() => navigate(`/books/${book._id}`)}
          />
        ))}
      </div>
      {canRight && (
        <button onClick={() => scroll(1)} style={arrowStyle("right")}>
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Category Shelf Block
// ─────────────────────────────────────────────────────────────
function CategoryShelfBlock({ category, startIndex, navigate }) {
  const { label, color, borderColor, bg, plankColor, books } = category;

  return (
    <div style={{
      background: "#0a1220",
      border: `1px solid ${borderColor}`,
      borderRadius: 14,
      overflow: "hidden",
    }}>
      {/* Category header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        background: bg,
        borderBottom: `1px solid ${borderColor}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Color dot */}
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: color,
            boxShadow: `0 0 8px ${color}`,
          }} />
          <span style={{
            fontSize: 12, fontWeight: 900, color,
            textTransform: "uppercase", letterSpacing: "0.14em",
          }}>
            {label}
          </span>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color, background: bg,
          border: `1px solid ${borderColor}`,
          borderRadius: 6, padding: "2px 10px",
        }}>
          {books.length} {books.length === 1 ? "book" : "books"}
        </span>
      </div>

      {/* Shelf */}
      <div style={{ padding: "4px 20px 0" }}>
        <BookShelf
          books={books}
          color={color}
          startIndex={startIndex}
          navigate={navigate}
        />
      </div>

      {/* Shelf plank */}
      <div style={{
        height: 5, margin: "0 20px 0",
        borderRadius: "0 0 4px 4px",
        background: `linear-gradient(to right, transparent, ${plankColor}, transparent)`,
      }} />
      <div style={{ height: 12 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function BooksPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const loadBooks = async () => {
    const { data } = await api.get("/books");
    setBooks(data);
  };

  useEffect(() => { loadBooks(); }, []);

  const categorized = categorizeBooks(books);

  // For consistent cover cycling across all shelves
  const categoryStartIndexes = [];
  let runningIndex = 0;
  categorized.forEach((cat) => {
    categoryStartIndexes.push(runningIndex);
    runningIndex += cat.books.length;
  });

  return (
    <div className="stack-lg">

      {/* ── Page header ── */}
      <div className="row-between">
        <div>
          <h2 style={{ margin: 0 }}>Books</h2>
          <p className="muted small" style={{ marginTop: 4 }}>
            {books.length} book{books.length !== 1 ? "s" : ""} across {categorized.length} categor{categorized.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm((p) => !p)}
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? "Cancel" : "New Book"}
        </button>
      </div>

      {/* ── Create form ── */}
      {showForm && (
        <div className="card">
          <BookForm onCreated={() => { loadBooks(); setShowForm(false); }} />
        </div>
      )}

      {/* ── Empty state ── */}
      {books.length === 0 ? (
        <div className="card" style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "72px 24px", textAlign: "center",
          border: "1px dashed #1f2937",
        }}>
          <BookOpen size={40} color="#334155" style={{ marginBottom: 14 }} />
          <p style={{ margin: 0, fontWeight: 600, color: "#475569" }}>No books yet</p>
          <p className="muted small" style={{ marginTop: 6 }}>
            Click "New Book" above to get started.
          </p>
        </div>
      ) : (
        /* ── Categorized shelves ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {categorized.map((cat, idx) => (
            <CategoryShelfBlock
              key={cat.key}
              category={cat}
              startIndex={categoryStartIndexes[idx]}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}