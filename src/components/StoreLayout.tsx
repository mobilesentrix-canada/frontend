// StoreLayout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import { StoreHeader } from "./StoreHeader";
import { ResponsiveStoreSidebar } from "./ResponsiveStoreSidebar";
export function StoreLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      <ResponsiveStoreSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <StoreHeader onToggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-auto">
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
