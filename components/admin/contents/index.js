"use client";
import React, { useState } from "react";
import {
  Button,
  Space,
  Form,
  Card,
  Typography,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

// Components
import ContentTable from "./ContentTable";
import ContentModal from "./ContentModal";
import DeleteModal from "./DeleteModal";
import OrderActions from "./OrderActions";
import ContentFilters from "./ContentFilters";

// Hooks
import { useContents } from "@/hooks/admin/useContents";
import { useMessage } from "@/hooks/admin/useAntdApp";

const { Title, Text } = Typography;

export default function ContentsManagement() {
  const { chapterId } = useParams();
  const router = useRouter();
  const message = useMessage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Use custom hook for contents data
  const {
    contents,
    allContents,
    loading,
    activeId,
    hasUnsavedChanges,
    savingOrder,
    sensors,
    initialOrder,
    searchInput,
    setSearchInput,
    filters,
    pagination,
    fetchContents,
    saveOrderChanges,
    cancelOrderChanges,
    resetOrder,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    resetFilters,
    updateContentInList,
    addContentToList,
    removeContentFromList,
  } = useContents(chapterId);

  // Create or update content
  const handleSubmitContent = async (contentData) => {
    setSubmitting(true);
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/contents/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contentData),
        });
      } else {
        res = await fetch(`/api/admin/contents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...contentData, chapterId }),
        });
      }
      const data = await res.json();
      if (data.success) {
        message.success(editing ? "แก้ไขเนื้อหาสำเร็จ" : "สร้างเนื้อหาสำเร็จ");
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        
        // Optimistic update without full page refresh
        if (editing) {
          // Update existing content in the list
          updateContentInList(editing.id, data.data);
        } else {
          // Add new content to the list
          addContentToList(data.data);
        }
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      message.error("เกิดข้อผิดพลาด");
      // On error, refresh the data to ensure consistency
      fetchContents();
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    setContentToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!contentToDelete?.id) {
      message.error("ไม่พบ ID ของเนื้อหา");
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/contents/${contentToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        message.success("ลบเนื้อหาสำเร็จ");
        setDeleteModalOpen(false);
        setContentToDelete(null);
        
        // Optimistic update - remove from list without full refresh
        removeContentFromList(contentToDelete.id);
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการลบเนื้อหา");
      }
    } catch (error) {
      console.error("Delete content error:", error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
      // On error, refresh the data to ensure consistency
      fetchContents();
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setContentToDelete(null);
  };

  // Open modal for create/edit
  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
      // ตั้งค่า order เป็นลำดับถัดไป
      const nextOrder =
        contents.length > 0 ? Math.max(...contents.map((c) => c.order)) + 1 : 1;
      form.setFieldsValue({ order: nextOrder });
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
      icon={<FileTextOutlined />}
      title="จัดการเนื้อหา"
      subtitle="สร้างและจัดการเนื้อหาใน Chapter"
      onBack={() => router.back()}
      actions={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal(null)}
          disabled={submitting || deleting || savingOrder}
        >
          สร้างเนื้อหาใหม่
        </Button>
      }
    >
      {/* Filter Section */}
      <ContentFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        totalCount={pagination.totalCount}
        currentCount={contents.length}
      />

      <Card style={{ marginBottom: "16px" }}>
        <OrderActions
          hasUnsavedChanges={hasUnsavedChanges}
          savingOrder={savingOrder}
          initialOrderLength={initialOrder.length}
          onSaveOrder={saveOrderChanges}
          onCancelOrder={cancelOrderChanges}
          onResetOrder={resetOrder}
        />
      </Card>

      <ContentTable
        contents={contents}
        allContents={allContents}
        loading={loading}
        activeId={activeId}
        sensors={sensors}
        onEdit={openModal}
        onDelete={handleDelete}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        disabled={submitting || deleting || savingOrder}
      />

      {/* Create/Edit Modal */}
      <ContentModal
        open={modalOpen}
        editing={editing}
        form={form}
        onCancel={closeModal}
        onSubmit={handleSubmitContent}
        submitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        content={contentToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </AdminPageHeader>
  );
}