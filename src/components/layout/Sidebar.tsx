"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

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
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  items,
  onClose,
  title,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handlePageChange = (path: string) => {
    router.push(path);
    if (onClose) onClose();
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-100 shadow-sm transition-all duration-300",
        collapsed ? "w-20" : "w-full",
      )}
    >
      <div
        className={cn(
          "flex flex-col justify-center",
          collapsed ? "p-2 items-center" : "p-4",
        )}
      >
        <div
          className={cn(
            "flex items-center transition-all",
            collapsed ? "flex-col gap-4" : "gap-3",
          )}
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={48}
            height={48}
            className={"object-contain transition-all w-16 h-16"}
          />

          {!collapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
              <h1 className="text-semibold-14 text-gray-900 whitespace-nowrap">
                POS System
              </h1>
              <p className="text-regular-11 text-gray-400 uppercase whitespace-nowrap">
                {title} Panel
              </p>
            </div>
          )}

          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className={cn(
                "cursor-pointer text-gray-400 hover:text-gray-600 transition-colors h-auto w-auto",
                collapsed ? "p-0" : "p-1",
              )}
            >
              <Menu className="size-6" />
            </Button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => handlePageChange(item.path)}
              className={cn(
                "cursor-pointer w-full flex items-center transition-all duration-200 h-auto justify-start",
                collapsed
                  ? "justify-center px-0 py-3 rounded-xl"
                  : "gap-4 px-5 py-4 rounded-2xl",
                isActive
                  ? "bg-[#fff1f2] text-[#f87171] font-black hover:bg-[#fff1f2] hover:text-[#f87171]"
                  : "text-gray-500 hover:bg-gray-50 font-bold",
              )}
              title={collapsed ? item.name : undefined}
            >
              <span
                className={cn(
                  "h-5 w-5 [&_svg]:size-5!",
                  isActive ? "text-[#f87171]" : "text-gray-400",
                )}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="text-regular-14 animate-in fade-in duration-300 whitespace-nowrap">
                  {item.name}
                </span>
              )}
              {!collapsed && isActive && (
                <div className="ml-auto w-1.5 h-6 bg-[#f87171] rounded-full"></div>
              )}
            </Button>
          );
        })}
      </nav>

      <div className={cn("border-t bg-gray-50/20", collapsed ? "p-3" : "p-6")}>
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-2xl mb-4 shadow-sm animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-full bg-[#fff1f2] flex items-center justify-center text-[#f87171] font-black text-sm shrink-0">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-regular-14  text-gray-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-regular-11 text-gray-400  uppercase truncate">
                {user?.role || "Role"}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto rounded-full bg-[#fff1f2] flex items-center justify-center text-[#f87171] font-black text-sm mb-4">
            {user?.name?.charAt(0) || "U"}
          </div>
        )}

        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "cursor-pointer w-full flex items-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all text-semibold-14 h-auto justify-start",
            collapsed
              ? "justify-center py-3 rounded-xl"
              : "gap-4 px-5 py-4 rounded-2xl",
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={18} />
          {!collapsed && (
            <span className="animate-in fade-in duration-300">Logout</span>
          )}
        </Button>
      </div>
    </div>
  );
}
