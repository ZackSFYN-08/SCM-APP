"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { inventoryDemandData } from "@/lib/mock-data";

const periods = ["1W", "1M", "1Y"];

export default function InventoryDemandChart() {
  const [activePeriod, setActivePeriod] = useState("1M");
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card-static rounded-xl p-4 md:p-6 flex flex-col h-[420px]"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-title-md font-semibold text-inverse-primary">
          {t("chart.inventoryVsDemand")}
        </h3>
        <div className="flex gap-1.5">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`px-3 py-1 rounded-md text-label-caps font-bold uppercase tracking-wider transition-colors ${
                activePeriod === period
                  ? "bg-primary-container/20 border border-primary-container/50 text-primary-container"
                  : "bg-inverse-surface border border-outline-variant/20 text-outline hover:text-inverse-primary"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={inventoryDemandData}>
            <defs>
              <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#737686", fontSize: 12, fontWeight: 700 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#737686", fontSize: 12, fontWeight: 700 }}
              tickFormatter={(value) =>
                value >= 1000 ? `${value / 1000}k` : value
              }
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(30, 32, 44, 0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                backdropFilter: "blur(12px)",
                color: "#fff",
                fontSize: "13px",
                fontFamily: "JetBrains Mono, monospace",
              }}
              labelStyle={{ color: "#B4C5FF", marginBottom: "4px" }}
              cursor={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <Area
              type="monotone"
              dataKey="demand"
              stroke="#2563EB"
              strokeWidth={2.5}
              fill="url(#demandGradient)"
              animationDuration={2000}
              name={t("chart.demandForecast")}
            />
            <Line
              type="monotone"
              dataKey="inventory"
              stroke="#6063EE"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={false}
              animationDuration={2000}
              animationBegin={500}
              name={t("chart.actualInventory")}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-3 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-container" />
          <span className="text-body-sm text-outline">{t("chart.demandForecast")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-secondary-container border-dashed" />
          <span className="text-body-sm text-outline">{t("chart.actualInventory")}</span>
        </div>
      </div>
    </motion.div>
  );
}
