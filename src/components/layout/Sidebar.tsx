"use client";

import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/types";
import { useAuth } from "@/providers/auth-provider";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  items: NavItem[];
  isOpen?: boolean;
  onClose?: () => void;
  title: string;
}

export function Sidebar({ items, isOpen, onClose, title }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handlePageChange = (path: string) => {
    router.push(path);
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 shadow-sm">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
            {/* Logo placeholder - replace with Image if needed */}
            <div className="w-6 h-6 bg-[#f87171] rounded-full flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">
              POS System
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">
              {title} Panel
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-gray-400 hover:text-red-500"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handlePageChange(item.path)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all",
                isActive
                  ? "bg-[#fff1f2] text-[#f87171] font-black"
                  : "text-gray-500 hover:bg-gray-50 font-bold",
              )}
            >
              <span className={isActive ? "text-[#f87171]" : "text-gray-400"}>
                {item.icon}
              </span>
              <span className="text-sm">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-6 bg-[#f87171] rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t bg-gray-50/20">
        <div className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-2xl mb-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#fff1f2] flex items-center justify-center text-[#f87171] font-black text-sm">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              {user?.role || "Role"}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all font-bold text-sm"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}
