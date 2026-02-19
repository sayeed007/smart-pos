"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Location } from "@/types";
import { Edit, Loader2, MapPin, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface LocationListTableProps {
  locations: Location[] | undefined;
  isLoading: boolean;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
}

export function LocationListTable({
  locations,
  isLoading,
  onEdit,
  onDelete,
}: LocationListTableProps) {
  const { t } = useTranslation("locations");

  return (
    <div className="bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-muted-foreground/50" />
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-muted border-0">
            <TableRow className="typo-semibold-14 border-b border-sidebar-border p-2">
              <TableHead className="w-75">
                {t("headers.name", "Name")}
              </TableHead>
              <TableHead>{t("headers.type", "Type")}</TableHead>
              <TableHead>{t("headers.address", "Address")}</TableHead>
              <TableHead>{t("headers.status", "Status")}</TableHead>
              <TableHead className="text-right">
                {t("headers.actions", "Actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <MapPin
                      size={48}
                      className="mb-4 text-muted-foreground/30"
                    />
                    <p className="typo-semibold-14">
                      {t("empty.title", "No locations found")}
                    </p>
                    <p className="typo-regular-12 mt-1">
                      {t(
                        "empty.description",
                        "Add a new location to manage stock across multiple branches.",
                      )}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              locations?.map((location) => (
                <TableRow
                  key={location.id}
                  className="border-sidebar-border p-2 odd:bg-card even:bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-chart-1/10 flex items-center justify-center text-chart-1 typo-semibold-14 border border-chart-1/20">
                        {location.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="typo-semibold-14 text-foreground">
                          {location.name}
                        </p>
                        <p className="typo-regular-12 mt-1 text-muted-foreground">
                          ID: {location.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground typo-regular-14 capitalize">
                    {location.type.toLowerCase()}
                  </TableCell>
                  <TableCell className="text-muted-foreground typo-regular-14 max-w-50 truncate">
                    {location.address || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${
                        location.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-gray-500/10 text-gray-600 border-gray-500/20"
                      }`}
                    >
                      {location.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(location)}
                        className="h-8 w-8 text-muted-foreground hover:text-chart-1 hover:bg-chart-1/10 cursor-pointer transition-colors"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(location)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
