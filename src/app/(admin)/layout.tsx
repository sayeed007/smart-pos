"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { UserRole } from "@/types";
import {
  Box,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  RotateCcw,
  Settings,
  ShoppingCart,
  Tag,
  Layers,
  Users,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation("common");

  const adminNavItems = [
    {
      name: t("dashboard"),
      icon: <LayoutDashboard size={20} />,
      path: "/admin/dashboard",
    },
    {
      name: t("sales"),
      icon: <FileText size={20} />,
      path: "/admin/sales",
    },
    {
      name: t("pos", "POS"),
      icon: <ShoppingCart size={20} />,
      path: "/admin/pos",
    },
    {
      name: t("products"),
      icon: <Package size={20} />,
      path: "/admin/products",
    },
    {
      name: t("inventory"),
      icon: <Box size={20} />,
      path: "/admin/inventory",
    },
    {
      name: t("categories"),
      icon: <Layers size={20} />,
      path: "/admin/categories",
    },
    {
      name: t("offers"),
      icon: <Tag size={20} />,
      path: "/admin/offers",
    },
    {
      name: t("people", "People"),
      icon: <Users size={20} />,
      path: "/admin/people",
    },
    {
      name: t("reports"),
      icon: <FileText size={20} />,
      path: "/admin/reports",
    },
    {
      name: t("returns"),
      icon: <RotateCcw size={20} />,
      path: "/admin/returns",
    },
    {
      name: t("locations", "Locations"),
      icon: <MapPin size={20} />,
      path: "/admin/locations",
    },

    {
      name: t("settings"),
      icon: <Settings size={20} />,
      path: "/admin/settings",
    },
  ];

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return null; // Or loader
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Mobile Hamburger Button */}
      <Button
        variant="outline"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 h-auto w-auto p-2 bg-card border-sidebar-border shadow-lg hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-foreground" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar
          items={adminNavItems}
          title="Admin"
          onClose={() => setIsMobileOpen(false)}
        />
      </aside>

      {/* Desktop Sidebar - Collapsible */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen fixed inset-y-0 z-50 transition-all duration-300",
          isDesktopCollapsed ? "w-20" : "w-58",
        )}
      >
        <Sidebar
          items={adminNavItems}
          title="Admin"
          collapsed={isDesktopCollapsed}
          onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        />
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 flex flex-col min-h-screen overflow-x-hidden transition-all duration-300",
          isDesktopCollapsed ? "lg:ml-20" : "lg:ml-58",
        )}
      >
        <div className="w-full max-w-400 mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
