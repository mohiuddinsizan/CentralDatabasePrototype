export default function EmptyState({ title, text }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-slate-400">{text}</p>
    </div>
  );
}