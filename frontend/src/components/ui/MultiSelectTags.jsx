export default function MultiSelectTags({ tags = [], value = [], onChange }) {
  const toggleTag = (tag) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  };

  return (
    <div>
      <div className="mb-3 text-sm text-slate-300">Tags</div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const active = value.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                active
                  ? "border-cyan-400 bg-cyan-400/15 text-cyan-300"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}