export default function Select({ label, children, ...props }) {
  return (
    <label className="block">
      {label && <div className="mb-2 text-sm text-slate-300">{label}</div>}
      <select
        {...props}
        className="w-full rounded-2xl border border-white/10 bg-[#0c1726] px-4 py-3 text-white outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {children}
      </select>
    </label>
  );
}