import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
        className,
      )}
    >
      <div>
        <h1 className="typo-bold-18 text-foreground tracking-tight">{title}</h1>
        {description && (
          <p className="typo-regular-14 text-muted-foreground mt-2">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
