"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Download,
  Calendar,
  SlidersHorizontal,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { suppliers, leadTimeData, supplierRadarData } from "@/lib/mock-data";
import { getStatusBgColor, formatPercentage } from "@/lib/utils";
import { exportAnalyticsCSV } from "@/lib/exportUtils";
import { useToast } from "@/components/shared/Toast";

export default function AnalyticsPage() {
  const { t, locale } = useTranslation();
  const { showToast, ToastComponent } = useToast();

  const handleExport = () => {
    try {
      exportAnalyticsCSV(suppliers);
      showToast(t("export.success"), "success");
    } catch {
      showToast(t("export.error"), "error");
    }
  };

  const supplierMetrics = [
    {
      label: t("analytics.avgOTD"),
      value: "94.2%",
      trend: `+2.1% ${t("analytics.vsBulanLalu")}`,
      trendDirection: "up" as const,
      icon: TrendingUp,
      trendColor: "text-emerald-400",
    },
    {
      label: t("analytics.qualityReject"),
      value: "1.8%",
      trend: `+0.3% ${t("analytics.vsBulanLalu")}`,
      trendDirection: "up" as const,
      icon: AlertTriangle,
      trendColor: "text-error",
    },
    {
      label: t("analytics.costVariance"),
      value: t("analytics.costValue"),
      trend: t("analytics.favorableTrend"),
      trendDirection: "down" as const,
      icon: DollarSign,
      trendColor: "text-emerald-400",
    },
  ];

  const riskLabels: Record<string, string> = {
    low: locale === "id" ? "Rendah" : "Low",
    medium: locale === "id" ? "Sedang" : "Medium",
    high: locale === "id" ? "Tinggi" : "High",
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
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full pulse-dot" />
            <span className="text-label-caps font-bold text-emerald-400 uppercase tracking-wider">
              {t("analytics.syncActive")}
            </span>
          </div>
          <h2 className="text-display-lg font-bold text-white tracking-tight">
            {t("analytics.title")}
          </h2>
          <p className="text-body-lg text-outline mt-1">
            {t("analytics.subtitle")}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="btn-ghost px-4 py-2 rounded-lg text-body-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {t("analytics.last30Days")}
          </button>
          <button className="btn-ghost px-4 py-2 rounded-lg text-body-sm font-medium flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> {t("analytics.category")}
          </button>
          <button
            onClick={handleExport}
            className="btn-primary px-4 py-2 rounded-lg text-body-sm font-medium flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> {t("analytics.exportReport")}
          </button>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {supplierMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="glass-card p-5 rounded-xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <span className="text-label-caps font-bold text-outline uppercase tracking-wider">
                  {metric.label}
                </span>
                <Icon className={`w-5 h-5 ${metric.trendColor}`} />
              </div>
              <p className="text-display-lg font-bold text-white mt-2">
                {metric.value}
              </p>
              <div className={`flex items-center gap-1 mt-2 ${metric.trendColor}`}>
                {metric.trendDirection === "up" ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span className="text-mono-data font-mono">{metric.trend}</span>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Lead Time Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2 glass-card-static rounded-xl p-5 h-[380px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-title-md font-semibold text-inverse-primary">
              {t("analytics.leadTime")}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-primary-container" />
                <span className="text-body-sm text-outline">{t("analytics.target")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-secondary-container" />
                <span className="text-body-sm text-outline">{t("analytics.actual")}</span>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadTimeData} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#737686", fontSize: 12, fontWeight: 700 }}
                  tickFormatter={(val) => {
                    const months: Record<string, string> = {
                      "MEI": locale === "id" ? "MEI" : "MAY",
                    };
                    return months[val] || val;
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#737686", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(30, 32, 44, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
                <Bar
                  dataKey="target"
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                  name={t("analytics.target")}
                />
                <Bar
                  dataKey="actual"
                  fill="#6063EE"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                  animationBegin={300}
                  name={t("analytics.actual")}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-static rounded-xl p-5 h-[380px] flex flex-col"
        >
          <h3 className="text-title-md font-semibold text-inverse-primary mb-4">
            {t("analytics.metricsRadar")}
          </h3>

          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={supplierRadarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tickFormatter={(tick) => {
                    const keys: Record<string, string> = {
                      "Kualitas": t("radar.quality"),
                      "Quality": t("radar.quality"),
                      "Biaya": t("radar.cost"),
                      "Cost": t("radar.cost"),
                      "Pengiriman": t("radar.delivery"),
                      "Delivery": t("radar.delivery"),
                      "Kelincahan": t("radar.agility"),
                      "Agility": t("radar.agility"),
                    };
                    return keys[tick] || tick;
                  }}
                  tick={{ fill: "#737686", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  tick={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Radar
                  name={t("analytics.performance")}
                  dataKey="value"
                  stroke="#2563EB"
                  fill="#2563EB"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  animationDuration={1500}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Vendor Performance Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card-static rounded-xl overflow-hidden"
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/5">
          <h3 className="text-title-md font-semibold text-inverse-primary">
            {t("analytics.vendorMatrix")}
          </h3>
          <button className="text-body-sm text-primary-container hover:text-inverse-primary transition-colors flex items-center gap-1">
            {t("analytics.viewAll")} <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-white/[0.02] border-b border-white/5">
          <div className="col-span-3 table-header">{t("analytics.supplierName")}</div>
          <div className="col-span-2 table-header">{t("inventory.status")}</div>
          <div className="col-span-2 table-header text-right">{t("analytics.otdScore")}</div>
          <div className="col-span-2 table-header text-right">{t("analytics.qualityRating")}</div>
          <div className="col-span-3 table-header text-right">{t("analytics.riskIndex")}</div>
        </div>

        {/* Table Rows */}
        {suppliers.map((supplier, index) => (
          <motion.div
            key={supplier.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.05 }}
            className="custom-table-row grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 items-center"
          >
            <div className="col-span-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-inverse-primary">
                  {supplier.initials}
                </span>
              </div>
              <span className="text-body-sm font-semibold text-white">
                {supplier.name}
              </span>
            </div>

            <div className="col-span-2">
              <span className={`badge text-[10px] ${getStatusBgColor(supplier.status)}`}>
                {supplier.status.toUpperCase()}
              </span>
            </div>

            <div className="col-span-2 text-right">
              <span className="text-body-sm font-mono text-white">
                {formatPercentage(supplier.otdScore)}
              </span>
            </div>

            <div className="col-span-2 text-right">
              <span className="text-body-sm font-mono text-white">
                {formatPercentage(supplier.qualityRating)}
              </span>
            </div>

            <div className="col-span-3 text-right">
              <span
                className={`text-body-sm font-mono ${
                  supplier.riskLevel === "low"
                    ? "text-emerald-400"
                    : supplier.riskLevel === "medium"
                    ? "text-amber-400"
                    : "text-error"
                }`}
              >
                {riskLabels[supplier.riskLevel]} ({supplier.riskIndex})
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
      {ToastComponent}
    </div>
  );
}
