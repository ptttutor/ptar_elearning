import { Users, GraduationCap, BookOpen, Crown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AdminStatsCard from "@/components/admin/shared/AdminStatsCard";

export default function UserStatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "ผู้ใช้งานทั้งหมด",
      value: stats.total || 0,
      icon: <Users className="h-6 w-6" style={{ color: "#1890ff" }} />,
      color: "#1890ff",
    },
    {
      title: "นักเรียน",
      value: stats.students || 0,
      icon: <GraduationCap className="h-6 w-6" style={{ color: "#52c41a" }} />,
      color: "#52c41a",
    },
    {
      title: "ผู้สอน",
      value: stats.instructors || 0,
      icon: <BookOpen className="h-6 w-6" style={{ color: "#fa8c16" }} />,
      color: "#fa8c16",
    },
    {
      title: "ผู้ดูแลระบบ",
      value: stats.admins || 0,
      icon: <Crown className="h-6 w-6" style={{ color: "#eb2f96" }} />,
      color: "#eb2f96",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <AdminStatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
