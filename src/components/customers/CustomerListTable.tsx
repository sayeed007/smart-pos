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
import { Customer } from "@/types";
import { Edit, Loader2, Trash2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CustomerListTableProps {
  customers: Customer[] | undefined;
  isLoading: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerListTable({
  customers,
  isLoading,
  onEdit,
  onDelete,
}: CustomerListTableProps) {
  const { t } = useTranslation("customers");

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
              <TableHead className="w-75">{t("headers.name")}</TableHead>
              <TableHead>{t("headers.phone")}</TableHead>
              <TableHead>{t("headers.email")}</TableHead>
              <TableHead className="text-right">
                {t("headers.totalSpent")}
              </TableHead>
              <TableHead className="text-right">
                {t("headers.loyaltyPoints")}
              </TableHead>
              <TableHead className="text-right">
                {t("headers.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users
                      size={48}
                      className="mb-4 text-muted-foreground/30"
                    />
                    <p className="typo-semibold-14">{t("empty.title")}</p>
                    <p className="typo-regular-12 mt-1">
                      {t("empty.description")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers?.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="border-sidebar-border p-2 odd:bg-card even:bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-chart-1/10 flex items-center justify-center text-chart-1 typo-semibold-14 border border-chart-1/20">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="typo-semibold-14 text-foreground">
                          {customer.name}
                        </p>
                        <p className="typo-regular-12 mt-1 text-muted-foreground">
                          ID: {customer.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground typo-regular-14">
                    {customer.phone}
                  </TableCell>
                  <TableCell className="text-muted-foreground typo-regular-14">
                    {customer.email}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="typo-bold-14 text-foreground">
                      ${Number(customer.totalSpent).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-chart-2/10 text-chart-2 typo-semibold-12 border border-chart-2/20">
                      {customer.loyaltyPoints} PTS
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(customer)}
                        className="h-8 w-8 text-muted-foreground hover:text-chart-1 hover:bg-chart-1/10 cursor-pointer transition-colors"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(customer)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                      >
                        <Trash2 size={16} color="red" />
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
