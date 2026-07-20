"use client";
import { useCallback } from "react";
import { useAdminListState } from "./useAdminListState";

export function useMockTopics() {
  const fetcher = useCallback(async ({ page, limit, search, subject, sortBy, sortOrder }) => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(limit),
      search: search || "",
      subject: subject && subject !== "all" ? subject : "",
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
    });

    const res = await fetch(`/api/admin/mock-topics?${params}`);
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "โหลดข้อมูลหัวข้อไม่สำเร็จ");
    }

    return { items: data.data, total: data.pagination.totalCount, page: data.pagination.page };
  }, []);

  const list = useAdminListState({
    fetcher,
    initialFilters: { subject: "all" },
  });

  return {
    topics: list.items,
    loading: list.loading,
    filters: list.filters,
    searchInput: list.searchInput,
    setSearchInput: list.setSearchInput,
    pagination: list.pagination,
    fetchTopics: list.fetchData,
    handleFilterChange: list.handleFilterChange,
    handlePageChange: list.handlePageChange,
    handleSortChange: list.handleSortChange,
    handleSortSelectChange: list.handleSortSelectChange,
    resetFilters: list.resetFilters,
  };
}

// Lightweight, unpaginated fetch for populating a topic <Select> for one
// subject (used by MockQuestionModal) — separate from the paginated admin-table hook above.
export async function fetchMockTopicsForSubject(subject) {
  if (!subject) return [];
  const params = new URLSearchParams({ subject, pageSize: "200", page: "1" });
  const response = await fetch(`/api/admin/mock-topics?${params}`);
  const data = await response.json();
  return data.success ? data.data : [];
}
