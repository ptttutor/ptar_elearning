"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth as useAuth } from "../_lib/AdminAuthContext";
import { Layout, theme } from "antd";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminLoadingScreen from "../../../components/admin/AdminLoadingScreen";
import AdminAccessDenied from "../../../components/admin/AdminAccessDenied";

const { Header, Sider, Content } = Layout;

export default function AdminShellLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

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
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        collapsedWidth={80}
        style={{ background: "#001529" }}
      >
        <AdminSidebar collapsed={collapsed} pathname={pathname} />
      </Sider>

      <Layout style={{ transition: "margin-left 0.2s" }}>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            borderBottom: "1px solid #f0f0f0",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <AdminHeader
            collapsed={collapsed}
            onToggle={handleToggle}
            user={user}
            onLogout={handleLogout}
          />
        </Header>

        <Content style={{ minHeight: "calc(100vh - 112px)" }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
