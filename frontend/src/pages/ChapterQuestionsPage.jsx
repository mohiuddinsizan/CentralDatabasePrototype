import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  FileText,
  FolderKanban,
  Hash,
  Library,
  ListChecks,
  Tag,
  User,
  Calendar,
  Layers,
} from "lucide-react";
import api from "../api/axios";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Stat chip ─────────────────────────────────────────────────
function StatChip({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent ?? "bg-white/[0.07]"}`}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </div>
  );
}

// ── MCQ card ──────────────────────────────────────────────────
// Uses: question.mcqOptions[{ key, text, isCorrect }]
//       question.stem, question.answerText, question.explanation, question.tags
function MCQCard({ question }) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/15 px-2.5 py-1 text-xs font-semibold text-sky-300">
          <ListChecks size={12} />
          MCQ
        </span>
        {question.tags?.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-white/[0.06] px-2 py-1 text-xs text-slate-400">
            <Tag size={10} />
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold leading-snug text-white">{question.title}</h3>

      {/* Stem */}
      {question.stem && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{question.stem}</p>
      )}

      {/* Options */}
      {question.mcqOptions?.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {question.mcqOptions.map((opt) => (
            <div
              key={opt.key}
              className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                opt.isCorrect
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-white/10 bg-white/[0.03] text-slate-300"
              }`}
            >
              <span className={`mt-0.5 w-5 shrink-0 font-mono text-xs font-bold ${opt.isCorrect ? "text-emerald-400" : "text-slate-500"}`}>
                {opt.key}
              </span>
              <span className="flex-1 leading-snug">{opt.text}</span>
              {opt.isCorrect && <span className="ml-auto shrink-0 text-xs font-bold text-emerald-400">✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* Answer text */}
      {question.answerText && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-sm text-emerald-300">
          <span className="font-semibold">Answer: </span>{question.answerText}
        </div>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-sm text-amber-300">
          <span className="font-semibold">Explanation: </span>{question.explanation}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <User size={11} />
          {question.createdBy?.name || question.createdBy?.username || "Unknown"}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {formatDate(question.createdAt)}
        </span>
      </div>
    </Card>
  );
}

