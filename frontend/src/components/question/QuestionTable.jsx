import { Eye, Pencil, Trash2 } from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import TableShell from "../ui/TableShell";

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString();
}

export default function QuestionTable({
  questions,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <TableShell>
      <table className="min-w-full text-left">
        <thead className="border-b border-white/10 bg-white/[0.03]">
          <tr className="text-sm text-slate-400">
            <th className="px-5 py-4">Title</th>
            <th className="px-5 py-4">Type</th>
            <th className="px-5 py-4">Archive</th>
            <th className="px-5 py-4">Chapter</th>
            <th className="px-5 py-4">Uploaded By</th>
            <th className="px-5 py-4">Uploaded At</th>
            <th className="px-5 py-4">Tags</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q._id} className="border-b border-white/6 align-top">
              <td className="px-5 py-4">
                <div className="font-medium text-white">{q.title}</div>
                {q.stem && (
                  <div className="mt-1 max-w-[420px] truncate text-sm text-slate-400">
                    {q.stem}
                  </div>
                )}
              </td>
              <td className="px-5 py-4">
                <Badge className={q.type === "MCQ" ? "text-cyan-300" : "text-fuchsia-300"}>
                  {q.type}
                </Badge>
              </td>
              <td className="px-5 py-4 text-slate-300">{q.archive?.name || "-"}</td>
              <td className="px-5 py-4 text-slate-300">{q.chapter?.name || "-"}</td>
              <td className="px-5 py-4 text-slate-300">
                {q.createdBy?.name || q.createdBy?.username || "-"}
              </td>
              <td className="px-5 py-4 text-slate-300">{formatDate(q.createdAt)}</td>
              <td className="px-5 py-4">
                <div className="flex max-w-[280px] flex-wrap gap-2">
                  {q.tags?.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => onView(q)}>
                    <Eye size={15} />
                  </Button>
                  <Button variant="secondary" onClick={() => onEdit(q)}>
                    <Pencil size={15} />
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(q)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}