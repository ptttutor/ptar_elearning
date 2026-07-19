"use client";
import React, { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

// Components
import ContentTable from "./ContentTable";
import ContentModal from "./ContentModal";
import DeleteModal from "./DeleteModal";
import OrderActions from "./OrderActions";
import ContentFilters from "./ContentFilters";

// Hooks
import { useContents } from "@/hooks/admin/useContents";

export default function ContentsManagement() {
  const { chapterId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Use custom hook for contents data — drag-and-drop wiring is untouched.
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
        toast({ title: editing ? "แก้ไขเนื้อหาสำเร็จ" : "สร้างเนื้อหาสำเร็จ" });
        setModalOpen(false);
        setEditing(null);

        // Optimistic update without full page refresh
        if (editing) {
          updateContentInList(editing.id, data.data);
        } else {
          addContentToList(data.data);
        }
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาด" });
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
      toast({ variant: "destructive", title: "ไม่พบ ID ของเนื้อหา" });
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
        toast({ title: "ลบเนื้อหาสำเร็จ" });
        setDeleteModalOpen(false);
        setContentToDelete(null);
        removeContentFromList(contentToDelete.id);
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการลบเนื้อหา" });
      }
    } catch (error) {
      console.error("Delete content error:", error);
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาด: ${error.message}` });
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
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const nextOrder = contents.length > 0 ? Math.max(...contents.map((c) => c.order)) + 1 : 1;

  return (
    <AdminPageHeader
      icon={<FileText className="h-6 w-6" />}
      title="จัดการเนื้อหา"
      subtitle="สร้างและจัดการเนื้อหาใน Chapter"
      onBack={() => router.back()}
      actions={
        <Button onClick={() => openModal(null)} disabled={submitting || deleting || savingOrder}>
          <Plus className="mr-2 h-4 w-4" />
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
        totalCount={pagination.totalCount}
        currentCount={contents.length}
      />

      <OrderActions
        hasUnsavedChanges={hasUnsavedChanges}
        savingOrder={savingOrder}
        initialOrderLength={initialOrder.length}
        onSaveOrder={saveOrderChanges}
        onCancelOrder={cancelOrderChanges}
        onResetOrder={resetOrder}
      />

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
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* Create/Edit Modal */}
      <ContentModal
        open={modalOpen}
        editing={editing}
        nextOrder={nextOrder}
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
