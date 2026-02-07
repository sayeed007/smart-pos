"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  FileText,
  Tag,
  RotateCcw,
  Menu,
  AlertCircle,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { UserRole } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const adminNavItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/admin/dashboard",
  },
  { name: "POS", icon: <ShoppingCart size={20} />, path: "/admin/pos" },
  { name: "Sales", icon: <FileText size={20} />, path: "/admin/sales" },
  { name: "Products", icon: <Package size={20} />, path: "/admin/products" },
  { name: "Customers", icon: <Users size={20} />, path: "/admin/customers" },
  { name: "Reports", icon: <FileText size={20} />, path: "/admin/reports" },
  { name: "Offers", icon: <Tag size={20} />, path: "/admin/offers" },
  { name: "Returns", icon: <RotateCcw size={20} />, path: "/admin/returns" },
  { name: "Users", icon: <Users size={20} />, path: "/admin/users" },
  { name: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const router = useRouter();

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
