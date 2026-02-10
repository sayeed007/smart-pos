"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CustomerSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function CustomerSearchBar({ value, onChange }: CustomerSearchBarProps) {
  const { t } = useTranslation("customers");
  return (
    <div className="flex items-center gap-4 bg-card p-1 rounded-xl shadow-sm max-w-sm">
      <Search className="w-4 h-4 text-muted-foreground ml-2" />
      <Input
        placeholder={t("searchPlaceholder", "Search customers...")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-none shadow-none focus-visible:ring-0 h-9"
      />
    </div>
  );
}
