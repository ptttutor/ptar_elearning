"use client";
import { useState } from "react";
import { Truck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

// Components
import ShippingFilters from "./ShippingFilters";
import ShippingTable from "./ShippingTable";
import ShippingModal from "./ShippingModal";
import ShippingDetailModal from "./ShippingDetailModal";

// Hooks
import { useShipping } from "@/hooks/admin/useShipping";

export default function AdminShippingPage() {
  const { toast } = useToast();

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [detailShipment, setDetailShipment] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Use custom hook for shipping data
  const {
    shipments,
    setShipments,
    loading,
    detailLoading,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    fetchShipmentDetail,
    updateShipment,
    handleFilterChange,
    handleSortSelectChange,
    handlePageChange,
    resetFilters,
  } = useShipping();

  // Handle view detail with loading state
  const handleViewDetail = async (shipment) => {
    setDetailModalOpen(true);
    setDetailShipment(null);

    try {
      const detail = await fetchShipmentDetail(shipment.id);
      if (detail) {
        setDetailShipment(detail);
      } else {
        setDetailModalOpen(false);
        toast({ variant: "destructive", title: "ไม่สามารถโหลดรายละเอียดการจัดส่งได้" });
      }
    } catch (error) {
      console.error("Error fetching shipment detail:", error);
      setDetailModalOpen(false);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการโหลดรายละเอียด" });
    }
  };

  // Handle edit
  const handleEdit = (shipment) => {
    setSelectedShipment(shipment);
    setEditModalOpen(true);
  };

  // Handle update submission with optimistic updates
  const handleUpdateSubmit = async (values) => {
    setUpdating(true);
    try {
      if (!selectedShipment?.id) {
        toast({ variant: "destructive", title: "ไม่พบข้อมูลการจัดส่งที่จะอัพเดท" });
        return false;
      }

      const originalShipment = selectedShipment;
      const updatedShipment = { ...originalShipment, ...values, updatedAt: new Date().toISOString() };

      setShipments((prev) => prev.map((s) => (s.id === selectedShipment.id ? updatedShipment : s)));

      try {
        const success = await updateShipment(selectedShipment.id, values);

        if (success) {
          setEditModalOpen(false);
          setSelectedShipment(null);
          return true;
        } else {
          setShipments((prev) => prev.map((s) => (s.id === selectedShipment.id ? originalShipment : s)));
          return false;
        }
      } catch (error) {
        setShipments((prev) => prev.map((s) => (s.id === selectedShipment.id ? originalShipment : s)));
        console.error("Error updating shipment:", error);
        toast({ variant: "destructive", title: "เกิดข้อผิดพลาดในการอัพเดทสถานะ" });
        return false;
      }
    } catch (error) {
      console.error("Error in handleUpdateSubmit:", error);
      toast({ variant: "destructive", title: "เกิดข้อผิดพลาดไม่คาดคิด" });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedShipment(null);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setDetailShipment(null);
  };

  return (
    <AdminPageHeader
      icon={<Truck className="h-6 w-6" />}
      title="จัดการการจัดส่ง"
      subtitle="ติดตามและอัพเดทสถานะการจัดส่งสินค้า"
    >
      {/* Filters */}
      <ShippingFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onFilterChange={handleFilterChange}
        onSortSelectChange={handleSortSelectChange}
        onReset={resetFilters}
        totalCount={pagination.totalCount}
        currentCount={shipments.length}
        loading={loading}
      />

      {/* Table */}
      <ShippingTable
        shipments={shipments}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onViewDetail={handleViewDetail}
        onEdit={handleEdit}
        updatingId={updating ? selectedShipment?.id : null}
      />

      {/* Edit Modal */}
      <ShippingModal open={editModalOpen} onClose={handleCloseEditModal} onSubmit={handleUpdateSubmit} loading={updating} shipment={selectedShipment} />

      {/* Detail Modal */}
      <ShippingDetailModal open={detailModalOpen} onClose={handleCloseDetailModal} shipment={detailShipment} loading={detailLoading} />
    </AdminPageHeader>
  );
}
