"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ShoppingCart, Package, Users, User } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { UserRole } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const cashierNavItems = [
  { name: "New Sale", icon: <ShoppingCart size={24} />, path: "/cashier/pos" },
  { name: "Products", icon: <Package size={24} />, path: "/cashier/products" },
  { name: "Customers", icon: <Users size={24} />, path: "/cashier/customers" },
  { name: "Profile", icon: <User size={24} />, path: "/cashier/profile" },
];

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.CASHIER)) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar - Collapsible */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen fixed inset-y-0 z-50 transition-all duration-300",
          isDesktopCollapsed ? "w-20" : "w-58",
        )}
      >
        <Sidebar
          items={cashierNavItems}
          title="Cashier"
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
