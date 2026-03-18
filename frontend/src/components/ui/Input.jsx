export default function Input({ label, ...props }) {
  return (
    <label className="block">
      {label && <div className="mb-2 text-sm text-slate-300">{label}</div>}
      <input
        {...props}
        className="w-full rounded-2xl border border-white/10 bg-[#0c1726] px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
      />
    </label>
  );
}