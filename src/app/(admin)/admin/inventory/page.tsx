"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTransferDialog } from "@/features/inventory/components/CreateTransferDialog";
import { StockAdjustmentDialog } from "@/features/inventory/components/StockAdjustmentDialog";
import { StockTransferList } from "@/features/inventory/components/StockTransferList";
import { useLocationStore } from "@/features/locations/store";
import { useAllInventoryTransactions } from "@/hooks/api/inventory";
import { useLocations } from "@/hooks/api/locations";
import { useProducts } from "@/hooks/api/products";
import { InventoryTransaction, Location } from "@/types";
import { format } from "date-fns";
import { Loader2, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function InventoryPage() {
  const { t } = useTranslation("inventory");
  const { currentLocation } = useLocationStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

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

  // Fetch transactions from API for selected location (only when we have a valid location)
  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useAllInventoryTransactions(effectiveLocationId, 1, 100);

  // Fetch products for lookup
  const { data: productsData } = useProducts({
    page: 1,
    limit: 1000, // Get all products for lookup
  });

  const transactions = transactionsData?.data || [];
  const products = productsData?.data || [];

  // Filter Logic
  const filteredTransactions = transactions.filter((tx) => {
    const product = products.find((p) => p.id === tx.productId);
    const searchString =
      `${product?.name} ${product?.sku} ${tx.reason} ${tx.referenceId}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: InventoryTransaction["type"]) => {
    switch (type) {
      case "IN":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            {t("transactionTypes.in")}
          </Badge>
        );
      case "OUT":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            {t("transactionTypes.out")}
          </Badge>
        );
      case "ADJUST":
        return (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-500"
          >
            {t("transactionTypes.adjust")}
          </Badge>
        );
      case "TRANSFER":
        return (
          <Badge variant="secondary">{t("transactionTypes.transfer")}</Badge>
        );
      case "RETURN":
        return (
          <Badge className="bg-blue-500">{t("transactionTypes.return")}</Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getProductDetails = (id: string) => {
    const p = products.find((prod) => prod.id === id);
    return p
      ? { name: p.name, sku: p.sku, image: p.image }
      : { name: t("messages.unknownProduct"), sku: "N/A", image: null };
  };

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
          <Card>
            <CardHeader>
              <CardTitle>{t("cards.transactions")}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("filters.search")}
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-45">
                    <SelectValue placeholder={t("filters.filterByType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                    <SelectItem value="IN">
                      {t("transactionTypes.in")}
                    </SelectItem>
                    <SelectItem value="OUT">
                      {t("transactionTypes.out")}
                    </SelectItem>
                    <SelectItem value="ADJUST">
                      {t("transactionTypes.adjust")}
                    </SelectItem>
                    <SelectItem value="TRANSFER">
                      {t("transactionTypes.transfer")}
                    </SelectItem>
                    <SelectItem value="RETURN">
                      {t("transactionTypes.return")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("tableHeaders.dateTime")}</TableHead>
                      <TableHead>{t("tableHeaders.type")}</TableHead>
                      <TableHead>{t("tableHeaders.product")}</TableHead>
                      <TableHead>{t("tableHeaders.location")}</TableHead>
                      <TableHead>{t("tableHeaders.qty")}</TableHead>
                      <TableHead>{t("tableHeaders.reasonRef")}</TableHead>
                      <TableHead>{t("tableHeaders.user")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((tx) => {
                        const product = getProductDetails(tx.productId);
                        return (
                          <TableRow key={tx.id}>
                            <TableCell className="font-medium text-xs text-muted-foreground whitespace-nowrap">
                              {format(
                                new Date(
                                  tx.createdAt || tx.timestamp || new Date(),
                                ),
                                "MMM dd, yyyy HH:mm",
                              )}
                            </TableCell>
                            <TableCell>{getTypeBadge(tx.type)}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm">
                                  {product.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {product.sku}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {selectedLocation.name}
                            </TableCell>
                            <TableCell>
                              <span
                                className={
                                  tx.type === "IN" || tx.type === "RETURN"
                                    ? "text-green-600 font-bold"
                                    : "text-red-600 font-bold"
                                }
                              >
                                {tx.type === "OUT" ? "-" : "+"}
                                {Math.abs(tx.quantity)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col text-sm">
                                <span>{tx.reason}</span>
                                {tx.referenceId && (
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {tx.referenceId}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {tx.performedBy}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          {t("messages.noTransactions")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle>{t("cards.transferHistory")}</CardTitle>
            </CardHeader>
            <CardContent>
              <StockTransferList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
