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
import { useAllInventoryTransactions } from "@/hooks/api/inventory";
import { InventoryTransaction } from "@/types";
import { format } from "date-fns";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface InventoryLedgerProps {
  locationId: string;
  locationName: string;
}

export function InventoryLedger({
  locationId,
  locationName,
}: InventoryLedgerProps) {
  const { t } = useTranslation("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Fetch transactions from API for selected location
  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useAllInventoryTransactions(locationId, 1, 100);

  const transactions = transactionsData?.data || [];

  // Filter Logic
  const filteredTransactions = transactions.filter((tx) => {
    const searchString =
      `${tx.product?.name || ""} ${tx.product?.sku || ""} ${tx.reason} ${tx.referenceId}`.toLowerCase();
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

  return (
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
              <SelectItem value="IN">{t("transactionTypes.in")}</SelectItem>
              <SelectItem value="OUT">{t("transactionTypes.out")}</SelectItem>
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
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium text-xs text-muted-foreground whitespace-nowrap">
                        {format(
                          new Date(tx.createdAt || tx.timestamp || new Date()),
                          "MMM dd, yyyy HH:mm",
                        )}
                      </TableCell>
                      <TableCell>{getTypeBadge(tx.type)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {tx.product?.name || t("messages.unknownProduct")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {tx.product?.sku || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{locationName}</TableCell>
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
  );
}
