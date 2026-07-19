import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Stats data
  const stats = useMemo(() => {
    if (!users.length) return { total: 0, students: 0, instructors: 0, admins: 0 };

    return {
      total: users.length,
      students: users.filter(user => user.role === 'STUDENT').length,
      instructors: users.filter(user => user.role === 'INSTRUCTOR').length,
      admins: users.filter(user => user.role === 'ADMIN').length,
    };
  }, [users]);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (pagination?.current || 1).toString(),
        limit: (pagination?.pageSize || 10).toString(),
        search: filters.search || "",
        role: filters.role || "all",
        status: filters.status || "all",
        sortBy: filters.sortBy || "createdAt",
        sortOrder: filters.sortOrder || "desc",
      });

      const response = await fetch(`/api/admin/users?${params}`);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch (_) {
          // Keep default HTTP status message when response body is not JSON.
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setPagination(prev => ({
          ...prev,
          total: data.data.total,
          current: data.data.pagination?.page ?? prev.current,
        }));
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการโหลดข้อมูล" });
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาด: ${error.message}` });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.current, pagination.pageSize]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      current: 1,
    }));
  }, []);

  // Handle pagination page changes
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, current: page }));
  }, []);

  // Handle sortable column header clicks — toggles asc/desc when clicking
  // the already-active column, otherwise switches to that column desc-first.
  const handleSortChange = useCallback((field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      role: "all",
      status: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setSearchInput("");
    setPagination(prev => ({
      ...prev,
      current: 1,
    }));
  }, []);

  // Apply search with debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange('search', searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, handleFilterChange]);

  // Fetch data when filters or pagination change.
  // Depend only on `fetchUsers` — it already closes over pagination.current /
  // pagination.pageSize / filters and only gets a new reference when one of
  // those primitives actually changes. Depending on the whole `pagination`
  // object here instead caused an infinite loop: fetchUsers' success handler
  // calls setPagination with a freshly spread object every time (even when
  // current/total are unchanged), which is a new reference on every render,
  // which re-triggered this effect, which re-ran fetchUsers, forever.
  useEffect(() => {
    if (pagination.current && pagination.pageSize) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUsers]);

  return {
    users,
    loading,
    stats,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchUsers,
    handleFilterChange,
    handlePageChange,
    handleSortChange,
    resetFilters,
  };
};
