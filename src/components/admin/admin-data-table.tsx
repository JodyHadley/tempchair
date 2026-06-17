"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render: (item: T) => React.ReactNode;
}

interface Filter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  filters?: Filter[];
  searchKeys: string[];
  searchPlaceholder?: string;
  pageSize?: number;
  getKey: (item: T) => string;
  actions?: (item: T) => React.ReactNode;
}

export function AdminDataTable<T extends Record<string, any>>({
  data,
  columns,
  filters = [],
  searchKeys,
  searchPlaceholder = "Search...",
  pageSize = 25,
  getKey,
  actions,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let result = [...data];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const val = key.split(".").reduce((obj, k) => obj?.[k], item as any);
          return val && String(val).toLowerCase().includes(q);
        }),
      );
    }

    // Filters
    for (const [key, value] of Object.entries(filterValues)) {
      if (value && value !== "__all__") {
        result = result.filter((item) => {
          const val = key.split(".").reduce((obj, k) => obj?.[k], item as any);
          return String(val) === value;
        });
      }
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = sortKey.split(".").reduce((obj, k) => obj?.[k], a as any);
        const bVal = sortKey.split(".").reduce((obj, k) => obj?.[k], b as any);
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }
        const cmp = String(aVal).localeCompare(String(bVal));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, search, filterValues, sortKey, sortDir, searchKeys]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filterValues[filter.key] || "__all__"}
            onValueChange={(v) => {
              if (v) setFilterValues((prev) => ({ ...prev, [filter.key]: v }));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All {filter.label}</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        {search && ` for "${search}"`}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 text-left text-xs font-medium text-muted-foreground ${col.sortable ? "cursor-pointer hover:text-foreground select-none" : ""}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <ArrowUpDown className={`h-3 w-3 ${sortKey === col.key ? "text-primary" : ""}`} />
                    )}
                  </span>
                </th>
              ))}
              {actions && <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.map((item) => (
              <tr key={getKey(item)} className="border-b last:border-0 hover:bg-muted/30">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2">{col.render(item)}</td>
                ))}
                {actions && <td className="px-3 py-2 text-right">{actions(item)}</td>}
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-3 py-8 text-center text-muted-foreground">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
