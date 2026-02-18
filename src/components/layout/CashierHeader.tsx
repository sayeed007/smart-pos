"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu, AlertCircle } from "lucide-react";

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

interface CashierHeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  currentTitle: string;
  navItems: NavItem[];
}

export function CashierHeader({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  currentTitle,
  navItems,
}: CashierHeaderProps) {
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 px-8 py-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <div className="lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto w-auto p-2 text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-58 border-r-0">
              <Sidebar
                items={navItems}
                title="Cashier"
                onClose={() => setIsMobileMenuOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>

        <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">
          {currentTitle}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex bg-green-50 text-green-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm">
          Live Terminal #01
        </div>
        <Button
          variant="outline"
          className="h-auto w-auto p-2.5 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-[#f87171] rounded-2xl transition-all border border-gray-100 hover:border-red-100"
        >
          <AlertCircle size={20} />
        </Button>
      </div>
    </header>
  );
}
