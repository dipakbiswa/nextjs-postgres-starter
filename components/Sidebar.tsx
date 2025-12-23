"use client";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Ticket,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Menu,
  X,
  Bot,
  BriefcaseMedicalIcon,
} from "lucide-react";
import { hr, ro } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/logout";

export default function Sidebar({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const router = useRouter();

  const handleSignOut = () => {
    const logout = async () => {
      await fetch("/api/logout", {
        method: "POST",
      });
      // Optionally, redirect to home or login page after logout
      window.location.href = "/";
    };
    logout();
  };

  const menuItems = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
    },
    { id: "ai-agent", icon: Bot, label: "AI Agent", href: "/ai-agent" },
    { id: "doctors", icon: Users, label: "Doctors", href: "/doctors" },
    {
      id: "pathology-lab",
      icon: BriefcaseMedicalIcon,
      label: "Pathology Lab",
      href: "/pathology-lab",
    },
    { id: "e-pharacy", icon: Settings, label: "E Pharacy", href: "/e-pharacy" },
    { id: "emergency", icon: Settings, label: "Emergency", href: "/emergency" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        ${collapsed ? "w-20" : "w-64"} 
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out
      `}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S-AI</span>
              </div>
              <span className="font-semibold text-gray-800">
                {process.env.NEXT_PUBLIC_APP_NAME}
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="p-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                  router.push(item.href);
                }}
                className={`
                  w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                  ${collapsed ? "justify-center" : "justify-start"}
                `}
              >
                <Icon size={20} className={collapsed ? "" : "mr-3"} />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "space-x-3"
            }`}
          >
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
              alt="User"
              className="w-10 h-10 rounded-full ring-2 ring-gray-200"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg lg:text-xl font-semibold text-gray-800 capitalize">
              {activeTab}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              className="relative p-2 rounded-lg hover:bg-red-800  bg-red-600 text-white"
              onClick={() => {
                handleSignOut();
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
