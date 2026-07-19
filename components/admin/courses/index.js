"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { BookOutlined, PlusOutlined } from "@ant-design/icons";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

// Components
import CourseFilters from "./CourseFilters";
import CourseTable from "./CourseTable";
import CourseModal from "./CourseModal";
import DeleteModal from "./DeleteModal";

// Hooks
import { useCourses } from "@/hooks/admin/useCourses";
import { useMessage } from "@/hooks/admin/useAntdApp";

export default function CoursesManagement() {
  // Confirm delete course
  const confirmDelete = async () => {
    if (!courseToDelete?.id) {
      message.error("ไม่พบ ID ของคอร์ส");
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/courses/${courseToDelete.id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        message.success("ลบคอร์สสำเร็จ");
        setDeleteModalOpen(false);
        setCourseToDelete(null);
        await fetchCourses();
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการลบคอร์ส");
      }
    } catch (error) {
      console.error("Delete course error:", error);
      message.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };
  // Handle delete course
  const handleDelete = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };
  const router = useRouter();
  const message = useMessage();
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Use custom hook for courses data
  const {
    courses,
    loading,
    categories,
    catLoading,
    instructors,
    instLoading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchCourses,
    handleFilterChange,
    handleTableChange,
    resetFilters,
    updateCourseInList,
    addCourseToList,
  } = useCourses();

  // Create or update course
  const handleSubmitCourse = async (courseData) => {
    setSubmitting(true);
    try {
      let res;
      // Ensure isRecommended is boolean
      const payload = { ...courseData, isRecommended: !!courseData.isRecommended };
      if (editing) {
        res = await fetch(`/api/admin/courses/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();

      if (result.success) {
        message.success(editing ? "แก้ไขคอร์สสำเร็จ" : "สร้างคอร์สสำเร็จ");
        setModalOpen(false);
        setEditing(null);
        // Optimistic update without full page refresh
        if (editing) {
          updateCourseInList(editing.id, result.data);
        } else {
          addCourseToList(result.data);
        }
      } else {
        message.error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setCourseToDelete(null);
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

  // Handle manage exams
  const handleManageExams = (course) => {
    console.log('Managing exams for course:', course.id);
    router.push(`/admin/courses/exams/${course.id}`);
  };

  return (
    <AdminPageHeader
      icon={<BookOutlined />}
      title="จัดการคอร์สเรียน"
      subtitle="สร้างและจัดการคอร์สเรียนออนไลน์"
      actions={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
          สร้างคอร์สใหม่
        </Button>
      }
    >
      {/* Filter Section */}
      <CourseFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        instructors={instructors}
        categories={categories}
        totalCount={pagination.totalCount}
        currentCount={courses.length}
      />

      <CourseTable
        courses={courses}
        loading={loading}
        filters={filters}
        pagination={pagination}
        onEdit={openModal}
        onDelete={handleDelete}
        onManageExams={handleManageExams}
        onTableChange={handleTableChange}
      />

      {/* Create/Edit Modal */}
      <CourseModal
        open={modalOpen}
        editing={editing}
        onCancel={closeModal}
        onSubmit={handleSubmitCourse}
        instructors={instructors}
        categories={categories}
        instLoading={instLoading}
        catLoading={catLoading}
        submitting={submitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        course={courseToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </AdminPageHeader>
  );
}
