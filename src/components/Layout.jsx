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
} from "lucide-react";
import Logo from "../../assets/sa.jpeg";

// const user = localStorage.getItem("user");
// console.log("Layout user:", user);

export default function Layout({
  currentScreen,
  setCurrentScreen,
  children,
  onSignOut,
}) {
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
    { id: "compare-loans", label: "Compare Loans", icon: FileText },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "timeline", label: "Loan Timelines", icon: Calendar },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center"> */}
              {/* <FileText className="w-5 h-5 text-white" /> */}
            {/* </div> */}
            <img src={Logo} alt="Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-semibold text-gray-900">Nixora</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-blue-700" : "text-gray-500"
                  }`}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user
                ? JSON.parse(user)
                    .name.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "JD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user
                  ? JSON.parse(user)
                      .name.split(" ")
                      .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
                      .join(" ")
                  : "John Davis"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                Portfolio Manager
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                showUserMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden z-50">
              <button
                onClick={() => {
                  if (currentScreen === "settings"){
                    setCurrentScreen("dashboard");
                  }
                  setCurrentScreen("settings");
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-200"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Settings</span>
              </button>
              <button
                onClick={() => {
                  onSignOut();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-left text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4 flex-1 max-w-2xl">
            <button className="lg:hidden">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search loans, borrowers, documents..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => {
                setCurrentScreen("notifications");
              }} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={() => {
                setCurrentScreen("settings");
              }}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer">
                {user
                  ? JSON.parse(user)
                      .name.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "JD"}
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
