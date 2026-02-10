"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface ProductFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function ProductFilterBar({
  search,
  onSearchChange,
  className,
  placeholder,
}: ProductFilterBarProps) {
  const { t } = useTranslation("products");

  return (
    <div
      className={cn(
        "flex items-center gap-4 bg-card p-1 rounded-xl shadow-sm max-w-sm",
        className,
      )}
    >
      <Search className="w-4 h-4 text-muted-foreground ml-2" />
      <Input
        placeholder={placeholder || t("page.searchPlaceholder")}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border-none shadow-none focus-visible:ring-0 h-9"
      />
    </div>
  );
}
