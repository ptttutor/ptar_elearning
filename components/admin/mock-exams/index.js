"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileQuestion, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

import MockExamFilters from "./MockExamFilters";
import MockExamTable from "./MockExamTable";
import MockExamModal from "./MockExamModal";
import DeleteModal from "./DeleteModal";

import { useMockExams } from "@/hooks/admin/useMockExams";

export default function MockExamsManagement() {
  const router = useRouter();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const {
    exams,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchExams,
    handleFilterChange,
    handlePageChange,
    handleSortChange,
    handleSortSelectChange,
    resetFilters,
  } = useMockExams();

  const handleSubmitExam = async (examData) => {
    let res;
    if (editing) {
      res = await fetch(`/api/admin/mock-exams/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examData),
      });
    } else {
      res = await fetch(`/api/admin/mock-exams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examData),
      });
    }

    const data = await res.json();
    if (data.success) {
      toast({ title: editing ? "แก้ไขข้อสอบจำลองสำเร็จ" : "สร้างข้อสอบจำลองสำเร็จ" });
      setModalOpen(false);
      setEditing(null);
      fetchExams();
    } else {
      toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาด" });
    }
  };

  const handleDelete = (record) => {
    setExamToDelete(record);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!examToDelete?.id) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/mock-exams/${examToDelete.id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast({ title: "ลบข้อสอบจำลองสำเร็จ" });
        setDeleteModalOpen(false);
        setExamToDelete(null);
        await fetchExams();
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการลบข้อสอบจำลอง" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาด: ${error.message}` });
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setExamToDelete(null);
  };

  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleManageQuestions = (exam) => {
    router.push(`/admin/mock-exams/questions/${exam.id}`);
  };

  return (
    <AdminPageHeader
      icon={<FileQuestion className="h-6 w-6" />}
      title="ข้อสอบจำลอง"
      subtitle="ระบบข้อสอบจำลองแยกต่างหาก รองรับโหมดฝึกฝน/สอบจริง และวิเคราะห์จุดอ่อนรายหัวข้อ"
      actions={
        <Button onClick={() => openModal(null)}>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มข้อสอบจำลองใหม่
        </Button>
      }
    >
      <MockExamFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onSortSelectChange={handleSortSelectChange}
        onReset={resetFilters}
        totalCount={pagination.total}
        currentCount={exams.length}
        loading={loading}
      />

      <MockExamTable
        exams={exams}
        loading={loading}
        filters={filters}
        pagination={pagination}
        onEdit={openModal}
        onDelete={handleDelete}
        onManageQuestions={handleManageQuestions}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      <MockExamModal open={modalOpen} editing={editing} onCancel={closeModal} onSubmit={handleSubmitExam} />

      <DeleteModal open={deleteModalOpen} exam={examToDelete} loading={deleting} onConfirm={confirmDelete} onCancel={cancelDelete} />
    </AdminPageHeader>
  );
}
