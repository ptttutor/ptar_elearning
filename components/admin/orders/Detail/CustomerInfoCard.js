"use client";
import { User, FileText } from "lucide-react";

export default function CustomerInfoCard({ selectedOrder }) {
  const user = selectedOrder?.user;
  return (
    <div className="mb-5 rounded-lg border border-gray-200 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <User className="h-4 w-4 text-blue-600" />
        ข้อมูลลูกค้า
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <User className="h-3.5 w-3.5" /> ชื่อ
          </div>
          <div className="text-sm font-semibold text-gray-900">{user?.name || "ไม่ระบุ"}</div>
        </div>
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
            <FileText className="h-3.5 w-3.5" /> อีเมล
          </div>
          <div className="text-sm text-gray-700">{user?.email || "ไม่ระบุ"}</div>
        </div>
      </div>
    </div>
  );
}
