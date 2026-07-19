import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Generic list-page state for admin sections: debounced search + filters +
 * sortable columns + server-side pagination + fetch — the same shape every
 * admin list page needs (Users, Courses, Orders, ...), wired the loop-safe
 * way.
 *
 * IMPORTANT: the final effect depends only on `fetchData`, never on the
 * whole `pagination`/`filters` object. A prior version of this pattern
 * (hooks/admin/useUsers.js) depended on `pagination` directly — but
 * fetchData's success handler calls setPagination with a freshly spread
 * object every time (even when the values are unchanged), which is a new
 * reference on every render, which re-triggered the effect, which re-ran
 * fetchData, forever. Depending on `fetchData` alone is safe because it's a
 * useCallback that only gets a new reference when a primitive it closes
 * over (pagination.current, pagination.pageSize, filters, fetcher) actually
 * changes.
 *
 * @param {object} options
 * @param {(params: {page:number, limit:number, [key:string]:any}) => Promise<{items:any[], total:number, page?:number, meta?:any}>} options.fetcher
 *   Must be stable (wrap in useCallback in the caller) — an inline arrow
 *   function recreated every render works but re-fetches on every render.
 *   `meta` is an optional passthrough slot for resource-specific summary
 *   data the endpoint returns alongside the page of results — e.g. Users'
 *   role-count stat cards need real counts across the *whole* table, which
 *   is not something you can derive from just the current (filtered,
 *   paginated) `items` array, so the API returns it separately and the
 *   fetcher forwards it here untouched.
 * @param {object} [options.initialFilters] Extra filter fields beyond
 *   search/sortBy/sortOrder, e.g. `{ role: "all", status: "all" }`.
 * @param {string} [options.defaultSortBy]
 * @param {string} [options.defaultSortOrder] "asc" | "desc"
 * @param {number} [options.pageSize]
 * @param {number} [options.searchDebounceMs]
 */
export function useAdminListState({
  fetcher,
  initialFilters = {},
  defaultSortBy = "createdAt",
  defaultSortOrder = "desc",
  pageSize = 10,
  searchDebounceMs = 500,
}) {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    sortBy: defaultSortBy,
    sortOrder: defaultSortOrder,
    ...initialFilters,
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize,
    total: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcher({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      });
      setItems(result.items || []);
      setMeta(result.meta ?? null);
      setPagination((prev) => ({
        ...prev,
        total: result.total ?? 0,
        current: result.page ?? prev.current,
      }));
    } catch (error) {
      console.error("Fetch list error:", error);
      toast({ variant: "destructive", title: error?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล" });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, filters, pagination.current, pagination.pageSize]);

  // Reset to page 1 whenever a filter changes — a stale page number past
  // the new (smaller) result set would just render an empty table.
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, current: page }));
  }, []);

  // Sortable column header clicks — toggles asc/desc when clicking the
  // already-active column, otherwise switches to that column desc-first.
  const handleSortChange = useCallback((field) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "desc" ? "asc" : "desc",
    }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  // For AdminFilterBar's combined sort <Select>, whose options are
  // "field-order" strings (e.g. "createdAt-desc") rather than a column
  // click — splits and applies both parts in one filter change.
  const handleSortSelectChange = useCallback((combinedValue) => {
    const [sortBy, sortOrder] = combinedValue.split("-");
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      sortBy: defaultSortBy,
      sortOrder: defaultSortOrder,
      ...initialFilters,
    });
    setSearchInput("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search -> filters.search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange("search", searchInput);
    }, searchDebounceMs);
    return () => clearTimeout(timer);
  }, [searchInput, handleFilterChange, searchDebounceMs]);

  // Fetch on mount and whenever filters/pagination actually change — see
  // the docblock above for why this depends on `fetchData` alone.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    items,
    meta,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchData,
    handleFilterChange,
    handlePageChange,
    handleSortChange,
    handleSortSelectChange,
    resetFilters,
  };
}
