"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListTree, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

import MockTopicFilters from "./MockTopicFilters";
import MockTopicTable from "./MockTopicTable";
import MockTopicModal from "./MockTopicModal";
import DeleteModal from "./DeleteModal";

import { useMockTopics } from "@/hooks/admin/useMockTopics";

export default function MockTopicsManagement() {
  const router = useRouter();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const {
    topics,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchTopics,
    handleFilterChange,
    handlePageChange,
    handleSortChange,
    handleSortSelectChange,
    resetFilters,
  } = useMockTopics();

  const handleSubmitTopic = async (topicData) => {
    let res;
    if (editing) {
      res = await fetch(`/api/admin/mock-topics/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(topicData),
      });
    } else {
      res = await fetch(`/api/admin/mock-topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(topicData),
      });
    }

    const data = await res.json();
    if (data.success) {
      toast({ title: editing ? "แก้ไขหัวข้อสำเร็จ" : "สร้างหัวข้อสำเร็จ" });
      setModalOpen(false);
      setEditing(null);
      fetchTopics();
    } else {
      toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาด" });
    }
  };

  const handleDelete = (record) => {
    setTopicToDelete(record);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!topicToDelete?.id) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/mock-topics/${topicToDelete.id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast({ title: "ลบหัวข้อสำเร็จ" });
        setDeleteModalOpen(false);
        setTopicToDelete(null);
        await fetchTopics();
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการลบหัวข้อ" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาด: ${error.message}` });
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setTopicToDelete(null);
  };

  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <AdminPageHeader
      icon={<ListTree className="h-6 w-6" />}
      title="หัวข้อข้อสอบจำลอง"
      subtitle="ใช้แท็กคำถามเพื่อวิเคราะห์จุดอ่อนของนักเรียนรายเรื่อง"
      onBack={() => router.back()}
      actions={
        <Button onClick={() => openModal(null)}>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มหัวข้อใหม่
        </Button>
      }
    >
      <MockTopicFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onSortSelectChange={handleSortSelectChange}
        onReset={resetFilters}
        totalCount={pagination.total}
        currentCount={topics.length}
        loading={loading}
      />

      <MockTopicTable
        topics={topics}
        loading={loading}
        filters={filters}
        pagination={pagination}
        onEdit={openModal}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      <MockTopicModal open={modalOpen} editing={editing} onCancel={closeModal} onSubmit={handleSubmitTopic} />

      <DeleteModal open={deleteModalOpen} topic={topicToDelete} loading={deleting} onConfirm={confirmDelete} onCancel={cancelDelete} />
    </AdminPageHeader>
  );
}
