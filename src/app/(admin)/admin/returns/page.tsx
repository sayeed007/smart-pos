"use client";

import { ReturnFormModal } from "@/components/returns/ReturnFormModal";
import { ReturnListTable } from "@/components/returns/ReturnListTable";
import { Button } from "@/components/ui/button";
import { MOCK_RETURNS } from "@/lib/mock-data";
import { Return } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ReturnsPage() {
  // Use local state simulate DB for returns
  const [returns, setReturns] = useState<Return[]>(MOCK_RETURNS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [search, setSearch] = useState("");

  const handleCreateReturn = (data: Partial<Return>) => {
    // Generate ID
    const newReturn = {
      ...data,
      id: `r${Date.now()}`,
      date: new Date().toISOString(),
      status: "Pending", // Default
    } as Return;
    setReturns([newReturn, ...returns]);
    toast.success("Return created successfully");
    setIsModalOpen(false);
  };

  const handleUpdateReturn = (data: Partial<Return>) => {
    if (!selectedReturn) return;
    const updatedReturns = returns.map((r) =>
      r.id === selectedReturn.id ? { ...r, ...data } : r,
    );
    setReturns(updatedReturns as Return[]);
    toast.success("Return updated successfully");
    setIsModalOpen(false);
    setSelectedReturn(null);
  };

  const handleDeleteReturn = (ret: Return) => {
    if (confirm("Are you sure you want to delete this return?")) {
      const updatedReturns = returns.filter((r) => r.id !== ret.id);
      setReturns(updatedReturns);
      toast.success("Return deleted successfully");
    }
  };

  const filteredReturns = returns.filter(
    (r) =>
      r.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Returns & Refunds
          </h1>
          <p className="text-gray-400 font-medium mt-1">
            Process returns and refunds
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedReturn(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-primary-foreground shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Return
        </Button>
      </div>

      <ReturnListTable
        returns={filteredReturns}
        isLoading={false}
        onEdit={(ret) => {
          setSelectedReturn(ret);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteReturn}
      />

      {isModalOpen && (
        <ReturnFormModal
          isOpen={isModalOpen}
          initialData={selectedReturn}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReturn(null);
          }}
          onSubmit={selectedReturn ? handleUpdateReturn : handleCreateReturn}
        />
      )}
    </div>
  );
}
