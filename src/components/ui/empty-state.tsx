import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-40 text-center text-muted-foreground",
        className,
      )}
    >
      <Icon className="h-10 w-10 mb-2 opacity-20" />
      <p className="typo-medium-14">{title}</p>
      {description && (
        <p className="text-muted-foreground/80 mt-1 typo-regular-12">{description}</p>
      )}
    </div>
  );
}
