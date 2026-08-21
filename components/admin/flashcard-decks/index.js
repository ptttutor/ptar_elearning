"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

import DeckFilters from "./DeckFilters";
import DeckTable from "./DeckTable";
import DeckModal from "./DeckModal";
import DeleteModal from "./DeleteModal";

import { useFlashcardDecks } from "@/hooks/admin/useFlashcardDecks";

export default function FlashcardDecksManagement() {
  const router = useRouter();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const {
    decks,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchDecks,
    handleFilterChange,
    handlePageChange,
    handleSortChange,
    handleSortSelectChange,
    resetFilters,
  } = useFlashcardDecks();

  const handleSubmitDeck = async (deckData) => {
    let res;
    if (editing) {
      res = await fetch(`/api/admin/flashcard-decks/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deckData),
      });
    } else {
      res = await fetch(`/api/admin/flashcard-decks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deckData),
      });
    }

    const data = await res.json();
    if (data.success) {
      toast({ title: editing ? "แก้ไขชุดสำเร็จ" : "สร้างชุดสำเร็จ" });
      setModalOpen(false);
      setEditing(null);
      fetchDecks();
    } else {
      toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาด" });
    }
  };

  const handleDelete = (deck) => {
    setDeckToDelete(deck);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deckToDelete?.id) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/flashcard-decks/${deckToDelete.id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast({ title: "ลบชุดสำเร็จ" });
        setDeleteModalOpen(false);
        setDeckToDelete(null);
        await fetchDecks();
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการลบชุด" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาด: ${error.message}` });
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDeckToDelete(null);
  };

  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleManageCards = (deck) => {
    router.push(`/admin/flashcard-decks/cards/${deck.id}`);
  };

  return (
    <AdminPageHeader
      icon={<Layers className="h-6 w-6" />}
      title="แฟลชการ์ด"
      subtitle="จัดการชุดแฟลชการ์ดสำหรับทบทวนแบบ spaced repetition"
      actions={
        <Button onClick={() => openModal(null)}>
          <Plus className="mr-2 h-4 w-4" />
          สร้างชุดใหม่
        </Button>
      }
    >
      <DeckFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onSortSelectChange={handleSortSelectChange}
        onReset={resetFilters}
        totalCount={pagination.total}
        currentCount={decks.length}
        loading={loading}
      />

      <DeckTable
        decks={decks}
        loading={loading}
        filters={filters}
        pagination={pagination}
        onEdit={openModal}
        onDelete={handleDelete}
        onManageCards={handleManageCards}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />

      <DeckModal open={modalOpen} editing={editing} onCancel={closeModal} onSubmit={handleSubmitDeck} />

      <DeleteModal open={deleteModalOpen} deck={deckToDelete} loading={deleting} onConfirm={confirmDelete} onCancel={cancelDelete} />
    </AdminPageHeader>
  );
}
