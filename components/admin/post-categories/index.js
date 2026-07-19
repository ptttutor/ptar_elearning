"use client";
import { useState } from "react";
import { Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

// Components
import PostCategoryFilters from "./PostCategoryFilters";
import PostCategoryTable from "./PostCategoryTable";
import PostCategoryModal from "./PostCategoryModal";
import DeleteModal from "./DeleteModal";

// Hooks
import { usePostCategories } from "@/hooks/admin/usePostCategories";

export default function PostCategoriesPage() {
  const { toast } = useToast();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Use custom hook for post categories data
  const {
    postCategories,
    setPostCategories,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchPostCategories,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    resetFilters,
  } = usePostCategories();

  // Create or update post category with optimistic updates
  const handleSubmitCategory = async (categoryData) => {
    setSubmitting(true);
    try {
      if (editing) {
        const originalCategory = editing;
        const updatedCategory = { ...originalCategory, ...categoryData, updatedAt: new Date().toISOString() };

        setPostCategories((prev) => prev.map((cat) => (cat.id === editing.id ? updatedCategory : cat)));

        try {
          const res = await fetch(`/api/admin/post-types/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoryData),
          });

          const data = await res.json();

          if (data.success) {
            toast({ title: "แก้ไขหมวดหมู่โพสต์สำเร็จ" });
            setModalOpen(false);
            setEditing(null);
          } else {
            setPostCategories((prev) => prev.map((cat) => (cat.id === editing.id ? originalCategory : cat)));
            toast({ variant: "destructive", title: data.error || "แก้ไขหมวดหมู่โพสต์ไม่สำเร็จ" });
          }
        } catch (error) {
          setPostCategories((prev) => prev.map((cat) => (cat.id === editing.id ? originalCategory : cat)));
          toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่โพสต์" });
        }
      } else {
        const tempId = Date.now().toString();
        const newCategory = {
          id: tempId,
          ...categoryData,
          postCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _isOptimistic: true,
        };

        setPostCategories((prev) => [newCategory, ...prev]);

        try {
          const res = await fetch("/api/admin/post-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoryData),
          });

          const data = await res.json();

          if (data.success) {
            setPostCategories((prev) => prev.map((cat) => (cat.id === tempId ? { ...data.data, _isOptimistic: false } : cat)));
            toast({ title: "สร้างหมวดหมู่โพสต์สำเร็จ" });
            setModalOpen(false);
            setEditing(null);
          } else {
            setPostCategories((prev) => prev.filter((cat) => cat.id !== tempId));
            toast({ variant: "destructive", title: data.error || "สร้างหมวดหมู่โพสต์ไม่สำเร็จ" });
          }
        } catch (error) {
          setPostCategories((prev) => prev.filter((cat) => cat.id !== tempId));
          toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการสร้างหมวดหมู่โพสต์" });
        }
      }
    } catch (error) {
      console.error("Error submitting category:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดไม่คาดคิด" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete with optimistic updates
  const handleDelete = (record) => {
    setCategoryToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete with optimistic updates
  const confirmDelete = async () => {
    if (!categoryToDelete?.id) {
      toast({ variant: "destructive", title: "ไม่พบ ID ของหมวดหมู่โพสต์" });
      return;
    }

    setDeleting(true);
    setPostCategories((prev) => prev.filter((cat) => cat.id !== categoryToDelete.id));

    try {
      const response = await fetch(`/api/admin/post-types/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        toast({ title: "ลบหมวดหมู่โพสต์สำเร็จ" });
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
      } else {
        setPostCategories((prev) => [...prev, categoryToDelete]);
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการลบหมวดหมู่โพสต์" });
      }
    } catch (error) {
      console.error("Delete post category error:", error);
      setPostCategories((prev) => [...prev, categoryToDelete]);
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาด: ${error.message}` });
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  // Open modal for create/edit
  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <AdminPageHeader
      icon={<Tag className="h-6 w-6" />}
      title="จัดการหมวดหมู่โพสต์"
      subtitle="สร้างและจัดการหมวดหมู่สำหรับโพสต์"
      actions={
        <Button onClick={() => openModal(null)} disabled={submitting}>
          <Plus className="mr-2 h-4 w-4" />
          สร้างหมวดหมู่ใหม่
        </Button>
      }
    >
      {/* Filter Section */}
      <PostCategoryFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        totalCount={pagination.totalCount}
        currentCount={postCategories.length}
      />

      <PostCategoryTable
        postCategories={postCategories}
        loading={loading}
        filters={filters}
        pagination={pagination}
        onEdit={openModal}
        onDelete={handleDelete}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        deletingId={deleting ? categoryToDelete?.id : null}
      />

      {/* Create/Edit Modal */}
      <PostCategoryModal
        open={modalOpen}
        editing={editing}
        onCancel={closeModal}
        onSubmit={handleSubmitCategory}
        loading={submitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        postCategory={categoryToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </AdminPageHeader>
  );
}
