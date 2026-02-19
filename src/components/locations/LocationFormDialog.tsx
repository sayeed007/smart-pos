"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { LocationFormValues, locationSchema } from "@/lib/validations/location";
import { Location } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";

interface LocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: Location | null;
  onSubmit: (data: LocationFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function LocationFormDialog({
  open,
  onOpenChange,
  location,
  onSubmit,
  isLoading,
}: LocationFormDialogProps) {
  const { t } = useTranslation("locations");

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      address: "",
      type: "STORE",
      status: "ACTIVE",
      priceBookId: "",
    },
  });

  useEffect(() => {
    if (location) {
      form.reset({
        name: location.name,
        address: location.address || "",
        type: location.type,
        status: location.status,
        priceBookId: location.priceBookId || "",
      });
    } else {
      form.reset({
        name: "",
        address: "",
        type: "STORE",
        status: "ACTIVE",
        priceBookId: "", // Or null
      });
    }
  }, [location, form]);

  const handleSubmit = async (values: LocationFormValues) => {
    // Ensure empty strings are handled if necessary
    const submissionData = {
      ...values,
      priceBookId: values.priceBookId || null,
    };
    await onSubmit(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {location
              ? t("dialog.editTitle", "Edit Location")
              : t("dialog.addTitle", "Add New Location")}
          </DialogTitle>
          <DialogDescription>
            {location
              ? t("dialog.editDescription", "Update location details.")
              : t(
                  "dialog.addDescription",
                  "Create a new location for your business.",
                )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("fields.name", "Name")}{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.enterName", "Enter location name")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("fields.type", "Type")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("fields.selectType", "Select type")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STORE">Store</SelectItem>
                        <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("fields.status", "Status")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t(
                              "fields.selectStatus",
                              "Select status",
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.address", "Address")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("fields.enterAddress", "Enter address")}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 
            <FormField
              control={form.control}
              name="priceBookId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.priceBookId", "Price Book ID")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fields.enterPriceBookId", "Enter Price Book ID (Optional)")} {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            */}

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("actions.cancel", "Cancel")}
              </Button>
              <PrimaryActionButton type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {location
                  ? t("actions.update", "Update Location")
                  : t("actions.save", "Create Location")}
              </PrimaryActionButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
