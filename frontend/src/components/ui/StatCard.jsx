import Card from "./Card";

export default function StatCard({ label, value, hint }) {
  return (
    <Card className="p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-bold text-white">{value}</div>
      {hint && <div className="mt-2 text-xs text-cyan-300">{hint}</div>}
    </Card>
  );
}