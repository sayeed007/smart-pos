"use client";

import { useLocationStore } from "@/features/locations/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationSelectorProps {
  className?: string;
  collapsed?: boolean;
}

export function LocationSelector({
  className,
  collapsed,
}: LocationSelectorProps) {
  const { currentLocation, locations, setLocation } = useLocationStore();

  if (collapsed) {
    return (
      <div
        className={cn("flex justify-center mb-2", className)}
        title={currentLocation.name}
      >
        <div className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-primary shadow-sm hover:bg-muted cursor-help">
          <MapPin size={18} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mb-2", className)}>
      <Select value={currentLocation.id} onValueChange={setLocation}>
        <SelectTrigger className="h-9 border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg shadow-sm transition-all w-full">
          <div className="flex items-center gap-2 truncate">
            <MapPin size={16} className="shrink-0" />
            <span className="truncate typo-medium-12">
              {currentLocation.name}
            </span>
          </div>
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
  );
}
