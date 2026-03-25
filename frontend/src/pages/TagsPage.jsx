import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTags = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/tags");
      setTags(data);
    } catch (err) {
      toast.error("Tags load করা যায়নি");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Tag name লিখুন");
      return;
    }

    try {
      setSaving(true);
      await api.post("/tags", { name: name.trim() });
      toast.success("Tag তৈরি হয়েছে");
      setName("");
      loadTags();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Tag তৈরি করা যায়নি");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editingName.trim()) {
      toast.error("Tag name লিখুন");
      return;
    }

    try {
      await api.put(`/tags/${id}`, { name: editingName.trim() });
      toast.success("Tag আপডেট হয়েছে");
      setEditingId(null);
      setEditingName("");
      loadTags();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Tag আপডেট করা যায়নি");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("এই tag delete করতে চান?");
    if (!ok) return;

    try {
      await api.delete(`/tags/${id}`);
      toast.success("Tag delete হয়েছে");
      loadTags();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Tag delete করা যায়নি");
      console.error(err);
    }
  };

  return (
    <Card className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Manage Tags</h1>
        <p className="mt-2 text-sm text-slate-400">
          এখান থেকে admin নতুন tag বানাতে, edit করতে এবং delete করতে পারবে।
        </p>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 md:flex-row">
        <div className="flex-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="নতুন tag লিখুন"
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Add Tag"}
        </Button>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white/5">
        {loading ? (
          <div className="p-4 text-sm text-slate-400">Loading tags...</div>
        ) : tags.length === 0 ? (
          <div className="p-4 text-sm text-slate-400">No tags found</div>
        ) : (
          <div className="divide-y divide-white/10">
            {tags.map((tag) => (
              <div
                key={tag._id}
                className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
              >
                {editingId === tag._id ? (
                  <>
                    <div className="flex-1">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => handleUpdate(tag._id)}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditingName("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="font-semibold text-white">{tag.name}</div>
                      <div className="text-xs text-slate-400">{tag.slug}</div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          setEditingId(tag._id);
                          setEditingName(tag.name);
                        }}
                      >
                        Edit
                      </Button>
                      <Button type="button" onClick={() => handleDelete(tag._id)}>
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}