"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Button,
  Space,
  Modal,
  Form,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMessage } from "@/hooks/admin/useAntdApp";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

// Components
import CategoriesTable from "./CategoriesTable";
import CategoryModal from "./CategoryModal";
import DeleteModal from "./DeleteModal";

export default function CategoriesManagement() {
  const message = useMessage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [form] = Form.useForm();

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.data || []);
    } catch (e) {
      message.error("โหลดข้อมูลหมวดหมู่ไม่สำเร็จ");
    }
    setLoading(false);
  }, [message]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Helper functions for optimistic updates
  const updateCategoryInList = (categoryId, updatedData) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === categoryId 
          ? { ...category, ...updatedData }
          : category
      )
    );
  };

  const addCategoryToList = (newCategory) => {
    setCategories(prevCategories => [newCategory, ...prevCategories]);
  };

  const removeCategoryFromList = (categoryId) => {
    setCategories(prevCategories => 
      prevCategories.filter(category => category.id !== categoryId)
    );
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
        message.success(
          editing ? "แก้ไขหมวดหมู่สำเร็จ" : "สร้างหมวดหมู่สำเร็จ"
        );
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        
        // Optimistic update without full page refresh
        if (editing) {
          // Update existing category in the list
          updateCategoryInList(editing.id, data.data);
        } else {
          // Add new category to the list
          addCategoryToList(data.data);
        }
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      // On error, refresh the data to ensure consistency
      fetchCategories();
    } finally {
      setSubmitting(false);
    }
  };

  // Delete category
  const handleDelete = (id, name) => {
    const category = categories.find(cat => cat.id === id);
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!categoryToDelete?.id) {
      message.error("ไม่พบ ID ของหมวดหมู่");
      return;
    }

    setDeleting(categoryToDelete.id);
    try {
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        message.success("ลบหมวดหมู่สำเร็จ");
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        
        // Optimistic update - remove from list without full refresh
        removeCategoryFromList(categoryToDelete.id);
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
      // On error, refresh the data to ensure consistency
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
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
  };

  return (
    <AdminPageHeader
      icon={<AppstoreOutlined />}
      title="จัดการหมวดหมู่"
      subtitle="จัดการหมวดหมู่สินค้าและเนื้อหา"
      actions={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal(null)}
          disabled={submitting || deleting}
        >
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
        form={form}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />

      <DeleteModal
        open={deleteModalOpen}
        category={categoryToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </AdminPageHeader>
  );
}