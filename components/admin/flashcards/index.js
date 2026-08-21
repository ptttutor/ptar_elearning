"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { HelpCircle, Plus, Layers, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

import CardTable from "./CardTable";
import CardModal from "./CardModal";
import DeleteModal from "./DeleteModal";
import BulkImportModal from "./BulkImportModal";

import { useFlashcards } from "@/hooks/admin/useFlashcards";
import { getSubjectLabel } from "@/lib/constants";

export default function FlashcardsManagement() {
  const { deckId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const [deckInfo, setDeckInfo] = useState(null);
  const [deckLoading, setDeckLoading] = useState(true);

  const { cards, loading, pagination, fetchCards, handlePageChange } = useFlashcards(deckId);

  const refreshDeckInfo = async () => {
    const res = await fetch(`/api/admin/flashcard-decks/${deckId}`);
    const data = await res.json();
    if (data.success) {
      setDeckInfo(data.data);
      return data.data;
    }
    return null;
  };

  useEffect(() => {
    if (!deckId) return;
    (async () => {
      setDeckLoading(true);
      try {
        const deck = await refreshDeckInfo();
        if (!deck) toast({ variant: "destructive", title: "ไม่สามารถโหลดข้อมูลชุดแฟลชการ์ดได้" });
      } catch {
        toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการโหลดข้อมูลชุดแฟลชการ์ด" });
      } finally {
        setDeckLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  const handleSubmitCard = async (cardData) => {
    let res;
    if (editing) {
      res = await fetch(`/api/admin/flashcards/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      });
    } else {
      res = await fetch(`/api/admin/flashcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cardData, deckId }),
      });
    }

    const data = await res.json();
    if (data.success) {
      toast({ title: editing ? "แก้ไขการ์ดสำเร็จ" : "สร้างการ์ดสำเร็จ" });
      setModalOpen(false);
      setEditing(null);
      fetchCards();
      refreshDeckInfo();
    } else {
      toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาด" });
    }
  };

  const handleBulkImport = async (text) => {
    const res = await fetch(`/api/admin/flashcards/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId, text }),
    });
    const data = await res.json();
    if (data.success) {
      toast({ title: data.message });
      setBulkModalOpen(false);
      fetchCards();
      refreshDeckInfo();
    } else {
      toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการนำเข้า" });
    }
  };

  const handleDelete = (card) => {
    setCardToDelete(card);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!cardToDelete?.id) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/flashcards/${cardToDelete.id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast({ title: "ลบการ์ดสำเร็จ" });
        setDeleteModalOpen(false);
        setCardToDelete(null);
        await fetchCards();
        refreshDeckInfo();
      } else {
        toast({ variant: "destructive", title: data.error || "เกิดข้อผิดพลาดในการลบการ์ด" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาด: ${error.message}` });
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setCardToDelete(null);
  };

  const openModal = (record) => {
    setEditing(record || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const deckSubtitle =
    deckInfo && !deckLoading ? (
      <div className="flex flex-wrap items-center gap-2">
        <span>ชุด: {deckInfo.title}</span>
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
          {getSubjectLabel(deckInfo.subject)}
        </Badge>
        <span className="text-gray-400">•</span>
        <span>{deckInfo._count?.cards || 0} ใบ</span>
      </div>
    ) : undefined;

  return (
    <AdminPageHeader
      icon={<HelpCircle className="h-6 w-6" />}
      title="จัดการการ์ด"
      subtitle={deckSubtitle}
      breadcrumbItems={[
        { href: "/admin/flashcard-decks", label: (<span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" />แฟลชการ์ด</span>) },
        { label: (<span className="inline-flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" />จัดการการ์ด</span>) },
      ]}
      onBack={() => router.back()}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setBulkModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            นำเข้าเป็นชุด
          </Button>
          <Button onClick={() => openModal(null)}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มการ์ดใหม่
          </Button>
        </div>
      }
    >
      <CardTable cards={cards} loading={loading} pagination={pagination} onEdit={openModal} onDelete={handleDelete} onPageChange={handlePageChange} />

      <CardModal open={modalOpen} editing={editing} onCancel={closeModal} onSubmit={handleSubmitCard} />

      <DeleteModal open={deleteModalOpen} card={cardToDelete} loading={deleting} onConfirm={confirmDelete} onCancel={cancelDelete} />

      <BulkImportModal open={bulkModalOpen} onCancel={() => setBulkModalOpen(false)} onSubmit={handleBulkImport} />
    </AdminPageHeader>
  );
}
