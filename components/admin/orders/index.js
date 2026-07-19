"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { ShoppingCart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import OrderTable from "./OrderTable";
import ConfirmActionModal from "./ConfirmActionModal";
import OrderFilters from "./OrderFilters";
import OrderDetailModal from "./Detail/OrderDetailModal";
import AdminPageHeader from "@/components/admin/shared/AdminPageHeader";

export default function OrdersManagement() {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    orderType: "",
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchOrders = useCallback(async (page = pagination.page, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const currentFilters = filtersRef.current;
      const params = new URLSearchParams();
      if (currentFilters.status) params.append("status", currentFilters.status);
      if (currentFilters.paymentStatus) params.append("paymentStatus", currentFilters.paymentStatus);
      if (currentFilters.orderType) params.append("orderType", currentFilters.orderType);
      if (currentFilters.search) params.append("search", currentFilters.search);
      if (currentFilters.dateFrom) params.append("dateFrom", currentFilters.dateFrom);
      if (currentFilters.dateTo) params.append("dateTo", currentFilters.dateTo);
      params.append("page", page);
      params.append("limit", pageSize);

      const response = await fetch(`/api/admin/orders?${params.toString()}`);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON response but got ${contentType}. Response status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
        setPagination((prev) => ({
          ...prev,
          page,
          pageSize,
          total: result.pagination?.total ?? prev.total,
        }));
      } else {
        toast({ variant: "destructive", title: result.error || "เกิดข้อผิดพลาดในการโหลดข้อมูล" });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}` });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(1, pagination.pageSize);
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Debounce search / non-search filter changes into a refetch
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchOrders(1, pagination.pageSize);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleDateChange = (dateFrom, dateTo) => {
    setFilters((prev) => ({ ...prev, dateFrom, dateTo }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      paymentStatus: "",
      orderType: "",
      search: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const handlePageChange = (page) => {
    fetchOrders(page, pagination.pageSize);
  };

  const handleViewDetail = async (order) => {
    setDetailModalVisible(true);
    setDetailLoading(true);
    setSelectedOrder(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON response but got ${contentType}. Response status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSelectedOrder(result.data);
      } else {
        toast({ variant: "destructive", title: result.error || "เกิดข้อผิดพลาดในการโหลดรายละเอียด" });
        setDetailModalVisible(false);
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาดในการโหลดรายละเอียด: ${error.message}` });
      setDetailModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirmPayment = (order) => {
    if (!order || !order.id) {
      toast({ variant: "destructive", title: "ไม่พบข้อมูลคำสั่งซื้อ" });
      return;
    }
    setSelectedOrder(order);
    setActionType("confirm");
    setConfirmModalVisible(true);
  };

  const handleRejectPayment = (order) => {
    if (!order || !order.id) {
      toast({ variant: "destructive", title: "ไม่พบข้อมูลคำสั่งซื้อ" });
      return;
    }
    setSelectedOrder(order);
    setActionType("reject");
    setConfirmModalVisible(true);
  };

  const executeAction = async () => {
    if (!selectedOrder || !selectedOrder.id) {
      toast({ variant: "destructive", title: "ไม่พบข้อมูลคำสั่งซื้อที่เลือก" });
      setConfirmModalVisible(false);
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          notes: actionType === "reject" ? "ตรวจสอบแล้วพบว่าหลักฐานการโอนเงินไม่ถูกต้อง" : "ตรวจสอบแล้วถูกต้อง",
          rejectionReason: actionType === "reject" ? "หลักฐานการโอนเงินไม่ถูกต้องหรือไม่ชัดเจน" : null,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON response but got ${contentType}. Response status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast({ title: result.message });

        if (actionType === "confirm" && result.enrollment) {
          toast({ title: "ลูกค้าสามารถเข้าเรียนคอร์สได้แล้ว" });
        }

        fetchOrders(pagination.page, pagination.pageSize);
        setConfirmModalVisible(false);

        if (detailModalVisible) setDetailModalVisible(false);
      } else {
        toast({ variant: "destructive", title: result.error });
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast({ variant: "destructive", title: `เกิดข้อผิดพลาดในการอัพเดทคำสั่งซื้อ: ${error.message}` });
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(price);
  const formatDate = (dateString) => new Date(dateString).toLocaleString("th-TH");

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "COMPLETED": return "success";
      case "PENDING": return "warning";
      case "PENDING_VERIFICATION": return "processing";
      case "REJECTED": return "error";
      case "FREE": return "cyan";
      default: return "default";
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case "COMPLETED": return "ชำระแล้ว";
      case "PENDING": return "รอชำระ";
      case "PENDING_VERIFICATION": return "รอตรวจสอบ";
      case "REJECTED": return "ปฏิเสธ";
      case "FREE": return "ฟรี";
      default: return status;
    }
  };

  return (
    <AdminPageHeader
      icon={<ShoppingCart className="h-6 w-6" />}
      title="จัดการคำสั่งซื้อ"
      subtitle="ตรวจสอบและอนุมัติการชำระเงิน"
      actions={
        <Button variant="outline" onClick={() => fetchOrders(pagination.page, pagination.pageSize)} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          รีเฟรช
        </Button>
      }
    >
      {/* Filters */}
      <OrderFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onDateChange={handleDateChange}
        onResetFilters={resetFilters}
        loading={loading}
        totalCount={pagination.total}
        currentCount={orders.length}
      />

      <OrderTable
        orders={orders}
        loading={loading}
        actionLoading={actionLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onViewDetail={handleViewDetail}
        onConfirmPayment={handleConfirmPayment}
        onRejectPayment={handleRejectPayment}
      />

      {/* Detail Modal */}
      <OrderDetailModal
        visible={detailModalVisible}
        loading={detailLoading}
        selectedOrder={selectedOrder}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedOrder(null);
        }}
        onConfirmPayment={handleConfirmPayment}
        onRejectPayment={handleRejectPayment}
        formatPrice={formatPrice}
        formatDate={formatDate}
        getPaymentStatusColor={getPaymentStatusColor}
        getPaymentStatusText={getPaymentStatusText}
      />

      {/* Confirm Action Modal */}
      <ConfirmActionModal
        visible={confirmModalVisible}
        actionType={actionType}
        selectedOrder={selectedOrder}
        loading={actionLoading}
        onOk={executeAction}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </AdminPageHeader>
  );
}
