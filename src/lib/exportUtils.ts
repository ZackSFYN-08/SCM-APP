/**
 * CSV Export utilities for FlowChain reports
 */

function escapeCSV(value: string | number | undefined): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCSV(filename: string, csvContent: string) {
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportInventoryCSV(
  items: Array<{
    name: string;
    sku: string;
    category: string;
    totalStock: number;
    reorderPoint: number;
    warehouseName: string;
    status: string;
    distribution: number;
  }>
) {
  const headers = [
    "Item Name",
    "SKU",
    "Category",
    "Total Stock",
    "Reorder Point",
    "Warehouse",
    "Status",
    "Distribution %",
  ];
  const rows = items.map((item) =>
    [
      escapeCSV(item.name),
      escapeCSV(item.sku),
      escapeCSV(item.category),
      item.totalStock,
      item.reorderPoint,
      escapeCSV(item.warehouseName),
      escapeCSV(item.status),
      item.distribution,
    ].join(",")
  );
  downloadCSV("flowchain_inventory", [headers.join(","), ...rows].join("\n"));
}

export function exportOrdersCSV(
  orders: Array<{
    orderNumber: string;
    status: string;
    customer: string;
    totalValue: number;
    priority: string;
    items: Array<{ name: string; quantity: number; unitPrice: number }>;
    timestamps: { created: Date | { toDate: () => Date } };
  }>
) {
  const headers = [
    "Order Number",
    "Status",
    "Customer",
    "Total Value (USD)",
    "Priority",
    "Items Count",
    "Created Date",
  ];
  const rows = orders.map((order) => {
    const created =
      order.timestamps.created instanceof Date
        ? order.timestamps.created
        : (order.timestamps.created as { toDate: () => Date }).toDate();
    return [
      escapeCSV(order.orderNumber),
      escapeCSV(order.status),
      escapeCSV(order.customer),
      order.totalValue.toFixed(2),
      escapeCSV(order.priority),
      order.items.length,
      created.toISOString().slice(0, 10),
    ].join(",");
  });
  downloadCSV("flowchain_orders", [headers.join(","), ...rows].join("\n"));
}

export function exportAnalyticsCSV(
  suppliers: Array<{
    name: string;
    status: string;
    otdScore: number;
    qualityRating: number;
    riskIndex: number;
    riskLevel: string;
    contactEmail: string;
  }>
) {
  const headers = [
    "Supplier Name",
    "Status",
    "OTD Score (%)",
    "Quality Rating (%)",
    "Risk Index",
    "Risk Level",
    "Contact Email",
  ];
  const rows = suppliers.map((s) =>
    [
      escapeCSV(s.name),
      escapeCSV(s.status),
      s.otdScore.toFixed(1),
      s.qualityRating.toFixed(1),
      s.riskIndex.toFixed(1),
      escapeCSV(s.riskLevel),
      escapeCSV(s.contactEmail),
    ].join(",")
  );
  downloadCSV("flowchain_supplier_analytics", [headers.join(","), ...rows].join("\n"));
}

export function exportDashboardCSV(
  kpis: Array<{ label: string; value: string | number; trend: number; trendDirection: string }>,
  chartData: Array<{ name: string; demand: number; inventory: number }>
) {
  // KPI Section
  let csv = "=== KPI SUMMARY ===\n";
  csv += "Metric,Value,Trend (%),Direction\n";
  kpis.forEach((kpi) => {
    csv += [escapeCSV(kpi.label), escapeCSV(kpi.value), kpi.trend, escapeCSV(kpi.trendDirection)].join(",") + "\n";
  });

  // Chart Data Section
  csv += "\n=== INVENTORY vs DEMAND ===\n";
  csv += "Day,Demand,Inventory\n";
  chartData.forEach((d) => {
    csv += [escapeCSV(d.name), d.demand, d.inventory].join(",") + "\n";
  });

  downloadCSV("flowchain_dashboard_report", csv);
}

export function exportShipmentsCSV(
  shipments: Array<{
    shipmentNumber: string;
    status: string;
    origin: { name?: string };
    destination: { name?: string };
    eta: string;
    driver: { name: string; vehicleId: string };
    speed: number;
  }>
) {
  const headers = [
    "Shipment Number",
    "Status",
    "Origin",
    "Destination",
    "ETA",
    "Driver",
    "Vehicle ID",
    "Speed (mph)",
  ];
  const rows = shipments.map((s) =>
    [
      escapeCSV(s.shipmentNumber),
      escapeCSV(s.status),
      escapeCSV(s.origin.name),
      escapeCSV(s.destination.name),
      escapeCSV(s.eta),
      escapeCSV(s.driver.name),
      escapeCSV(s.driver.vehicleId),
      s.speed,
    ].join(",")
  );
  downloadCSV("flowchain_shipments", [headers.join(","), ...rows].join("\n"));
}
