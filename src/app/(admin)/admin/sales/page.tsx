"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Sale } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Receipt, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function SalesHistoryPage() {
  const { data: sales, isLoading } = useQuery<Sale[]>({
    queryKey: ["sales"],
    queryFn: async () => (await api.get("/sales")).data,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Sales History
        </h1>
        <p className="text-gray-400 font-medium">View all transactions</p>
      </div>

      <div className="rounded-[2.5rem] border border-gray-100 shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="py-6 pl-8 font-black uppercase text-xs tracking-widest text-gray-400">
                Invoice
              </TableHead>
              <TableHead className="font-black uppercase text-xs tracking-widest text-gray-400">
                Date/Time
              </TableHead>
              <TableHead className="font-black uppercase text-xs tracking-widest text-gray-400">
                Items
              </TableHead>
              <TableHead className="font-black uppercase text-xs tracking-widest text-gray-400">
                Customer
              </TableHead>
              <TableHead className="font-black uppercase text-xs tracking-widest text-gray-400">
                Method
              </TableHead>
              <TableHead className="pr-8 text-right font-black uppercase text-xs tracking-widest text-gray-400">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="animate-spin text-gray-300" />
                  </div>
                </TableCell>
              </TableRow>
            ) : sales?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Receipt size={48} className="mb-4 text-gray-200" />
                    <p className="font-bold">No sales records found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sales?.map((sale) => (
                <TableRow
                  key={sale.id}
                  className="hover:bg-gray-50/50 transition-colors border-gray-100"
                >
                  <TableCell className="py-5 pl-8 font-bold text-gray-900">
                    {sale.invoiceNo}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium text-gray-700">
                      <Calendar size={14} className="text-gray-400" />
                      {format(new Date(sale.date), "MMM dd, yyyy")}
                      <span className="text-gray-400 text-xs ml-1 at-time">
                        {sale.time}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-500">
                    {sale.items.length} Items
                  </TableCell>
                  <TableCell className="font-bold text-gray-900">
                    {sale.customerName || "Walk-in Customer"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sale.paymentMethod === "Cash" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}
                    >
                      {sale.paymentMethod}
                    </span>
                  </TableCell>
                  <TableCell className="pr-8 text-right font-black text-gray-900">
                    ${sale.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
