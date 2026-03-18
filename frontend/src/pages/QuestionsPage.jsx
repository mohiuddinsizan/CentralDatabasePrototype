import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Badge from "../components/ui/Badge";
import QuestionFilters from "../components/question/QuestionFilters";
import QuestionTable from "../components/question/QuestionTable";
import QuestionForm from "../components/question/QuestionForm";

export default function QuestionsPage() {
  const [archives, setArchives] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [tags, setTags] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    archiveId: "",
    chapterId: "",
    type: "",
    tag: "",
  });

  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const loadData = async () => {
    try {
      const [archivesRes, chaptersRes, tagsRes, questionsRes] = await Promise.all([
        api.get("/archives"),
        api.get("/chapters"),
        api.get("/questions/tags"),
        api.get("/questions"),
      ]);

      setArchives(archivesRes.data);
      setChapters(chaptersRes.data);
      setTags(tagsRes.data);
      setQuestions(questionsRes.data);
    } catch (err) {
      toast.error("Failed to load questions");
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch = filters.search
        ? q.title?.toLowerCase().includes(filters.search.toLowerCase())
        : true;

      const qArchive = q.archive?._id || q.archive;
      const qChapter = q.chapter?._id || q.chapter;

      const matchArchive = filters.archiveId ? qArchive === filters.archiveId : true;
      const matchChapter = filters.chapterId ? qChapter === filters.chapterId : true;
      const matchType = filters.type ? q.type === filters.type : true;
      const matchTag = filters.tag ? q.tags?.includes(filters.tag) : true;

      return matchSearch && matchArchive && matchChapter && matchType && matchTag;
    });
  }, [questions, filters]);

  const confirmDelete = async () => {
    if (!deleteItem) return;

    try {
      await api.delete(`/questions/${deleteItem._id}`);
      toast.success("Question deleted");
      setDeleteItem(null);
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete question");
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      <QuestionFilters
        filters={filters}
        setFilters={setFilters}
        archives={archives}
        chapters={chapters}
        tags={tags}
      />

      {filteredQuestions.length === 0 ? (
        <EmptyState title="No questions found" text="Try changing filters or add new questions." />
      ) : (
        <QuestionTable
          questions={filteredQuestions}
          onView={setViewItem}
          onEdit={setEditItem}
          onDelete={setDeleteItem}
        />
      )}

      <Modal open={!!viewItem} title="Question Details" onClose={() => setViewItem(null)}>
        {viewItem && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge>{viewItem.type}</Badge>
              {viewItem.tags?.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-white">{viewItem.title}</h3>
              <p className="mt-2 text-sm text-slate-400">
                Archive: {viewItem.archive?.name} | Chapter: {viewItem.chapter?.name}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Uploaded by {viewItem.createdBy?.name || viewItem.createdBy?.username || "-"} on{" "}
                {viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleString() : "-"}
              </p>
            </div>

            {viewItem.stem && (
              <Card className="p-4">
                <div className="text-sm text-slate-400">Stem</div>
                <div className="mt-2 whitespace-pre-wrap text-slate-200">
                  {viewItem.stem}
                </div>
              </Card>
            )}

            {viewItem.type === "MCQ" && (
              <Card className="p-4">
                <div className="text-sm text-slate-400">Options</div>
                <div className="mt-3 space-y-2">
                  {viewItem.mcqOptions?.map((opt) => (
                    <div
                      key={opt.key}
                      className={`rounded-2xl border p-3 ${
                        opt.isCorrect
                          ? "border-cyan-400/25 bg-cyan-400/10"
                          : "border-white/10 bg-white/[0.03]"
                      }`}
                    >
                      <span className="font-medium text-white">{opt.key}.</span>{" "}
                      <span className="text-slate-300">{opt.text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {viewItem.type === "CQ" && (
              <Card className="p-4">
                <div className="text-sm text-slate-400">CQ Parts</div>
                <div className="mt-3 space-y-3">
                  {viewItem.cqParts?.map((part, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 p-4">
                      <div className="text-cyan-300">Part {part.label}</div>
                      <div className="mt-2 whitespace-pre-wrap text-slate-200">
                        {part.question}
                      </div>
                      <div className="mt-3 text-sm text-slate-400">Answer</div>
                      <div className="mt-1 whitespace-pre-wrap text-slate-300">
                        {part.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {viewItem.explanation && (
              <Card className="p-4">
                <div className="text-sm text-slate-400">Explanation</div>
                <div className="mt-2 whitespace-pre-wrap text-slate-200">
                  {viewItem.explanation}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>

      <Modal open={!!editItem} title="Edit Question" onClose={() => setEditItem(null)}>
        {editItem && (
          <QuestionForm
            mode="edit"
            initialData={editItem}
            onSuccess={() => {
              setEditItem(null);
              loadData();
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteItem}
        title="Delete Question"
        text="This action will permanently remove the selected question."
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}