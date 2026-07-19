import { useCallback, useMemo } from "react";
import { useAdminListState } from "./useAdminListState";

export const useUsers = () => {
  const fetcher = useCallback(async ({ page, limit, search, role, status, sortBy, sortOrder }) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search: search || "",
      role: role || "all",
      status: status || "all",
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
    });

    const response = await fetch(`/api/admin/users?${params}`);
    if (!response.ok) {
      let message = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.error) message = errorData.error;
      } catch {
        // Keep default HTTP status message when response body is not JSON.
      }
      throw new Error(message);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    }

    return {
      items: data.data.users,
      total: data.data.total,
      page: data.data.pagination?.page,
    };
  }, []);

  const list = useAdminListState({
    fetcher,
    initialFilters: { role: "all", status: "all" },
  });

  // Stats data, derived from the current page of results.
  const stats = useMemo(() => {
    const users = list.items;
    if (!users.length) return { total: 0, students: 0, instructors: 0, admins: 0 };

    return {
      total: users.length,
      students: users.filter((user) => user.role === "STUDENT").length,
      instructors: users.filter((user) => user.role === "INSTRUCTOR").length,
      admins: users.filter((user) => user.role === "ADMIN").length,
    };
  }, [list.items]);

  return {
    users: list.items,
    loading: list.loading,
    stats,
    filters: list.filters,
    searchInput: list.searchInput,
    setSearchInput: list.setSearchInput,
    pagination: list.pagination,
    fetchUsers: list.fetchData,
    handleFilterChange: list.handleFilterChange,
    handlePageChange: list.handlePageChange,
    handleSortChange: list.handleSortChange,
    handleSortSelectChange: list.handleSortSelectChange,
    resetFilters: list.resetFilters,
  };
};
