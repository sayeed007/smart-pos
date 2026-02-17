import { backendApi } from "@/lib/axios";
import { unwrapEnvelope } from "./utils";
import { Product, Variant } from "@/types";
import { ApiEnvelope, ListQueryParams, PaginatedResult } from "@/types/backend";

export interface CreateProductDto {
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  stockQuantity: number;
  minStockLevel: number;
  status: "active" | "inactive";
  image?: string | File;
  type: "simple" | "variable";
  variants?: Variant[];
  uom?: string;
  allowDecimals?: boolean;
  barcodes?: string[];
}

export type UpdateProductDto = Partial<CreateProductDto>;

export class ProductsService {
  private static normalizeTypeToBackend(value?: string) {
    if (!value) return value;
    const normalized = value.toLowerCase();
    return normalized === "variable" ? "VARIABLE" : "SIMPLE";
  }

  private static normalizeTypeFromBackend(value?: string) {
    if (!value) return "simple";
    const normalized = value.toLowerCase();
    return normalized === "variable" ? "variable" : "simple";
  }

  private static normalizeStatusToBackend(value?: string) {
    if (!value) return value;
    const normalized = value.toLowerCase();
    if (normalized === "inactive") return "INACTIVE";
    if (normalized === "draft") return "DRAFT";
    return "ACTIVE";
  }

  private static normalizeStatusFromBackend(value?: string) {
    if (!value) return "active";
    const normalized = value.toLowerCase();
    return normalized === "active" ? "active" : "inactive";
  }

  private static normalizeBarcodes(
    primaryBarcode?: unknown,
    barcodes?: unknown,
  ) {
    const collected: Array<{
      barcode: string;
      type?: string;
      isPrimary?: boolean;
    }> = [];
    const seen = new Set<string>();

    const addBarcode = (value: unknown, isPrimary?: boolean) => {
      if (typeof value !== "string") return;
      const trimmed = value.trim();
      if (!trimmed) return;
      if (seen.has(trimmed)) {
        if (isPrimary) {
          const existing = collected.find((b) => b.barcode === trimmed);
          if (existing) existing.isPrimary = true;
        }
        return;
      }
      collected.push({
        barcode: trimmed,
        ...(isPrimary ? { isPrimary: true } : {}),
      });
      seen.add(trimmed);
    };

    addBarcode(primaryBarcode, true);

    if (Array.isArray(barcodes)) {
      barcodes.forEach((entry) => {
        if (typeof entry === "string") {
          addBarcode(entry);
          return;
        }
        if (entry && typeof entry === "object") {
          const barcode = (entry as { barcode?: unknown }).barcode;
          if (typeof barcode !== "string") return;
          const trimmed = barcode.trim();
          if (!trimmed) return;
          if (seen.has(trimmed)) {
            if ((entry as { isPrimary?: boolean }).isPrimary) {
              const existing = collected.find((b) => b.barcode === trimmed);
              if (existing) existing.isPrimary = true;
            }
            return;
          }
          collected.push({
            ...(entry as { type?: string; isPrimary?: boolean }),
            barcode: trimmed,
          });
          seen.add(trimmed);
        }
      });
    }

    return collected;
  }

  private static mapProductFromBackend(product: Product) {
    const rawBarcodes = (product as any).barcodes;
    const barcodeList = Array.isArray(rawBarcodes)
      ? rawBarcodes
          .map((b: any) => (typeof b === "string" ? b : b?.barcode))
          .filter((b: any) => typeof b === "string" && b.trim() !== "")
      : [];
    const primaryBarcode =
      Array.isArray(rawBarcodes) && rawBarcodes.length
        ? rawBarcodes.find((b: any) => b?.isPrimary)?.barcode
        : undefined;

    return {
      ...product,
      image: (product as any).imageUrl || product.image,
      type: this.normalizeTypeFromBackend((product as any).type),
      status: this.normalizeStatusFromBackend((product as any).status),
      barcode:
        primaryBarcode || barcodeList[0] || (product as any).barcode || "",
      barcodes: barcodeList,
      costPrice: Number((product as any).costPrice ?? 0),
      sellingPrice: Number((product as any).sellingPrice ?? 0),
      taxRate: Number(
        (product as any).taxRate ?? (product as any).taxProfile?.rate ?? 0,
      ),
      stockQuantity: Number((product as any).stockQuantity ?? 0),
      minStockLevel: Number((product as any).minStockLevel ?? 0),
      variants: (product as any).variants?.map((v: any) => ({
        ...v,
        price: Number(v.price ?? 0),
        costPrice: v.costPrice !== undefined ? Number(v.costPrice) : undefined,
        stockQuantity: Number(v.stockQuantity ?? 0),
        barcode: Array.isArray(v.barcodes)
          ? v.barcodes.find((b: any) => b?.isPrimary)?.barcode ||
            v.barcodes[0]?.barcode
          : undefined,
        barcodes: Array.isArray(v.barcodes)
          ? v.barcodes
              .map((b: any) => b?.barcode)
              .filter((b: any) => typeof b === "string" && b.trim() !== "")
          : undefined,
      })),
    } as Product;
  }

