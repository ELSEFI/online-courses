import React from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Globe,
} from "lucide-react";

export default function Sidebar({
  currentPage,
  onChange,
  collapsed,
  onToggle,
}) {
  const menu = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "instructors", label: "Instructors", icon: GraduationCap },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <aside
      className={`bg-gray-800 border-r border-gray-700 ${
        collapsed ? "w-20" : "w-64"
      } transition-all`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          </div>
        )}
        <button
          onClick={onToggle}
          className="text-gray-400 p-2 rounded hover:bg-gray-700"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {menu.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              currentPage === m.id
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                : "text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <m.icon className="w-5 h-5" />
            {!collapsed && <span className="font-medium">{m.label}</span>}
          </button>
        ))}

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white"
        >
          <Globe className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Main Site</span>}
        </a>
      </nav>
    </aside>
  );
}
