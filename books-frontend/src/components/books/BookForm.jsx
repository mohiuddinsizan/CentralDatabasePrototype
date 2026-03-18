import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";

const SECTION_LABELS = {
  boardAnalysis: "Board Analysis",
  tables: "Tables",
  formulas: "Formulas",
  videos: "Videos",
  figures: "Figures",
  selectedQuestions: "Question Answer",
};

export default function BookForm({ onCreated }) {
  const [sectionOptions, setSectionOptions] = useState([]);
  const [form, setForm] = useState({
    title: "",
    className: "",
    subject: "",
    description: "",
    enabledSections: [],
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/books/section-options");
      setSectionOptions(data);
    };
    load();
  }, []);

  const toggleSection = (key) => {
    setForm((prev) => ({
      ...prev,
      enabledSections: prev.enabledSections.includes(key)
        ? prev.enabledSections.filter((x) => x !== key)
        : [...prev.enabledSections, key],
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Book title is required");
      return;
    }

    if (!form.className.trim()) {
      toast.error("Class is required");
      return;
    }

    try {
      await api.post("/books", {
        title: form.title.trim(),
        className: form.className.trim(),
        subject: form.subject.trim(),
        description: form.description.trim(),
        enabledSections: form.enabledSections,
      });

      toast.success("Book created");

      setForm({
        title: "",
        className: "",
        subject: "",
        description: "",
        enabledSections: [],
      });

      onCreated?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create book");
    }
  };

  return (
    <Card>
      <h2>Create Book Skeleton</h2>

      <form onSubmit={submitHandler} className="stack mt-16">
        <div className="grid-3">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <Input
            label="Class"
            value={form.className}
            onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))}
          />
          <Input
            label="Subject"
            value={form.subject}
            onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
          />
        </div>

        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />

        <div>
          <div className="field-label">Enabled Sections</div>
          <div className="chip-wrap">
            {sectionOptions.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${
                  form.enabledSections.includes(item) ? "chip-active" : ""
                }`}
                onClick={() => toggleSection(item)}
              >
                {SECTION_LABELS[item] || item}
              </button>
            ))}
          </div>
        </div>

        <div className="right">
          <Button type="submit">Create Book</Button>
        </div>
      </form>
    </Card>
  );
}