  static async list(params?: ListQueryParams) {
    const response = await backendApi.get<
      ApiEnvelope<PaginatedResult<Product>>
    >("/products", {
      params,
    });
    const result = unwrapEnvelope(response.data);

    result.data = result.data.map((product) =>
      this.mapProductFromBackend(product),
    );

    return result;
  }

  static async getById(id: string) {
    const response = await backendApi.get<ApiEnvelope<Product>>(
      `/products/${id}`,
    );
    const product = unwrapEnvelope(response.data);
    return this.mapProductFromBackend(product);
  }

  static async getByBarcode(barcode: string) {
    const response = await backendApi.get<ApiEnvelope<Product>>(
      `/products/barcode/${barcode}`,
    );
    const product = unwrapEnvelope(response.data);
    return this.mapProductFromBackend(product);
  }

  static toFormData(
    data: CreateProductDto | UpdateProductDto,
    mode: "create" | "update" = "create",
  ): FormData {
    const formData = new FormData();
    const allowedKeys =
      mode === "create"
        ? new Set([
            "name",
            "description",
            "sku",
            "type",
            "categoryId",
            "taxProfileId",
            "costPrice",
            "sellingPrice",
            "uom",
            "allowDecimals",
            "minStockLevel",
            "image",
            "imageUrl",
            "variants",
            "barcodes",
            "stockQuantity",
          ])
        : new Set([
            "name",
            "description",
            "categoryId",
            "taxProfileId",
            "costPrice",
            "sellingPrice",
            "uom",
            "allowDecimals",
            "minStockLevel",
            "image",
            "imageUrl",
            "status",
            "variants",
          ]);

    const mergedBarcodes = this.normalizeBarcodes(
      (data as { barcode?: unknown }).barcode,
      (data as { barcodes?: unknown }).barcodes,
    );
    let barcodesHandled = false;

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (!allowedKeys.has(key)) {
        return;
      }

      if (key === "variants") {
        const isUuid = (val: string) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            val,
          );
        const variants = (value as any[]).map((v) => {
          const normalizedBarcode =
            typeof v.barcode === "string" && v.barcode.trim()
              ? v.barcode.trim()
              : Array.isArray(v.barcodes)
                ? v.barcodes[0]
                : undefined;
          const base = {
            name: v.name,
            sku: v.sku,
            price:
              v.price !== undefined && v.price !== null
                ? Number(v.price)
                : undefined,
            costPrice:
              v.costPrice !== undefined && v.costPrice !== null
                ? Number(v.costPrice)
                : undefined,
            barcode: normalizedBarcode,
            attributes: v.attributes || {},
            imageUrl: v.imageUrl, // Preserve if present
            stockQuantity:
              v.stockQuantity !== undefined && v.stockQuantity !== null
                ? Number(v.stockQuantity)
                : undefined,
          };
          if (mode === "update") {
            const id =
              typeof v.id === "string" && isUuid(v.id) ? v.id : undefined;
            return id ? { id, ...base } : base;
          }
          return base;
        });
        formData.append(key, JSON.stringify(variants));
      } else if (key === "barcodes") {
        if (mergedBarcodes.length) {
          formData.append(key, JSON.stringify(mergedBarcodes));
        }
        barcodesHandled = true;
      } else if (key === "image") {
        if (value instanceof File) {
          formData.append("image", value);
        } else if (typeof value === "string") {
          // Map 'image' string to 'imageUrl' for backend DTO
          formData.append("imageUrl", value);
        }
      } else if (key === "type") {
        const normalizedType = this.normalizeTypeToBackend(String(value));
        if (normalizedType) formData.append(key, normalizedType);
      } else if (key === "status") {
        const normalizedStatus = this.normalizeStatusToBackend(String(value));
        if (normalizedStatus) formData.append(key, normalizedStatus);
      } else {
        // Skip empty strings for UUID fields — backend validates with @IsUUID()
        const strValue = String(value);
        if (
          (key === "categoryId" || key === "taxProfileId") &&
          strValue === ""
        ) {
          return;
        }
        formData.append(key, strValue);
      }
    });

    if (!barcodesHandled && mergedBarcodes.length && mode === "create") {
      formData.append("barcodes", JSON.stringify(mergedBarcodes));
    }
    return formData;
  }

  static async create(data: CreateProductDto) {
    const formData = this.toFormData(data, "create");
    const response = await backendApi.post<ApiEnvelope<Product>>(
      "/products",
      formData,
      {
        headers: { "Content-Type": undefined },
      },
    );
    return unwrapEnvelope(response.data);
  }

  static async update(id: string, data: UpdateProductDto) {
    // For updates, we only send what's needed.
    // If image is a string (URL), we might not need to send it if backend ignores text 'image' field for file interceptor.
    // But backend logic says: if file exists, update image.
    const formData = this.toFormData(data, "update");
    const response = await backendApi.patch<ApiEnvelope<Product>>(
      `/products/${id}`,
      formData,
      {
        headers: { "Content-Type": undefined },
      },
    );
    return unwrapEnvelope(response.data);
  }

  static async delete(id: string) {
    const response = await backendApi.delete<ApiEnvelope<void>>(
      `/products/${id}`,
    );
    return unwrapEnvelope(response.data);
  }
}
