import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeleteButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
}

/**
 * Standardised delete icon button used across all admin tables and forms.
 * Renders a ghost Button with a Trash2 icon, destructive hover styles,
 * and a consistent size/color — replaces ad-hoc Trash2 + Button combos.
 */
export function DeleteButton({
  onClick,
  disabled = false,
  size = "md",
  className,
  label = "Delete",
}: DeleteButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer",
        size === "sm" ? "h-7 w-7" : "h-8 w-8",
        className,
      )}
    >
      <Trash2 size={size === "sm" ? 14 : 16} color="red" />
    </Button>
  );
}
