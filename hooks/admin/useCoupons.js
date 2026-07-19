"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

export function useCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    applicable: "all",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchCoupons = useCallback(async (customFilters = null, customPagination = null) => {
    setLoading(true);
    const currentFilters = customFilters || filtersRef.current;
    const currentPagination = customPagination || pagination;

    try {
      const params = new URLSearchParams({
        page: (currentPagination?.page || 1).toString(),
        limit: (currentPagination?.pageSize || 10).toString(),
        search: currentFilters?.search || "",
        type: currentFilters?.type !== "all" ? currentFilters?.type || "" : "",
        status: currentFilters?.status !== "all" ? currentFilters?.status || "" : "",
        applicable: currentFilters?.applicable !== "all" ? currentFilters?.applicable || "" : "",
      });

      const response = await fetch(`/api/admin/coupons?${params}`);
      if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      const result = await response.json();

      if (result.success) {
        setCoupons(result.data.coupons);
        setPagination({
          page: result.data.pagination.current,
          pageSize: result.data.pagination.pageSize,
          totalCount: result.data.pagination.total,
          totalPages: result.data.pagination.totalPages,
        });
        if (customFilters) setFilters(currentFilters);
      }
    } catch (error) {
      console.error("Fetch coupons error:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการดึงข้อมูลคูปอง" });
      setCoupons([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filtersRef.current, [key]: value };
    fetchCoupons(newFilters, { page: 1, pageSize: pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCoupons, pagination.pageSize]);

  const handlePageChange = useCallback((page) => {
    fetchCoupons(filtersRef.current, {
      page,
      pageSize: pagination.pageSize,
      totalCount: pagination.totalCount,
      totalPages: pagination.totalPages,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCoupons, pagination.pageSize, pagination.totalCount, pagination.totalPages]);

  const resetFilters = useCallback(() => {
    const defaultFilters = { search: "", type: "all", status: "all", applicable: "all" };
    setSearchInput("");
    fetchCoupons(defaultFilters, { page: 1, pageSize: pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCoupons, pagination.pageSize]);

  // Initial fetch
  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search (skip the run that fires immediately on mount)
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const timer = setTimeout(() => {
      handleFilterChange("search", searchInput);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return {
    coupons,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchCoupons,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  };
}
