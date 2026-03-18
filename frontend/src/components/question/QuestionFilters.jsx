import Card from "../ui/Card";
import Input from "../ui/Input";
import Select from "../ui/Select";

export default function QuestionFilters({
  filters,
  setFilters,
  archives,
  chapters,
  tags,
}) {
  const filteredChapters = filters.archiveId
    ? chapters.filter(
        (ch) => ch.archive?._id === filters.archiveId || ch.archive === filters.archiveId
      )
    : chapters;

  return (
    <Card className="p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Input
          label="Search Title"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search question title"
        />

        <Select
          label="Archive"
          value={filters.archiveId}
          onChange={(e) =>
            setFilters({
              ...filters,
              archiveId: e.target.value,
              chapterId: "",
            })
          }
        >
          <option value="">All Archives</option>
          {archives.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </Select>

        <Select
          label="Chapter"
          value={filters.chapterId}
          onChange={(e) => setFilters({ ...filters, chapterId: e.target.value })}
        >
          <option value="">All Chapters</option>
          {filteredChapters.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          label="Type"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="MCQ">MCQ</option>
          <option value="CQ">CQ</option>
        </Select>

        <Select
          label="Tag"
          value={filters.tag}
          onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
        >
          <option value="">All Tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </Select>
      </div>
    </Card>
  );
}