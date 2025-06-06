import React from "react";
import { Outlet } from "react-router-dom";
import { StoreSidebar } from "./StoreSidebar";
import { StoreHeader } from "./StoreHeader";

export function StoreLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="flex-shrink-0">
        <StoreSidebar />
      </div>
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <div className="flex-shrink-0">
          <StoreHeader />
        </div>
        <main className="flex-1 overflow-auto min-h-0">
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
