import { LogOut, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";

const titles = {
  "/": "Dashboard",
  "/archives": "Archives",
  "/chapters": "Chapters",
  "/questions": "Questions",
  "/questions/upload": "Upload Question",
};

export default function Topbar({ setMobileOpen }) {
  const { admin, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07111f]/85 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>

          <div>
            <div className="text-lg font-semibold text-white">
              {titles[location.pathname] || "Admin Panel"}
            </div>
            <div className="text-sm text-slate-400">
              Logged in as {admin?.username}
            </div>
          </div>
        </div>

        <Button variant="secondary" onClick={logout}>
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </header>
  );
}