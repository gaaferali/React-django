import { Building2, FileBarChart2, HeartHandshake, Home, LogIn, LogOut, MessageSquare, Search, UserCog } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "Seeker Home", to: "/seeker/home", icon: Home },
  { label: "Search", to: "/seeker/search-for-property", icon: Search },
  { label: "Offers", to: "/seeker/offer-display", icon: Building2 },
  { label: "Owner", to: "/owner/home", icon: UserCog },
  { label: "Contact", to: "/contact", icon: MessageSquare },
  { label: "Deals", to: "/deals", icon: HeartHandshake },
  { label: "Reports", to: "/admin/reports", icon: FileBarChart2 },
  { label: "Login", to: "/login", icon: LogIn },
  { label: "Logout", to: "/logout", icon: LogOut }
];

export function AppLayout() {
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
