"use client";
import { useState } from "react";
import { Users as UsersIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

// Components
import UserFilters from "@/components/admin/users/UserFilters";
import UserTable from "@/components/admin/users/UserTable";
import UserModal from "@/components/admin/users/UserModal";
import DeleteModal from "@/components/admin/users/DeleteModal";
import QuickGrantCourseModal from "@/components/admin/users/QuickGrantCourseModal";
import UserStatsCards from "@/components/admin/users/UserStatsCards";

// Hooks
import { useUsers } from "@/hooks/admin/useUsers";

export default function UsersPage() {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [grantUser, setGrantUser] = useState(null);
  const { toast } = useToast();

  // Use custom hook for users data
  const {
    users,
    loading,
    stats,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchUsers,
    handleFilterChange,
    handlePageChange,
    handleSortChange,
    resetFilters,
  } = useUsers();

  // Create or update user
  const handleSubmitUser = async (userData) => {
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/users/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
      } else {
        res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
      }

      const data = await res.json();

      if (data.success) {
        toast({ title: editing ? "แก้ไขผู้ใช้สำเร็จ" : "สร้างผู้ใช้สำเร็จ" });
        setModalOpen(false);
        setEditing(null);
        fetchUsers();
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch (error) {
      console.error("Submit user error:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการบันทึกผู้ใช้" });
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    setUserToDelete(record);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!userToDelete?.id) {
      toast({ variant: "destructive", title: "ไม่พบ ID ของผู้ใช้" });
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: data.message || "ลบผู้ใช้สำเร็จ" });
        setDeleteModalOpen(false);
        setUserToDelete(null);
        await fetchUsers();
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการลบผู้ใช้" });
      }
    } catch (error) {
      console.error("Delete user error:", error);
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาด: ${error.message}` });
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // Open the quick-grant modal for this user
  const openGrantModal = (record) => {
    setGrantUser(record);
    setGrantModalOpen(true);
  };

  const closeGrantModal = () => {
    setGrantModalOpen(false);
    setGrantUser(null);
  };

  const handleQuickGrant = async (courseId, accessDuration) => {
    if (!grantUser?.id) return;
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: grantUser.id,
          courseIds: [courseId],
          accessDuration,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการเพิ่มคอร์ส" });
        return;
      }

      if (data.granted?.length) {
        toast({ title: `เพิ่มคอร์สสำเร็จ: ${data.granted.join(", ")}` });
      }
      if (data.alreadyEnrolled?.length) {
        toast({ title: `ผู้ใช้มีคอร์สนี้อยู่แล้ว: ${data.alreadyEnrolled.join(", ")}` });
      }
      closeGrantModal();
    } catch (error) {
      console.error("Quick grant error:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการเพิ่มคอร์ส" });
    }
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

  // Toggle user status
  const handleToggleStatus = async (user) => {
    try {
      const newRole = user.role === "STUDENT" ? "INSTRUCTOR" : "STUDENT";

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, role: newRole }),
      });

      const data = await res.json();

      if (data.success) {
        toast({ title: `เปลี่ยนสถานะเป็น ${newRole === "INSTRUCTOR" ? "ผู้สอน" : "นักเรียน"} สำเร็จ` });
        fetchUsers();
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch (error) {
      console.error("Toggle user status error:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ" });
    }
  };

  return (
    <AdminPageHeader
      icon={<UsersIcon className="h-6 w-6" />}
      title="จัดการผู้ใช้งาน"
      subtitle="จัดการข้อมูลผู้ใช้งาน สิทธิ์การเข้าถึง และสถานะการเรียน"
      actions={
        <Button onClick={() => openModal(null)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มผู้ใช้ใหม่
        </Button>
      }
    >
      {/* Stats Cards */}
      <UserStatsCards stats={stats} loading={loading} />

      {/* Filters */}
      <UserFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        totalCount={pagination.total}
        currentCount={users.length}
        loading={loading}
      />

      {/* Table */}
      <UserTable
        users={users}
        loading={loading}
        filters={filters}
        pagination={pagination}
        onEdit={openModal}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onGrantCourse={openGrantModal}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      {/* Create/Edit Modal */}
      <UserModal open={modalOpen} editing={editing} onCancel={closeModal} onSubmit={handleSubmitUser} />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModalOpen}
        user={userToDelete}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Quick Grant Course Modal */}
      <QuickGrantCourseModal
        open={grantModalOpen}
        user={grantUser}
        onCancel={closeGrantModal}
        onSubmit={handleQuickGrant}
      />
    </AdminPageHeader>
  );
}
