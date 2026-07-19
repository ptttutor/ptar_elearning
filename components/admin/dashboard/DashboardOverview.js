"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  BookOpen,
  DollarSign,
  ShoppingCart,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getPaginationRange } from "@/lib/get-pagination-range";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import AdminStatsCard from "@/components/admin/shared/AdminStatsCard";
import {
  useDashboardStats,
  useCourseSales,
  useEbookSales,
} from "@/hooks/admin/useDashboard";

const PAGE_SIZE = 10;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(amount || 0);

const formatNumber = (number) => new Intl.NumberFormat("th-TH").format(number || 0);

function SalesTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  return (
    <div className="rounded-lg border bg-white p-4 shadow-lg">
      <div className="mb-1 font-semibold text-blue-600">{data.orderId}</div>
      <div className="text-sm">
        ประเภท: <span className="font-medium">{data.type}</span>
      </div>
      <div className="text-sm">
        ชื่อสินค้า: <span className="font-medium">{data.name}</span>
      </div>
      <div className="text-sm">
        จำนวนครั้ง: <span className="font-medium">{data.count} ครั้ง</span>
      </div>
      <div className="mt-1 text-base font-bold text-green-600">
        ยอดขาย: {formatCurrency(data.amount)}
      </div>
    </div>
  );
}

const DashboardOverview = () => {
  const [period, setPeriod] = useState(30);
  const [salesData, setSalesData] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [allSalesData, setAllSalesData] = useState([]);
  const [allSalesLoading, setAllSalesLoading] = useState(false);
  const [page, setPage] = useState(1);

  // ดึงข้อมูล sales overview จาก /api/admin/orders?paymentStatus=COMPLETED
  React.useEffect(() => {
    setSalesLoading(true);
    fetch(`/api/admin/orders?paymentStatus=COMPLETED&limit=100`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          const data = result.data.map((order) => ({
            orderId: order.id,
            type: order.course ? "Course" : order.ebook ? "Ebook" : "-",
            name:
              order.course?.title ||
              order.ebook?.title ||
              order.items?.[0]?.title ||
              "-",
            amount: order.payment?.amount || order.total,
            date: order.payment?.paidAt || order.createdAt,
          }));
          setSalesData(data);
        } else {
          setSalesData([]);
        }
      })
      .catch(() => setSalesData([]))
      .finally(() => setSalesLoading(false));
  }, [period]);

  // ดึงข้อมูล sales ทั้งหมดสำหรับกราฟ
  React.useEffect(() => {
    setAllSalesLoading(true);
    fetch(`/api/admin/orders?paymentStatus=COMPLETED`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          const data = result.data.map((order) => ({
            orderId: order.id,
            type: order.course ? "Course" : order.ebook ? "Ebook" : "-",
            name:
              order.course?.title ||
              order.ebook?.title ||
              order.items?.[0]?.title ||
              "-",
            amount: order.payment?.amount || order.total,
            date: order.payment?.paidAt || order.createdAt,
          }));
          setAllSalesData(data);
        } else {
          setAllSalesData([]);
        }
      })
      .catch(() => setAllSalesData([]))
      .finally(() => setAllSalesLoading(false));
  }, [period]);

  const { stats } = useDashboardStats(period);
  useCourseSales(period);
  useEbookSales(period);

  const salesDataWithIndex = salesData.map((item, idx) => ({ ...item, rowNumber: idx + 1 }));

  const groupedAllSalesData = allSalesData.reduce((acc, current) => {
    const existingOrder = acc.find((item) => item.orderId === current.orderId);
    if (existingOrder) {
      existingOrder.amount += current.amount;
      existingOrder.count = (existingOrder.count || 1) + 1;
    } else {
      acc.push({ ...current, count: 1 });
    }
    return acc;
  }, []);

  const revenueChartData = stats
    ? [
        { type: "ยอดขายรวม", value: stats.stats.revenue.total },
        { type: "รายได้ Course", value: stats.stats.revenue.course },
      ]
    : [];

  const productChartData = groupedAllSalesData.slice(0, 10).map((item) => ({
    orderId: `Order ${item.orderId}`,
    amount: item.amount,
    count: item.count,
    type: item.type,
    name: item.name,
    displayName: item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
  }));

  const totalPages = Math.max(1, Math.ceil(salesDataWithIndex.length / PAGE_SIZE));
  const pagedSales = useMemo(
    () => salesDataWithIndex.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [salesDataWithIndex, page]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">ภาพรวมการขายและสถิติ</p>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-8 py-8">
        {/* Overview Stats */}
        {stats && (
          <div>
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-800">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              สถิติโดยรวม
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AdminStatsCard
                title="ยอดขายรวม"
                value={formatCurrency(stats.stats.revenue.total)}
                icon={<DollarSign className="h-6 w-6" style={{ color: "#52c41a" }} />}
                color="#52c41a"
              />
              <AdminStatsCard
                title="ออร์เดอร์ทั้งหมด"
                value={formatNumber(stats.stats.orders.total)}
                icon={<ShoppingCart className="h-6 w-6" style={{ color: "#1890ff" }} />}
                color="#1890ff"
                extra={`สำเร็จ: ${stats.stats.orders.completed} | รอ: ${stats.stats.orders.pending}`}
              />
              <AdminStatsCard
                title="รายได้ Course"
                value={formatCurrency(stats.stats.revenue.course)}
                icon={<BookOpen className="h-6 w-6" style={{ color: "#722ed1" }} />}
                color="#722ed1"
                extra={`ขาย: ${formatNumber(stats.stats.courses.sold)} คอร์ส`}
              />
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {stats && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                ภาพรวมยอดขาย
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200" />
                  <XAxis dataKey="type" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#fa8c16" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              ยอดขายสินค้า
            </div>
            {allSalesLoading ? (
              <div className="flex h-[280px] items-center justify-center text-gray-400">
                กำลังโหลดข้อมูล...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={productChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200" />
                  <XAxis dataKey="displayName" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<SalesTooltip />} />
                  <Bar dataKey="amount" fill="#1890ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <LayoutDashboard className="h-5 w-5 text-green-500" />
            รายการขายล่าสุด ({salesDataWithIndex.length} รายการ)
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14 text-center">#</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>ชื่อสินค้า</TableHead>
                  <TableHead className="text-right">ยอดขาย</TableHead>
                  <TableHead>วันที่</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : pagedSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-400">
                      ยังไม่มีรายการขาย
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedSales.map((item) => (
                    <TableRow key={item.orderId}>
                      <TableCell className="text-center text-gray-500">{item.rowNumber}</TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            item.type === "Course"
                              ? "border-green-200 bg-green-50 text-green-600"
                              : "border-orange-200 bg-orange-50 text-orange-600"
                          }`}
                        >
                          {item.type}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.name}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {new Date(item.date).toLocaleString("th-TH")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                  />
                </PaginationItem>
                {getPaginationRange(page, totalPages).map((p, i) =>
                  p === "..." ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={page === p}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
