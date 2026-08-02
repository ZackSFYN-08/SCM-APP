"use client";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { useSidebarStore } from "@/lib/stores/sidebarStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isCollapsed } = useSidebarStore();
  const { user, loading, initialized, initializeAuth } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // Initialize auth listener
  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  // Auth Guard redirect
  useEffect(() => {
    if (initialized && !user && !loading) {
      router.push("/login");
    }
  }, [user, loading, initialized, router]);

  const marginLeft = isMounted
    ? typeof window !== "undefined" && window.innerWidth >= 768
      ? isCollapsed
        ? "80px"
        : "272px"
      : "0px"
    : "0px";

  // Loading indicator for authentication check
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-[#090A0F] text-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
          <span className="text-body-sm font-semibold text-outline animate-pulse">
            Authenticating Secure Portal...
          </span>
        </div>
      </div>
    );
  }

  // Double safety: if not logged in, return null while router shifts page
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className="flex-1 flex flex-col min-h-screen transition-[margin-left] duration-300 ease-in-out md:ml-[272px]"
        style={isMounted ? { marginLeft } : undefined}
      >
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:px-8 md:pb-8 md:pt-4 max-w-[1440px] mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
