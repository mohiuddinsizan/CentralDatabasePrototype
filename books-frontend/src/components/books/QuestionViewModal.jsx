import Modal from "../ui/Modal";
import Card from "../ui/Card";

const TYPE_COLORS = {
  mcq: { bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.25)", text: "#22d3ee", label: "MCQ" },
  cq: { bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.25)", text: "#a855f7", label: "Written (CQ)" },
};

function TypeBadge({ type }) {
  const t = type?.toLowerCase();
  const cfg = TYPE_COLORS[t] || { bg: "rgba(100,116,139,0.12)", border: "#334155", text: "#94a3b8", label: type || "Unknown" };
  return (
    <span style={{
      display: "inline-block",
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 6,
      padding: "2px 10px",
      fontSize: 11,
      fontWeight: 700,
      color: cfg.text,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>
      {cfg.label}
    </span>
  );
}

function MetaRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ minWidth: 90, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", paddingTop: 1 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: "#94a3b8" }}>{value}</span>
    </div>
  );
}

export default function QuestionViewModal({ open, onClose, question }) {
  if (!question) return null;
  const q = question;

  return (
    <Modal open={open} onClose={onClose} title="Question Details">
      <div className="stack">

        {/* Type + title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TypeBadge type={q.type} />
          <h3 style={{ margin: 0, color: "#e2e8f0", fontSize: 16, fontWeight: 700, lineHeight: 1.5 }}>
            {q.title || "Untitled Question"}
          </h3>
        </div>

        {/* Meta info */}
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <MetaRow label="Archive" value={q.archive?.name} />
            <MetaRow label="Chapter" value={q.chapter?.name} />
            <MetaRow label="Tags" value={q.tags?.join(", ")} />
          </div>
        </Card>

        {/* Stem */}
        {q.stem && (
          <Card>
            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Question Stem
            </p>
            <p style={{ margin: 0, fontSize: 14, color: "#cbd5e1", lineHeight: 1.7 }}>
              {q.stem}
            </p>
          </Card>
        )}

        {/* MCQ Options */}
        {q.type?.toLowerCase() === "mcq" && q.options?.length > 0 && (
          <Card>
            <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Options
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {q.options.map((opt, idx) => {
                const label = String.fromCharCode(65 + idx);
                const isCorrect = opt.isCorrect || opt.correct;
                return (
                  <div key={idx} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 7,
                    background: isCorrect ? "rgba(34,197,94,0.08)" : "#0f172a",
                    border: `1px solid ${isCorrect ? "rgba(34,197,94,0.3)" : "#1e293b"}`,
                  }}>
                    <span style={{
                      minWidth: 22,
                      height: 22,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      background: isCorrect ? "rgba(34,197,94,0.2)" : "#1e293b",
                      color: isCorrect ? "#4ade80" : "#64748b",
                      flexShrink: 0,
                    }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 13, color: isCorrect ? "#86efac" : "#94a3b8", lineHeight: 1.5, paddingTop: 2 }}>
                      {opt.text || opt.value || opt}
                    </span>
                    {isCorrect && (
                      <span style={{ marginLeft: "auto", fontSize: 10, color: "#4ade80", fontWeight: 700, paddingTop: 4, flexShrink: 0 }}>
                        ✓ Correct
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* CQ sub-questions / answer */}
        {q.type?.toLowerCase() === "cq" && q.answer && (
          <Card>
            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Answer / Guidelines
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>
              {q.answer}
            </p>
          </Card>
        )}

      </div>
    </Modal>
  );
}