"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useInstance } from "@/providers/instance-provider";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher";
import { LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LocationSelector } from "@/components/location/LocationSelector";

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
  const { instance } = useInstance();
  const { t } = useTranslation("common");

  const handlePageChange = (path: string) => {
    router.push(path);
    if (onClose) onClose();
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card border-r border-sidebar-border shadow-sm transition-all duration-300 overflow-hidden",
        collapsed ? "w-20" : "w-full",
      )}
    >
      <div
        className={cn(
          "flex flex-col justify-center",
          collapsed ? "p-2 items-center pb-2" : "p-4 pb-2",
        )}
      >
        <div
          className={cn(
            "flex items-center transition-all",
            collapsed ? "flex-col gap-2" : "gap-0",
          )}
        >
          <Image
            src={instance.logoUrl}
            alt={instance.companyName}
            width={48}
            height={48}
            className={"object-contain transition-all w-16 h-16"}
          />

          {!collapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
              <h1 className="typo-semibold-14 text-foreground whitespace-nowrap mb-1">
                {instance.companyName}
              </h1>
              <p className="typo-regular-11 text-muted-foreground uppercase whitespace-nowrap">
                {title} {t("panel")}
              </p>
            </div>
          )}

          {/* Desktop collapse button */}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className={cn(
                "cursor-pointer text-muted-foreground hover:text-foreground transition-colors h-auto w-auto",
                collapsed ? "p-0" : "p-1",
              )}
            >
              <Menu className="size-6" />
            </Button>
          )}

          {/* Mobile close button */}
          {onClose && !collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden cursor-pointer text-muted-foreground hover:text-foreground transition-colors h-auto w-auto p-1"
            >
              <X className="size-6" />
            </Button>
          )}
        </div>
      </div>
      <nav className="flex-1 p-4 pt-0 space-y-2 overflow-y-auto scrollbar-hide">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => handlePageChange(item.path)}
              className={cn(
                "w-full justify-start",
                collapsed
                  ? "justify-center w-12 h-12 mx-auto rounded-md"
                  : "gap-3 px-4 py-3 rounded-md mx-2",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm typo-bold-14"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground typo-medium-14",
              )}
              title={collapsed ? item.name : undefined}
            >
              <span
                className={cn(
                  "h-5 w-5 [&_svg]:size-5! transition-colors shrink-0",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="animate-in fade-in duration-300 whitespace-nowrap typo-regular-14">
                  {item.name}
                </span>
              )}
              {!collapsed && isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </Button>
          );
        })}
      </nav>
      {/* USER AND LOG OUT */}
      <div
        className={cn(
          "border-t border-sidebar-border bg-muted/20",
          collapsed ? "p-2" : "p-3",
        )}
      >
        <LocationSelector collapsed={collapsed} className="mb-3" />

        <div
          className={cn(
            "flex items-center gap-3 mb-3",
            collapsed ? "justify-center" : "px-2",
          )}
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 shadow-sm typo-regular-12 typo-bold-14">
            {user?.name?.charAt(0) || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-foreground truncate leading-none mb-1 typo-bold-14">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate leading-none typo-bold-14">
                {typeof user?.role === "object"
                  ? (user.role as { name: string }).name
                  : user?.role || t("role")}
              </p>
            </div>
          )}
        </div>

        <div
          className={cn("flex items-center gap-2", collapsed ? "flex-col" : "")}
        >
          <LanguageSwitcher
            className={cn(
              "h-9 border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg shadow-sm transition-all",
              collapsed ? "w-full" : "flex-1 w-full",
            )}
          />

          <ThemeSelector
            className={cn(
              "h-9 border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg shadow-sm transition-all",
              collapsed ? "w-full" : "flex-1 w-full",
            )}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className={cn(
              "h-9 border border-border bg-card hover:bg-destructive/10 text-muted-foreground hover:text-destructive hover:border-destructive/30 rounded-lg shadow-sm transition-all",
              collapsed ? "w-full" : "flex-1 w-full",
            )}
            title={t("logout")}
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
