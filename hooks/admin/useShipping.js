"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

export function useShipping() {
  const { toast } = useToast();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    shippingMethod: "all",
    startDate: "",
    endDate: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchShipments = useCallback(async (customFilters = null, customPagination = null) => {
    setLoading(true);
    const currentFilters = customFilters || filtersRef.current;
    const currentPagination = customPagination || pagination;

    try {
      const params = new URLSearchParams({
        page: (currentPagination?.page || 1).toString(),
        pageSize: (currentPagination?.pageSize || 10).toString(),
        search: currentFilters.search || "",
        status: currentFilters.status || "ALL",
        shippingMethod: currentFilters.shippingMethod !== "all" ? currentFilters.shippingMethod || "" : "",
        startDate: currentFilters.startDate || "",
        endDate: currentFilters.endDate || "",
        sortBy: currentFilters.sortBy || "createdAt",
        sortOrder: currentFilters.sortOrder || "desc",
      });

      const response = await fetch(`/api/admin/shipping?${params}`);
      const result = await response.json();

      if (result.success) {
        setShipments(result.data);
        setPagination({
          page: currentPagination?.page || 1,
          pageSize: currentPagination?.pageSize || 10,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        });
        if (customFilters) setFilters(currentFilters);
      } else {
        toast({ variant: "destructive", title: result.error || "เกิดข้อผิดพลาดในการโหลดข้อมูลการจัดส่ง" });
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการโหลดข้อมูล" });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const fetchShipmentDetail = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/admin/shipping/${id}`);
      const result = await response.json();

      if (result.success) return result.data;
      toast({ variant: "destructive", title: result.error || "เกิดข้อผิดพลาดในการโหลดรายละเอียด" });
      return null;
    } catch (error) {
      console.error("Error fetching shipment detail:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการโหลดรายละเอียด" });
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, [toast]);

  const updateShipment = useCallback(async (id, updateData) => {
    try {
      const response = await fetch(`/api/admin/shipping/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        toast({ title: "อัพเดทข้อมูลการจัดส่งสำเร็จ" });
        fetchShipments();
        return true;
      } else {
        toast({ variant: "destructive", title: result.error || "เกิดข้อผิดพลาดในการอัพเดทข้อมูล" });
        return false;
      }
    } catch (error) {
      console.error("Error updating shipment:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล" });
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, fetchShipments]);

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filtersRef.current, [key]: value };
    fetchShipments(newFilters, { page: 1, pageSize: pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchShipments, pagination.pageSize]);

  const handleSortSelectChange = useCallback((value) => {
    const [sortBy, sortOrder] = value.split("_");
    const newFilters = { ...filtersRef.current, sortBy, sortOrder };
    fetchShipments(newFilters, { page: 1, pageSize: pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchShipments, pagination.pageSize]);

  const handlePageChange = useCallback((page) => {
    fetchShipments(filtersRef.current, {
      page,
      pageSize: pagination.pageSize,
      totalCount: pagination.totalCount,
      totalPages: pagination.totalPages,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchShipments, pagination.pageSize, pagination.totalCount, pagination.totalPages]);

  const resetFilters = useCallback(() => {
    const defaultFilters = {
      search: "",
      status: "ALL",
      shippingMethod: "all",
      startDate: "",
      endDate: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setSearchInput("");
    fetchShipments(defaultFilters, { page: 1, pageSize: pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchShipments, pagination.pageSize]);

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

  // Initial load
  useEffect(() => {
    fetchShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    shipments,
    setShipments,
    loading,
    detailLoading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchShipmentDetail,
    updateShipment,
    handleFilterChange,
    handleSortSelectChange,
    handlePageChange,
    resetFilters,
  };
}
