import { useEffect, useState } from "react";
import api from "../api/axios";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    archives: 0,
    chapters: 0,
    questions: 0,
  });

  useEffect(() => {
    const load = async () => {
      const [archivesRes, chaptersRes, questionsRes] = await Promise.all([
        api.get("/archives"),
        api.get("/chapters"),
        api.get("/questions"),
      ]);

      setStats({
        archives: archivesRes.data.length,
        chapters: chaptersRes.data.length,
        questions: questionsRes.data.length,
      });
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Overview</h2>
        <p className="mt-2 text-slate-400">
          Premium admin dashboard for managing archives, chapters, and questions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Archives" value={stats.archives} hint="Organized by class" />
        <StatCard label="Chapters" value={stats.chapters} hint="Inside archives" />
        <StatCard label="Questions" value={stats.questions} hint="MCQ + CQ combined" />
      </div>

      {/* <Card className="p-6">
        <h3 className="text-xl font-semibold text-white">System Highlights</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-300">
            Dynamic question builder for MCQ and CQ.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-300">
            Fixed tag selection and archive-based chapter organization.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-300">
            Seeded admin-only authentication.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-300">
            Clean premium UI with mobile sidebar and modals.
          </div>
        </div>
      </Card> */}
    </div>
  );
}