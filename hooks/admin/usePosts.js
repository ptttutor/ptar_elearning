"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

export function usePosts() {
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [postTypes, setPostTypes] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postTypesLoading, setPostTypesLoading] = useState(true);
  const [authorsLoading, setAuthorsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    postTypeId: "all",
    authorId: "all",
    dateFrom: "",
    dateTo: "",
    sortBy: "created_desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchPosts = useCallback(async (customFilters = null, customPagination = null) => {
    setLoading(true);
    const currentFilters = customFilters || filtersRef.current;
    const currentPagination = customPagination || pagination;

    try {
      const params = new URLSearchParams({
        page: (currentPagination?.page || 1).toString(),
        pageSize: (currentPagination?.pageSize || 10).toString(),
        sortBy: currentFilters?.sortBy || "created_desc",
      });

      if (searchInput && searchInput.trim()) params.append("search", searchInput.trim());
      if (currentFilters.postTypeId && currentFilters.postTypeId !== "all") params.append("postTypeId", currentFilters.postTypeId);
      if (currentFilters.authorId && currentFilters.authorId !== "all") params.append("authorId", currentFilters.authorId);
      if (currentFilters.dateFrom) params.append("dateFrom", currentFilters.dateFrom);
      if (currentFilters.dateTo) params.append("dateTo", currentFilters.dateTo);

      const response = await fetch(`/api/admin/posts?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data || []);
        setPagination({
          page: data.pagination?.page || 1,
          pageSize: data.pagination?.pageSize || 10,
          totalCount: data.pagination?.totalCount || 0,
          totalPages: data.pagination?.totalPages || 0,
        });
        if (customFilters) setFilters(currentFilters);
      } else {
        toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการโหลดข้อมูลโพสต์" });
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการโหลดข้อมูลโพสต์" });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, toast]);

  const fetchPostTypes = useCallback(async () => {
    try {
      setPostTypesLoading(true);
      const response = await fetch("/api/admin/post-types?pageSize=1000&status=ALL");
      const data = await response.json();
      setPostTypes(data.success && Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Error fetching post types:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการโหลดประเภทโพสต์" });
      setPostTypes([]);
    } finally {
      setPostTypesLoading(false);
    }
  }, [toast]);

  const fetchAuthors = useCallback(async () => {
    try {
      setAuthorsLoading(true);
      const response = await fetch("/api/admin/users?pageSize=1000&status=all&role=all");
      const data = await response.json();
      setAuthors(data.success && data.data?.users ? data.data.users : []);
    } catch (error) {
      console.error("Error fetching authors:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการโหลดผู้เขียน" });
      setAuthors([]);
    } finally {
      setAuthorsLoading(false);
    }
  }, [toast]);

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filtersRef.current, [key]: value };
    fetchPosts(newFilters, { page: 1, pageSize: pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPosts, pagination.pageSize]);

  const handleSortSelectChange = useCallback((value) => {
    const newFilters = { ...filtersRef.current, sortBy: value };
    fetchPosts(newFilters, { page: 1, pageSize: pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPosts, pagination.pageSize]);

  const handlePageChange = useCallback((page) => {
    fetchPosts(filtersRef.current, {
      page,
      pageSize: pagination.pageSize,
      totalCount: pagination.totalCount,
      totalPages: pagination.totalPages,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPosts, pagination.pageSize, pagination.totalCount, pagination.totalPages]);

  const resetFilters = useCallback(() => {
    const defaultFilters = {
      postTypeId: "all",
      authorId: "all",
      dateFrom: "",
      dateTo: "",
      sortBy: "created_desc",
    };
    setSearchInput("");
    fetchPosts(defaultFilters, { page: 1, pageSize: pagination.pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPosts, pagination.pageSize]);

  // Create or update post
  const savePost = async (postData, editingPost) => {
    try {
      const url = editingPost ? `/api/admin/posts/${editingPost.id}` : "/api/admin/posts";
      const method = editingPost ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        toast({ title: editingPost ? "อัพเดทโพสต์สำเร็จ" : "สร้างโพสต์สำเร็จ" });
        await fetchPosts();
        return true;
      } else {
        toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
        return false;
      }
    } catch (error) {
      console.error("Error saving post:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
      return false;
    }
  };

  // Delete post
  const deletePost = async (id) => {
    try {
      const response = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });

      if (response.ok) {
        toast({ title: "ลบโพสต์สำเร็จ" });
        await fetchPosts();
        return true;
      } else {
        toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการลบ" });
        return false;
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการลบข้อมูล" });
      return false;
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    fetchPostTypes();
    fetchAuthors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    posts,
    postTypes,
    authors,
    loading,
    postTypesLoading,
    authorsLoading,
    searchInput,
    setSearchInput,
    filters,
    pagination,
    fetchPosts,
    savePost,
    deletePost,
    handleFilterChange,
    handleSortSelectChange,
    handlePageChange,
    resetFilters,
  };
}
