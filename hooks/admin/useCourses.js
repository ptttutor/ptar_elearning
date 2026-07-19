"use client";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAdminListState } from "./useAdminListState";

export function useCourses() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [instLoading, setInstLoading] = useState(false);

  const fetcher = useCallback(
    async ({ page, limit, search, status, instructorId, categoryId, subject, gradeLevel, minPrice, maxPrice, sortBy, sortOrder }) => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(limit),
        search: search || "",
        status: status || "ALL",
        instructorId: instructorId && instructorId !== "all" ? instructorId : "",
        categoryId: categoryId && categoryId !== "all" ? categoryId : "",
        subject: subject && subject !== "all" ? subject : "",
        gradeLevel: gradeLevel && gradeLevel !== "all" ? gradeLevel : "",
        sortBy: sortBy || "createdAt",
        sortOrder: sortOrder || "desc",
      });
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      const res = await fetch(`/api/admin/courses?${params}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "โหลดข้อมูลคอร์สไม่สำเร็จ");
      }

      return {
        items: data.data,
        total: data.pagination.totalCount,
        page: data.pagination.page,
      };
    },
    []
  );

  const list = useAdminListState({
    fetcher,
    initialFilters: {
      status: "ALL",
      instructorId: "all",
      categoryId: "all",
      subject: "all",
      gradeLevel: "all",
      minPrice: "",
      maxPrice: "",
    },
  });

  const fetchCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.data || []);
    } catch (e) {
      toast({ variant: "destructive", title: "โหลดข้อมูลหมวดหมู่ไม่สำเร็จ" });
    } finally {
      setCatLoading(false);
    }
  }, [toast]);

  const fetchInstructors = useCallback(async () => {
    setInstLoading(true);
    try {
      const res = await fetch("/api/admin/users?role=INSTRUCTOR");
      const data = await res.json();
      setInstructors(data.data?.users || []);
    } catch (e) {
      toast({ variant: "destructive", title: "โหลดข้อมูลผู้สอนไม่สำเร็จ" });
    } finally {
      setInstLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
    fetchInstructors();
  }, [fetchCategories, fetchInstructors]);

  return {
    courses: list.items,
    loading: list.loading,
    categories,
    catLoading,
    instructors,
    instLoading,
    filters: list.filters,
    searchInput: list.searchInput,
    setSearchInput: list.setSearchInput,
    pagination: list.pagination,
    fetchCourses: list.fetchData,
    handleFilterChange: list.handleFilterChange,
    handlePageChange: list.handlePageChange,
    handleSortChange: list.handleSortChange,
    handleSortSelectChange: list.handleSortSelectChange,
    resetFilters: list.resetFilters,
  };
}
