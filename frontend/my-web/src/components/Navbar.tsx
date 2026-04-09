import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { LogOut, Shield, Video, Users, Menu, X, Settings } from "lucide-react";
import { useState } from "react";
import { ROLE_PERMISSIONS } from "../data/mockData";
import IvertoLogo from "./IvertoLogo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const permissions = ROLE_PERMISSIONS[user.role];

  const roleBadgeColor: Record<string, string> = {
    admin: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    staff: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    parent: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  };

  const navLinks = [
    { to: "/dashboard", label: "Live Feed", icon: Video, roles: ["admin", "staff", "parent"] },
    { to: "/students", label: "Students", icon: Users, roles: ["admin", "staff"] },
    ...(permissions.canAccessSettings
      ? [{ to: "/settings", label: "Settings", icon: Settings, roles: ["admin"] }]
      : []),
  ];

  const visibleLinks = navLinks.filter((l) => l.roles.includes(user.role));

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow p-1">
              <IvertoLogo size={28} />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                iverto<span className="text-[#E31B54]">.ai</span>
              </span>
              <span className="hidden sm:block text-[10px] text-gray-400 -mt-1 tracking-wide uppercase">Smart Monitor</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-gray-900 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User Info & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadgeColor[user.role]}`}>
                <Shield className="w-2.5 h-2.5" />
                {user.role}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold">
              {user.name.split(" ").map(n => n[0]).join("")}
            </div>
            <button
              id="logout-button"
              onClick={handleLogout}
              className="ml-1 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          {visibleLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="border-t border-gray-100 pt-2 mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${roleBadgeColor[user.role]}`}>
                  <Shield className="w-2.5 h-2.5" />
                  {user.role}
                </span>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg text-red-500 hover:bg-red-50">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
