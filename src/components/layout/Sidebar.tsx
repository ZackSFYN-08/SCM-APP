"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/lib/stores/sidebarStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Receipt,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Workflow,
} from "lucide-react";

const navItems = [
  { key: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "nav.inventory", href: "/inventory", icon: Package },
  { key: "nav.orders", href: "/orders", icon: ShoppingCart },
  { key: "nav.shipments", href: "/shipments", icon: Truck },
  { key: "nav.procurement", href: "/procurement", icon: Receipt },
  { key: "nav.analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebarStore();
  const { t } = useTranslation();

  const renderSidebarContent = (isMobile = false) => {
    const showText = isMobile || !isCollapsed;

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10 px-4 pt-2">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
            <Workflow className="w-5 h-5 text-on-primary-container" />
          </div>
          <AnimatePresence>
            {showText && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <h1 className="text-xl font-bold text-inverse-primary tracking-tight whitespace-nowrap">
                  FlowChain
                </h1>
                <p className="text-[11px] font-bold text-outline uppercase tracking-[0.15em] whitespace-nowrap">
                  {t("nav.subtitle")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const label = t(item.key);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={
                  isActive
                    ? "sidebar-link-active"
                    : "sidebar-link"
                }
                title={!showText ? label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <AnimatePresence>
                  {showText && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto px-2 pb-4 space-y-2">
          <Link
            href="/settings"
            onClick={closeMobile}
            className={
              pathname === "/settings"
                ? "sidebar-link-active"
                : "sidebar-link"
            }
            title={!showText ? t("nav.settings") : undefined}
          >
            <Settings className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {showText && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {t("nav.settings")}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Collapse Toggle (Desktop only) */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex w-full items-center justify-center gap-2 py-2 rounded-lg text-outline/50 hover:bg-white/5 hover:text-outline transition-all"
            title={isCollapsed ? t("nav.expand") : t("nav.collapse")}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs">{t("nav.collapse")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex fixed left-0 top-0 h-screen flex-col py-6 bg-inverse-surface/70 backdrop-blur-xl border-r border-outline-variant/10 z-50 shadow-lg"
        animate={{ width: isCollapsed ? 80 : 272 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {renderSidebarContent(false)}
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-md z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
            />
            <motion.aside
              className="md:hidden fixed left-0 top-0 h-screen w-72 flex flex-col py-6 bg-inverse-surface/98 backdrop-blur-2xl border-r border-outline-variant/10 z-[60] shadow-2xl"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <button
                onClick={closeMobile}
                className="absolute top-4 right-4 p-2 rounded-lg text-outline hover:text-inverse-primary hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
