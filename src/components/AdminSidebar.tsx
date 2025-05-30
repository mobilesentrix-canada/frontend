import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Settings, Users, List, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Stores", href: "/admin/stores", icon: Settings },
  { name: "Members", href: "/admin/members", icon: Users },
  { name: "Orders", href: "/admin/orders", icon: List },
];

export function AdminSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex flex-col gap-1 h-20 px-6 border-b border-gray-200 justify-center">
        <h2 className="text-xl font-bold text-gray-900">MS Admin Portal</h2>
        {user && (
          <p className="text-sm text-gray-600 truncate">
            Welcome, <span className="font-semibold">{user.name}</span>
          </p>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                active
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="px-6 py-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-red-600 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Logout"
            title="Logout"
            type="button"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
