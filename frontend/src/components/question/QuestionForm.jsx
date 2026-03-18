import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import MultiSelectTags from "../ui/MultiSelectTags";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import { getQuestionDefaults, setQuestionDefaults } from "../../utils/storage";

/* ─── constants ─────────────────────────────────────────────────────────── */
const BANGLA_MCQ_KEYS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ"];
const BANGLA_CQ_LABELS = ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ"];

const makeMcqOptions = (count) =>
  Array.from({ length: count }, (_, i) => ({
    key: BANGLA_MCQ_KEYS[i] || `${i + 1}`,
    text: "",
    isCorrect: false,
  }));

const makeCqParts = (count) =>
  Array.from({ length: count }, (_, i) => ({
    label: BANGLA_CQ_LABELS[i] || `${i + 1}`,
    question: "",
    answer: "",
  }));

/* ─── sub-components ─────────────────────────────────────────────────────── */

/** Labelled section wrapper with a left-accent line */
function Section({ title, icon, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        {icon && <span style={styles.sectionIcon}>{icon}</span>}
        <span style={styles.sectionTitle}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/** Inline number stepper */
function Stepper({ label, value, min = 1, onChange }) {
  return (
    <div style={styles.stepperWrap}>
      <span style={styles.stepperLabel}>{label}</span>
      <div style={styles.stepperControl}>
        <button
          type="button"
          style={styles.stepBtn}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <span style={styles.stepValue}>{value}</span>
        <button
          type="button"
          style={styles.stepBtn}
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

/** Pill-style radio for stem toggle */
function PillRadio({ name, checked, onChange, children }) {
  return (
    <label style={{ ...styles.pill, ...(checked ? styles.pillActive : {}) }}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{ display: "none" }}
      />
      {children}
    </label>
  );
}

/* ─── main component ─────────────────────────────────────────────────────── */
export default function QuestionForm({
  mode = "create",
  initialData = null,
  onSuccess,
}) {
  const defaults = useMemo(() => getQuestionDefaults(), []);
  const [archives, setArchives] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    archiveId: "",
    chapterId: "",
    type: "MCQ",
    title: "",
    stem: "",
    hasStem: false,
    explanation: "",
    tags: [],
    defaultMcqOptionCount: defaults.defaultMcqOptionCount || 4,
    defaultCqPartCount: defaults.defaultCqPartCount || 2,
    mcqOptions: makeMcqOptions(defaults.defaultMcqOptionCount || 4),
    cqParts: makeCqParts(defaults.defaultCqPartCount || 2),
  });

  /* load remote data */
  useEffect(() => {
    const load = async () => {
      try {
        const [archivesRes, chaptersRes, tagsRes] = await Promise.all([
          api.get("/archives"),
          api.get("/chapters"),
          api.get("/questions/tags"),
        ]);
        setArchives(archivesRes.data);
        setChapters(chaptersRes.data);
        setTags(tagsRes.data);
      } catch (err) {
        toast.error("ফর্মের ডাটা লোড করা যায়নি");
        console.error(err);
      }
    };
    load();
  }, []);

  /* populate from initialData in edit mode */
  useEffect(() => {
    if (!initialData) return;
    const archiveId = initialData.archive?._id || initialData.archive || "";
    const chapterId = initialData.chapter?._id || initialData.chapter || "";
    setForm({
      archiveId,
      chapterId,
      type: initialData.type || "MCQ",
      title: initialData.title || "",
      stem: initialData.stem || "",
      hasStem: !!initialData.stem,
      explanation: initialData.explanation || "",
      tags: initialData.tags || [],
      defaultMcqOptionCount:
        initialData.settingsSnapshot?.defaultMcqOptionCount ||
        initialData.mcqOptions?.length ||
        4,
      defaultCqPartCount:
        initialData.settingsSnapshot?.defaultCqPartCount ||
        initialData.cqParts?.length ||
        2,
      mcqOptions:
        initialData.mcqOptions?.length > 0
          ? initialData.mcqOptions.map((opt, idx) => ({
              key: opt.key || BANGLA_MCQ_KEYS[idx] || `${idx + 1}`,
              text: opt.text || "",
              isCorrect: !!opt.isCorrect,
            }))
          : makeMcqOptions(
              initialData.settingsSnapshot?.defaultMcqOptionCount || 4
            ),
      cqParts:
        initialData.cqParts?.length > 0
          ? initialData.cqParts.map((part, idx) => ({
              label: part.label || BANGLA_CQ_LABELS[idx] || `${idx + 1}`,
              question: part.question || "",
              answer: part.answer || "",
            }))
          : makeCqParts(
              initialData.settingsSnapshot?.defaultCqPartCount || 2
            ),
    });
  }, [initialData]);

  const filteredChapters = chapters.filter((chapter) => {
    const archiveRef = chapter.archive?._id || chapter.archive;
    return archiveRef === form.archiveId;
  });

  const updateMcqCount = (n) => {
    const count = Math.max(2, n);
    setForm((prev) => ({ ...prev, defaultMcqOptionCount: count, mcqOptions: makeMcqOptions(count) }));
    setQuestionDefaults({ ...getQuestionDefaults(), defaultMcqOptionCount: count });
  };

  const updateCqCount = (n) => {
    const count = Math.max(1, n);
    setForm((prev) => ({ ...prev, defaultCqPartCount: count, cqParts: makeCqParts(count) }));
    setQuestionDefaults({ ...getQuestionDefaults(), defaultCqPartCount: count });
  };

  const isSubmitDisabled =
    saving || !form.archiveId || !form.chapterId || !form.type || !form.title.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.archiveId) { toast.error("আর্কাইভ সিলেক্ট করুন"); return; }
    if (!form.chapterId) { toast.error("চ্যাপ্টার সিলেক্ট করুন"); return; }
    if (!form.title.trim()) { toast.error("প্রশ্ন লিখুন"); return; }

    if (form.type === "MCQ") {
      if (form.mcqOptions.some((opt) => !opt.text.trim())) {
        toast.error("সবগুলো অপশন পূরণ করতে হবে"); return;
      }
      if (form.mcqOptions.filter((opt) => opt.isCorrect).length < 1) {
        toast.error("কমপক্ষে একটি সঠিক উত্তর নির্বাচন করুন"); return;
      }
    }

    if (form.type === "CQ") {
      if (form.hasStem && !form.stem.trim()) {
        toast.error("উদ্দীপক লিখুন অথবা 'না' নির্বাচন করুন"); return;
      }
      if (form.cqParts.some((part) => !part.question.trim())) {
        toast.error("প্রতিটি অংশে প্রশ্ন লিখতে হবে"); return;
      }
    }

    const payload = {
      archiveId: form.archiveId,
      chapterId: form.chapterId,
      type: form.type,
      title: form.title.trim(),
      stem: form.type === "CQ" && form.hasStem ? form.stem.trim() : "",
      explanation: form.explanation.trim(),
      tags: form.tags,
      mcqOptions:
        form.type === "MCQ"
          ? form.mcqOptions.map((opt) => ({ key: opt.key, text: opt.text.trim(), isCorrect: !!opt.isCorrect }))
          : [],
      cqParts:
        form.type === "CQ"
          ? form.cqParts.map((part) => ({ label: part.label, question: part.question.trim(), answer: part.answer.trim() }))
          : [],
      settingsSnapshot: {
        defaultMcqOptionCount: form.defaultMcqOptionCount,
        defaultCqPartCount: form.defaultCqPartCount,
      },
    };

    try {
      setSaving(true);
      if (mode === "edit" && initialData?._id) {
        await api.put(`/questions/${initialData._id}`, payload);
        toast.success("প্রশ্ন আপডেট হয়েছে");
      } else {
        await api.post("/questions", payload);
        toast.success("প্রশ্ন সেভ হয়েছে");
      }
      onSuccess?.();
      if (mode === "create") {
        setForm((prev) => ({
          ...prev,
          title: "",
          stem: "",
          hasStem: false,
          explanation: "",
          tags: [],
          mcqOptions: makeMcqOptions(prev.defaultMcqOptionCount),
          cqParts: makeCqParts(prev.defaultCqPartCount),
        }));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "প্রশ্ন সেভ করা যায়নি");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* ─── render ─────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{css}</style>

      <form style={styles.form} onSubmit={handleSubmit}>

        {/* ── Row 1: Archive + Chapter ─────────────────────────────────── */}
        <Section title="শ্রেণীবিন্যাস" icon="📂">
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>আর্কাইভ</label>
              <Select
                value={form.archiveId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, archiveId: e.target.value, chapterId: "" }))
                }
              >
                <option value="">আর্কাইভ নির্বাচন করুন</option>
                {archives.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} — Class {a.className}
                  </option>
                ))}
              </Select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>চ্যাপ্টার</label>
              <Select
                value={form.chapterId}
                onChange={(e) => setForm((prev) => ({ ...prev, chapterId: e.target.value }))}
                disabled={!form.archiveId}
              >
                <option value="">
                  {!form.archiveId ? "আগে আর্কাইভ নির্বাচন করুন" : "চ্যাপ্টার নির্বাচন করুন"}
                </option>
                {filteredChapters.map((ch) => (
                  <option key={ch._id} value={ch._id}>{ch.name}</option>
                ))}
              </Select>
            </div>
          </div>
        </Section>

        {/* ── Row 2: Type + Counts ─────────────────────────────────────── */}
        <Section title="প্রশ্নের ধরন ও কনফিগারেশন" icon="⚙️">
          <div style={styles.configRow}>

            {/* Type toggle */}
            <div style={styles.field}>
              <label style={styles.label}>প্রশ্নের ধরন</label>
              <div style={styles.typeToggle}>
                {["MCQ", "CQ"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    style={{
                      ...styles.typeBtn,
                      ...(form.type === t ? styles.typeBtnActive : {}),
                    }}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, type: t, stem: "", hasStem: false }))
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Steppers */}
            <Stepper
              label="MCQ অপশন"
              value={form.defaultMcqOptionCount}
              min={2}
              onChange={updateMcqCount}
            />
            <Stepper
              label="CQ অংশ"
              value={form.defaultCqPartCount}
              min={1}
              onChange={updateCqCount}
            />
          </div>
        </Section>

        {/* ── Row 3: Main question text ────────────────────────────────── */}
        <Section title={form.type === "MCQ" ? "প্রশ্ন" : "মূল প্রশ্ন / শিরোনাম"} icon="✏️">
          <Textarea
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="এখানে প্রশ্নটি লিখুন…"
          />
        </Section>

        {/* ── MCQ Options ──────────────────────────────────────────────── */}
        {form.type === "MCQ" && (
          <Section title="MCQ অপশনসমূহ" icon="☑️">
            <div style={styles.optionList}>
              {form.mcqOptions.map((option, idx) => (
                <div
                  key={`${option.key}-${idx}`}
                  style={{
                    ...styles.optionRow,
                    ...(option.isCorrect ? styles.optionRowCorrect : {}),
                  }}
                >
                  {/* Badge */}
                  <div style={{
                    ...styles.badge,
                    ...(option.isCorrect ? styles.badgeCorrect : {}),
                  }}>
                    {option.key}
                  </div>

                  {/* Text input */}
                  <div style={{ flex: 1 }}>
                    <Input
                      value={option.text}
                      placeholder={`অপশন ${option.key} লিখুন`}
                      onChange={(e) => {
                        const next = [...form.mcqOptions];
                        next[idx].text = e.target.value;
                        setForm((prev) => ({ ...prev, mcqOptions: next }));
                      }}
                    />
                  </div>

                  {/* Correct toggle */}
                  <label style={styles.correctLabel}>
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const next = [...form.mcqOptions];
                        next[idx].isCorrect = e.target.checked;
                        setForm((prev) => ({ ...prev, mcqOptions: next }));
                      }}
                    />
                    <span style={{
                      ...styles.correctPill,
                      ...(option.isCorrect ? styles.correctPillOn : {}),
                    }}>
                      {option.isCorrect ? "✓ সঠিক" : "সঠিক?"}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── CQ ───────────────────────────────────────────────────────── */}
        {form.type === "CQ" && (
          <>
            {/* Stem */}
            <Section title="উদ্দীপক" icon="📄">
              <div style={styles.pillGroup}>
                <PillRadio
                  name="hasStem"
                  checked={form.hasStem === true}
                  onChange={() => setForm((prev) => ({ ...prev, hasStem: true }))}
                >
                  উদ্দীপক আছে
                </PillRadio>
                <PillRadio
                  name="hasStem"
                  checked={form.hasStem === false}
                  onChange={() => setForm((prev) => ({ ...prev, hasStem: false, stem: "" }))}
                >
                  উদ্দীপক নেই
                </PillRadio>
              </div>

              {form.hasStem && (
                <div style={{ marginTop: 16 }}>
                  <Textarea
                    value={form.stem}
                    onChange={(e) => setForm((prev) => ({ ...prev, stem: e.target.value }))}
                    placeholder="উদ্দীপকের বিবরণ লিখুন…"
                  />
                </div>
              )}
            </Section>

            {/* CQ Parts */}
            <Section title="CQ অংশসমূহ" icon="📝">
              <div style={styles.cqList}>
                {form.cqParts.map((part, idx) => (
                  <div key={`${part.label}-${idx}`} style={styles.cqCard}>
                    <div style={styles.cqCardHeader}>
                      <div style={styles.cqBadge}>{part.label}</div>
                      <span style={styles.cqCardTitle}>অংশ {part.label}</span>
                    </div>

                    <div style={styles.cqFields}>
                      <div>
                        <label style={styles.subLabel}>প্রশ্ন</label>
                        <Textarea
                          value={part.question}
                          onChange={(e) => {
                            const next = [...form.cqParts];
                            next[idx].question = e.target.value;
                            setForm((prev) => ({ ...prev, cqParts: next }));
                          }}
                          placeholder="প্রশ্ন লিখুন…"
                        />
                      </div>
                      <div>
                        <label style={styles.subLabel}>উত্তর</label>
                        <Textarea
                          value={part.answer}
                          onChange={(e) => {
                            const next = [...form.cqParts];
                            next[idx].answer = e.target.value;
                            setForm((prev) => ({ ...prev, cqParts: next }));
                          }}
                          placeholder="উত্তর লিখুন…"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* ── Explanation ──────────────────────────────────────────────── */}
        <Section title="ব্যাখ্যা" icon="💡">
          <Textarea
            value={form.explanation}
            onChange={(e) => setForm((prev) => ({ ...prev, explanation: e.target.value }))}
            placeholder="প্রয়োজনে বিস্তারিত ব্যাখ্যা লিখুন…"
          />
        </Section>

        {/* ── Tags ─────────────────────────────────────────────────────── */}
        <Section title="ট্যাগ" icon="🏷️">
          <MultiSelectTags
            tags={tags}
            value={form.tags}
            onChange={(nextTags) => setForm((prev) => ({ ...prev, tags: nextTags }))}
          />
        </Section>

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <div style={styles.footer}>
          <div style={styles.footerMeta}>
            {isSubmitDisabled && !saving && (
              <span style={styles.footerHint}>
                আর্কাইভ, চ্যাপ্টার ও প্রশ্ন পূরণ করুন
              </span>
            )}
          </div>
          <Button type="submit" disabled={isSubmitDisabled}>
            {saving
              ? mode === "edit" ? "আপডেট হচ্ছে…" : "সেভ হচ্ছে…"
              : mode === "edit" ? "প্রশ্ন আপডেট করুন" : "প্রশ্ন সেভ করুন"}
          </Button>
        </div>
      </form>
    </>
  );
}

/* ─── styles ─────────────────────────────────────────────────────────────── */
const T = {
  bg: "#0d1117",
  surface: "#161b22",
  surfaceHover: "#1c2230",
  border: "rgba(255,255,255,0.08)",
  borderAccent: "rgba(56,189,248,0.4)",
  accent: "#38bdf8",
  accentGlow: "rgba(56,189,248,0.15)",
  success: "#22c55e",
  successGlow: "rgba(34,197,94,0.15)",
  text: "#e2e8f0",
  muted: "#64748b",
  label: "#94a3b8",
};

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
    color: T.text,
  },

  /* section */
  section: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 20px",
    borderBottom: `1px solid ${T.border}`,
    background: "rgba(255,255,255,0.02)",
  },
  sectionIcon: { fontSize: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: T.label,
  },

  /* grids / rows */
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    padding: 20,
  },
  configRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 20,
    padding: 20,
  },
  field: { display: "flex", flexDirection: "column", gap: 8, minWidth: 160 },

  /* labels */
  label: { fontSize: 12, fontWeight: 600, color: T.label, letterSpacing: "0.04em" },
  subLabel: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: T.label,
    letterSpacing: "0.04em",
    marginBottom: 6,
  },

  /* type toggle */
  typeToggle: {
    display: "flex",
    background: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    border: `1px solid ${T.border}`,
    overflow: "hidden",
  },
  typeBtn: {
    flex: 1,
    padding: "9px 20px",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.06em",
    border: "none",
    background: "transparent",
    color: T.muted,
    cursor: "pointer",
    transition: "all 0.18s",
  },
  typeBtnActive: {
    background: T.accent,
    color: "#0d1117",
    boxShadow: `0 0 16px ${T.accentGlow}`,
  },

  /* stepper */
  stepperWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 130,
  },
  stepperLabel: { fontSize: 12, fontWeight: 600, color: T.label, letterSpacing: "0.04em" },
  stepperControl: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    background: "rgba(0,0,0,0.3)",
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    overflow: "hidden",
    width: "fit-content",
  },
  stepBtn: {
    width: 36,
    height: 36,
    border: "none",
    background: "transparent",
    color: T.accent,
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  },
  stepValue: {
    minWidth: 36,
    textAlign: "center",
    fontSize: 15,
    fontWeight: 700,
    color: T.text,
    borderLeft: `1px solid ${T.border}`,
    borderRight: `1px solid ${T.border}`,
    lineHeight: "36px",
  },

  /* MCQ option list */
  optionList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 20,
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    background: "rgba(0,0,0,0.2)",
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    transition: "border-color 0.2s, background 0.2s",
  },
  optionRowCorrect: {
    borderColor: "rgba(34,197,94,0.4)",
    background: "rgba(34,197,94,0.05)",
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    fontWeight: 700,
    color: T.muted,
    flexShrink: 0,
    transition: "all 0.2s",
  },
  badgeCorrect: {
    background: T.successGlow,
    borderColor: "rgba(34,197,94,0.5)",
    color: T.success,
  },
  correctLabel: { cursor: "pointer", flexShrink: 0 },
  correctPill: {
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${T.border}`,
    color: T.muted,
    transition: "all 0.2s",
    userSelect: "none",
    whiteSpace: "nowrap",
  },
  correctPillOn: {
    background: T.successGlow,
    borderColor: "rgba(34,197,94,0.5)",
    color: T.success,
  },

  /* stem pill radios */
  pillGroup: { display: "flex", gap: 10, padding: "16px 20px 0" },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 18px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    border: `1px solid ${T.border}`,
    background: "rgba(255,255,255,0.04)",
    color: T.muted,
    cursor: "pointer",
    transition: "all 0.18s",
    userSelect: "none",
  },
  pillActive: {
    background: T.accentGlow,
    borderColor: T.borderAccent,
    color: T.accent,
  },

  /* CQ */
  cqList: { display: "flex", flexDirection: "column", gap: 16, padding: 20 },
  cqCard: {
    background: "rgba(0,0,0,0.2)",
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    overflow: "hidden",
  },
  cqCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    borderBottom: `1px solid ${T.border}`,
    background: "rgba(255,255,255,0.02)",
  },
  cqBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: T.accentGlow,
    border: `1px solid ${T.borderAccent}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    color: T.accent,
    flexShrink: 0,
  },
  cqCardTitle: { fontSize: 13, fontWeight: 600, color: T.label },
  cqFields: { display: "flex", flexDirection: "column", gap: 14, padding: 16 },

  /* footer */
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  footerMeta: { flex: 1 },
  footerHint: { fontSize: 12, color: T.muted },
};

/* ─── global css (font import + stepper hover) ───────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

  /* Stepper button hover */
  button[data-step]:hover { background: rgba(56,189,248,0.1) !important; }

  /* Section content padding for direct children of section that aren't header */
  .qf-section-body { padding: 20px; }
`;