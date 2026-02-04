"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Product, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => (await api.get("/products")).data,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()),
  );

  const createMutation = useMutation({
    mutationFn: async (newProduct: Partial<Product>) => {
      return api.post("/products", newProduct);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDialogOpen(false);
      toast.success("Product created successfully");
    },
    onError: () => toast.error("Failed to create product"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      sellingPrice: Number(formData.get("sellingPrice")),
      stockQuantity: Number(formData.get("stockQuantity")),
      categoryId: formData.get("categoryId") as string,
      status: "active" as const, // Fixed for now
      barcode: formData.get("sku") as string, // Reuse SKU for demo
      costPrice: 0,
      taxRate: 0,
      minStockLevel: 5,
    };

    createMutation.mutate(productData);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Products
          </h1>
          <p className="text-gray-400 font-medium">Manage your inventory</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="rounded-2xl bg-[#f87171] hover:bg-[#ef4444] shadow-lg shadow-red-100"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-white border-gray-100"
          />
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-gray-100 shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="py-6 pl-8 font-black uppercase text-xs tracking-widest text-gray-400">
                Name
              </TableHead>
              <TableHead className="font-black uppercase text-xs tracking-widest text-gray-400">
                SKU
              </TableHead>
              <TableHead className="font-black uppercase text-xs tracking-widest text-gray-400">
                Category
              </TableHead>
              <TableHead className="font-black uppercase text-xs tracking-widest text-gray-400 text-right">
                Price
              </TableHead>
              <TableHead className="font-black uppercase text-xs tracking-widest text-gray-400 text-right">
                Stock
              </TableHead>
              <TableHead className="pr-8 text-right font-black uppercase text-xs tracking-widest text-gray-400">
                Actions
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
            ) : filteredProducts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Package size={48} className="mb-4 text-gray-200" />
                    <p className="font-bold">No products found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts?.map((product) => (
                <TableRow
                  key={product.id}
                  className="hover:bg-gray-50/50 transition-colors border-gray-100"
                >
                  <TableCell className="py-5 pl-8 font-bold text-gray-900">
                    {product.name}
                  </TableCell>
                  <TableCell className="font-medium text-gray-500">
                    {product.sku}
                  </TableCell>
                  <TableCell>
                    {categories?.find((c) => c.id === product.categoryId)
                      ?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="text-right font-bold text-gray-900">
                    ${product.sellingPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${product.stockQuantity < 10 ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}
                    >
                      {product.stockQuantity} Units
                    </span>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-[#f87171]"
                    >
                      <Edit size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" required className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="categoryId" defaultValue="1">
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="sellingPrice"
                  type="number"
                  step="0.01"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stockQuantity"
                  type="number"
                  required
                  className="rounded-xl"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl bg-[#f87171] hover:bg-[#ef4444] mt-4"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Save Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
