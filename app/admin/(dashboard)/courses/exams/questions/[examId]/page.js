"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Space,
  message,
  Tag,
} from "antd";
import {
  QuestionCircleOutlined,
  PlusOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

// Components
import QuestionTable from "@/components/admin/exam-questions/QuestionTable";
import QuestionModal from "@/components/admin/exam-questions/QuestionModal";
import DeleteModal from "@/components/admin/exam-questions/DeleteModal";
import QuestionFilters from "@/components/admin/exam-questions/QuestionFilters";

// Hooks
import { useExamQuestions } from "@/hooks/admin/useExamQuestions";

export default function ExamQuestionsPage() {
  const { examId } = useParams();
  const router = useRouter();
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Exam info state
  const [examInfo, setExamInfo] = useState(null);
  const [examLoading, setExamLoading] = useState(true);

  // Use custom hook for questions data
  const {
    questions,
    loading,
    searchInput,
    setSearchInput,
    filters,
    pagination,
    fetchQuestions,
    handleFilterChange,
    handleTableChange,
    resetFilters,
  } = useExamQuestions(examId);

  // Fetch exam info
  useEffect(() => {
    const fetchExamInfo = async () => {
      try {
        const response = await fetch(`/api/admin/course-exams/${examId}`);
        const data = await response.json();
        if (data.success) {
          setExamInfo(data.data);
        } else {
          message.error("ไม่สามารถโหลดข้อมูลข้อสอบได้");
        }
      } catch (error) {
        console.error("Error fetching exam info:", error);
        message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลข้อสอบ");
      } finally {
        setExamLoading(false);
      }
    };

    if (examId) {
      fetchExamInfo();
    }
  }, [examId]);

  // Create or update question
  const handleSubmitQuestion = async (questionData) => {
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/exam-questions/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...questionData, examId }),
        });
      } else {
        res = await fetch(`/api/admin/exam-questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...questionData, examId }),
        });
      }

      const data = await res.json();

      if (data.success) {
        message.success(
          editing ? "แก้ไขคำถามสำเร็จ" : "สร้างคำถามสำเร็จ"
        );
        setModalOpen(false);
        setEditing(null);
        fetchQuestions();
        
        // Refresh exam info to get updated question count
        if (examInfo) {
          const updatedExam = await fetch(`/api/admin/course-exams/${examId}`);
          const updatedData = await updatedExam.json();
          if (updatedData.success) {
            setExamInfo(updatedData.data);
          }
        }
      } else {
        message.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      message.error("เกิดข้อผิดพลาด");
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    setQuestionToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!questionToDelete?.id) {
      message.error("ไม่พบ ID ของคำถาม");
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/exam-questions/${questionToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        message.success("ลบคำถามสำเร็จ");
        setDeleteModalOpen(false);
        setQuestionToDelete(null);
        await fetchQuestions();
        
        // Refresh exam info to get updated question count
        if (examInfo) {
          const updatedExam = await fetch(`/api/admin/course-exams/${examId}`);
          const updatedData = await updatedExam.json();
          if (updatedData.success) {
            setExamInfo(updatedData.data);
          }
        }
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการลบคำถาม");
      }
    } catch (error) {
      console.error("Delete question error:", error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setQuestionToDelete(null);
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

  const getExamTypeColor = (type) => {
    switch (type) {
      case "PRETEST": return "blue";
      case "POSTTEST": return "green";
      case "QUIZ": return "orange";
      case "MIDTERM": return "purple";
      case "FINAL": return "red";
      case "PRACTICE": return "cyan";
      default: return "default";
    }
  };

  const getExamTypeText = (type) => {
    switch (type) {
      case "PRETEST": return "ทดสอบก่อนเรียน";
      case "POSTTEST": return "ทดสอบหลังเรียน";
      case "QUIZ": return "แบบทดสอบ";
      case "MIDTERM": return "สอบกลางภาค";
      case "FINAL": return "สอบปลายภาค";
      case "PRACTICE": return "ฝึกทำ";
      default: return type;
    }
  };

  const examSubtitle =
    examInfo && !examLoading ? (
      <Space direction="vertical" size={2}>
        <span>คอร์ส: {examInfo.course?.title}</span>
        <Space>
          <span>ข้อสอบ: {examInfo.title}</span>
          <Tag color={getExamTypeColor(examInfo.examType)}>
            {getExamTypeText(examInfo.examType)}
          </Tag>
          <span>• {examInfo._count?.questions || 0} คำถาม</span>
          <span>• {examInfo.totalMarks} คะแนน</span>
        </Space>
      </Space>
    ) : undefined;

  return (
    <AdminPageHeader
      icon={<QuestionCircleOutlined />}
      title="จัดการคำถาม"
      subtitle={examSubtitle}
      breadcrumbItems={[
        { href: "/admin/courses", label: (<Space size={4}><BookOutlined /><span>จัดการคอร์ส</span></Space>) },
        { href: examInfo?.courseId ? `/admin/courses/exams/${examInfo.courseId}` : "#", label: (<Space size={4}><FileTextOutlined /><span>จัดการข้อสอบ</span></Space>) },
        { label: (<Space size={4}><QuestionCircleOutlined /><span>จัดการคำถาม</span></Space>) },
      ]}
      onBack={() => router.back()}
      actions={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          เพิ่มคำถามใหม่
        </Button>
      }
    >
      {/* Filters Card */}
      <QuestionFilters
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        loading={loading}
        currentCount={questions.length}
        totalCount={pagination?.totalCount}
      />

      {/* Questions Table */}
      <QuestionTable
        questions={questions}
        loading={loading}
        filters={filters}
        pagination={pagination}
        onEdit={openModal}
        onDelete={handleDelete}
        onTableChange={handleTableChange}
      />

      {/* Create/Edit Modal */}
      <QuestionModal
        open={modalOpen}
        editing={editing}
        examId={examId}
        onCancel={closeModal}
        onSubmit={handleSubmitQuestion}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        question={questionToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </AdminPageHeader>
  );
}
