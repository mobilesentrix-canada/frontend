
import React from 'react';
import { Outlet } from 'react-router-dom';
import { StoreSidebar } from './StoreSidebar';
import { StoreHeader } from './StoreHeader';

export function StoreLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <StoreSidebar />
      <div className="flex flex-1 flex-col">
        <StoreHeader />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
