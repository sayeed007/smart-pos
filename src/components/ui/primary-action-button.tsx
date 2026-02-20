import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { VariantProps } from "class-variance-authority";

export interface PrimaryActionButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: LucideIcon | React.ReactNode;
}

export const PrimaryActionButton = React.forwardRef<
  HTMLButtonElement,
  PrimaryActionButtonProps
>(({ className, children, icon: Icon, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        "cursor-pointer bg-primary hover:bg-primary/90 typo-semibold-14 text-primary-foreground shadow-lg shadow-primary/20 transition-all disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:border",
        className,
      )}
      {...props}
    >
      {Icon ? (
        <>
          <span className="mr-2">
            {typeof Icon === "function" ||
            (typeof Icon === "object" && Icon !== null && "render" in Icon)
              ? React.createElement(Icon as LucideIcon, {
                  className: "w-4 h-4",
                })
              : Icon}
          </span>
          {children}
        </>
      ) : (
        children
      )}
    </Button>
  );
});
PrimaryActionButton.displayName = "PrimaryActionButton";
