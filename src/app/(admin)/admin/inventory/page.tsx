"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTransferDialog } from "@/features/inventory/components/CreateTransferDialog";
import { InventoryLedger } from "@/features/inventory/components/InventoryLedger";
import { InventoryTransfers } from "@/features/inventory/components/InventoryTransfers";
import { StockAdjustmentDialog } from "@/features/inventory/components/StockAdjustmentDialog";
import { useLocationStore } from "@/features/locations/store";
import { useLocations } from "@/hooks/api/locations";
import { Location } from "@/types";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function InventoryPage() {
  const { t } = useTranslation("inventory");
  const { currentLocation } = useLocationStore();

  // Fetch locations for dropdown
  const { data: locationsData } = useLocations();
  const locations: Location[] = locationsData ?? [];

  // Get default location - prefer currentLocation if it exists in the list, otherwise use first location
  const defaultLocation =
    locations.length > 0
      ? locations.find((loc) => loc.id === currentLocation.id) || locations[0]
      : null;

  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const defaultLocationId = defaultLocation?.id ?? "";
  const effectiveLocationId = selectedLocationId || defaultLocationId;

  const selectedLocation =
    locations?.find((loc) => loc.id === effectiveLocationId) || currentLocation;

  return (
    <div className="p-6 space-y-6 max-w-400 mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("subtitleWithLocation", { location: selectedLocation.name })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Location Selector */}
          <div className="flex items-center gap-2 min-w-50">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Select
              value={effectiveLocationId}
              onValueChange={setSelectedLocationId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <StockAdjustmentDialog defaultLocationId={effectiveLocationId} />
          <CreateTransferDialog />
        </div>
      </div>

      <Tabs defaultValue="ledger" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ledger">{t("tabs.ledger")}</TabsTrigger>
          <TabsTrigger value="transfers">{t("tabs.transfers")}</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger">
          <InventoryLedger
            locationId={effectiveLocationId}
            locationName={selectedLocation.name}
          />
        </TabsContent>

        <TabsContent value="transfers">
          <InventoryTransfers locationId={effectiveLocationId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
