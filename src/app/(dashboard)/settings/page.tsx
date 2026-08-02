"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserPlus,
  Filter,
  MoreVertical,
  Package,
  ShoppingCart,
  BarChart3,
  CheckCircle,
  AlertCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { users, settingsActivities } from "@/lib/mock-data";
import { relativeTime, getStatusBgColor } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { subscribeUsers, updateUserPermissions } from "@/lib/firebase/service";
import type { AppUser, UserRole } from "@/lib/types";
import { useToast } from "@/components/shared/Toast";
import { X } from "lucide-react";

const activityIcons: Record<string, React.ElementType> = {
  CheckCircle,
  Package,
  AlertCircle,
};

const dotColors: Record<string, string> = {
  emerald: "bg-emerald-400",
  blue: "bg-primary-container",
  red: "bg-error",
  gray: "bg-outline",
};

const USERS_PER_PAGE = 5;

export default function SettingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersListState, setUsersListState] = useState<AppUser[]>(users);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, locale } = useTranslation();
  const { showToast, ToastComponent } = useToast();

  const [inviteForm, setInviteForm] = useState({
    displayName: "",
    email: "",
    role: "warehouse",
  });

  useEffect(() => {
    const unsubscribe = subscribeUsers((data) => {
      setUsersListState((prev) => {
        const merged = [...prev];
        data.forEach((liveUser) => {
          const idx = merged.findIndex((u) => u.email === liveUser.email);
          if (idx !== -1) {
            merged[idx] = liveUser;
          } else {
            merged.push(liveUser);
          }
        });
        return merged;
      });
    });
    return () => unsubscribe();
  }, []);

  // Set default selected user
  useEffect(() => {
    if (usersListState.length > 0 && !selectedUserId) {
      setSelectedUserId(usersListState[0].id);
    }
  }, [usersListState, selectedUserId]);

  const handleTogglePermission = async (permKey: string) => {
    if (!selectedUserId) return;
    const targetUser = usersListState.find((u) => u.id === selectedUserId);
    if (!targetUser) return;

    const updatedPermissions = {
      ...targetUser.permissions,
      [permKey]: !targetUser.permissions[permKey],
    };

    try {
      await updateUserPermissions(selectedUserId, updatedPermissions);
    } catch (error) {
      console.error("Error toggling user permissions:", error);
    }
  };

  const permissionsList = [
    { key: "inventoryEdit", label: t("settings.inventoryEdit"), icon: Package },
    { key: "orderApproval", label: t("settings.orderApproval"), icon: ShoppingCart },
    { key: "financialAnalytics", label: t("settings.financialAnalytics"), icon: BarChart3 },
  ];

  const roleLabels: Record<string, string> = {
    admin: locale === "id" ? "Admin" : "Admin",
    warehouse: locale === "id" ? "Gudang" : "Warehouse",
    finance: locale === "id" ? "Keuangan" : "Finance",
    procurement: locale === "id" ? "Pengadaan" : "Procurement",
    manager: locale === "id" ? "Manajer" : "Manager",
  };

  const filteredUsers = usersListState.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle invite user
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    // Add to local state
    const newUser: AppUser = {
      id: `usr-${Date.now()}`,
      displayName: inviteForm.displayName,
      email: inviteForm.email,
      role: inviteForm.role as UserRole,
      permissions: { inventoryEdit: false, orderApproval: false, financialAnalytics: false },
      lastActive: new Date(),
      status: "offline",
    };
    setUsersListState((prev) => [...prev, newUser]);
    setIsSubmitting(false);
    setIsInviteOpen(false);
    setInviteForm({ displayName: "", email: "", role: "warehouse" });
    showToast(
      locale === "id" ? "Undangan berhasil dikirim!" : "Invitation sent successfully!",
      "success"
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 className="text-display-lg font-bold text-white tracking-tight">
            {t("settings.title")}
          </h2>
          <p className="text-body-lg text-outline mt-1">
            {t("settings.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setIsInviteOpen(true)}
          className="btn-primary px-4 py-2 rounded-lg text-body-sm font-medium flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> {t("settings.inviteUser")}
        </button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex justify-between items-center"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder={t("settings.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input rounded-lg pl-10 pr-4 py-2.5 text-body-sm text-inverse-on-surface placeholder:text-outline/50"
          />
        </div>
        <div className="flex gap-2">
          <button className="glass-input rounded-lg p-2.5 hover:bg-white/5 transition-colors">
            <Filter className="w-5 h-5 text-outline" />
          </button>
          <button className="glass-input rounded-lg p-2.5 hover:bg-white/5 transition-colors">
            <MoreVertical className="w-5 h-5 text-outline" />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* User Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2 glass-card-static rounded-xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5">
            <div className="col-span-4 table-header">{t("settings.user")}</div>
            <div className="col-span-2 table-header">{t("settings.role")}</div>
            <div className="col-span-2 table-header">{t("settings.status")}</div>
            <div className="col-span-2 table-header">{t("settings.lastActive")}</div>
            <div className="col-span-2 table-header text-right">{t("settings.actions")}</div>
          </div>

          {/* User Rows */}
          {paginatedUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              onClick={() => setSelectedUserId(user.id)}
              className={`custom-table-row grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 items-center cursor-pointer transition-colors duration-150 ${
                selectedUserId === user.id ? "bg-white/[0.04] border-l-2 border-l-primary-container" : "hover:bg-white/[0.01]"
              }`}
            >
              {/* User Info */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-inverse-primary">
                    {user.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-white">
                    {user.displayName}
                  </p>
                  <p className="text-label-caps text-outline mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="col-span-2">
                <span className={`badge text-[10px] ${getStatusBgColor(user.role)}`}>
                  {roleLabels[user.role] || user.role}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      user.status === "active"
                        ? "bg-emerald-400"
                        : "bg-outline/50"
                    }`}
                  />
                  <span className="text-body-sm text-outline">
                    {user.status === "active" ? t("settings.active") : t("settings.offline")}
                  </span>
                </div>
              </div>

              {/* Last Active */}
              <div className="col-span-2">
                <span className="text-mono-data font-mono text-outline">
                  {relativeTime(user.lastActive as Date)}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end">
                <button className="p-1.5 rounded-lg hover:bg-white/5 text-outline hover:text-inverse-primary transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 px-5 py-4 border-t border-white/5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-white/5 text-outline transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-body-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-primary-container text-white"
                    : "text-outline hover:bg-white/5"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-white/5 text-outline transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Quick Permissions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card-static rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-5 h-5 text-inverse-primary" />
              <h3 className="text-title-md font-semibold text-inverse-primary">
                {t("settings.quickPermissions")}{" "}
                {usersListState.find((u) => u.id === selectedUserId) ? `(${usersListState.find((u) => u.id === selectedUserId)?.displayName})` : ""}
              </h3>
            </div>

            <div className="space-y-4">
              {permissionsList.map((perm) => {
                const Icon = perm.icon;
                const activeUser = usersListState.find((u) => u.id === selectedUserId);
                const isEnabled = activeUser?.permissions?.[perm.key] || false;

                return (
                  <div
                    key={perm.key}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-outline" />
                      <span className="text-body-sm text-white">{perm.label}</span>
                    </div>
                    <button
                      onClick={() => handleTogglePermission(perm.key)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                        isEnabled ? "bg-primary-container" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                          isEnabled ? "translate-x-[22px]" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <button className="w-full mt-4 btn-ghost px-4 py-2.5 rounded-lg text-body-sm font-medium text-center">
              {t("settings.viewFullMatrix")}
            </button>
          </motion.div>

          {/* Live Activity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card-static rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-5 h-5 text-inverse-primary" />
              <h3 className="text-title-md font-semibold text-inverse-primary">
                {t("settings.liveActivity")}
              </h3>
            </div>

            <div className="space-y-0">
              {settingsActivities.map((activity, index) => {
                const Icon = activity.icon
                  ? activityIcons[activity.icon] || CheckCircle
                  : CheckCircle;

                const message = activity.translationKey ? t(activity.translationKey) : activity.message;

                return (
                  <div key={activity.id} className="flex gap-3 py-3">
                    <div className="relative flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <Icon
                          className={`w-4 h-4 ${
                            activity.color === "red"
                              ? "text-error"
                              : "text-inverse-primary"
                          }`}
                        />
                      </div>
                      {index < settingsActivities.length - 1 && (
                        <div className="w-px flex-1 bg-outline-variant/20 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-body-sm text-white/90">
                        {message.split(/(PO-\d+|SKU-\w+)/g).map((part, i) =>
                          /^(PO-|SKU-)/.test(part) ? (
                            <span key={i} className="font-mono text-primary-container font-semibold">
                              {part}
                            </span>
                          ) : (
                            <span key={i} className={part === activity.userName ? "font-semibold" : ""}>
                              {part}
                            </span>
                          )
                        )}
                      </p>
                      <p className="text-label-caps font-bold text-outline mt-1">
                        {relativeTime(activity.timestamp as Date)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Logout Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-4"
      >
        <button className="flex items-center gap-2 text-outline hover:text-error transition-colors text-body-sm">
          <LogOut className="w-4 h-4" /> {t("settings.logout")}
        </button>
      </motion.div>

      {/* Modal: Invite User */}
      <AnimatePresence>
        {isInviteOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-white/10 relative shadow-2xl"
            >
              <button
                onClick={() => setIsInviteOpen(false)}
                className="absolute top-4 right-4 text-outline hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-title-lg font-bold text-white mb-6">
                {t("settings.inviteTitle")}
              </h3>
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                    {t("settings.displayName")}
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteForm.displayName}
                    onChange={(e) => setInviteForm({ ...inviteForm, displayName: e.target.value })}
                    className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                    {t("settings.email")}
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                    {t("settings.selectRole")}
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white bg-black/80"
                  >
                    <option value="warehouse">{roleLabels.warehouse}</option>
                    <option value="finance">{roleLabels.finance}</option>
                    <option value="procurement">{roleLabels.procurement}</option>
                    <option value="manager">{roleLabels.manager}</option>
                    <option value="admin">{roleLabels.admin}</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
                    className="btn-ghost px-4 py-2 rounded-lg text-body-sm font-semibold"
                  >
                    {t("settings.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary px-5 py-2 rounded-lg text-body-sm font-semibold flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>{t("settings.invite")}</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      {ToastComponent}
    </div>
  );
}
