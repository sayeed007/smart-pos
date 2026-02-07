"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/providers/auth-provider";
import { UserRole } from "@/types";
import {
  FileText,
  LayoutDashboard,
  Package,
  RotateCcw,
  Settings,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation("common");

  const adminNavItems = [
    {
      name: t("dashboard"),
      icon: <LayoutDashboard size={20} />,
      path: "/admin/dashboard",
    },
    { name: t("pos"), icon: <ShoppingCart size={20} />, path: "/admin/pos" },
    { name: t("sales"), icon: <FileText size={20} />, path: "/admin/sales" },
    {
      name: t("products"),
      icon: <Package size={20} />,
      path: "/admin/products",
    },
    {
      name: t("customers"),
      icon: <Users size={20} />,
      path: "/admin/customers",
    },
    {
      name: t("reports"),
      icon: <FileText size={20} />,
      path: "/admin/reports",
    },
    { name: t("offers"), icon: <Tag size={20} />, path: "/admin/offers" },
    {
      name: t("returns"),
      icon: <RotateCcw size={20} />,
      path: "/admin/returns",
    },
    { name: t("users"), icon: <Users size={20} />, path: "/admin/users" },
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
    <div className="flex min-h-screen bg-[#fcfdfe]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-58 h-screen fixed inset-y-0 z-50">
        <Sidebar items={adminNavItems} title="Admin" />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-58 flex flex-col min-h-screen overflow-x-hidden">
        <div className="w-full max-w-400 mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
