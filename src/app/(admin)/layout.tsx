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

  const currentTitle =
    adminNavItems.find((item) => pathname.startsWith(item.path))?.name ||
    "Management";

  return (
    <div className="flex min-h-screen bg-[#fcfdfe]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 h-screen fixed inset-y-0 z-50">
        <Sidebar items={adminNavItems} title="Admin" />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen overflow-x-hidden">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 text-gray-600 bg-gray-50 rounded-xl">
                  <Menu size={20} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-r-0">
                <Sidebar
                  items={adminNavItems}
                  title="Admin"
                  onClose={() => setIsMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">
              {currentTitle}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-green-50 text-green-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm">
              Live Terminal #01
            </div>
            <button className="p-2.5 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-[#f87171] rounded-2xl transition-all border border-gray-100">
              <AlertCircle size={20} />
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-6 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
