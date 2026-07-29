"use client";

import { SessionProvider } from "next-auth/react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AntdConfigProvider } from "@/lib/antd";
import { AdminAuthProvider } from "./_lib/AdminAuthContext";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({ children }) {
  return (
    <SessionProvider>
      <AdminAuthProvider>
        <AntdRegistry>
          <AntdConfigProvider>{children}</AntdConfigProvider>
        </AntdRegistry>
        <Toaster />
      </AdminAuthProvider>
    </SessionProvider>
  );
}
