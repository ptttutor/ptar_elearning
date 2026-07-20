"use client";
import { useCallback } from "react";
import { useAdminListState } from "./useAdminListState";

export function useMockExams() {
  const fetcher = useCallback(async ({ page, limit, search, subject, status, sortBy, sortOrder }) => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(limit),
      search: search || "",
      subject: subject && subject !== "all" ? subject : "",
      status: status && status !== "all" ? status : "",
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
    });

    const res = await fetch(`/api/admin/mock-exams?${params}`);
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "โหลดข้อมูลข้อสอบจำลองไม่สำเร็จ");
    }

    return { items: data.data, total: data.pagination.totalCount, page: data.pagination.page };
  }, []);

  const list = useAdminListState({
    fetcher,
    initialFilters: { subject: "all", status: "all" },
  });

  return {
    exams: list.items,
    loading: list.loading,
    filters: list.filters,
    searchInput: list.searchInput,
    setSearchInput: list.setSearchInput,
    pagination: list.pagination,
    fetchExams: list.fetchData,
    handleFilterChange: list.handleFilterChange,
    handlePageChange: list.handlePageChange,
    handleSortChange: list.handleSortChange,
    handleSortSelectChange: list.handleSortSelectChange,
    resetFilters: list.resetFilters,
  };
}
