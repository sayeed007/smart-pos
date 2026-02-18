"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { UserPlus, X } from "lucide-react";
import { db } from "@/lib/db";
import { Customer } from "@/types";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { useTranslation } from "react-i18next";

interface MemberSearchViewProps {
  onSelect: (customer: Customer) => void;
  onClose: () => void;
  initialPhone?: string;
}

export function MemberSearchView({
  onSelect,
  onClose,
  initialPhone,
}: MemberSearchViewProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [isCreating, setIsCreating] = useState(!!initialPhone);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: initialPhone || "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(["pos", "common"]);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (!val) {
      setResults([]);
      return;
    }
    db.customers
      .where("phone")
      .startsWith(val)
      .or("name")
      .startsWithIgnoreCase(val)
      .limit(5)
      .toArray()
      .then(setResults);
  };

  const handleCreate = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error(t("customer.requiredError", "Name and Phone required"));
      return;
    }
    setIsLoading(true);
    try {
      const existing = await db.customers
        .where("phone")
        .equals(newCustomer.phone)
        .first();
      if (existing) {
        toast.error(
          t("customer.existsError", "Customer with this phone already exists"),
        );
        return;
      }
      const id = `cust-${Date.now()}`;
      const customer: Customer = {
        id,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email || "",
        totalSpent: 0,
        loyaltyPoints: 0,
        tierId: "tier-bronze",
        history: [],
      };
      await db.customers.add(customer);
      onSelect(customer);
      toast.success(t("customer.createdSuccess", "Customer Created"));
    } catch (error) {
      console.error(error);
      toast.error(
        getErrorMessage(
          error,
          t("customer.createError", "Failed to create customer"),
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl min-w-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="typo-bold-18 text-foreground tracking-tight">
          {isCreating
            ? t("customer.newCustomer", "New Customer")
            : t("customer.selectCustomer", "Select Customer")}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isCreating ? (
        <div className="space-y-4">
          <Input
            placeholder={t("customer.fullName", "Full Name *")}
            value={newCustomer.name}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, name: e.target.value })
            }
          />
          <Input
            placeholder={t("customer.phoneNumber", "Phone Number *")}
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
          />
          <Input
            placeholder={t("customer.emailOptional", "Email (Optional)")}
            value={newCustomer.email}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, email: e.target.value })
            }
          />
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsCreating(false)}
              disabled={isLoading}
            >
              {t("common:back", "Back")}
            </Button>
            <PrimaryActionButton
              className="flex-1"
              onClick={handleCreate}
              disabled={isLoading}
            >
              {isLoading
                ? t("common:creating", "Creating...")
                : t("customer.createCustomer", "Create Customer")}
            </PrimaryActionButton>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            placeholder={t(
              "customer.searchPlaceholder",
              "Search by name or phone...",
            )}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />

          <div className="space-y-2 min-h-50">
            {results.length > 0 ? (
              results.map((c) => (
                <Button
                  key={c.id}
                  variant="ghost"
                  onClick={() => onSelect(c)}
                  className="w-full justify-between h-auto p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 group"
                >
                  <div className="text-left">
                    <div className="typo-bold-14 text-foreground">{c.name}</div>
                    <div className="typo-regular-12 text-muted-foreground font-normal">
                      {c.phone}
                    </div>
                  </div>
                  <div className="typo-bold-12 text-primary group-hover:underline">
                    {t("common:select", "Select")}
                  </div>
                </Button>
              ))
            ) : query ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                {t("customer.noCustomersFound", "No customers found.")}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                {t("customer.typeToSearch", "Type above to search...")}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setIsCreating(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {t("customer.addNewCustomer", "Add New Customer")}
          </Button>
        </div>
      )}
    </div>
  );
}
