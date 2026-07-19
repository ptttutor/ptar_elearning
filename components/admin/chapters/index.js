"use client";
import React, { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

// Components
import ChapterTable from "./ChapterTable";
import ChapterModal from "./ChapterModal";
import DeleteModal from "./DeleteModal";
import OrderActions from "./OrderActions";
import ChapterFilters from "./ChapterFilters";

// Hooks
import { useChapters } from "@/hooks/admin/useChapters";

export default function ChaptersManagement() {
  const { courseId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Use custom hook for chapters data — drag-and-drop wiring (sensors,
  // activeId, handleDragStart/End/Cancel, arrayMove, hasUnsavedChanges,
  // saveOrderChanges/cancelOrderChanges/resetOrder) is untouched here.
  const {
    chapters,
    allChapters,
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
    fetchChapters,
    saveOrderChanges,
    cancelOrderChanges,
    resetOrder,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleFilterChange,
    handlePageChange,
    resetFilters,
    updateChapterInList,
    addChapterToList,
    removeChapterFromList,
  } = useChapters(courseId);

  // Create or update chapter
  const handleSubmitChapter = async (chapterData) => {
    setSubmitting(true);
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/chapters/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(chapterData),
        });
      } else {
        res = await fetch(`/api/admin/chapters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...chapterData, courseId }),
        });
      }
      const data = await res.json();
      if (data.success) {
        toast({ title: editing ? "แก้ไข chapter สำเร็จ" : "สร้าง chapter สำเร็จ" });
        setModalOpen(false);
        setEditing(null);

        // Optimistic update without full page refresh
        if (editing) {
          updateChapterInList(editing.id, data.data);
        } else {
          addChapterToList(data.data);
        }
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาด" });
      // On error, refresh the data to ensure consistency
      fetchChapters();
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    setChapterToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!chapterToDelete?.id) {
      toast({ variant: "destructive", title: "ไม่พบ ID ของ chapter" });
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/chapters/${chapterToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        toast({ title: "ลบ chapter สำเร็จ" });
        setDeleteModalOpen(false);
        setChapterToDelete(null);

        // Optimistic update - remove from list without full refresh
        removeChapterFromList(chapterToDelete.id);
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการลบ chapter" });
      }
    } catch (error) {
      console.error("Delete chapter error:", error);
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาด: ${error.message}` });
      // On error, refresh the data to ensure consistency
      fetchChapters();
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setChapterToDelete(null);
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

  // Handle manage content
  const handleManageContent = (record) => {
    router.push(`/admin/courses/content/${record.id}`);
  };

  const nextOrder = allChapters.length > 0 ? Math.max(...allChapters.map((c) => c.order)) + 1 : 1;

  return (
    <AdminPageHeader
      icon={<BookOpen className="h-6 w-6" />}
      title="จัดการ Chapter"
      subtitle="สร้างและจัดการ Chapter ของคอร์สเรียน"
      onBack={() => router.back()}
      actions={
        <Button onClick={() => openModal(null)} disabled={submitting || deleting || savingOrder}>
          <Plus className="mr-2 h-4 w-4" />
          สร้าง Chapter ใหม่
        </Button>
      }
    >
      {/* Filter Section */}
      <ChapterFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        pagination={pagination}
        onPageChange={handlePageChange}
        totalCount={pagination.totalCount}
        currentCount={chapters.length}
      />

      <OrderActions
        hasUnsavedChanges={hasUnsavedChanges}
        savingOrder={savingOrder}
        initialOrderLength={initialOrder.length}
        onSaveOrder={saveOrderChanges}
        onCancelOrder={cancelOrderChanges}
        onResetOrder={resetOrder}
      />

      <ChapterTable
        chapters={chapters}
        allChapters={allChapters}
        loading={loading}
        activeId={activeId}
        sensors={sensors}
        onEdit={openModal}
        onDelete={handleDelete}
        onManageContent={handleManageContent}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        disabled={submitting || deleting || savingOrder}
      />

      {/* Create/Edit Modal */}
      <ChapterModal
        open={modalOpen}
        editing={editing}
        nextOrder={nextOrder}
        onCancel={closeModal}
        onSubmit={handleSubmitChapter}
        submitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        chapter={chapterToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </AdminPageHeader>
  );
}
