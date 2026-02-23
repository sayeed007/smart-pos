"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { User, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Customer } from "@/types";
import { db } from "@/lib/db";
import { usePOSStore } from "@/features/pos/store/pos-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

interface CustomerSearchComboboxProps {
  onSelect: (customer: Customer) => void;
  placeholder?: string;
  className?: string;
}

export function CustomerSearchCombobox({
  onSelect,
  placeholder = "Search customers (mobile/name)...",
  className,
}: CustomerSearchComboboxProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const allowOpenOnFocusRef = useRef(false);
  const suppressOpenRef = useRef(false);

  const { setModal } = usePOSStore();
  const BATCH_SIZE = 20;

  const isDebouncing = search !== debouncedSearch;

  // Auto-focus logic (optional, keep disabled or enable if needed)
  useEffect(() => {
    // inputRef.current?.focus();
  }, []);

  const handleSelect = useCallback(
    (customer: Customer) => {
      onSelect(customer);
      setSearch("");
      setIsOpen(false);
      setOffset(0);
      setHasMore(true);

      suppressOpenRef.current = true;
    },
    [onSelect],
  );

  // Load Logic
  useEffect(() => {
    const query = debouncedSearch.trim();
    let active = true;

    setOffset(0);
    setHasMore(true);

    const loadCustomers = async () => {
      setIsLoading(true);
      try {
        let results: Customer[] = [];

        if (!query) {
          // Load all customers paginated (ordered by name)
          // Requires 'name' index which we added in db version 9
          results = await db.customers.reverse().limit(BATCH_SIZE).toArray();

          // If we want alphabetical sorting by default, we can do:
          // .orderBy("name").limit(BATCH_SIZE).toArray()
          // But handling offset with orderBy might be tricky if not consistent.
          // Dexie supports offset on Collection.

          setHasMore(results.length === BATCH_SIZE);
        } else {
          // Search customers by phone OR name
          results = await db.customers
            .where("phone")
            .startsWith(query)
            .or("name")
            .startsWithIgnoreCase(query)
            .limit(BATCH_SIZE)
            .toArray();

          setHasMore(false); // Disable pagination for search results to simplify
        }

        if (active) {
          // Sort results alphabetically if searching?
          // Dexie OR query might return mixed order.
          if (query) {
            results.sort((a, b) => a.name.localeCompare(b.name));
          }

          setCustomers(results);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error("Failed to load customers", error);
        toast.error(getErrorMessage(error, "Failed to load customers"));
        if (active) setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();

    return () => {
      active = false;
    };
  }, [debouncedSearch]);

  // Load More Logic
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || search.trim()) return;

    setIsLoading(true);
    try {
      const newOffset = offset + BATCH_SIZE;
      const moreCustomers = await db.customers
        .reverse()
        .offset(newOffset)
        .limit(BATCH_SIZE)
        .toArray();

      if (moreCustomers.length > 0) {
        setCustomers((prev) => [...prev, ...moreCustomers]);
        setOffset(newOffset);
        setHasMore(moreCustomers.length === BATCH_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more customers", error);
      toast.error(getErrorMessage(error, "Failed to load more customers"));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, search, offset]);

  // Handle Scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrollPercentage =
        (target.scrollTop + target.clientHeight) / target.scrollHeight;

      if (scrollPercentage > 0.8 && hasMore && !isLoading) {
        loadMore();
      }
    },
    [hasMore, isLoading, loadMore],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (customers.length > 0 || search.trim())) {
      setIsOpen(true);
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % customers.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + customers.length) % customers.length,
      );
    } else if (e.key === "Enter") {
      if (isDebouncing || isLoading) {
        e.preventDefault();
        return;
      }

      if (customers.length > 0) {
        e.preventDefault();
        handleSelect(customers[selectedIndex]);
      } else if (search.trim()) {
        e.preventDefault();
        // Smart create logic
        const isPhone = /^\d+$/.test(search.trim());
        if (isPhone) {
          setModal("member", { phone: search.trim() });
        } else {
          setModal("member");
        }
        setSearch("");
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearch("");
      allowOpenOnFocusRef.current = false;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        allowOpenOnFocusRef.current = false;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <User className="text-muted-foreground" size={20} />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={search}
          onPointerDown={() => {
            allowOpenOnFocusRef.current = true;
            if (document.activeElement === inputRef.current) {
              setIsOpen(true);
            }
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (suppressOpenRef.current) {
              suppressOpenRef.current = false;
              return;
            }
            if (
              allowOpenOnFocusRef.current ||
              search.trim() ||
              customers.length > 0
            ) {
              setIsOpen(true);
            }
            allowOpenOnFocusRef.current = false;
          }}
          onKeyDown={handleKeyDown}
          className="pl-11 pr-10 h-11 typo-medium-14"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSearch("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 rounded-xl border-2 border-primary/20 bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div
            className="max-h-64 overflow-y-auto scrollbar-thin"
            onScroll={handleScroll}
          >
            {customers.length > 0 ? (
              customers.map((customer, index) => (
                <Button
                  key={customer.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-between h-auto px-4 py-3 border-b border-border/50 last:border-b-0 rounded-none",
                    index === selectedIndex
                      ? "bg-primary/15 border-primary/30"
                      : "hover:bg-primary/10 active:bg-primary/15",
                  )}
                  onClick={() => handleSelect(customer)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-foreground truncate typo-semibold-14">
                      {customer.name}
                    </p>
                    <p className="text-muted-foreground truncate mt-0.5 typo-regular-12">
                      {customer.phone}
                    </p>
                  </div>
                  {customer.loyaltyPoints > 0 && (
                    <div className="text-amber-600 shrink-0 typo-medium-12">
                      {customer.loyaltyPoints} pts
                    </div>
                  )}
                </Button>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-muted-foreground typo-regular-14">
                {search.trim() ? (
                  <div className="flex flex-col items-center gap-2">
                    <span>No customer found.</span>
                    <span className="opacity-70 typo-regular-12">
                      Press Enter to create new
                    </span>
                  </div>
                ) : isLoading ? (
                  <span>Loading...</span>
                ) : (
                  <span>No customers.</span>
                )}
              </div>
            )}

            {isLoading && customers.length > 0 && (
              <div className="px-4 py-2 text-center text-muted-foreground typo-regular-12">
                Loading more...
              </div>
            )}

            {/* Always show create option if search is present */}
            {search.trim() && (
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto px-4 py-3 border-t border-dashed border-border/50 hover:bg-primary/5 text-primary rounded-none",
                  customers.length === 0 && selectedIndex === 0
                    ? "bg-primary/10"
                    : "",
                )}
                onClick={() => {
                  const isPhone = /^\d+$/.test(search.trim());
                  if (isPhone) {
                    setModal("member", { phone: search.trim() });
                  } else {
                    setModal("member");
                  }
                  setSearch("");
                  setIsOpen(false);
                }}
              >
                <Plus size={16} className="mr-2" />
                <span className="typo-semibold-14">
                  Create new &quot;{search}&quot;
                </span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
