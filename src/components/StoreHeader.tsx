
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

export function StoreHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex-1">
        {user?.storeName && (
          <p className="text-sm text-gray-600">{user.storeName}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">
          Welcome, {user?.name}
        </span>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
