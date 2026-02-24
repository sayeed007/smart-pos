"use client";

import { OfferFormModal } from "@/components/offers/OfferFormModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import {
  useCreateOffer,
  useDeleteOffer,
  useOffers,
  useUpdateOffer,
} from "@/hooks/api/offers";
import { getErrorMessage } from "@/lib/errors";
import { CreateOfferDto } from "@/lib/services/backend/offers.service";
import { Offer } from "@/types";
import {
  Archive,
  DollarSign,
  Gift,
  Loader2,
  Percent,
  Plus,
  Search,
  SquarePen,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function OffersPage() {
  const { t } = useTranslation(["offers", "common"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: offersData, isLoading } = useOffers(page, 20);
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const deleteOffer = useDeleteOffer();

  const offers = offersData?.data || [];
  const meta = offersData?.meta;

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
      if (selectedOffer) {
        await updateOffer.mutateAsync({
          id: selectedOffer.id,
          data: offerData,
        });
        toast.success(t("updateSuccess"));
      } else {
        await createOffer.mutateAsync(offerData as unknown as CreateOfferDto);
        toast.success(t("createSuccess"));
      }
    } catch (error) {
      console.error(error);
      toast.error(
        getErrorMessage(error, t("common:error", "An error occurred")),
      );
      throw error;
    }
  };

  const handleDelete = (id: string) => {
    setOfferToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!offerToDelete) return;
    try {
      await deleteOffer.mutateAsync(offerToDelete);
      toast.success(t("deleteSuccess", "Offer deleted successfully"));
      setOfferToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, t("common:error")));
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
    if (offer.type === "buy_x_get_y") {
      const rule =
        offer.rule && "buyXGetY" in offer.rule
          ? offer.rule.buyXGetY
          : undefined;
      if (!rule) return "Buy X Get Y";
      const discountLabel =
        rule.discountType === "free"
          ? "Free"
          : rule.discountType === "percent"
            ? `${rule.discountValue ?? 0}% off`
            : `$${rule.discountValue ?? 0} off`;
      return `Buy ${rule.buyQty} Get ${rule.getQty} (${discountLabel})`;
    }
    if (offer.type === "bundle") {
      const rule =
        offer.rule && "bundle" in offer.rule ? offer.rule.bundle : undefined;
      if (!rule) return "Bundle";
      if (rule.pricingType === "fixed_price") {
        return `Bundle $${rule.price ?? 0}`;
      }
      return `Bundle ${rule.percent ?? 0}% off`;
    }
    if (offer.type === "fixed") return `$${offer.value}`;
    return `${offer.value}%`;
  };

  const filteredOffers = offers
    .filter((offer) => offer.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      // Sort by status: active first
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;

      // Then sort by name
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <PageHeader title={t("title")} description={t("subtitle")}>
        <PrimaryActionButton onClick={handleAdd} icon={Plus}>
          {t("createOffer")}
        </PrimaryActionButton>
      </PageHeader>

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
      ) : filteredOffers.length > 0 ? (
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
                      <h3 className="leading-tight mb-1 line-clamp-2 typo-bold-16">
                        {offer.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`border-none rounded-sm px-2 py-0.5 h-auto typo-regular-12 ${
                          offer.status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-100/80"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-100/80"
                        }`}
                      >
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {t(`status.${offer.status}` as any, offer.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground line-clamp-2 min-h-10 typo-regular-14">
                  {offer.description}
                </p>

                {/* Details */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between typo-regular-14">
                    <span className="text-muted-foreground">
                      {t("fields.type", "Type")}:
                    </span>
                    <span className="text-foreground capitalize typo-medium-14">
                      {offer.type === "buy_x_get_y" ? "Bogo" : offer.type}
                    </span>
                  </div>
                  <div className="flex justify-between typo-regular-14">
                    <span className="text-muted-foreground">
                      {offer.type === "fixed"
                        ? t("fields.discountAmount", "Discount")
                        : t("fields.discountValue", "Discount")}
                      :
                    </span>
                    <span className="text-green-600 typo-bold-14">
                      {getOfferValueDisplay(offer)}
                    </span>
                  </div>
                  <div className="flex justify-between typo-regular-14">
                    <span className="text-muted-foreground">Valid Until:</span>
                    <span className="text-foreground typo-medium-14">
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
                  title={t("archive", "Archive")}
                >
                  <Archive className="w-4 h-4 text-gray-700" />
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

      {/* Pagination Controls */}
      {meta && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    if (meta.hasPreviousPage) {
                      setPage((p) => Math.max(1, p - 1));
                    }
                  }}
                  className={
                    !meta.hasPreviousPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-muted-foreground px-4 typo-medium-14">
                  Page {meta.page} of {meta.totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    if (meta.hasNextPage) {
                      setPage((p) => p + 1);
                    }
                  }}
                  className={
                    !meta.hasNextPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <OfferFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        offerToEdit={selectedOffer}
        onSave={handleSave}
      />

      <ConfirmationDialog
        open={!!offerToDelete}
        onOpenChange={(open) => !open && setOfferToDelete(null)}
        title={t("archiveOfferTitle", "Archive Offer?")}
        description={t(
          "archiveOfferDescription",
          "This offer will be marked as inactive and archived.",
        )}
        confirmLabel={t("archive", "Archive")}
        onConfirm={handleConfirmDelete}
        loading={deleteOffer.isPending}
        variant="destructive"
      />
    </div>
  );
}
