import {
  Database,
  FolderKanban,
  LayoutDashboard,
  PlusSquare,
  Tags,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/archives", label: "Archives", icon: FolderKanban },
  { to: "/questions", label: "Questions", icon: Database },
  { to: "/questions/upload", label: "Upload Question", icon: PlusSquare },
  { to: "/tags", label: "Manage Tags", icon: Tags },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-72 overflow-y-auto border-r border-white/10 bg-[#08111d] p-5 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
              Admin Panel
            </div>
            <h1 className="mt-2 text-2xl font-bold text-white">
              Central Database
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Question archive management
            </p>
          </div>

          <button
            type="button"
            className="rounded-xl p-2 text-slate-300 hover:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                  isActive
                    ? "border border-cyan-400/20 bg-cyan-400/12 text-cyan-300"
                    : "text-slate-300 hover:bg-white/6"
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}