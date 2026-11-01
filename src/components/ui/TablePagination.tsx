"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DropdownSelect } from "@/components/ui/DropdownSelect";
import { cn } from "@/lib/cn";

const DEFAULT_PAGE_SIZES = [10, 20, 50];

export interface TablePaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  /** Plural noun in "Showing 1 to 10 of 248 orders". */
  itemLabel: string;
  onPageChange: (page: number) => void;
  /** Shows the "Show 10" page-size dropdown when provided. */
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  /**
   * "attached": sits under a table inside the same bordered card (border-t + padding), as on Students.
   * "plain": no border/padding, for card grids.
   */
  variant?: "attached" | "plain";
  className?: string;
}

const getPageNumbers = (currentPage: number, totalPages: number): (number | "...")[] => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, "...", totalPages];
  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

/** The single table footer used across the admin panel (originally the Students page footer). */
export function TablePagination({
  currentPage,
  totalCount,
  pageSize,
  itemLabel,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  variant = "attached",
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalCount);
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left",
        variant === "attached" && "p-3.5 sm:p-4 border-t border-dash",
        className
      )}
    >
      <span className="body-sm-regular text-primary-400">
        Showing <span className="body-sm-regular font-semibold! text-primary-500">{startItem}</span> to{" "}
        <span className="body-sm-regular font-semibold! text-primary-500">{endItem}</span> of{" "}
        <span className="body-sm-regular font-semibold! text-primary-500">{totalCount.toLocaleString()}</span> {itemLabel}
      </span>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <div className="flex items-center gap-1">
          <motion.button whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="w-8 h-8 rounded-lg border border-dash flex items-center justify-center text-primary-400 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          {pages.map((item, idx) =>
            item === "..." ? (
              <span key={`ellipsis-${idx}`} className="w-6 text-center text-primary-300 body-sm-regular select-none">
                ...
              </span>
            ) : (
              <motion.button whileTap={{ scale: 0.92 }}
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === currentPage ? "page" : undefined}
                className={cn(
                  "w-8 h-8 rounded-lg body-sm-medium transition-all cursor-pointer",
                  item === currentPage
                    ? "bg-brand-orange text-white shadow-2xs"
                    : "border border-dash text-primary-400 hover:bg-slate-50 hover:text-primary-500"
                )}
              >
                {item}
              </motion.button>
            )
          )}

          <motion.button whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="w-8 h-8 rounded-lg border border-dash flex items-center justify-center text-primary-400 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>

        {onPageSizeChange && (
          <div className="w-29 ml-2 shrink-0">
            <DropdownSelect
              options={pageSizeOptions.map((size) => ({ value: String(size), label: `Show ${size}` }))}
              value={String(pageSize)}
              onChange={(val) => onPageSizeChange(Number(val))}
              buttonClassName="!h-8 !py-1 body-sm-medium border-dash rounded-lg px-2.5"
              menuClassName="min-w-29 w-29"
              align="right"
              direction="up"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TablePagination;
