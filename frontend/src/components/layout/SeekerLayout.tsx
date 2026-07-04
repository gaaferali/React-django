import { Building2, FileBarChart2, HeartHandshake, Home, LogIn, LogOut, MessageSquare, Search, UserCog } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "Seeker", to: "/seeker/home", icon: Home },
  { label: "Search", to: "/seeker/search-for-property", icon: Search },
  { label: "Offers", to: "/seeker/offer-display", icon: Building2 },
  { label: "Edit Profile", to: "/seeker/profile/edit-information", icon: UserCog},
  { label: "Contact", to: "/seeker/contact", icon: MessageSquare },
  { label: "Deals", to: "/seeker/deals", icon: HeartHandshake },
  { label: "Fair Price average", to: "/seeker/fair-price-average", icon: FileBarChart2 },
  { label: "Search Filters", to: "/seeker/search-filter", icon: Search },
  { label: "Offer Recommendation", to: "/seeker/offer-recommendation", icon: HeartHandshake },
  { label: "Logout", to: "/seeker/logout", icon: LogOut }
]; 

export function SeekerLayout() {
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
