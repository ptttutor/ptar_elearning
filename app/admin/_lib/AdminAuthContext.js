"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession, signIn, signOut, getSession } from "next-auth/react";

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (session?.user) {
      setUser(session.user);
      setLoading(false);
    } else {
      const savedUser = localStorage.getItem("admin_user");

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing saved admin user:", error);
          localStorage.removeItem("admin_user");
        }
      }
      setLoading(false);
    }
  }, [session, status]);

  const login = async (email, password) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: "ไม่พบผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" };
      }

      const freshSession = await getSession();
      const userData = freshSession?.user;

      setUser(userData);
      setLoading(false);
      return { success: true, user: userData };
    } catch (error) {
      console.error("Admin login error:", error);
      return { success: false, error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        const newUser = result.data;
        setUser(newUser);
        localStorage.setItem("admin_user", JSON.stringify(newUser));
        return { success: true, user: newUser };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error("Admin register error:", error);
      return { success: false, error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" };
    }
  };

  const logout = async () => {
    if (session) {
      await signOut({ redirect: false });
    }
    setUser(null);
    localStorage.removeItem("admin_user");
  };

  const loginWithLine = () => {
    signIn("line");
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("admin_user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    loginWithLine,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
