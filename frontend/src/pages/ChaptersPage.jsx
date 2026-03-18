import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";

export default function ChaptersPage() {
  const [archives, setArchives] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [form, setForm] = useState({
    archiveId: "",
    name: "",
    order: 1,
  });

  const loadData = async () => {
    const [archivesRes, chaptersRes] = await Promise.all([
      api.get("/archives"),
      api.get("/chapters"),
    ]);
    setArchives(archivesRes.data);
    setChapters(chaptersRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    await api.post("/chapters", { ...form, order: Number(form.order) });
    toast.success("Chapter created");
    setForm({ archiveId: "", name: "", order: 1 });
    loadData();
  };

  const deleteChapter = async () => {
    if (!selectedChapter) return;
    await api.delete(`/chapters/${selectedChapter._id}`);
    toast.success("Chapter deleted");
    setConfirmOpen(false);
    setSelectedChapter(null);
    loadData();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white">Create Chapter</h2>
        <form className="mt-5 space-y-4" onSubmit={submitHandler}>
          <Select
            label="Archive"
            value={form.archiveId}
            onChange={(e) => setForm({ ...form, archiveId: e.target.value })}
          >
            <option value="">Select archive</option>
            {archives.map((archive) => (
              <option key={archive._id} value={archive._id}>
                {archive.name} - Class {archive.className}
              </option>
            ))}
          </Select>

          <Input
            label="Chapter Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter chapter title"
          />

          <Input
            label="Order"
            type="number"
            min="1"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.value })}
          />

          <Button type="submit">Create Chapter</Button>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Chapters</h2>
        {chapters.length === 0 ? (
          <EmptyState title="No chapters yet" text="Create your first chapter." />
        ) : (
          chapters.map((chapter) => (
            <Card key={chapter._id} className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{chapter.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Archive: {chapter.archive?.name} | Class {chapter.archive?.className}
                  </p>
                  <p className="mt-2 text-sm text-cyan-300">Order: {chapter.order}</p>
                </div>

                <Button
                  variant="danger"
                  onClick={() => {
                    setSelectedChapter(chapter);
                    setConfirmOpen(true);
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Chapter"
        text="This will remove the chapter."
        onClose={() => setConfirmOpen(false)}
        onConfirm={deleteChapter}
      />
    </div>
  );
}