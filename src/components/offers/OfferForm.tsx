"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";

import { Offer, Category, Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const ALL_TYPES = [
  "percentage",
  "fixed",
  "buy_x_get_y",
  "bundle",
  "category_discount",
] as const;

const optionalNumber = (schema: z.ZodType<number, z.ZodTypeDef, unknown>) =>
  z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }
    return value;
  }, schema.optional());

const offerSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    type: z.enum(ALL_TYPES),
    value: optionalNumber(z.coerce.number()),
    applicableOn: z.enum(["all", "category", "product"]),
    categoryId: z.string().optional().nullable(),
    productIds: z.array(z.string()).default([]),
    minPurchase: optionalNumber(
      z.coerce.number().min(0, { message: "Must be 0 or more" }),
    ),
    maxDiscount: optionalNumber(
      z.coerce.number().min(0, { message: "Must be 0 or more" }),
    ),
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    status: z.enum(["active", "inactive", "scheduled"]),
    bogo: z
      .object({
        buyProductIds: z.array(z.string()).default([]),
        getProductIds: z.array(z.string()).default([]),
        buyQty: z
          .union([z.number(), z.string()])
          .transform((val) => Number(val))
          .pipe(z.number().min(1, { message: "Must be at least 1" })),
        getQty: z
          .union([z.number(), z.string()])
          .transform((val) => Number(val))
          .pipe(z.number().min(1, { message: "Must be at least 1" })),
        sameProduct: z.boolean().default(true),
        discountType: z.enum(["free", "percent", "fixed"]),
        discountValue: optionalNumber(z.coerce.number()),
      })
      .optional(),
    bundle: z
      .object({
        productIds: z.array(z.string()).default([]),
        pricingType: z.enum(["fixed_price", "percent"]),
        price: optionalNumber(z.coerce.number()),
        percent: optionalNumber(z.coerce.number()),
      })
      .optional(),
  })
  .superRefine((values, ctx) => {
    if (
      values.type === "category_discount" &&
      values.applicableOn !== "category"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["applicableOn"],
        message: "Category discount must apply to a category",
      });
    }

    if (
      values.type !== "buy_x_get_y" &&
      values.type !== "bundle" &&
      values.applicableOn === "product"
    ) {
      if (!values.productIds || values.productIds.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["productIds"],
          message: "Select at least one product",
        });
      }
    }

    if (values.applicableOn === "category" && !values.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["categoryId"],
        message: "Select a category",
      });
    }

    if (
      values.type === "percentage" ||
      values.type === "fixed" ||
      values.type === "category_discount"
    ) {
      if (values.value === undefined || Number.isNaN(values.value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Value is required",
        });
      } else if (
        (values.type === "percentage" || values.type === "category_discount") &&
        (values.value <= 0 || values.value > 100)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Value must be between 1 and 100",
        });
      } else if (values.type === "fixed" && values.value <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Value must be greater than 0",
        });
      }
    }

    if (values.type === "buy_x_get_y") {
      if (!values.bogo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bogo"],
          message: "BOGO details are required",
        });
      } else {
        if (!values.bogo.buyProductIds.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["bogo", "buyProductIds"],
            message: "Select buy products",
          });
        }
        if (!values.bogo.sameProduct && !values.bogo.getProductIds.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["bogo", "getProductIds"],
            message: "Select get products",
          });
        }
        if (values.bogo.discountType !== "free") {
          if (
            values.bogo.discountValue === undefined ||
            Number.isNaN(values.bogo.discountValue)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["bogo", "discountValue"],
              message: "Discount value is required",
            });
          } else if (
            values.bogo.discountType === "percent" &&
            (values.bogo.discountValue <= 0 || values.bogo.discountValue > 100)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["bogo", "discountValue"],
              message: "Percent must be between 1 and 100",
            });
          } else if (
            values.bogo.discountType === "fixed" &&
            values.bogo.discountValue <= 0
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["bogo", "discountValue"],
              message: "Amount must be greater than 0",
            });
          }
        }
      }
    }

    if (values.type === "bundle") {
      if (!values.bundle) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bundle"],
          message: "Bundle details are required",
        });
      } else {
        if (
          !values.bundle.productIds.length ||
          values.bundle.productIds.length < 2
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["bundle", "productIds"],
            message: "Select at least 2 products",
          });
        }
        if (values.bundle.pricingType === "fixed_price") {
          if (
            values.bundle.price === undefined ||
            Number.isNaN(values.bundle.price) ||
            values.bundle.price <= 0
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["bundle", "price"],
              message: "Bundle price must be greater than 0",
            });
          }
        }
        if (values.bundle.pricingType === "percent") {
          if (
            values.bundle.percent === undefined ||
            Number.isNaN(values.bundle.percent) ||
            values.bundle.percent <= 0 ||
            values.bundle.percent > 100
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["bundle", "percent"],
              message: "Percent must be between 1 and 100",
            });
          }
        }
      }
    }

    if (values.startDate && values.endDate) {
      const start = new Date(values.startDate);
      const end = new Date(values.endDate);
      if (start > end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End date must be on or after start date",
        });
      }
    }
  });

