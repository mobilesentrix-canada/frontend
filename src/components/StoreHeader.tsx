import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StoreHeaderProps {
  onToggleSidebar: () => void;
}

export function StoreHeader({ onToggleSidebar }: StoreHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutDialog(false);
    await logout();
    navigate("/login");
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        {!isMobile && (
          <Button variant="ghost" size="sm" onClick={onToggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900">
            MS Store Portal
          </h1>
          {user?.storeName && (
            <p className="text-sm text-gray-600">{user.storeName}</p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            Welcome, {user?.name}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogoutClick}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to sign in again to
              access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelLogout}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLogout}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
