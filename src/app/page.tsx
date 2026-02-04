"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { UserRole } from "@/types";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.role === UserRole.ADMIN) {
          router.push("/admin/dashboard");
        } else if (user.role === UserRole.CASHIER) {
          router.push("/cashier/pos");
        } else {
          router.push("/login"); // Fallback for other roles
        }
      } else {
        router.push("/login"); // For non-logged-in users
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
    </div>
  );
}
