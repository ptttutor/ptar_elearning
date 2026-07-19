"use client";
import { useState, useEffect, Suspense } from "react";
import { useAdminAuth as useAuth } from "../_lib/AdminAuthContext";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginContainer from "../../../components/admin/login/LoginContainer";
import LoginLeftSection from "../../../components/admin/login/LoginLeftSection";
import LoginRightSection from "../../../components/admin/login/LoginRightSection";

function LoginPageContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, logout, isAuthenticated, user } = useAuth();
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get("redirect");
  const urlError = searchParams.get("error");
  const errorDetails = searchParams.get("details");

  // Handle URL errors
  useEffect(() => {
    if (urlError) {
      let errorMessage = "";
      switch (urlError) {
        case 'line_oauth_error':
          errorMessage = "เกิดข้อผิดพลาดในการล็อกอิน LINE";
          break;
        case 'no_code':
          errorMessage = "ไม่พบรหัสยืนยันจาก LINE";
          break;
        case 'token_exchange_failed':
          errorMessage = "ไม่สามารถแลกเปลี่ยน Token ได้";
          break;
        case 'profile_fetch_failed':
          errorMessage = "ไม่สามารถดึงข้อมูลโปรไฟล์ LINE ได้";
          break;
        case 'internal_error':
          errorMessage = "เกิดข้อผิดพลาดภายในระบบ";
          if (errorDetails) {
            errorMessage += `: ${errorDetails}`;
          }
          break;
        case 'AccessDenied':
          errorMessage = "คุณไม่มีสิทธิ์เข้าใช้งานในส่วนนี้ (เฉพาะ Admin เท่านั้น)";
          // Force logout for non-admin users
          if (isAuthenticated) {
            logout();
          }
          break;
        default:
          errorMessage = "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      }
      setError(errorMessage);


      // Log error for debugging
      console.error('Login error from URL:', { urlError, errorDetails });
    }
  }, [urlError, errorDetails, logout, isAuthenticated]);

  // Redirect if already authenticated
  useEffect(() => {
    // Don't redirect if there's an AccessDenied error
    if (urlError === 'AccessDenied') {
      return;
    }

    if (isAuthenticated && user) {
      // ถ้าเป็น admin และมี redirect ไป admin
      const userRole = user.role?.toUpperCase();
      if (userRole === 'ADMIN' && redirectUrl && redirectUrl.includes('/admin')) {
        router.push(redirectUrl);
      } else if (userRole === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push(redirectUrl || "/");
      }
    }
  }, [isAuthenticated, user, router, redirectUrl, urlError]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");

    const result = await login(values.email, values.password);

    console.log('Login result:', result);

    if (result.success) {
      // Redirect ทันทีหลัง login สำเร็จ
      const userRole = result.user?.role?.toUpperCase();
      console.log('Redirecting user with role:', userRole);
      
      // ให้ state update และ re-render ก่อน redirect
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('About to redirect...');
      
      if (userRole === 'ADMIN') {
        const destination = (redirectUrl && redirectUrl.includes('/admin')) 
          ? redirectUrl 
          : '/admin/dashboard';
        console.log('Redirecting to:', destination);
        window.location.href = destination; // ใช้ window.location แทน router.push
      } else {
        const destination = redirectUrl || "/";
        console.log('Redirecting to:', destination);
        window.location.href = destination;
      }
    } else {
      console.error('Login failed:', result.error);
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      {({ isMobile, isSmallMobile, isTablet }) => (
        <>
          <LoginLeftSection
            isMobile={isMobile}
            isSmallMobile={isSmallMobile}
          />
          <LoginRightSection
            error={error}
            setError={setError}
            loading={loading}
            onSubmit={handleSubmit}
            isSmallMobile={isSmallMobile}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </>
      )}
    </LoginContainer>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
