import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { admin, logout } = useAuth();

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">Books Management</div>
        <div className="topbar-subtitle">
          Logged in as {admin?.username || "admin"}
        </div>
      </div>

      <button className="btn btn-secondary" onClick={logout}>
        <LogOut size={16} />
        Logout
      </button>
    </header>
  );
}