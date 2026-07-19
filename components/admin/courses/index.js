"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

// Components
import CourseFilters from "./CourseFilters";
import CourseTable from "./CourseTable";
import CourseModal from "./CourseModal";
import DeleteModal from "./DeleteModal";

// Hooks
import { useCourses } from "@/hooks/admin/useCourses";

export default function CoursesManagement() {
  const router = useRouter();
  const { toast } = useToast();

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
    handlePageChange,
    handleSortChange,
    handleSortSelectChange,
    resetFilters,
  } = useCourses();

  // Create or update course
  const handleSubmitCourse = async (courseData) => {
    setSubmitting(true);
    try {
      let res;
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
        toast({ title: editing ? "แก้ไขคอร์สสำเร็จ" : "สร้างคอร์สสำเร็จ" });
        setModalOpen(false);
        setEditing(null);
        fetchCourses();
      } else {
        toast({ variant: "destructive", title: result.error || "เกิดข้อผิดพลาด" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete course
  const handleDelete = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  // Confirm delete course
  const confirmDelete = async () => {
    if (!courseToDelete?.id) {
      toast({ variant: "destructive", title: "ไม่พบ ID ของคอร์ส" });
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/courses/${courseToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "ลบคอร์สสำเร็จ" });
        setDeleteModalOpen(false);
        setCourseToDelete(null);
        await fetchCourses();
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการลบคอร์ส" });
      }
    } catch (error) {
      console.error("Delete course error:", error);
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาด: ${error.message}` });
    } finally {
      setDeleting(false);
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
    router.push(`/admin/courses/exams/${course.id}`);
  };

  return (
    <AdminPageHeader
      icon={<BookOpen className="h-6 w-6" />}
      title="จัดการคอร์สเรียน"
      subtitle="สร้างและจัดการคอร์สเรียนออนไลน์"
      actions={
        <Button onClick={() => openModal(null)}>
          <Plus className="mr-2 h-4 w-4" />
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
        onSortSelectChange={handleSortSelectChange}
        onReset={resetFilters}
        instructors={instructors}
        categories={categories}
        totalCount={pagination.total}
        currentCount={courses.length}
        loading={loading}
      />

      <CourseTable
        courses={courses}
        loading={loading}
        filters={filters}
        pagination={pagination}
        onEdit={openModal}
        onDelete={handleDelete}
        onManageExams={handleManageExams}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
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
