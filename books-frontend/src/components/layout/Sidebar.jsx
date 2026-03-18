import { BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mini">BOOKS ADMIN</div>
        <div className="brand-title"></div>
      </div>

      <nav className="nav-list">
        <NavLink
          to="/books"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <BookOpen size={18} />
          <span>Books</span>
        </NavLink>
      </nav>
    </aside>
  );
}