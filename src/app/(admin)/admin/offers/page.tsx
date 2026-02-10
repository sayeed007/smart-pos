"use client";

import { OfferFormModal } from "@/components/offers/OfferFormModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import { MOCK_OFFERS } from "@/lib/mock-data";
import { Offer } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  Gift,
  Loader2,
  Percent,
  Plus,
  Search,
  SquarePen,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function OffersPage() {
  const { t } = useTranslation(["offers", "common"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: offers, isLoading } = useQuery<Offer[]>({
    queryKey: ["offers"],
    queryFn: async () => (await api.get("/offers")).data,
    initialData: MOCK_OFFERS,
  });

  const handleEdit = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedOffer(null);
    setIsModalOpen(true);
  };

  const handleSave = async (offerData: Partial<Offer>) => {
    try {
      if (offerData.id) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success(t("updateSuccess"));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success(t("createSuccess"));
      }
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(t("common:error", "An error occurred"));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("common:confirmDelete", "Are you sure?"))) {
      try {
        console.log("Deleting offer", id);
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success(t("deleteSuccess", "Offer deleted successfully"));
        queryClient.invalidateQueries({ queryKey: ["offers"] });
      } catch (error) {
        console.error(error);
        toast.error(t("common:error"));
      }
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getOfferIcon = (type: string) => {
    switch (type) {
      case "percentage":
      case "category_discount":
        return <Percent className="w-5 h-5 text-orange-500" />;
      case "fixed":
        return <DollarSign className="w-5 h-5 text-orange-500" />;
      case "buy_x_get_y":
      case "bundle":
        return <Gift className="w-5 h-5 text-orange-500" />;
      default:
        return <Tag className="w-5 h-5 text-orange-500" />;
    }
  };

  const getOfferValueDisplay = (offer: Offer) => {
    if (offer.type === "buy_x_get_y") return "Buy 2 Get 1"; // Simplification for dummy
    if (offer.type === "fixed") return `$${offer.value}`;
    return `${offer.value}%`;
  };

  const filteredOffers = offers?.filter((offer) =>
    offer.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="typo-bold-18 tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="typo-regular-16 text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-chart-1 hover:bg-chart-1/90 text-card"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("createOffer")}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("common:searchPlaceholder", "Search offers...")}
          className="pl-9 bg-card border-none shadow-sm rounded-lg h-10 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Offers Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredOffers && filteredOffers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.map((offer) => (
            <Card
              key={offer.id}
              className="border-none shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1 space-y-4">
                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      {getOfferIcon(offer.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight mb-1 line-clamp-2">
                        {offer.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 hover:bg-green-100/80 border-none rounded-sm px-2 py-0.5 h-auto font-normal text-xs"
                      >
                        {t(`status.${offer.status}` as any, offer.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">
                  {offer.description}
                </p>

                {/* Details */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("fields.type", "Type")}:
                    </span>
                    <span className="font-medium text-foreground capitalize">
                      {offer.type === "buy_x_get_y" ? "Bogo" : offer.type}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {offer.type === "fixed"
                        ? t("fields.discountAmount", "Discount")
                        : t("fields.discountValue", "Discount")}
                      :
                    </span>
                    <span className="font-bold text-green-600">
                      {getOfferValueDisplay(offer)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valid Until:</span>
                    <span className="font-medium text-foreground">
                      {formatDate(offer.endDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200"
                  onClick={() => handleEdit(offer)}
                >
                  <SquarePen className="w-4 h-4 mr-2" />
                  {t("common:edit", "Edit")}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-200 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                  onClick={() => handleDelete(offer.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {t("noOffers", "No offers found")}
        </div>
      )}

      <OfferFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        offerToEdit={selectedOffer}
        onSave={handleSave}
      />
    </div>
  );
}
