import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { StoreSidebar } from "./StoreSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface ResponsiveStoreSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ResponsiveStoreSidebar({
  isOpen,
  onToggle,
}: ResponsiveStoreSidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onToggle}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <StoreSidebar />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={`hidden md:block transition-all duration-300 ${
        isOpen ? "w-64" : "w-0 overflow-hidden"
      }`}
    >
      <StoreSidebar />
    </div>
  );
}
