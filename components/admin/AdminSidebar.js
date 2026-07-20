"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Tags,
  Truck,
  BookOpen,
  Folder,
  PenSquare,
  Tag,
  Users,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  ListTree,
} from "lucide-react";

const menuItems = [
  { key: "/admin/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { key: "/admin/orders", label: "คำสั่งซื้อ", icon: ShoppingCart },
  { key: "/admin/coupons", label: "คูปอง", icon: Tags },
  { key: "/admin/shipping", label: "การจัดส่ง", icon: Truck },
  { key: "/admin/courses", label: "คอร์สเรียน", icon: BookOpen },
  { key: "/admin/categories", label: "หมวดหมู่คอร์ส", icon: Folder },
  { key: "/admin/mock-exams", label: "ข้อสอบจำลอง", icon: FileQuestion },
  { key: "/admin/mock-topics", label: "หัวข้อข้อสอบจำลอง", icon: ListTree },
  { key: "/admin/posts", label: "โพสต์", icon: PenSquare },
  { key: "/admin/post-categories", label: "หมวดหมู่โพสต์", icon: Tag },
  { key: "/admin/users", label: "ผู้ใช้", icon: Users },
];

export default function AdminSidebar({ collapsed, pathname, onToggle }) {
  return (
    <div className="relative flex h-full flex-col border-r border-gray-200 bg-white">
      {/* Logo/Brand — links back to the customer-facing home page */}
      <Link
        href="/"
        className={`flex min-h-16 shrink-0 items-center border-b border-gray-200 ${
          collapsed ? "justify-center px-0 py-3" : "justify-start px-6 py-3"
        }`}
      >
        <span
          className={
            collapsed
              ? "text-lg font-bold tracking-tight text-gray-900"
              : "text-sm font-bold leading-snug tracking-tight text-gray-900"
          }
        >
          {collapsed ? "A" : "ระบบจัดการคอร์สเรียนออนไลน์"}
        </span>
      </Link>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.key;
          return (
            <Link
              key={item.key}
              href={item.key}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              } ${collapsed ? "justify-center px-0" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse/expand toggle */}
      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
        className="absolute top-[70px] -right-3 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