export type OfferFormValues = z.infer<typeof offerSchema>;

export type OfferFormPayload = Omit<
  OfferFormValues,
  "productIds" | "bogo" | "bundle" | "categoryId"
> & {
  productIds: string[];
  categoryId?: string | null;
  rule?: Offer["rule"];
};

export interface OfferFormProps {
  initialValues?: Partial<Offer> | null;
  products?: Product[];
  categories?: Category[];
  onSubmit: (values: OfferFormPayload) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  disabled?: boolean;
}

const normalizeDate = (value?: string) => {
  if (!value) return "";
  return value.split("T")[0];
};

interface ProductMultiSelectProps {
  products: Product[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  idPrefix: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

function ProductMultiSelect({
  products,
  selectedIds,
  onToggle,
  search,
  onSearchChange,
  idPrefix,
  searchPlaceholder,
  emptyText,
}: ProductMultiSelectProps) {
  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const query = search.toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(query),
    );
  }, [products, search]);

  return (
    <div className="border rounded-md p-2">
      <div className="relative mb-2">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder || "Search..."}
          className="pl-8"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <ScrollArea className="h-50">
        <div className="grid gap-2 p-1">
          {filtered.map((product) => {
            const checkboxId = `${idPrefix}-${product.id}`;
            return (
              <div
                key={product.id}
                className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md"
              >
                <Checkbox
                  id={checkboxId}
                  checked={selectedIds.includes(product.id)}
                  onCheckedChange={() => onToggle(product.id)}
                />
                <label
                  htmlFor={checkboxId}
                  className="flex-1 cursor-pointer flex justify-between text-sm"
                >
                  <span>{product.name}</span>
                  <span className="text-muted-foreground">
                    ${product.sellingPrice}
                  </span>
                </label>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-2 text-sm text-muted-foreground">
              {emptyText || "No results"}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function OfferForm({
  initialValues,
  products = [],
  categories = [],
  onSubmit,
  onCancel,
  submitLabel,
  disabled,
}: OfferFormProps) {
  const { t } = useTranslation(["offers", "common"]);
  const [productSearch, setProductSearch] = useState("");
  const [bogoBuySearch, setBogoBuySearch] = useState("");
  const [bogoGetSearch, setBogoGetSearch] = useState("");
  const [bundleSearch, setBundleSearch] = useState("");

  const buyXGetYRule =
    initialValues?.rule && "buyXGetY" in initialValues.rule
      ? initialValues.rule.buyXGetY
      : undefined;
  const bundleRule =
    initialValues?.rule && "bundle" in initialValues.rule
      ? initialValues.rule.bundle
      : undefined;

  const defaultValues = useMemo<OfferFormValues>(
    () => ({
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      type: (initialValues?.type as OfferFormValues["type"]) ?? "percentage",
      value:
        initialValues?.value !== undefined
          ? Number(initialValues.value)
          : undefined,
      applicableOn:
        (initialValues?.applicableOn as OfferFormValues["applicableOn"]) ??
        "all",
      categoryId: initialValues?.categoryId ?? undefined,
      productIds: initialValues?.productIds ?? [],
      minPurchase:
        initialValues?.minPurchase !== undefined
          ? Number(initialValues.minPurchase)
          : undefined,
      maxDiscount:
        initialValues?.maxDiscount !== undefined
          ? Number(initialValues.maxDiscount)
          : undefined,
      startDate: normalizeDate(initialValues?.startDate),
      endDate: normalizeDate(initialValues?.endDate),
      status: (initialValues?.status as OfferFormValues["status"]) ?? "active",
      bogo: {
        buyProductIds: buyXGetYRule?.buyProductIds ?? [],
        getProductIds: buyXGetYRule?.getProductIds ?? [],
        buyQty: buyXGetYRule?.buyQty ?? 1,
        getQty: buyXGetYRule?.getQty ?? 1,
        sameProduct: buyXGetYRule?.sameProduct ?? true,
        discountType: buyXGetYRule?.discountType ?? "free",
        discountValue: buyXGetYRule?.discountValue ?? undefined,
      },
      bundle: {
        productIds: bundleRule?.productIds ?? [],
        pricingType: bundleRule?.pricingType ?? "fixed_price",
        price: bundleRule?.price ?? undefined,
        percent: bundleRule?.percent ?? undefined,
      },
    }),
    [
      buyXGetYRule?.buyProductIds,
      buyXGetYRule?.buyQty,
      buyXGetYRule?.discountType,
      buyXGetYRule?.discountValue,
      buyXGetYRule?.getProductIds,
      buyXGetYRule?.getQty,
      buyXGetYRule?.sameProduct,
      bundleRule?.percent,
      bundleRule?.price,
      bundleRule?.pricingType,
      bundleRule?.productIds,
      initialValues?.applicableOn,
      initialValues?.categoryId,
      initialValues?.description,
      initialValues?.endDate,
      initialValues?.maxDiscount,
      initialValues?.minPurchase,
      initialValues?.name,
      initialValues?.productIds,
      initialValues?.startDate,
      initialValues?.status,
      initialValues?.type,
      initialValues?.value,
    ],
  );

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues,
  });

  const watchType = form.watch("type");
  const watchApplicableOn = form.watch("applicableOn");
  const watchSameProduct = form.watch("bogo.sameProduct");
  const watchBogoDiscountType = form.watch("bogo.discountType");
  const watchBundlePricingType = form.watch("bundle.pricingType");

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  useEffect(() => {
    if (watchType === "category_discount") {
      form.setValue("applicableOn", "category");
    }
    if (watchType === "buy_x_get_y" || watchType === "bundle") {
      form.setValue("applicableOn", "product");
      form.setValue("value", 0);
    }
  }, [watchType, form]);

  const showProductPicker =
    watchApplicableOn === "product" &&
    watchType !== "buy_x_get_y" &&
    watchType !== "bundle";

  const handleSubmit = async (values: OfferFormValues) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bogo, bundle, ...restValues } = values;
    let rule: Offer["rule"] | undefined;
    let productIds = values.applicableOn === "product" ? values.productIds : [];
    let applicableOn = values.applicableOn;
    let value =
      values.value !== undefined && Number.isFinite(values.value)
        ? Number(values.value)
        : undefined;

    if (values.type === "buy_x_get_y" && values.bogo) {
      const buyProductIds = values.bogo.buyProductIds;
      const getProductIds = values.bogo.sameProduct
        ? values.bogo.buyProductIds
        : values.bogo.getProductIds;
      rule = {
        buyXGetY: {
          buyProductIds,
          getProductIds,
          buyQty: Number(values.bogo.buyQty),
          getQty: Number(values.bogo.getQty),
          sameProduct: values.bogo.sameProduct,
          discountType: values.bogo.discountType,
          discountValue:
            values.bogo.discountType === "free"
              ? undefined
              : values.bogo.discountValue !== undefined
                ? Number(values.bogo.discountValue)
                : undefined,
        },
      };
      productIds = buyProductIds;
      applicableOn = "product";
      value = 0;
    }

    if (values.type === "bundle" && values.bundle) {
      rule = {
        bundle: {
          productIds: values.bundle.productIds,
          pricingType: values.bundle.pricingType,
          price:
            values.bundle.pricingType === "fixed_price"
              ? Number(values.bundle.price)
              : undefined,
          percent:
            values.bundle.pricingType === "percent"
              ? Number(values.bundle.percent)
              : undefined,
        },
      };
      productIds = values.bundle.productIds;
      applicableOn = "product";
      value = 0;
    }

    if (values.type === "category_discount") {
      applicableOn = "category";
    }

    const payload: OfferFormPayload = {
      ...restValues,
      applicableOn,
      productIds,
      categoryId: applicableOn === "category" ? values.categoryId : null,
      minPurchase:
        values.minPurchase !== undefined && values.minPurchase > 0
          ? values.minPurchase
          : undefined,
      maxDiscount:
        values.maxDiscount !== undefined && values.maxDiscount > 0
          ? values.maxDiscount
          : undefined,
      value,
      rule,
    };

    await onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid gap-4 py-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("fields.name")} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder={t("placeholders.name")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("fields.description")}{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("placeholders.description")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("fields.type")} <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("fields.type")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">
                      {t("types.percentage")}
                    </SelectItem>
                    <SelectItem value="fixed">{t("types.fixed")}</SelectItem>
                    <SelectItem value="buy_x_get_y">
                      {t("types.buy_x_get_y")}
                    </SelectItem>
                    <SelectItem value="bundle">{t("types.bundle")}</SelectItem>
                    <SelectItem value="category_discount">
                      {t("types.category_discount")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicableOn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("fields.applicableOn")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={
                    watchType === "category_discount" ||
                    watchType === "buy_x_get_y" ||
                    watchType === "bundle"
                  }
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("fields.applicableOn")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">{t("applicableOn.all")}</SelectItem>
                    <SelectItem value="category">
                      {t("applicableOn.category")}
                    </SelectItem>
                    <SelectItem value="product">
                      {t("applicableOn.product")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {(watchType === "percentage" ||
          watchType === "fixed" ||
          watchType === "category_discount") && (
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {watchType === "fixed"
                    ? t("fields.discountAmount")
                    : t("fields.discountValue")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("fields.status")} <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">{t("status.active")}</SelectItem>
                  <SelectItem value="inactive">
                    {t("status.inactive")}
                  </SelectItem>
                  <SelectItem value="scheduled">
                    {t("status.scheduled", "Scheduled")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchApplicableOn === "category" && (
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("fields.selectCategory")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("fields.selectCategory")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {showProductPicker && (
          <FormField
            control={form.control}
            name="productIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("fields.selectProducts")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <ProductMultiSelect
                  products={products}
                  selectedIds={field.value ?? []}
                  onToggle={(id) => {
                    const current = field.value ?? [];
                    field.onChange(
                      current.includes(id)
                        ? current.filter((item) => item !== id)
                        : [...current, id],
                    );
                  }}
                  search={productSearch}
                  onSearchChange={setProductSearch}
                  idPrefix="offer-products"
                  searchPlaceholder={t("common:searchPlaceholder", "Search...")}
                  emptyText={t("common:noResults", "No results")}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {watchType === "buy_x_get_y" && (
          <div className="rounded-md border p-4 space-y-4">
            <div className="text-sm font-semibold">
              {t("types.buy_x_get_y")}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bogo.buyQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("offers:buyQty", "Buy Qty")}</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bogo.getQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("offers:getQty", "Get Qty")}</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bogo.discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("offers:discountType", "Discount Type")}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="free">
                          {t("offers:free", "Free")}
                        </SelectItem>
                        <SelectItem value="percent">
                          {t("offers:percent", "Percent")}
                        </SelectItem>
                        <SelectItem value="fixed">
                          {t("offers:fixed", "Fixed Amount")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchBogoDiscountType !== "free" && (
                <FormField
                  control={form.control}
                  name="bogo.discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {watchBogoDiscountType === "percent"
                          ? t("offers:discountPercent", "Percent")
                          : t("offers:discountAmount", "Amount")}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <FormField
              control={form.control}
              name="bogo.sameProduct"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(Boolean(checked))
                      }
                    />
                  </FormControl>
                  <FormLabel className="mb-0">
                    {t("offers:sameProduct", "Get the same product")}
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bogo.buyProductIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("offers:buyProducts", "Buy Products")}
                  </FormLabel>
                  <ProductMultiSelect
                    products={products}
                    selectedIds={field.value ?? []}
                    onToggle={(id) => {
                      const current = field.value ?? [];
                      field.onChange(
                        current.includes(id)
                          ? current.filter((item) => item !== id)
                          : [...current, id],
                      );
                    }}
                    search={bogoBuySearch}
                    onSearchChange={setBogoBuySearch}
                    idPrefix="bogo-buy"
                    searchPlaceholder={t(
                      "common:searchPlaceholder",
                      "Search...",
                    )}
                    emptyText={t("common:noResults", "No results")}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {!watchSameProduct && (
              <FormField
                control={form.control}
                name="bogo.getProductIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("offers:getProducts", "Get Products")}
                    </FormLabel>
                    <ProductMultiSelect
                      products={products}
                      selectedIds={field.value ?? []}
                      onToggle={(id) => {
                        const current = field.value ?? [];
                        field.onChange(
                          current.includes(id)
                            ? current.filter((item) => item !== id)
                            : [...current, id],
                        );
                      }}
                      search={bogoGetSearch}
                      onSearchChange={setBogoGetSearch}
                      idPrefix="bogo-get"
                      searchPlaceholder={t(
                        "common:searchPlaceholder",
                        "Search...",
                      )}
                      emptyText={t("common:noResults", "No results")}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}
        {watchType === "bundle" && (
          <div className="rounded-md border p-4 space-y-4">
            <div className="text-sm font-semibold">{t("types.bundle")}</div>
            <FormField
              control={form.control}
              name="bundle.productIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("offers:bundleProducts", "Bundle Products")}
                  </FormLabel>
                  <ProductMultiSelect
                    products={products}
                    selectedIds={field.value ?? []}
                    onToggle={(id) => {
                      const current = field.value ?? [];
                      field.onChange(
                        current.includes(id)
                          ? current.filter((item) => item !== id)
                          : [...current, id],
                      );
                    }}
                    search={bundleSearch}
                    onSearchChange={setBundleSearch}
                    idPrefix="bundle-products"
                    searchPlaceholder={t(
                      "common:searchPlaceholder",
                      "Search...",
                    )}
                    emptyText={t("common:noResults", "No results")}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bundle.pricingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("offers:bundlePricing", "Bundle Pricing")}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed_price">
                          {t("offers:fixedPrice", "Fixed Price")}
                        </SelectItem>
                        <SelectItem value="percent">
                          {t("offers:percentOff", "Percent Off")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchBundlePricingType === "fixed_price" && (
                <FormField
                  control={form.control}
                  name="bundle.price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("offers:bundlePrice", "Bundle Price")}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchBundlePricingType === "percent" && (
                <FormField
                  control={form.control}
                  name="bundle.percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("offers:discountPercent", "Percent")}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minPurchase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.minPurchase")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("placeholders.minPurchase")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxDiscount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.maxDiscount")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("placeholders.maxDiscount")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("fields.startDate")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("fields.endDate")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={disabled}
          >
            {t("common:cancel")}
          </Button>
          <PrimaryActionButton type="submit" disabled={disabled}>
            {submitLabel || t("common:save")}
          </PrimaryActionButton>
        </div>
      </form>
    </Form>
  );
}
