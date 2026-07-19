"use client";
import { useEffect, useState, useCallback } from "react";
import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

// Components
import CategoriesTable from "./CategoriesTable";
import CategoryModal from "./CategoryModal";
import DeleteModal from "./DeleteModal";

export default function CategoriesManagement() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.data || []);
    } catch (e) {
      toast({ variant: "destructive", title: "โหลดข้อมูลหมวดหมู่ไม่สำเร็จ" });
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Helper functions for optimistic updates
  const updateCategoryInList = (categoryId, updatedData) => {
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, ...updatedData } : c)));
  };

  const addCategoryToList = (newCategory) => {
    setCategories((prev) => [newCategory, ...prev]);
  };

  const removeCategoryFromList = (categoryId) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  // Create or update category
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/categories/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } else {
        res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }
      const data = await res.json();
      if (data.success) {
        toast({ title: editing ? "แก้ไขหมวดหมู่สำเร็จ" : "สร้างหมวดหมู่สำเร็จ" });
        setModalOpen(false);
        setEditing(null);

        if (editing) {
          updateCategoryInList(editing.id, data.data);
        } else {
          addCategoryToList(data.data);
        }
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
      fetchCategories();
    } finally {
      setSubmitting(false);
    }
  };

  // Delete category
  const handleDelete = (id) => {
    const category = categories.find((cat) => cat.id === id);
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!categoryToDelete?.id) {
      toast({ variant: "destructive", title: "ไม่พบ ID ของหมวดหมู่" });
      return;
    }

    setDeleting(categoryToDelete.id);
    try {
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "ลบหมวดหมู่สำเร็จ" });
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        removeCategoryFromList(categoryToDelete.id);
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการลบข้อมูล" });
      fetchCategories();
    } finally {
      setDeleting(null);
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
      icon={<Layers className="h-6 w-6" />}
      title="จัดการหมวดหมู่"
      subtitle="จัดการหมวดหมู่สินค้าและเนื้อหา"
      actions={
        <Button onClick={() => openModal(null)} disabled={submitting || !!deleting}>
          <Plus className="mr-2 h-4 w-4" />
          สร้างหมวดหมู่ใหม่
        </Button>
      }
    >
      <CategoriesTable
        categories={categories}
        loading={loading}
        submitting={submitting}
        deleting={deleting}
        onEdit={openModal}
        onDelete={handleDelete}
      />

      <CategoryModal
        open={modalOpen}
        editing={editing}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />

      <DeleteModal
        open={deleteModalOpen}
        category={categoryToDelete}
        loading={!!deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </AdminPageHeader>
  );
}
