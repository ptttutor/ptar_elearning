"use client";
import { useCallback } from "react";
import { useAdminListState } from "./useAdminListState";

export function useFlashcards(deckId) {
  const fetcher = useCallback(
    async ({ page, limit, search, answerMode, sortBy, sortOrder }) => {
      if (!deckId) return { items: [], total: 0 };

      const params = new URLSearchParams({
        deckId,
        page: String(page),
        pageSize: String(limit),
        search: search || "",
        answerMode: answerMode && answerMode !== "all" ? answerMode : "",
        sortBy: sortBy || "order",
        sortOrder: sortOrder || "asc",
      });

      const res = await fetch(`/api/admin/flashcards?${params}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "โหลดข้อมูลการ์ดไม่สำเร็จ");
      }

      return { items: data.data, total: data.pagination.totalCount, page: data.pagination.page };
    },
    [deckId]
  );

  const list = useAdminListState({
    fetcher,
    initialFilters: { answerMode: "all" },
    defaultSortBy: "order",
    defaultSortOrder: "asc",
  });

  return {
    cards: list.items,
    loading: list.loading,
    filters: list.filters,
    searchInput: list.searchInput,
    setSearchInput: list.setSearchInput,
    pagination: list.pagination,
    fetchCards: list.fetchData,
    handleFilterChange: list.handleFilterChange,
    handlePageChange: list.handlePageChange,
    handleSortChange: list.handleSortChange,
    resetFilters: list.resetFilters,
  };
}
