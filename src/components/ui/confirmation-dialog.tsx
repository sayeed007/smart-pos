"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel,
  cancelLabel,
  variant = "default",
  loading = false,
}: ConfirmationDialogProps) {
  const { t } = useTranslation("common");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {title || t("confirm.title", "Are you sure?")}
          </DialogTitle>
          <DialogDescription>
            {description ||
              t("confirm.description", "This action cannot be undone.")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel || t("cancel", "Cancel")}
          </Button>
          <PrimaryActionButton
            onClick={onConfirm}
            disabled={loading}
            className={
              variant === "destructive"
                ? "bg-destructive hover:bg-destructive/90 shadow-destructive/20"
                : ""
            }
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel || t("confirm", "Confirm")}
          </PrimaryActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
