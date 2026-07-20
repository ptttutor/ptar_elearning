"use client";
import { useCallback } from "react";
import { useAdminListState } from "./useAdminListState";

export function useMockExamQuestions(mockExamId) {
  const fetcher = useCallback(
    async ({ page, limit, search, questionType, topicId, sortBy, sortOrder }) => {
      if (!mockExamId) return { items: [], total: 0 };

      const params = new URLSearchParams({
        mockExamId,
        page: String(page),
        pageSize: String(limit),
        search: search || "",
        questionType: questionType && questionType !== "all" ? questionType : "",
        topicId: topicId && topicId !== "all" ? topicId : "",
        sortBy: sortBy || "order",
        sortOrder: sortOrder || "asc",
      });

      const res = await fetch(`/api/admin/mock-exam-questions?${params}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "โหลดข้อมูลคำถามไม่สำเร็จ");
      }

      return { items: data.data, total: data.pagination.totalCount, page: data.pagination.page };
    },
    [mockExamId]
  );

  const list = useAdminListState({
    fetcher,
    initialFilters: { questionType: "all", topicId: "all" },
    defaultSortBy: "order",
    defaultSortOrder: "asc",
  });

  return {
    questions: list.items,
    loading: list.loading,
    filters: list.filters,
    searchInput: list.searchInput,
    setSearchInput: list.setSearchInput,
    pagination: list.pagination,
    fetchQuestions: list.fetchData,
    handleFilterChange: list.handleFilterChange,
    handlePageChange: list.handlePageChange,
    handleSortChange: list.handleSortChange,
    handleSortSelectChange: list.handleSortSelectChange,
    resetFilters: list.resetFilters,
  };
}
