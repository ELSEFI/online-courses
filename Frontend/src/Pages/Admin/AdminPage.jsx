// src/Pages/Admin/DashboardLayout.jsx
import { Outlet } from "react-router-dom"; // Outlet هي مكان تحميل الصفحات الفرعية
import Sidebar from "../../components/Layout/Sidebar"; // Sidebar من Canvas
import { useState } from "react";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false); // تحكم Sidebar مصغّر/موسع
  const [currentPage, setCurrentPage] = useState("overview"); // الصفحة الحالية في Sidebar

  return (
    <div className="flex bg-gray-900 text-white min-h-screen">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        currentPage={currentPage}
        onChange={setCurrentPage}
      />

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
