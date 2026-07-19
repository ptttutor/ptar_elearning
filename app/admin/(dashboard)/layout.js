"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth as useAuth } from "../_lib/AdminAuthContext";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminLoadingScreen from "../../../components/admin/AdminLoadingScreen";
import AdminAccessDenied from "../../../components/admin/AdminAccessDenied";

export default function AdminShellLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setAuthChecking(false);
        router.push(
          "/admin/login?redirect=" + encodeURIComponent("/admin/dashboard")
        );
      }
    }, 5000);

    if (loading) return () => clearTimeout(timeout);

    clearTimeout(timeout);

    if (!user || !isAuthenticated) {
      setAuthChecking(false);
      router.push("/admin/login?redirect=" + encodeURIComponent("/admin/dashboard"));
      return;
    }

    const userRole = user.role?.toUpperCase();
    if (userRole !== "ADMIN") {
      setAuthChecking(false);
      router.push("/admin/login?error=AccessDenied");
      return;
    }

    setAuthChecking(false);
  }, [user, isAuthenticated, loading, router]);

  if (loading || authChecking) {
    return <AdminLoadingScreen />;
  }

  if (!user || user.role?.toUpperCase() !== "ADMIN") {
    return <AdminAccessDenied />;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex min-h-screen">
      <aside
        className="relative shrink-0 transition-[width] duration-200"
        style={{ width: collapsed ? 80 : 220 }}
      >
        <AdminSidebar collapsed={collapsed} pathname={pathname} onToggle={handleToggle} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[100] flex h-16 items-center border-b border-gray-200 bg-white px-6">
          <AdminHeader
            collapsed={collapsed}
            onToggle={handleToggle}
            user={user}
            onLogout={handleLogout}
          />
        </header>

        <main className="min-h-[calc(100vh-64px)] min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