// ── CQ card ───────────────────────────────────────────────────
// Uses: question.cqParts[{ label, question, answer }]
//       question.stem, question.answerText, question.explanation, question.tags
function CQCard({ question }) {
  const [shownAnswers, setShownAnswers] = useState({});
  const toggle = (label) => setShownAnswers((p) => ({ ...p, [label]: !p[label] }));

  return (
    <Card className="flex flex-col gap-4 p-5">
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-300">
          <FileText size={12} />
          CQ
        </span>
        {question.tags?.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-white/[0.06] px-2 py-1 text-xs text-slate-400">
            <Tag size={10} />
            {tag}
          </span>
        ))}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold leading-snug text-white">{question.title}</h3>

      {/* Stem / passage */}
      {question.stem && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Stem</div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{question.stem}</p>
        </div>
      )}

      {/* Parts — cqParts[{ label, question, answer }] */}
      {question.cqParts?.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Questions</div>
          {question.cqParts.map((part) => {
            const hasAnswer = !!part.answer?.trim();
            const answerOpen = !!shownAnswers[part.label];

            return (
              <div key={part.label} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                {/* Part question row */}
                <div className="flex items-start gap-3 px-3 py-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-violet-500/20 text-xs font-bold text-violet-300">
                    {part.label}
                  </span>
                  <p className="flex-1 text-sm leading-snug text-slate-200">{part.question}</p>
                  {hasAnswer && (
                    <button
                      onClick={() => toggle(part.label)}
                      className="shrink-0 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                    >
                      {answerOpen ? "Hide" : "Answer"}
                    </button>
                  )}
                </div>

                {/* Collapsible answer */}
                {hasAnswer && answerOpen && (
                  <div className="border-t border-white/10 bg-emerald-500/5 px-3 py-3">
                    <div className="mb-1 text-xs font-semibold text-emerald-500">Answer</div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-emerald-200">{part.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Overall answer */}
      {question.answerText && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-sm text-emerald-300">
          <span className="font-semibold">Answer: </span>{question.answerText}
        </div>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-sm text-amber-300">
          <span className="font-semibold">Explanation: </span>{question.explanation}
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <User size={11} />
          {question.createdBy?.name || question.createdBy?.username || "Unknown"}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {formatDate(question.createdAt)}
        </span>
      </div>
    </Card>
  );
}

// ── Empty state ───────────────────────────────────────────────
function EmptyQuestions({ type }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 py-16 text-center">
      {type === "MCQ" ? (
        <ListChecks size={36} className="mb-4 text-slate-600" />
      ) : (
        <FileText size={36} className="mb-4 text-slate-600" />
      )}
      <p className="text-base font-medium text-slate-400">No {type} questions yet</p>
      <p className="mt-1 text-sm text-slate-600">Upload questions and assign them to this chapter.</p>
    </div>
  );
}

// ── Tabs config ───────────────────────────────────────────────
const TABS = [
  { key: "ALL", label: "All" },
  { key: "MCQ", label: "MCQ", icon: ListChecks },
  { key: "CQ", label: "CQ", icon: FileText },
];

// ── Page ──────────────────────────────────────────────────────
export default function ChapterQuestionsPage() {
  const { archiveId, chapterId } = useParams();
  const navigate = useNavigate();

  const [archive, setArchive] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [archivesRes, chaptersRes, questionsRes] = await Promise.all([
          api.get("/archives"),
          api.get("/chapters"),
          api.get("/questions"),
        ]);

        const foundArchive = archivesRes.data.find((a) => a._id === archiveId);
        const foundChapter = chaptersRes.data.find((c) => c._id === chapterId);

        if (!foundArchive || !foundChapter) {
          toast.error("Archive or chapter not found");
          return;
        }

        setArchive(foundArchive);
        setChapter(foundChapter);

        const chapterQuestions = questionsRes.data.filter((q) => {
          const qChapterId = q.chapter?._id || q.chapter;
          return qChapterId === chapterId;
        });
        setQuestions(chapterQuestions);
      } catch (err) {
        toast.error("Failed to load chapter questions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [archiveId, chapterId]);

  const mcqQuestions = useMemo(() => questions.filter((q) => q.type === "MCQ"), [questions]);
  const cqQuestions = useMemo(() => questions.filter((q) => q.type === "CQ"), [questions]);

  const visibleQuestions = useMemo(() => {
    if (activeTab === "MCQ") return mcqQuestions;
    if (activeTab === "CQ") return cqQuestions;
    return questions;
  }, [activeTab, questions, mcqQuestions, cqQuestions]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <button onClick={() => navigate("/archives")} className="flex items-center gap-1.5 hover:text-white transition-colors">
          <FolderKanban size={14} />
          Archives
        </button>
        <ChevronRight size={14} className="text-slate-600" />
        <span className="flex items-center gap-1.5 text-slate-300">
          <FolderKanban size={14} />
          {archive?.name ?? "…"}
        </span>
        <ChevronRight size={14} className="text-slate-600" />
        <span className="flex items-center gap-1.5 font-medium text-white">
          <Library size={14} />
          {chapter?.name ?? "…"}
        </span>
      </div>

      {/* Chapter header */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07]">
              <Library size={18} className="text-slate-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{chapter?.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-1"><FolderKanban size={12} />{archive?.name}</span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1"><BookOpen size={12} />Class {archive?.className}</span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1"><Hash size={12} />Order {chapter?.order}</span>
              </div>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate("/archives")}>
            <ArrowLeft size={14} />
            Back to Archives
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatChip icon={Layers} label="Total" value={questions.length} accent="bg-white/[0.07]" />
          <StatChip icon={ListChecks} label="MCQ" value={mcqQuestions.length} accent="bg-sky-500/20" />
          <StatChip icon={FileText} label="CQ" value={cqQuestions.length} accent="bg-violet-500/20" />
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const count = tab.key === "MCQ" ? mcqQuestions.length : tab.key === "CQ" ? cqQuestions.length : questions.length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab.key ? "bg-white/[0.10] text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {Icon && <Icon size={14} />}
              {tab.label}
              <span className={`rounded-md px-1.5 py-0.5 text-xs font-mono ${activeTab === tab.key ? "bg-white/10 text-white" : "bg-white/[0.04] text-slate-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Question grid */}
      {visibleQuestions.length === 0 ? (
        <EmptyQuestions type={activeTab === "ALL" ? "MCQ / CQ" : activeTab} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleQuestions.map((question) =>
            question.type === "MCQ" ? (
              <MCQCard key={question._id} question={question} />
            ) : (
              <CQCard key={question._id} question={question} />
            )
          )}
        </div>
      )}
    </div>
  );
}