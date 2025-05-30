import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
      {!isMobile && (
        <Button variant="ghost" size="sm" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <div className="flex-1">
        <h1 className="text-lg font-semibold text-gray-900">MS Admin Portal</h1>
      </div>
    </header>
  );
}
