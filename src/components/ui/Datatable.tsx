/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface ColumnDef<T> {
  key?: string;
  header: React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";

  showFilterIcon?: boolean;

  onIconClick?: () => void;
  onHeaderClick?: () => void;
  sortDirection?: "asc" | "desc" | null;

  filter?: {
    options: string[];
    selectedValue?: string;
    onChange: (nextValue: string) => void;
  };

  render?: (row: T, rowIndex: number) => React.ReactNode;
  // Compatibility with accessorKey and cell
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export type Column<T> = ColumnDef<T>;

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey?: (row: T, rowIndex: number) => string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: React.ReactNode;
  selectable?: boolean;
  selectedRowKeys?: (string | number)[];
  onSelectRow?: (key: string | number, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  className?: string;
  containerClassName?: string;
  tableClassName?: string;
  headerClassName?: string;
  thClassName?: string;
  cellClassName?: string;
  minWidth?: string;
  renderExpandedRow?: (row: T, rowIndex: number) => React.ReactNode;
  expandedRowKeys?: (string | number)[];
  isLoading?: boolean;
  verticalBorders?: boolean;
  /** Extra classes per body row (e.g. highlight failing rows). */
  rowClassName?: (row: T, rowIndex: number) => string | undefined;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey = (row, idx) => (row && (row.id ?? idx)) || idx,
  onRowClick,
  emptyMessage = "No data found",
  selectable = false,
  selectedRowKeys = [],
  onSelectRow,
  onSelectAll,
  className,
  containerClassName,
  tableClassName,
  headerClassName,
  thClassName,
  cellClassName,
  minWidth = "min-w-full",
  renderExpandedRow,
  expandedRowKeys = [],
  isLoading = false,
  verticalBorders = true,
  rowClassName,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedRowKeys.length === data.length;

  if (isLoading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-7 h-7 border-2 border-blue/100 border-t-transparent rounded-full animate-spin" />
        <span className="body-sm-regular text-primary-300">Loading records...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full overflow-x-auto border border-dash rounded-xl scrollbar-hide",
        containerClassName,
        className
      )}
    >
      <table
        className={cn(
          "w-full border-collapse text-left",
          minWidth,
          tableClassName
        )}
      >
        <thead
          className={cn(
            "bg-gray-bg border-b border-dash body-xsm-medium subtext-500",
            headerClassName
          )}
        >
          <tr>
            {selectable && (
              <th className="py-3.5 px-4 w-10 border-r border-dash">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-blue focus:ring-blue"
                  checked={allSelected}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                />
              </th>
            )}
            {columns.map((col, idx) => {
              const handleToggleFilter = () => {
                if (!col.filter) return;
                const { options, selectedValue, onChange } = col.filter;
                const cycleList = ["", ...options];
                const currentIndex = cycleList.indexOf(selectedValue || "");
                const nextIndex = (currentIndex + 1) % cycleList.length;

                onChange(cycleList[nextIndex]);
              };

              const handleHeaderClick = () => {
                if (col.onHeaderClick) {
                  col.onHeaderClick();
                } else if (col.onIconClick) {
                  col.onIconClick();
                } else if (col.filter) {
                  handleToggleFilter();
                }
              };

              const shouldShowIcon =
                col.showFilterIcon ||
                Boolean(col.filter) ||
                Boolean(col.onIconClick) ||
                Boolean(col.onHeaderClick) ||
                col.sortDirection !== undefined;

              const isLastColumn = idx === columns.length - 1;
              const isClickable =
                Boolean(col.onIconClick) ||
                Boolean(col.onHeaderClick) ||
                Boolean(col.filter);

              return (
                <th
                  key={col.key || String(col.accessorKey) || idx}
                  onClick={isClickable ? handleHeaderClick : undefined}
                  className={cn(
                    "py-3 body-xsm-medium-inter subtext-500 select-none outline-none focus:outline-none",
                    thClassName || "px-3 sm:px-3.5",
                    isClickable &&
                      "cursor-pointer hover:text-primary-500 transition-colors",
                    !isLastColumn && verticalBorders && "border-r border-dash",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.className
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      col.align === "center" && "justify-center",
                      col.align === "right" && "justify-end"
                    )}
                  >
                    <span>{col.header}</span>

                    {shouldShowIcon && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHeaderClick();
                        }}
                        className={cn(
                          "p-0.5 rounded transition-colors hover:bg-slate-200 cursor-pointer focus:outline-none",
                          col.filter?.selectedValue || col.sortDirection
                            ? "text-primary-500"
                            : "subtext-500"
                        )}
                        title={
                          col.sortDirection === "asc"
                            ? "Ascending (click to sort descending)"
                            : col.sortDirection === "desc"
                            ? "Descending (click to sort ascending)"
                            : "Sort"
                        }
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="shrink-0"
                        >
                          <path
                            d="M11.3307 6.33333L7.9974 3L4.66406 6.33333H11.3307Z"
                            fill={
                              col.sortDirection === "asc"
                                ? "var(--dash-text)"
                                : col.sortDirection === "desc"
                                ? "var(--dash-border)"
                                : col.filter?.selectedValue
                                ? "var(--color-blue)"
                                : "var(--dash-muted)"
                            }
                          />
                          <path
                            d="M11.3307 9.66667L7.9974 13L4.66406 9.66667H11.3307Z"
                            fill={
                              col.sortDirection === "desc"
                                ? "var(--dash-text)"
                                : col.sortDirection === "asc"
                                ? "var(--dash-border)"
                                : col.filter?.selectedValue
                                ? "var(--color-blue)"
                                : "var(--dash-muted)"
                            }
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="bg-white">
          {data.length === 0 ? (
            <tr>
              <td
                className="py-8 px-4 text-center body-sm-regular text-primary-300"
                colSpan={columns.length + (selectable ? 1 : 0)}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const key = rowKey(row, rowIndex);
              const isSelected = selectedRowKeys.includes(key);
              const isExpanded = expandedRowKeys.includes(key);

              return (
                <React.Fragment key={key}>
                  <motion.tr
                    // Staggered fade-in whenever rows change (page, filter, sort)
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut", delay: Math.min(rowIndex, 12) * 0.025 }}
                    className={cn(
                      "border-b border-dash transition-colors hover:bg-slate-50/50",
                      onRowClick && "cursor-pointer",
                      isSelected && "bg-brand-orange-light/30",
                      rowClassName?.(row, rowIndex)
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td
                        className="py-3 px-4 border-r border-dash"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue focus:ring-blue"
                          checked={isSelected}
                          onChange={(e) => onSelectRow?.(key, e.target.checked)}
                        />
                      </td>
                    )}
                    {columns.map((col, idx) => {
                      const isLastColumn = idx === columns.length - 1;
                      const cellContent = col.render
                        ? col.render(row, rowIndex)
                        : col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? (row as any)[col.accessorKey]
                        : col.key
                        ? (row as any)[col.key]
                        : null;

                      return (
                        <td
                          key={col.key || String(col.accessorKey) || idx}
                          className={cn(
                            "py-3 text-primary-500 body-sm-regular",
                            cellClassName || "px-3 sm:px-3.5",
                            !isLastColumn && verticalBorders && "border-r border-dash",
                            col.align === "center" && "text-center",
                            col.align === "right" && "text-right",
                            col.className
                          )}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </motion.tr>
                  {renderExpandedRow && (
                    <tr
                      className={cn(
                        "transition-all",
                        isExpanded
                          ? "border-b border-dash last:border-b-0"
                          : "border-none"
                      )}
                    >
                      <td
                        colSpan={columns.length + (selectable ? 1 : 0)}
                        className="p-0"
                      >
                        <div
                          className={cn(
                            "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                            isExpanded
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          )}
                        >
                          <div className="overflow-hidden min-h-0">
                            {renderExpandedRow(row, rowIndex)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// Export both Datatable and DataTable for complete consistency
export { DataTable as Datatable };
export default DataTable;
