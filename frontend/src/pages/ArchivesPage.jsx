import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  BookOpen,
  Plus,
  X,
  ListChecks,
  FileText,
  ArrowRight,
} from "lucide-react";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import ConfirmDialog from "../components/ui/ConfirmDialog";

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

function normalizeClassName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function extractSortableClassValue(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/\d+(\.\d+)?/);
  if (match) return Number(match[0]);
  return null;
}

function getDisplayClassName(value) {
  const raw = String(value || "").trim().replace(/\s+/g, " ");
  if (!raw) return "Unclassified";

  const num = extractSortableClassValue(raw);
  if (num !== null) return `Class ${num}`;

  return raw
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function compareClassGroups(a, b) {
  const aNum = extractSortableClassValue(a.rawClassName);
  const bNum = extractSortableClassValue(b.rawClassName);

  if (aNum !== null && bNum !== null) return aNum - bNum;
  if (aNum !== null) return -1;
  if (bNum !== null) return 1;

  return a.displayClassName.localeCompare(b.displayClassName);
}

function compareArchivesWithinGroup(a, b) {
  const nameCompare = String(a.name || "").localeCompare(String(b.name || ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });

  if (nameCompare !== 0) return nameCompare;

  return String(a._id).localeCompare(String(b._id));
}

function ArchiveBook({ archive, index, isSelected, onClick, onDeleteClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative shrink-0 cursor-pointer select-none"
      style={{ width: 160 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        onClick={onClick}
        className="relative overflow-hidden rounded-lg transition-all duration-300"
        style={{
          height: 230,
          transform: isSelected
            ? "translateY(-10px) scale(1.05)"
            : hovered
            ? "translateY(-6px) scale(1.03)"
            : "none",
          boxShadow: isSelected
            ? "0 20px 40px rgba(0,0,0,0.8), -3px 0 0 rgba(255,255,255,0.1), 0 0 0 2px rgba(255,255,255,0.15)"
            : hovered
            ? "8px 12px 28px rgba(0,0,0,0.7), -2px 0 0 rgba(255,255,255,0.07)"
            : "4px 8px 18px rgba(0,0,0,0.55), -2px 0 0 rgba(255,255,255,0.04)",
        }}
      >
        <img
          src={getCover(index)}
          alt={archive.name}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/70 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <div className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
          {getDisplayClassName(archive.className)}
        </div>

        {isSelected && <div className="absolute inset-x-0 bottom-0 h-1 bg-white" />}

        <button
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600/80 opacity-0 backdrop-blur-sm transition-opacity hover:bg-red-500"
          style={{ opacity: hovered ? 1 : 0 }}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick();
          }}
        >
          <Trash2 size={11} className="text-white" />
        </button>

        <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
          <div className="flex items-center justify-between text-[10px] text-slate-300">
            <span>{archive.chapters.length} ch.</span>
            <span>{archive.totalQuestions} qs.</span>
          </div>
        </div>
      </div>

      <div className="mt-2.5 px-0.5 text-center">
        <p className="line-clamp-2 text-xs font-semibold leading-snug text-slate-200">
          {archive.name}
        </p>
      </div>
    </div>
  );
}

function BookShelf({ children, count }) {
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
  }, [count]);

  const scroll = (dir) =>
    ref.current?.scrollBy({ left: dir * 560, behavior: "smooth" });

  return (
    <div className="relative px-2">
      {canLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute -left-1 top-[100px] z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#080f1e] shadow-xl transition-colors hover:bg-white/10"
        >
          <ChevronLeft size={16} className="text-slate-300" />
        </button>
      )}

      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto py-4 pl-1 pr-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      {canRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute -right-1 top-[100px] z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#080f1e] shadow-xl transition-colors hover:bg-white/10"
        >
          <ChevronRight size={16} className="text-slate-300" />
        </button>
      )}
    </div>
  );
}

