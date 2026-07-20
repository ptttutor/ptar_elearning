"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { HelpCircle, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

import MockQuestionFilters from "./MockQuestionFilters";
import MockQuestionTable from "./MockQuestionTable";
import MockQuestionModal from "./MockQuestionModal";
import DeleteModal from "./DeleteModal";

import { useMockExamQuestions } from "@/hooks/admin/useMockExamQuestions";
import { fetchMockTopicsForSubject } from "@/hooks/admin/useMockTopics";
import { getSubjectLabel } from "@/lib/constants";

export default function MockExamQuestionsManagement() {
  const { mockExamId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [examInfo, setExamInfo] = useState(null);
  const [examLoading, setExamLoading] = useState(true);
  const [topics, setTopics] = useState([]);

  const {
    questions,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchQuestions,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  } = useMockExamQuestions(mockExamId);

  const refreshExamInfo = async () => {
    const res = await fetch(`/api/admin/mock-exams/${mockExamId}`);
    const data = await res.json();
    if (data.success) {
      setExamInfo(data.data);
      return data.data;
    }
    return null;
  };

  useEffect(() => {
    if (!mockExamId) return;

    (async () => {
      setExamLoading(true);
      try {
        const exam = await refreshExamInfo();
        if (exam) {
          const topicList = await fetchMockTopicsForSubject(exam.subject);
          setTopics(topicList);
        } else {
          toast({ variant: "destructive", title: "ไม่สามารถโหลดข้อมูลข้อสอบจำลองได้" });
        }
      } catch (error) {
        toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการโหลดข้อมูลข้อสอบจำลอง" });
      } finally {
        setExamLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockExamId]);

  const handleSubmitQuestion = async (questionData) => {
    let res;
    if (editing) {
      res = await fetch(`/api/admin/mock-exam-questions/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...questionData, mockExamId }),
      });
    } else {
      res = await fetch(`/api/admin/mock-exam-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...questionData, mockExamId }),
      });
    }

    const data = await res.json();
    if (data.success) {
      toast({ title: editing ? "แก้ไขคำถามสำเร็จ" : "สร้างคำถามสำเร็จ" });
      setModalOpen(false);
      setEditing(null);
      fetchQuestions();
      refreshExamInfo();
    } else {
      toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาด" });
    }
  };

  const handleDelete = (record) => {
    setQuestionToDelete(record);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete?.id) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/mock-exam-questions/${questionToDelete.id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast({ title: "ลบคำถามสำเร็จ" });
        setDeleteModalOpen(false);
        setQuestionToDelete(null);
        await fetchQuestions();
        refreshExamInfo();
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการลบคำถาม" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาด: ${error.message}` });
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setQuestionToDelete(null);
  };

  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const totalMarks = examInfo?.questions?.reduce((sum, q) => sum + (q.marks || 0), 0) ?? 0;

  const examSubtitle =
    examInfo && !examLoading ? (
      <div className="flex flex-wrap items-center gap-2">
        <span>ข้อสอบจำลอง: {examInfo.title}</span>
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
          {getSubjectLabel(examInfo.subject)}
        </Badge>
        <span className="text-gray-400">•</span>
        <span>{examInfo._count?.questions || 0} คำถาม</span>
        <span className="text-gray-400">•</span>
        <span>{totalMarks} คะแนนรวม</span>
      </div>
    ) : undefined;

  return (
    <AdminPageHeader
      icon={<HelpCircle className="h-6 w-6" />}
      title="จัดการคำถาม"
      subtitle={examSubtitle}
      breadcrumbItems={[
        { href: "/admin/mock-exams", label: (<span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" />ข้อสอบจำลอง</span>) },
        { label: (<span className="inline-flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" />จัดการคำถาม</span>) },
      ]}
      onBack={() => router.back()}
      actions={
        <Button onClick={() => openModal(null)}>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มคำถามใหม่
        </Button>
      }
    >
      <MockQuestionFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        totalCount={pagination.total}
        currentCount={questions.length}
        loading={loading}
        topics={topics}
      />

      <MockQuestionTable
        questions={questions}
        loading={loading}
        pagination={pagination}
        onEdit={openModal}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
      />

      <MockQuestionModal open={modalOpen} editing={editing} topics={topics} onCancel={closeModal} onSubmit={handleSubmitQuestion} />

      <DeleteModal open={deleteModalOpen} question={questionToDelete} loading={deleting} onConfirm={confirmDelete} onCancel={cancelDelete} />
    </AdminPageHeader>
  );
}
