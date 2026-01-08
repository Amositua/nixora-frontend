import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Upload,
  FolderOpen,
  Search,
  FileText,
  Calendar,
  Bell,
  Settings,
  ChevronDown,
  Menu,
  LogOut,
  BarChart3,
  MessageCircle,
  Edit3,
} from "lucide-react";
import Logo from "../../assets/sa.jpeg";

import useRefreshToken from "../hooks/useRefreshToken";

// const user = localStorage.getItem("user");
// console.log("Layout user:", user);

export default function Layout({
  currentScreen,
  setCurrentScreen,
  children,
  onSignOut,
}) {
  const refresh = useRefreshToken()
  const [user, setUser] = useState(null);
  console.log("Layout render, user:", user);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(userData);
    }
  }, []);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "upload", label: "Upload Loans", icon: Upload },
    { id: "portfolio", label: "Loan Portfolio", icon: FolderOpen },
    { id: "query", label: "Search & Queries", icon: Search },
    { id: "compare-loans", label: "Compare Loans", icon: BarChart3 },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "timeline", label: "Loan Timelines", icon: Calendar },
    { id: "loan-chat-selector", label: "Ask AI", icon: MessageCircle },
    // { id: "notifications", label: "Notifications", icon: Bell },
    { id: "collaborate", label: "collaborate and Edit", icon: Edit3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/60 flex flex-col shadow-lg">
        <div className="h-16 flex items-center px-6 border-b border-gray-200/60 bg-white/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img src={Logo} alt="Logo" className="w-9 h-9 rounded-xl shadow-md" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl opacity-20 blur"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Nixora
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                    : "text-gray-700 hover:bg-gray-100/70 hover:scale-[1.01]"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                />
                <span className={`text-sm font-medium ${isActive ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200/60 bg-white/50 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100/70 transition-all duration-200 hover:shadow-md"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-teal-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
              {user
                ? JSON.parse(user)
                    .name.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "JD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user
                  ? JSON.parse(user)
                      .name.split(" ")
                      .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
                      .join(" ")
                  : "John Davis"}
              </p>
              <p className="text-xs text-gray-500 truncate font-medium">
                Portfolio Manager
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                showUserMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl border border-gray-200/60 shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
              <button
                onClick={() => {
                  if (currentScreen === "settings") {
                    setCurrentScreen("dashboard");
                  }
                  setCurrentScreen("settings");
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3.5 hover:bg-gray-50 transition-all duration-200 text-left border-b border-gray-100"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Settings</span>
              </button>
              <button
                onClick={() => {
                  onSignOut();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3.5 hover:bg-red-50 transition-all duration-200 text-left text-red-600"
              >
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-sm font-semibold">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-4 flex-1 max-w-2xl">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                onClick={() => setCurrentScreen("query")}
                type="text"
                placeholder="Search loans, borrowers, documents..."
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setCurrentScreen("notifications");
              }}
              className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              {/* <Bell className="w-5 h-5 text-gray-600" /> */}
              {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
            </button>
            <button
              onClick={() => {
                setCurrentScreen("settings");
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-teal-600 rounded-xl flex items-center justify-center text-white text-sm font-bold cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                {user
                  ? JSON.parse(user)
                      .name.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "JD"}
              </div>
            </button>
            {/* <button onClick={() => refresh()}>Refresh</button> */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}