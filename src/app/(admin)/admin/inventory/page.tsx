"use client";

import { InventoryTransaction } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { MOCK_PRODUCTS, MOCK_LOCATIONS } from "@/lib/mock-data";
import { useInventoryStore } from "@/features/inventory/store/inventory-store";
import { StockAdjustmentDialog } from "@/features/inventory/components/StockAdjustmentDialog";
import { useLocationStore } from "@/features/locations/store";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { StockTransferList } from "@/features/inventory/components/StockTransferList";
import { CreateTransferDialog } from "@/features/inventory/components/CreateTransferDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InventoryPage() {
  const { currentLocation } = useLocationStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Simulated Queries (replace with API)
  const transactions = useInventoryStore((state) => state.transactions);
  const products = MOCK_PRODUCTS;
  const locations = MOCK_LOCATIONS;

  // Filter Logic
  const filteredTransactions = transactions.filter((tx) => {
    const product = products.find((p) => p.id === tx.productId);
    const searchString =
      `${product?.name} ${product?.sku} ${tx.reason} ${tx.referenceId}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    const matchesLocation = tx.locationId === currentLocation.id;
    return matchesSearch && matchesType && matchesLocation;
  });

  const getTypeBadge = (type: InventoryTransaction["type"]) => {
    switch (type) {
      case "IN":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Stock In</Badge>
        );
      case "OUT":
        return <Badge className="bg-red-500 hover:bg-red-600">Stock Out</Badge>;
      case "ADJUST":
        return (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-500"
          >
            Adjustment
          </Badge>
        );
      case "TRANSFER":
        return <Badge variant="secondary">Transfer</Badge>;
      case "RETURN":
        return <Badge className="bg-blue-500">Return</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getProductDetails = (id: string) => {
    const p = products.find((prod) => prod.id === id);
    return p
      ? { name: p.name, sku: p.sku, image: p.image }
      : { name: "Unknown Product", sku: "N/A", image: null };
  };

  const getLocationName = (id: string) => {
    const l = locations.find((loc) => loc.id === id);
    return l ? l.name : id;
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage stock levels, transfers, and audit logs for{" "}
            <span className="font-semibold text-primary">
              {currentLocation.name}
            </span>
            .
          </p>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline">Export CSV</Button> */}
          <StockAdjustmentDialog />
          <CreateTransferDialog />
        </div>
      </div>

      <Tabs defaultValue="ledger" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ledger">Transaction Ledger</TabsTrigger>
          <TabsTrigger value="transfers">Stock Transfers</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by product, SKU, or reason..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="IN">Stock In</SelectItem>
                    <SelectItem value="OUT">Stock Out</SelectItem>
                    <SelectItem value="ADJUST">Adjustment</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                    <SelectItem value="RETURN">Return</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Reason / Ref</TableHead>
                    <TableHead>User</TableHead>
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
                              new Date(tx.timestamp),
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
                            {getLocationName(tx.locationId)}
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
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers">
          <Card>
            <CardHeader>
              <CardTitle>Transfer History</CardTitle>
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
