"use client";
import { useState } from "react";
import { Tags, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

// Components
import CouponFilters from "@/components/admin/coupons/CouponFilters";
import CouponTable from "@/components/admin/coupons/CouponTable";
import CouponModal from "@/components/admin/coupons/CouponModal";
import DeleteModal from "@/components/admin/coupons/DeleteModal";

// Hooks
import { useCoupons } from "@/hooks/admin/useCoupons";

export default function CouponsPage() {
  const { toast } = useToast();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Use custom hook for coupons data
  const {
    coupons,
    loading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchCoupons,
    handleFilterChange,
    handlePageChange,
    resetFilters,
  } = useCoupons();

  // Create or update coupon
  const handleSubmitCoupon = async (couponData) => {
    try {
      let res;
      if (editing) {
        res = await fetch(`/api/admin/coupons/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(couponData),
        });
      } else {
        res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(couponData),
        });
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      toast({ title: editing ? "แก้ไขคูปองสำเร็จ" : "สร้างคูปองสำเร็จ" });
      setModalOpen(false);
      setEditing(null);
      fetchCoupons();
    } catch (error) {
      console.error("Submit error:", error);
      toast({ variant: "destructive", title: error.message || "เกิดข้อผิดพลาดในการบันทึกคูปอง" });
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons/${couponToDelete.id}`, { method: "DELETE" });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      toast({ title: "ลบคูปองสำเร็จ" });
      setDeleteModalOpen(false);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (error) {
      console.error("Delete error:", error);
      toast({ variant: "destructive", title: error.message || "เกิดข้อผิดพลาดในการลบคูปอง" });
    } finally {
      setDeleting(false);
    }
  };

  // Open edit modal
  const handleEdit = (coupon) => {
    setEditing(coupon);
    setModalOpen(true);
  };

  // Open delete modal
  const handleDelete = (coupon) => {
    setCouponToDelete(coupon);
    setDeleteModalOpen(true);
  };

  // Toggle coupon status
  const handleToggleStatus = async (coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...coupon, isActive: !coupon.isActive }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "เกิดข้อผิดพลาด");
      }

      toast({ title: coupon.isActive ? "ปิดใช้งานคูปองสำเร็จ" : "เปิดใช้งานคูปองสำเร็จ" });
      fetchCoupons();
    } catch (error) {
      console.error("Toggle error:", error);
      toast({ variant: "destructive", title: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ" });
    }
  };

  return (
    <AdminPageHeader
      icon={<Tags className="h-6 w-6" />}
      title="จัดการคูปอง"
      subtitle="สร้างและจัดการคูปองส่วนลดสำหรับลูกค้า"
      actions={
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มคูปองใหม่
        </Button>
      }
    >
      {/* Filters */}
      <CouponFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        loading={loading}
        totalCount={pagination.totalCount}
        currentCount={coupons.length}
      />

      {/* Table */}
      <CouponTable
        coupons={coupons}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/* Create/Edit Modal */}
      <CouponModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmitCoupon}
        initialData={editing}
        title={editing ? "แก้ไขคูปอง" : "เพิ่มคูปองใหม่"}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCouponToDelete(null);
        }}
        onConfirm={handleDeleteCoupon}
        coupon={couponToDelete}
        loading={deleting}
      />
    </AdminPageHeader>
  );
}
