"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { LocationListTable } from "@/components/locations/LocationListTable";
import { LocationFormDialog } from "@/components/locations/LocationFormDialog";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import {
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from "@/hooks/api/locations";
import { Location } from "@/types";
import { getErrorMessage } from "@/lib/errors";
import { LocationFormValues } from "@/lib/validations/location";

export function LocationsTab() {
  const { t } = useTranslation("locations");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(
    null,
  );

  const { data: locations = [], isLoading } = useLocations();
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const handleSubmit = async (values: LocationFormValues) => {
    if (selectedLocation) {
      updateMutation.mutate(
        { id: selectedLocation.id, data: values },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedLocation(null);
            toast.success(
              t("toasts.updateSuccess", "Location updated successfully"),
            );
          },
          onError: (error: unknown) =>
            toast.error(
              getErrorMessage(
                error,
                t("toasts.updateError", "Failed to update location"),
              ),
            ),
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          setIsDialogOpen(false);
          toast.success(
            t("toasts.createSuccess", "Location created successfully"),
          );
        },
        onError: (error: unknown) =>
          toast.error(
            getErrorMessage(
              error,
              t("toasts.createError", "Failed to create location"),
            ),
          ),
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!locationToDelete) return;
    try {
      await deleteMutation.mutateAsync(locationToDelete.id);
      setLocationToDelete(null);
      toast.success(t("toasts.deleteSuccess", "Location deleted successfully"));
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          t("toasts.deleteError", "Failed to delete location"),
        ),
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="typo-bold-18 text-foreground">
            {t("page.title", "Locations")}
          </h2>
          <p className="typo-regular-14 text-muted-foreground mt-0.5">
            {t("page.subtitle", "Manage your business locations and branches")}
          </p>
        </div>
        <PrimaryActionButton
          onClick={() => {
            setSelectedLocation(null);
            setIsDialogOpen(true);
          }}
          icon={Plus}
        >
          {t("actions.addLocation", "Add Location")}
        </PrimaryActionButton>
      </div>

      <LocationListTable
        locations={locations}
        isLoading={isLoading}
        onEdit={(loc) => {
          setSelectedLocation(loc);
          setIsDialogOpen(true);
        }}
        onDelete={(loc) => setLocationToDelete(loc)}
      />

      <LocationFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        location={selectedLocation}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmationDialog
        open={!!locationToDelete}
        onOpenChange={(open) => !open && setLocationToDelete(null)}
        title={t("dialog.deleteTitle", "Delete Location?")}
        description={t(
          "dialog.deleteDescription",
          `Are you sure you want to delete ${locationToDelete?.name}? This action cannot be undone.`,
        )}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
