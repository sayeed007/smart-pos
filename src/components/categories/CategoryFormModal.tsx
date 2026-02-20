"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { Category } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { z } from "zod";

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: Category | null;
  onSave: (category: Partial<Category>) => void;
}

export function CategoryFormModal({
  open,
  onOpenChange,
  categoryToEdit,
  onSave,
}: CategoryFormModalProps) {
  const { t } = useTranslation(["categories", "common"]);
  const { theme } = useTheme();

  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, {
          message: t("validation.nameRequired", "Name is required"),
        }),
        icon: z.string().optional(),
      }),
    [t],
  );

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: categoryToEdit?.name || "",
      icon: categoryToEdit?.icon || "",
    },
  });

  // Update default values when categoryToEdit changes
  // Note: react-hook-form doesn't automatically update defaultValues when prop changes unless specific logic is added,
  // but since we remount component with key={open ? ...} in parent, it might be fine.
  // We can add a useEffect if needed, or rely on parent key prop.
  // The original code passed defaultValues to useForm directly.

  const onSubmit = (values: FormValues) => {
    onSave({
      ...categoryToEdit,
      name: values.name,
      icon: values.icon || "", // ensure string
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {categoryToEdit
              ? t("editCategory", "Edit Category")
              : t("addCategory", "Add Category")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("fields.name", "Category Name")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("placeholders.name", "e.g. Dresses")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.icon", "Icon")}</FormLabel>
                  <div className="flex flex-col gap-2">
                    <FormControl>
                      <>
                        {field.value ? (
                          <span className="text-2xl mr-2">{field.value}</span>
                        ) : (
                          <span className="text-muted-foreground">
                            {t("placeholders.selectIcon", "Select an icon")}
                          </span>
                        )}
                        <EmojiPicker
                          onEmojiClick={(emojiData: EmojiClickData) =>
                            field.onChange(emojiData.emoji)
                          }
                          width="100%"
                          height={300}
                          theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                        />
                      </>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("common:cancel", "Cancel")}
              </Button>
              <PrimaryActionButton type="submit">
                {t("common:save", "Save")}
              </PrimaryActionButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
