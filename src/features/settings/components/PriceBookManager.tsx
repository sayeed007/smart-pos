"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { PriceBook } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PriceBookEditorDialog } from "./PriceBookEditorDialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export function PriceBookManager() {
  const [books, setBooks] = useState<PriceBook[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<PriceBook | null>(null);
  const [newBookName, setNewBookName] = useState("");
  const [newBookDesc, setNewBookDesc] = useState("");
  const [deleteState, setDeleteState] = useState<{
    id: string | null;
    name: string;
  }>({ id: null, name: "" });

  const load = async () => {
    const data = await db.priceBooks.toArray();
    setBooks(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!newBookName) return;
    try {
      const newBook: PriceBook = {
        id: `pb-${crypto.randomUUID().slice(0, 8)}`,
        name: newBookName,
        description: newBookDesc,
        isDefault: false,
        createdAt: new Date().toISOString(),
      };
      await db.priceBooks.add(newBook);
      setNewBookName("");
      setNewBookDesc("");
      setIsCreateOpen(false);
      load();
      toast.success("Price Book created.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create Price Book."));
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteState({ id, name });
  };

  const handleConfirmDelete = async () => {
    const { id } = deleteState;
    if (!id) return;

    await db.transaction("rw", db.priceBooks, db.priceOverrides, async () => {
      await db.priceBooks.delete(id);
      await db.priceOverrides.where("priceBookId").equals(id).delete();
    });
    load();
    toast.success("Price Book deleted.");
    setDeleteState({ id: null, name: "" });
  };

  return (
    <Card>
      <PriceBookEditorDialog
        book={editingBook}
        open={!!editingBook}
        onOpenChange={(open) => !open && setEditingBook(null)}
      />

      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Price Books</CardTitle>
          <CardDescription>
            Create different pricing tiers for different store locations.
          </CardDescription>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" /> Add Price Book
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Price Book</DialogTitle>
              <DialogDescription>
                Start a new collection of price overrides.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newBookName}
                  onChange={(e) => setNewBookName(e.target.value)}
                  placeholder="e.g. Airport Pricing"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newBookDesc}
                  onChange={(e) => setNewBookDesc(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Create Book</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {books.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No price books found.
            </div>
          )}
          {books.map((book) => (
            <div
              key={book.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/10 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 typo-bold-14">
                  {book.name}
                  {book.isDefault && (
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider typo-bold-10">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground typo-regular-14">
                  {book.description || "No description"}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingBook(book)}
                >
                  <DollarSign className="w-4 h-4 mr-2" /> Prices
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteClick(book.id, book.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <ConfirmationDialog
        open={!!deleteState.id}
        onOpenChange={(open) => !open && setDeleteState({ id: null, name: "" })}
        title={`Delete Price Book "${deleteState.name}"?`}
        description="This will remove all price overrides associated with it. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </Card>
  );
}