function ArchivePanel({
  archive,
  onClose,
  onAddChapter,
  chapterForm,
  onChapterFormChange,
  onDeleteChapter,
  navigate,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold text-white">{archive.name}</h3>
            <span className="rounded-lg bg-cyan-500/15 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
              {getDisplayClassName(archive.className)}
            </span>
          </div>
          {archive.description && (
            <p className="mt-1.5 text-sm text-slate-400">{archive.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-xl border border-white/10 p-1.5 text-slate-400 transition-colors hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm">
          <BookOpen size={13} className="text-slate-400" />
          <span className="font-semibold text-white">{archive.chapters.length}</span>
          <span className="text-slate-400">chapters</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm">
          <ListChecks size={13} className="text-slate-400" />
          <span className="font-semibold text-white">{archive.totalQuestions}</span>
          <span className="text-slate-400">questions</span>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <p className="mb-3 text-sm font-semibold text-slate-300">Add Chapter</p>
        <div className="flex flex-wrap gap-3">
          <div className="min-w-[180px] flex-1">
            <Input
              label="Chapter Name"
              value={chapterForm.name}
              onChange={(e) => onChapterFormChange("name", e.target.value)}
              placeholder="e.g. Trigonometry"
            />
          </div>
          <div className="w-24">
            <Input
              label="Order"
              type="number"
              min="1"
              value={chapterForm.order}
              onChange={(e) => onChapterFormChange("order", e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={onAddChapter}>
              <Plus size={14} />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {archive.chapters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-8 text-center text-sm text-slate-500">
            No chapters yet — add one above.
          </div>
        ) : (
          archive.chapters.map((ch) => (
            <div
              key={ch._id}
              className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.05]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-bold text-slate-400">
                {ch.order}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{ch.name}</p>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <ListChecks size={10} />
                    {ch.mcqCount} MCQ
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={10} />
                    {ch.cqCount} CQ
                  </span>
                  <span>{ch.totalCount} total</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() =>
                    navigate(`/archives/${archive._id}/chapters/${ch._id}`)
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.12]"
                >
                  View <ArrowRight size={11} />
                </button>
                <button
                  onClick={() => onDeleteChapter(ch)}
                  className="flex h-7 w-7 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function ArchivesPage() {
  const navigate = useNavigate();

  const [archives, setArchives] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [archiveForm, setArchiveForm] = useState({
    name: "",
    className: "",
    description: "",
  });
  const [chapterForms, setChapterForms] = useState({});

  const [selectedArchiveId, setSelectedArchiveId] = useState(null);

  const [deleteArchiveOpen, setDeleteArchiveOpen] = useState(false);
  const [deleteChapterOpen, setDeleteChapterOpen] = useState(false);
  const [targetArchive, setTargetArchive] = useState(null);
  const [targetChapter, setTargetChapter] = useState(null);

  const loadData = async () => {
    try {
      const [a, c, q] = await Promise.all([
        api.get("/archives"),
        api.get("/chapters"),
        api.get("/questions"),
      ]);
      setArchives(a.data);
      setChapters(c.data);
      setQuestions(q.data);
    } catch {
      toast.error("Failed to load archives");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const structuredArchives = useMemo(() => {
    return archives
      .map((archive, idx) => {
        const archiveChapters = chapters
          .filter((ch) => (ch.archive?._id || ch.archive) === archive._id)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const structured = archiveChapters.map((ch) => {
          const qs = questions.filter(
            (q) => (q.chapter?._id || q.chapter) === ch._id
          );

          return {
            ...ch,
            mcqCount: qs.filter((q) => q.type === "MCQ").length,
            cqCount: qs.filter((q) => q.type === "CQ").length,
            totalCount: qs.length,
          };
        });

        return {
          ...archive,
          coverIndex: idx,
          chapters: structured,
          totalQuestions: structured.reduce((s, c) => s + c.totalCount, 0),
        };
      })
      .sort((a, b) => {
        const aNum = extractSortableClassValue(a.className);
        const bNum = extractSortableClassValue(b.className);

        if (aNum !== null && bNum !== null && aNum !== bNum) return aNum - bNum;
        if (aNum !== null && bNum === null) return -1;
        if (aNum === null && bNum !== null) return 1;

        const classCompare = normalizeClassName(a.className).localeCompare(
          normalizeClassName(b.className)
        );
        if (classCompare !== 0) return classCompare;

        return compareArchivesWithinGroup(a, b);
      });
  }, [archives, chapters, questions]);

  const groupedArchives = useMemo(() => {
    const map = new Map();

    structuredArchives.forEach((archive) => {
      const rawClassName = String(archive.className || "").trim();
      const normalizedKey = normalizeClassName(rawClassName) || "unclassified";

      if (!map.has(normalizedKey)) {
        map.set(normalizedKey, {
          key: normalizedKey,
          rawClassName,
          displayClassName: getDisplayClassName(rawClassName),
          archives: [],
        });
      }

      map.get(normalizedKey).archives.push(archive);
    });

    return Array.from(map.values())
      .map((group) => ({
        ...group,
        archives: [...group.archives].sort(compareArchivesWithinGroup),
      }))
      .sort(compareClassGroups);
  }, [structuredArchives]);

  const totalArchiveCount = structuredArchives.length;

  const selectedArchive =
    structuredArchives.find((a) => a._id === selectedArchiveId) || null;

  const handleCreateArchive = async (e) => {
    e.preventDefault();

    if (!archiveForm.name.trim()) return toast.error("Archive name is required");
    if (!archiveForm.className.trim()) return toast.error("Class is required");

    try {
      await api.post("/archives", {
        name: archiveForm.name.trim(),
        className: archiveForm.className.trim(),
        description: archiveForm.description.trim(),
      });

      toast.success("Archive created");
      setArchiveForm({ name: "", className: "", description: "" });
      setShowCreateForm(false);
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create archive");
    }
  };

  const handleAddChapter = async (archiveId) => {
    const form = chapterForms[archiveId] || { name: "", order: 1 };

    if (!form.name?.trim()) return toast.error("Chapter name is required");

    try {
      await api.post("/chapters", {
        archiveId,
        name: form.name.trim(),
        order: Number(form.order) || 1,
      });

      toast.success("Chapter created");
      setChapterForms((p) => ({ ...p, [archiveId]: { name: "", order: 1 } }));
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create chapter");
    }
  };

  const handleDeleteArchive = async () => {
    if (!targetArchive) return;

    try {
      await api.delete(`/archives/${targetArchive._id}`);
      toast.success("Archive deleted");

      if (selectedArchiveId === targetArchive._id) {
        setSelectedArchiveId(null);
      }

      setDeleteArchiveOpen(false);
      setTargetArchive(null);
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete archive");
    }
  };

  const handleDeleteChapter = async () => {
    if (!targetChapter) return;

    try {
      await api.delete(`/chapters/${targetChapter._id}`);
      toast.success("Chapter deleted");
      setDeleteChapterOpen(false);
      setTargetChapter(null);
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete chapter");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Archives</h1>
          <p className="mt-1 text-sm text-slate-400">
            {totalArchiveCount} archive{totalArchiveCount !== 1 ? "s" : ""} · grouped automatically by class name
          </p>
        </div>
        <Button onClick={() => setShowCreateForm((p) => !p)}>
          <Plus size={15} />
          New Archive
        </Button>
      </div>

      {showCreateForm && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Create Archive</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="rounded-xl border border-white/10 p-1.5 text-slate-400 transition-colors hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <form className="grid gap-4 md:grid-cols-3" onSubmit={handleCreateArchive}>
            <Input
              label="Archive Name"
              value={archiveForm.name}
              onChange={(e) =>
                setArchiveForm((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="e.g. SSC 2026"
            />

            <Input
              label="Class"
              value={archiveForm.className}
              onChange={(e) =>
                setArchiveForm((p) => ({ ...p, className: e.target.value }))
              }
              placeholder="e.g. 10 / class 10 / HSC 1st Year"
            />

            <div className="md:col-span-3">
              <Textarea
                label="Description (optional)"
                value={archiveForm.description}
                onChange={(e) =>
                  setArchiveForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Write archive description"
              />
            </div>

            <div className="flex justify-end md:col-span-3">
              <Button type="submit">Create Archive</Button>
            </div>
          </form>
        </div>
      )}

      {groupedArchives.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 py-20 text-center">
          <BookOpen size={40} className="mb-4 text-slate-600" />
          <p className="text-base font-semibold text-slate-400">No archives yet</p>
          <p className="mt-1 text-sm text-slate-600">
            Click "New Archive" to get started.
          </p>
        </div>
      ) : (
        <>
          {groupedArchives.map((group, groupIndex) => (
            <div
              key={group.key}
              className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 pb-4"
            >
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                    Class Section
                  </div>
                  <h2 className="mt-1 text-xl font-bold text-white">
                    {group.displayClassName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {group.archives.length} archive
                    {group.archives.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
                  Organized automatically from archive class names
                </div>
              </div>

              <BookShelf count={group.archives.length}>
                {group.archives.map((archive, archiveIndex) => (
                  <ArchiveBook
                    key={archive._id}
                    archive={archive}
                    index={groupIndex * 20 + archiveIndex}
                    isSelected={selectedArchiveId === archive._id}
                    onClick={() =>
                      setSelectedArchiveId((prev) =>
                        prev === archive._id ? null : archive._id
                      )
                    }
                    onDeleteClick={() => {
                      setTargetArchive(archive);
                      setDeleteArchiveOpen(true);
                    }}
                  />
                ))}
              </BookShelf>

              <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-white/[0.03] via-white/[0.07] to-white/[0.03]" />
            </div>
          ))}

          {selectedArchive && (
            <ArchivePanel
              archive={selectedArchive}
              onClose={() => setSelectedArchiveId(null)}
              chapterForm={chapterForms[selectedArchive._id] || { name: "", order: 1 }}
              onChapterFormChange={(field, value) =>
                setChapterForms((p) => ({
                  ...p,
                  [selectedArchive._id]: {
                    ...(p[selectedArchive._id] || { name: "", order: 1 }),
                    [field]: value,
                  },
                }))
              }
              onAddChapter={() => handleAddChapter(selectedArchive._id)}
              onDeleteChapter={(ch) => {
                setTargetChapter(ch);
                setDeleteChapterOpen(true);
              }}
              navigate={navigate}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteArchiveOpen}
        title="Delete Archive"
        text="This will remove the archive. Delete related chapters and questions first if your backend blocks archive deletion."
        onClose={() => setDeleteArchiveOpen(false)}
        onConfirm={handleDeleteArchive}
      />

      <ConfirmDialog
        open={deleteChapterOpen}
        title="Delete Chapter"
        text="This will remove the chapter. Delete related questions first if your backend blocks chapter deletion."
        onClose={() => setDeleteChapterOpen(false)}
        onConfirm={handleDeleteChapter}
      />
    </div>
  );
}