import { Building2, FileBarChart2, HeartHandshake, Home, LogIn, LogOut, MessageSquare, Search, UserCog } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "Owner Home", to: "/owner/home", icon: Home },
  { label: "Add Property", to: "/owner/add-property", icon: Building2 },
  { label: "Manage Property", to: "/owner/manage-property", icon: UserCog },
  { label: "Contact", to: "/owner/contact", icon: MessageSquare },
  { label: "Deals", to: "/owner/deals", icon: HeartHandshake },
  { label: "Edit Profile", to: "/owner/profile/edit-information", icon: UserCog},
  { label: "Logout", to: "/owner/logout", icon: LogOut }
];

export function OwnerLayout() {
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
