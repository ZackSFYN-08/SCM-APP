"use client";

import { useSidebarStore } from "@/lib/stores/sidebarStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useNotificationStore } from "@/lib/stores/notificationStore";
import { mockNotifications } from "@/lib/mock-data";
import { relativeTime } from "@/lib/utils";
import {
  Menu,
  RefreshCw,
  Bell,
  Search,
  Globe,
  LogOut,
  X,
  Package,
  Truck,
  ShoppingCart,
  AlertTriangle,
  Info,
  CheckCheck,
  Shield,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const notifTypeIcons: Record<string, React.ElementType> = {
  inventory: Package,
  shipment: Truck,
  order: ShoppingCart,
  system: Info,
  approval: Shield,
};

const severityColors: Record<string, string> = {
  critical: "text-error",
  warning: "text-amber-400",
  info: "text-primary-container",
};

const severityDotColors: Record<string, string> = {
  critical: "bg-error",
  warning: "bg-amber-400",
  info: "bg-primary-container",
};

export default function TopBar() {
  const router = useRouter();
  const { toggleMobile } = useSidebarStore();
  const { t, locale, toggleLocale } = useTranslation();
  const { userProfile, logOut } = useAuthStore();
  const {
    notifications,
    isOpen: isNotifOpen,
    setNotifications,
    markAsRead,
    markAllAsRead,
    togglePanel,
    closePanel,
    unreadCount,
  } = useNotificationStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ label: string; href: string; type: string }>
  >([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Initialize notifications
  useEffect(() => {
    if (notifications.length === 0) {
      setNotifications(mockNotifications);
    }
  }, [notifications.length, setNotifications]);

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("global-search-input");
        if (input) {
          input.focus();
          setIsSearchFocused(true);
        }
      }
      if (e.key === "Escape") {
        setIsSearchFocused(false);
        setSearchResults([]);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    const results: Array<{ label: string; href: string; type: string }> = [];

    // Search across page names
    const pages = [
      { label: locale === "id" ? "Dasbor" : "Dashboard", href: "/dashboard", type: "page" },
      { label: locale === "id" ? "Inventori" : "Inventory", href: "/inventory", type: "page" },
      { label: locale === "id" ? "Pesanan" : "Orders", href: "/orders", type: "page" },
      { label: locale === "id" ? "Pengiriman" : "Shipments", href: "/shipments", type: "page" },
      { label: locale === "id" ? "Pengadaan" : "Procurement", href: "/procurement", type: "page" },
      { label: locale === "id" ? "Analitik" : "Analytics", href: "/analytics", type: "page" },
      { label: locale === "id" ? "Pengaturan" : "Settings", href: "/settings", type: "page" },
    ];

    pages.forEach((page) => {
      if (page.label.toLowerCase().includes(q)) {
        results.push(page);
      }
    });

    // Search common terms
    if ("order".includes(q) || "pesanan".includes(q)) {
      results.push({ label: locale === "id" ? "Pesanan Baru" : "New Order", href: "/orders", type: "action" });
    }
    if ("inventory".includes(q) || "inventori".includes(q) || "stok".includes(q) || "stock".includes(q)) {
      results.push({ label: locale === "id" ? "Cek Stok" : "Check Stock", href: "/inventory", type: "action" });
    }
    if ("shipment".includes(q) || "pengiriman".includes(q) || "tracking".includes(q)) {
      results.push({ label: locale === "id" ? "Lacak Pengiriman" : "Track Shipments", href: "/shipments", type: "action" });
    }
    if ("supplier".includes(q) || "pemasok".includes(q) || "vendor".includes(q)) {
      results.push({ label: locale === "id" ? "Analitik Pemasok" : "Supplier Analytics", href: "/analytics", type: "action" });
    }

    setSearchResults(results.slice(0, 6));
  }, [searchQuery, locale]);

  // Handle sync/refresh
  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSyncing(false);
  };

  const handleSearchSelect = (href: string) => {
    router.push(href);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  const getInitials = () => {
    if (!userProfile) return "AU";
    return userProfile.displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const unread = unreadCount();

  return (
    <header className="sticky top-3 z-40 mx-auto my-2 w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] max-w-[1440px] h-16 px-4 md:px-6 rounded-2xl glass-panel bg-inverse-surface/75 backdrop-blur-xl border border-white/12 shadow-2xl shadow-black/50 flex justify-between items-center transition-all duration-200">
      {/* Left: Mobile Menu + Sync Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobile}
          className="md:hidden text-outline hover:text-inverse-primary transition-colors p-2 rounded-full hover:bg-white/5"
          aria-label={t("topbar.menu")}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* System Sync Indicator */}
        <div className="hidden sm:flex items-center gap-2.5 glass-card-static px-4 py-1.5 rounded-full">
          <div className={`w-2 h-2 rounded-full ${isSyncing ? "bg-amber-400 animate-pulse" : "pulse-dot"}`} />
          <span className="text-mono-data font-mono text-inverse-primary/80">
            {isSyncing ? t("sync.refreshing") : t("topbar.syncing")}
          </span>
        </div>
      </div>

      {/* Center: Search (expandable) */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8" ref={searchRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            id="global-search-input"
            type="text"
            placeholder={t("topbar.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full glass-input rounded-lg pl-10 pr-16 py-2 text-body-sm text-inverse-on-surface placeholder:text-outline/50"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-outline/50 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
            Ctrl+K
          </kbd>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {isSearchFocused && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full mt-2 left-0 right-0 glass-panel border border-white/10 rounded-xl p-2 shadow-2xl z-50"
              >
                {searchResults.map((result, i) => (
                  <button
                    key={`${result.href}-${i}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSearchSelect(result.href);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm text-white hover:bg-white/5 transition-colors text-left"
                  >
                    <Search className="w-3.5 h-3.5 text-outline" />
                    <span>{result.label}</span>
                    <span className="ml-auto text-[10px] font-bold uppercase text-outline/50 bg-white/5 px-2 py-0.5 rounded-full">
                      {result.type === "page"
                        ? locale === "id"
                          ? "Halaman"
                          : "Page"
                        : locale === "id"
                        ? "Aksi"
                        : "Action"}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="lg:hidden p-2 text-outline hover:text-inverse-primary hover:bg-white/5 rounded-full transition-colors"
          aria-label={t("topbar.searchShort")}
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Language Switcher */}
        <button
          onClick={toggleLocale}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-outline hover:text-inverse-primary hover:bg-white/5 rounded-lg transition-colors border border-outline-variant/10 active:scale-95 duration-150 mr-1 font-mono"
          title={t("lang.label")}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{locale.toUpperCase()}</span>
        </button>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="p-2 text-outline hover:text-inverse-primary hover:bg-white/5 rounded-full transition-colors active:scale-95 duration-150 disabled:opacity-50"
          aria-label={t("topbar.syncData")}
        >
          <RefreshCw className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              togglePanel();
              setDropdownOpen(false);
            }}
            className="p-2 text-outline hover:text-inverse-primary hover:bg-white/5 rounded-full transition-colors active:scale-95 duration-150 relative"
            aria-label={t("topbar.notifications")}
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-error rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {/* Notification Panel Dropdown */}
          <AnimatePresence>
            {isNotifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={closePanel}
                />
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-[calc(100vw-32px)] max-w-sm sm:w-96 glass-panel border border-white/10 rounded-2xl shadow-2xl z-50 max-h-[480px] flex flex-col"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                    <h4 className="text-body-sm font-semibold text-white">
                      {t("notification.title")}
                    </h4>
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-[11px] font-bold text-primary-container hover:text-inverse-primary transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      {t("notification.markAllRead")}
                    </button>
                  </div>

                  {/* List */}
                  <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <Bell className="w-8 h-8 text-outline/30 mx-auto mb-2" />
                        <p className="text-body-sm text-outline">
                          {t("notification.empty")}
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const Icon =
                          notifTypeIcons[notif.type] || Info;
                        return (
                          <div
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
                            className={`flex gap-3 px-4 py-3 border-b border-white/5 last:border-b-0 cursor-pointer transition-colors hover:bg-white/[0.02] ${
                              !notif.read ? "bg-white/[0.02]" : ""
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                              <Icon
                                className={`w-4 h-4 ${
                                  severityColors[notif.severity]
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`text-body-sm leading-relaxed ${
                                    notif.read
                                      ? "text-outline"
                                      : "text-white/90"
                                  }`}
                                >
                                  {notif.message}
                                </p>
                                {!notif.read && (
                                  <div
                                    className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                                      severityDotColors[notif.severity]
                                    }`}
                                  />
                                )}
                              </div>
                              <p className="text-label-caps font-bold text-outline uppercase tracking-wider mt-1">
                                {relativeTime(notif.createdAt as Date)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <div className="relative">
          <div
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              closePanel();
            }}
            className="w-8 h-8 rounded-full bg-primary-container/30 border border-outline-variant/20 overflow-hidden ml-2 cursor-pointer hover:ring-2 ring-primary transition-all flex items-center justify-center"
          >
            {userProfile?.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-inverse-primary">
                {getInitials()}
              </span>
            )}
          </div>

          {dropdownOpen && (
            <>
              {/* Overlay blocker to close dropdown */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 glass-panel border border-white/10 rounded-xl p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2 py-1.5 border-b border-white/5 mb-2">
                  <p className="text-body-sm font-semibold text-white truncate">
                    {userProfile?.displayName}
                  </p>
                  <p className="text-xs text-outline truncate mt-0.5">
                    {userProfile?.email}
                  </p>
                  <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/20 text-inverse-primary mt-1.5">
                    {userProfile?.role}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    setDropdownOpen(false);
                    await logOut();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-body-sm text-error hover:bg-error/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("settings.logout") || "Keluar / Logout"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar (Expandable) */}
      {searchOpen && (
        <div className="lg:hidden absolute left-2 right-2 top-full mt-2 p-3 glass-panel rounded-2xl border border-white/12 shadow-2xl z-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder={t("topbar.searchShort")}
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-lg pl-10 pr-10 py-2 text-body-sm text-inverse-on-surface placeholder:text-outline/50"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
              {searchResults.map((result, i) => (
                <button
                  key={`${result.href}-${i}`}
                  onClick={() => {
                    handleSearchSelect(result.href);
                    setSearchOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-body-sm text-white hover:bg-white/5 transition-colors text-left"
                >
                  <span>{result.label}</span>
                  <span className="text-[10px] font-bold uppercase text-outline/60 bg-white/5 px-2 py-0.5 rounded-full">
                    {result.type === "page"
                      ? locale === "id"
                        ? "Halaman"
                        : "Page"
                      : locale === "id"
                      ? "Aksi"
                      : "Action"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
