import { Building2, FileBarChart2, HeartHandshake, Home, LogIn, LogOut, MessageSquare, Search, UserCog } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "Dashboard ", to: "/admin/dashboard", icon: Home },
  { label: "Reports", to: "/admin/reports", icon: FileBarChart2 },
  { label: "Logout", to: "/admin/logout", icon: LogOut }
];

export function AdminLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="AMAN navigation">
        <div className="brand-block">
          <div className="brand-mark">A</div>
          <div>
            <strong>AMAN</strong>
            <span>Real Estate</span>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="workspace">
        <Outlet />
      </main>
    </div>
  );
}
