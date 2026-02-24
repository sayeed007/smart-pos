import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants, type Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

type DataPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  totalItemsLabel?: (totalItems: number) => React.ReactNode;
  pageSizeSuffix?: React.ReactNode;
  goToLabel?: React.ReactNode;
  goToPageLabel?: React.ReactNode;
  pageWindowMobile?: number;
  pageWindowDesktop?: number;
  className?: string;
};

type PageToken = number | "ellipsis";

function buildPageTokens(
  currentPage: number,
  totalPages: number,
  windowSize: number,
): PageToken[] {
  if (totalPages <= 1) return [1];

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);

  const start = Math.max(1, currentPage - windowSize);
  const end = Math.min(totalPages, currentPage + windowSize);

  for (let page = start; page <= end; page += 1) {
    pages.add(page);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const tokens: PageToken[] = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const current = sorted[i];
    const previous = sorted[i - 1];

    if (i > 0 && current - previous > 1) {
      tokens.push("ellipsis");
    }

    tokens.push(current);
  }

  return tokens;
}

function DataPagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  hasPreviousPage,
  hasNextPage,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  totalItemsLabel,
  pageSizeSuffix,
  goToLabel,
  goToPageLabel,
  pageWindowMobile = 1,
  pageWindowDesktop = 2,
  className,
}: DataPaginationProps) {
  const { t } = useTranslation("common");
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safePage = Math.min(Math.max(1, page || 1), safeTotalPages);

  const canPrevious = hasPreviousPage ?? safePage > 1;
  const canNext = hasNextPage ?? safePage < safeTotalPages;
  const [goToInput, setGoToInput] = React.useState("");
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const updateMedia = () => setIsDesktop(mediaQuery.matches);
    updateMedia();

    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", updateMedia);
      return () => mediaQuery.removeEventListener("change", updateMedia);
    }

    mediaQuery.addListener(updateMedia);
    return () => mediaQuery.removeListener(updateMedia);
  }, []);

  const computedOptions = React.useMemo(() => {
    const unique = new Set(
      pageSizeOptions.filter((option) => Number.isFinite(option) && option > 0),
    );

    if (pageSize && Number.isFinite(pageSize) && pageSize > 0) {
      unique.add(pageSize);
    }

    return Array.from(unique).sort((a, b) => a - b);
  }, [pageSizeOptions, pageSize]);

  const effectivePageSize =
    pageSize && pageSize > 0
      ? pageSize
      : computedOptions.length > 0
        ? computedOptions[0]
        : 10;

  const paginationWindow = isDesktop ? pageWindowDesktop : pageWindowMobile;
  const pageTokens = React.useMemo(
    () => buildPageTokens(safePage, safeTotalPages, paginationWindow),
    [safePage, safeTotalPages, paginationWindow],
  );

  const handleGoToPage = React.useCallback(() => {
    const parsed = Number(goToInput.trim());
    if (!Number.isFinite(parsed)) return;

    const clamped = Math.min(safeTotalPages, Math.max(1, Math.trunc(parsed)));
    if (clamped !== safePage) {
      onPageChange(clamped);
    }
    setGoToInput("");
  }, [goToInput, onPageChange, safePage, safeTotalPages]);

  const totalItemsDisplay =
    typeof totalItems === "number" ? Math.max(0, totalItems) : undefined;
  const resolvedGoToLabel = goToLabel ?? t("goTo", "Go to");
  const resolvedGoToPageLabel = goToPageLabel ?? t("page", "Page");
  const resolvedPageSizeSuffix = pageSizeSuffix ?? t("perPageSuffix", "/ page");

  return (
    <div
      className={cn(
        "w-full flex flex-col md:flex-row items-center justify-between gap-4",
        className,
      )}
    >
      {typeof totalItemsDisplay === "number" ? (
        <div className="hidden sm:block min-w-0 truncate text-muted-foreground typo-medium-14 whitespace-nowrap">
          {totalItemsLabel
            ? totalItemsLabel(totalItemsDisplay)
            : t("totalItems", {
                count: totalItemsDisplay,
                defaultValue: "Total {{count}} items",
              })}
        </div>
      ) : null}

      <Pagination className="mx-0 w-auto">
        <PaginationContent className="flex-wrap justify-center">
          <PaginationItem>
            <PaginationLink
              size="icon"
              aria-label="Go to previous page"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (canPrevious) {
                  onPageChange(Math.max(1, safePage - 1));
                }
              }}
              className={
                canPrevious
                  ? "cursor-pointer"
                  : "pointer-events-none opacity-50"
              }
            >
              <ChevronLeftIcon className="size-4" />
            </PaginationLink>
          </PaginationItem>

          {pageTokens.map((token, index) =>
            token === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={token}>
                <PaginationLink
                  href="#"
                  size="icon"
                  isActive={token === safePage}
                  onClick={(event) => {
                    event.preventDefault();
                    if (token !== safePage) {
                      onPageChange(token);
                    }
                  }}
                  className="h-9 w-9"
                >
                  {token}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationLink
              size="icon"
              aria-label="Go to next page"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                if (canNext) {
                  onPageChange(Math.min(safeTotalPages, safePage + 1));
                }
              }}
              className={
                canNext ? "cursor-pointer" : "pointer-events-none opacity-50"
              }
            >
              <ChevronRightIcon className="size-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {onPageSizeChange ? (
          <Select
            value={String(effectivePageSize)}
            onValueChange={(value) => {
              const nextPageSize = Number(value);
              if (Number.isFinite(nextPageSize) && nextPageSize > 0) {
                onPageSizeChange(nextPageSize);
              }
            }}
          >
            <SelectTrigger className="h-10 w-[118px] lg:w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {computedOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} {resolvedPageSizeSuffix}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground typo-medium-14 whitespace-nowrap">
            {resolvedGoToLabel}
          </span>
          <Input
            value={goToInput}
            onChange={(event) => {
              const next = event.target.value.replace(/[^\d]/g, "");
              setGoToInput(next);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleGoToPage();
              }
            }}
            inputMode="numeric"
            placeholder={String(safePage)}
            className="h-10 w-16 lg:w-20 text-center"
          />
          <span className="hidden lg:inline text-muted-foreground typo-medium-14 whitespace-nowrap">
            {resolvedGoToPageLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export {
  DataPagination,
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
