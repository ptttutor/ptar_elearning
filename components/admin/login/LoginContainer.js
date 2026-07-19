"use client";
import { useResponsive } from "@/hooks/admin/useResponsive";

export default function LoginContainer({ children }) {
  const responsive = useResponsive();

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: responsive.isMobile ? "column" : "row"
  };

  return (
    <div style={containerStyle}>
      {children(responsive)}
    </div>
  );
}
