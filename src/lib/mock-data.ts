import type {
  KPIData,
  ChartDataPoint,
  ActivityLogEntry,
  InventoryItem,
  Shipment,
  Supplier,
  AppUser,
  LeadTimeData,
  Order,
  AppNotification,
} from "@/lib/types";

// ===== Dashboard KPI =====
export const dashboardKPIs: KPIData[] = [
  {
    label: "Total Stok",
    translationKey: "kpi.totalStock",
    value: 124592,
    trend: 5.2,
    trendDirection: "up",
    icon: "Package",
    color: "text-primary-container",
  },
  {
    label: "Pesanan Aktif",
    translationKey: "kpi.activeOrders",
    value: 8430,
    trend: 12.4,
    trendDirection: "up",
    icon: "FileText",
    color: "text-secondary-container",
  },
  {
    label: "Dalam Perjalanan",
    translationKey: "kpi.inTransit",
    value: 1204,
    trend: 0,
    trendDirection: "stable",
    icon: "Truck",
    color: "text-inverse-primary",
  },
  {
    label: "Terlambat",
    translationKey: "kpi.delayed",
    value: 42,
    trend: -2.1,
    trendDirection: "down",
    icon: "AlertTriangle",
    color: "text-error",
  },
];

// ===== Data Grafik Dashboard =====
export const inventoryDemandData: ChartDataPoint[] = [
  { name: "Sen", demand: 5200, inventory: 7200 },
  { name: "Sel", demand: 6800, inventory: 6400 },
  { name: "Rab", demand: 4500, inventory: 7800 },
  { name: "Kam", demand: 7200, inventory: 6200 },
  { name: "Jum", demand: 8500, inventory: 5800 },
  { name: "Sab", demand: 6200, inventory: 7000 },
  { name: "Min", demand: 9200, inventory: 5200 },
];

// ===== Feed Aktivitas Live =====
export const liveActivities: ActivityLogEntry[] = [
  {
    id: "act-1",
    type: "shipment",
    translationKey: "activity.shipmentDeparted",
    message: "Pengiriman #492 berangkat dari fasilitas.",
    userName: "Sistem",
    userId: "system",
    timestamp: new Date(Date.now() - 10000),
    color: "emerald",
  },
  {
    id: "act-2",
    type: "order",
    translationKey: "activity.newOrder",
    message: "Pesanan baru PO-8821 diterima.",
    details: "PO-8821",
    userName: "Sistem",
    userId: "system",
    timestamp: new Date(Date.now() - 720000),
    color: "blue",
  },
  {
    id: "act-3",
    type: "inventory",
    translationKey: "activity.inventoryAlert",
    message: "Peringatan inventori: Microchip di bawah batas minimum.",
    userName: "Sistem",
    userId: "system",
    timestamp: new Date(Date.now() - 2700000),
    color: "red",
  },
  {
    id: "act-4",
    type: "system",
    translationKey: "activity.systemMaintenance",
    message: "Pemeliharaan sistem selesai.",
    userName: "Sistem",
    userId: "system",
    timestamp: new Date(Date.now() - 7200000),
    color: "gray",
  },
];

// ===== Item Inventori =====
export const inventoryItems: InventoryItem[] = [
  {
    id: "inv-1",
    name: "Motor Servo Alpha",
    sku: "SM-A-1029",
    category: "Robotika",
    totalStock: 1240,
    reorderPoint: 500,
    warehouseId: "wh-1",
    warehouseName: "Gudang A",
    status: "good",
    distribution: 78,
    icon: "Cog",
    lastUpdated: new Date(Date.now() - 7200000),
  },
  {
    id: "inv-2",
    name: "Logic Board V2",
    sku: "LB-V2-004",
    category: "Sirkuit",
    totalStock: 142,
    reorderPoint: 250,
    warehouseId: "wh-1",
    warehouseName: "Gudang A",
    status: "low",
    distribution: 42,
    icon: "Cpu",
    lastUpdated: new Date(),
    drainRate: "Penurunan real-time",
  },
  {
    id: "inv-3",
    name: "Segmen Sabuk Konveyor",
    sku: "CB-S-881",
    category: "Infrastruktur",
    totalStock: 0,
    reorderPoint: 50,
    warehouseId: "wh-2",
    warehouseName: "Gudang B",
    status: "depleted",
    distribution: 0,
    icon: "ArrowRightLeft",
    lastUpdated: new Date(Date.now() - 86400000),
    expectedDate: "24 Okt",
  },
  {
    id: "inv-4",
    name: "Sel Baterai Industri",
    sku: "IB-C-990",
    category: "Sumber Daya",
    totalStock: 4800,
    reorderPoint: 1000,
    warehouseId: "wh-1",
    warehouseName: "Gudang A",
    status: "good",
    distribution: 85,
    icon: "Battery",
    lastUpdated: new Date(Date.now() - 300000),
  },
  {
    id: "inv-5",
    name: "Unit Pompa Hidrolik",
    sku: "HP-U-552",
    category: "Permesinan",
    totalStock: 320,
    reorderPoint: 100,
    warehouseId: "wh-3",
    warehouseName: "Gudang C",
    status: "good",
    distribution: 65,
    icon: "Droplets",
    lastUpdated: new Date(Date.now() - 3600000),
  },
  {
    id: "inv-6",
    name: "Set Roda Gigi Presisi",
    sku: "PG-S-217",
    category: "Robotika",
    totalStock: 89,
    reorderPoint: 150,
    warehouseId: "wh-2",
    warehouseName: "Gudang B",
    status: "low",
    distribution: 35,
    icon: "Settings",
    lastUpdated: new Date(Date.now() - 1800000),
  },
];

// ===== Pengiriman =====
export const shipments: Shipment[] = [
  {
    id: "shp-1",
    shipmentNumber: "SHP-40291",
    status: "in-transit",
    origin: { lat: -6.3, lng: 107.0, name: "Hub Cikarang" },
    destination: { lat: -6.9, lng: 107.6, name: "DC Bandung" },
    currentPosition: { lat: -6.6, lng: 107.3 },
    eta: "14:30 WIB",
    driver: { name: "M. Rodriguez", vehicleId: "TRK-99A" },
    speed: 68,
    temperature: 38,
    temperatureStatus: "stable",
    lastUpdated: new Date(),
  },
  {
    id: "shp-2",
    shipmentNumber: "SHP-39110",
    status: "delayed",
    origin: { lat: -6.1, lng: 106.8, name: "Pelabuhan Jakarta" },
    destination: { lat: -6.2, lng: 106.9, name: "Pelabuhan Tanjung Priok" },
    currentPosition: { lat: -6.15, lng: 106.85 },
    eta: "16:45 WIB (Diperbarui)",
    driver: { name: "A. Santoso", vehicleId: "TRK-45B" },
    speed: 12,
    temperature: 40,
    temperatureStatus: "warning",
    lastUpdated: new Date(Date.now() - 600000),
  },
  {
    id: "shp-3",
    shipmentNumber: "SHP-38900",
    status: "delivered",
    origin: { lat: -7.25, lng: 112.75, name: "Gudang Surabaya" },
    destination: { lat: -7.3, lng: 112.7, name: "DC Surabaya" },
    currentPosition: { lat: -7.3, lng: 112.7 },
    eta: "Terkirim",
    driver: { name: "B. Wijaya", vehicleId: "TRK-22C" },
    speed: 0,
    lastUpdated: new Date(Date.now() - 7200000),
  },
];

// ===== Log Aktivitas Pengiriman =====
export const shipmentActivities: ActivityLogEntry[] = [
  {
    id: "sa-1",
    type: "shipment",
    translationKey: "shipActivity.departed",
    message: "Pengiriman #SHP-40291 berangkat dari Hub Cikarang.",
    userName: "Sistem",
    userId: "system",
    timestamp: new Date(),
    color: "blue",
  },
  {
    id: "sa-2",
    type: "shipment",
    translationKey: "shipActivity.delayed",
    message: "Pengiriman #SHP-39110 tertunda karena kemacetan lalu lintas di sekitar Pelabuhan Tanjung Priok. ETA diperbarui.",
    userName: "Sistem",
    userId: "system",
    timestamp: new Date(Date.now() - 600000),
    color: "red",
  },
  {
    id: "sa-3",
    type: "order",
    translationKey: "shipActivity.orderReady",
    message: "Pesanan #ORD-882 selesai diproses. Siap diambil.",
    userName: "Sistem",
    userId: "system",
    timestamp: new Date(Date.now() - 2700000),
    color: "blue",
  },
  {
    id: "sa-4",
    type: "shipment",
    translationKey: "shipActivity.delivered",
    message: "Pengiriman #SHP-38900 berhasil dikirim.",
    userName: "Sistem",
    userId: "system",
    timestamp: new Date(Date.now() - 7200000),
    color: "gray",
  },
];

// ===== Pemasok =====
export const suppliers: Supplier[] = [
  {
    id: "sup-1",
    name: "Apex Global",
    initials: "AG",
    status: "preferred",
    otdScore: 98.5,
    qualityRating: 99.1,
    riskIndex: 1.2,
    riskLevel: "low",
    contactEmail: "contact@apexglobal.com",
  },
  {
    id: "sup-2",
    name: "NovaTech Solutions",
    initials: "NS",
    status: "preferred",
    otdScore: 96.2,
    qualityRating: 97.8,
    riskIndex: 1.8,
    riskLevel: "low",
    contactEmail: "info@novatech.io",
  },
  {
    id: "sup-3",
    name: "MetaCorp Industries",
    initials: "MI",
    status: "standard",
    otdScore: 89.4,
    qualityRating: 92.1,
    riskIndex: 3.5,
    riskLevel: "medium",
    contactEmail: "sales@metacorp.com",
  },
  {
    id: "sup-4",
    name: "QuickShip Logistics",
    initials: "QS",
    status: "probation",
    otdScore: 78.1,
    qualityRating: 85.3,
    riskIndex: 6.2,
    riskLevel: "high",
    contactEmail: "support@quickship.com",
  },
  {
    id: "sup-5",
    name: "PrimeParts Co.",
    initials: "PP",
    status: "preferred",
    otdScore: 97.8,
    qualityRating: 98.5,
    riskIndex: 1.0,
    riskLevel: "low",
    contactEmail: "orders@primeparts.com",
  },
];

// ===== Data Grafik Lead Time =====
export const leadTimeData: LeadTimeData[] = [
  { month: "JAN", target: 45, actual: 52 },
  { month: "FEB", target: 42, actual: 48 },
  { month: "MAR", target: 48, actual: 55 },
  { month: "APR", target: 40, actual: 38 },
  { month: "MEI", target: 35, actual: 32 },
  { month: "JUN", target: 38, actual: 35 },
];

// ===== Pengguna =====
export const users: AppUser[] = [
  {
    id: "usr-1",
    displayName: "Admin Utama",
    email: "admin@flowchain.io",
    role: "admin",
    permissions: { inventoryEdit: true, orderApproval: true, financialAnalytics: true },
    lastActive: new Date(),
    status: "active",
  },
  {
    id: "usr-2",
    displayName: "Sarah C.",
    email: "sarah@flowchain.io",
    role: "warehouse",
    permissions: { inventoryEdit: true, orderApproval: false, financialAnalytics: false },
    lastActive: new Date(Date.now() - 7200000),
    status: "offline",
  },
  {
    id: "usr-3",
    displayName: "Tim Keuangan",
    email: "finance@flowchain.io",
    role: "finance",
    permissions: { inventoryEdit: false, orderApproval: false, financialAnalytics: true },
    lastActive: new Date(Date.now() - 900000),
    status: "active",
  },
  {
    id: "usr-4",
    displayName: "James T.",
    email: "james@flowchain.io",
    role: "procurement",
    permissions: { inventoryEdit: false, orderApproval: true, financialAnalytics: false },
    lastActive: new Date(Date.now() - 3600000),
    status: "active",
  },
  {
    id: "usr-5",
    displayName: "Maria L.",
    email: "maria@flowchain.io",
    role: "manager",
    permissions: { inventoryEdit: true, orderApproval: true, financialAnalytics: true },
    lastActive: new Date(Date.now() - 1800000),
    status: "active",
  },
];

// ===== Log Aktivitas Pengaturan =====
export const settingsActivities: ActivityLogEntry[] = [
  {
    id: "sla-1",
    type: "approval",
    translationKey: "settingsAct.approved",
    message: "Sarah C. menyetujui PO-8819",
    userName: "Sarah C.",
    userId: "usr-2",
    timestamp: new Date(Date.now() - 120000),
    color: "blue",
    icon: "CheckCircle",
  },
  {
    id: "sla-2",
    type: "inventory",
    translationKey: "settingsAct.stockUpdate",
    message: "Bot Gudang memperbarui stok untuk SKU-A44",
    userName: "Bot Gudang",
    userId: "system",
    timestamp: new Date(Date.now() - 900000),
    color: "blue",
    icon: "Package",
  },
  {
    id: "sla-3",
    type: "auth",
    translationKey: "settingsAct.failedLogin",
    message: "Percobaan login gagal (IP: 192.168...)",
    userName: "Tidak dikenal",
    userId: "unknown",
    timestamp: new Date(Date.now() - 3600000),
    color: "red",
    icon: "AlertCircle",
  },
];

// ===== Pesanan =====
export const orders: Order[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-9982",
    status: "processing",
    items: [
      { itemId: "inv-1", name: "Motor Servo Alpha", quantity: 50, unitPrice: 193.7988788 },
      { itemId: "inv-4", name: "Sel Baterai Industri", quantity: 100, unitPrice: 69.2138853 },
    ],
    totalValue: 16611.33247,
    customer: "PT Robotika Indonesia",
    createdBy: "usr-4",
    assignedTo: "usr-2",
    priority: "high",
    timestamps: {
      created: new Date(Date.now() - 86400000),
      updated: new Date(Date.now() - 3600000),
      approved: new Date(Date.now() - 43200000),
    },
  },
  {
    id: "ord-2",
    orderNumber: "ORD-9981",
    status: "shipped",
    items: [
      { itemId: "inv-2", name: "Logic Board V2", quantity: 25, unitPrice: 431.8946443 },
    ],
    totalValue: 10797.36611,
    customer: "Nusantara Electronics",
    createdBy: "usr-5",
    assignedTo: "usr-2",
    priority: "medium",
    timestamps: {
      created: new Date(Date.now() - 172800000),
      updated: new Date(Date.now() - 7200000),
      approved: new Date(Date.now() - 86400000),
      shipped: new Date(Date.now() - 7200000),
    },
  },
  {
    id: "ord-3",
    orderNumber: "ORD-9980",
    status: "draft",
    items: [
      { itemId: "inv-5", name: "Unit Pompa Hidrolik", quantity: 10, unitPrice: 1550.3910308 },
    ],
    totalValue: 15503.91031,
    customer: "Mega Konstruksi",
    createdBy: "usr-4",
    assignedTo: "usr-5",
    priority: "low",
    timestamps: {
      created: new Date(Date.now() - 3600000),
      updated: new Date(Date.now() - 3600000),
    },
  },
  {
    id: "ord-4",
    orderNumber: "ORD-9979",
    status: "delivered",
    items: [
      { itemId: "inv-6", name: "Set Roda Gigi Presisi", quantity: 200, unitPrice: 27.6855541 },
    ],
    totalValue: 5537.11082,
    customer: "AutoTech Manufacturing",
    createdBy: "usr-5",
    assignedTo: "usr-2",
    priority: "medium",
    timestamps: {
      created: new Date(Date.now() - 604800000),
      updated: new Date(Date.now() - 86400000),
      approved: new Date(Date.now() - 518400000),
      shipped: new Date(Date.now() - 259200000),
      delivered: new Date(Date.now() - 86400000),
    },
  },
  {
    id: "ord-5",
    orderNumber: "ORD-9978",
    status: "approved",
    items: [
      { itemId: "inv-1", name: "Motor Servo Alpha", quantity: 30, unitPrice: 193.7988788 },
      { itemId: "inv-3", name: "Segmen Sabuk Konveyor", quantity: 15, unitPrice: 664.4532989 },
    ],
    totalValue: 15780.76585,
    customer: "Indo Assembly Lines",
    createdBy: "usr-4",
    assignedTo: "usr-2",
    priority: "urgent",
    timestamps: {
      created: new Date(Date.now() - 259200000),
      updated: new Date(Date.now() - 43200000),
      approved: new Date(Date.now() - 43200000),
    },
  },
];

// ===== Data Radar Pemasok =====
export const supplierRadarData = [
  { metric: "Kualitas", value: 92 },
  { metric: "Biaya", value: 78 },
  { metric: "Pengiriman", value: 88 },
  { metric: "Kelincahan", value: 72 },
];

// ===== Notifikasi =====
export const mockNotifications: AppNotification[] = [
  {
    id: "notif-1",
    type: "inventory",
    message: "Logic Board V2 stock di bawah titik pesan ulang (142 tersisa)",
    severity: "critical",
    read: false,
    userId: "system",
    createdAt: new Date(Date.now() - 300000),
  },
  {
    id: "notif-2",
    type: "shipment",
    message: "SHP-39110 mengalami keterlambatan — ETA diperbarui",
    severity: "warning",
    read: false,
    userId: "system",
    createdAt: new Date(Date.now() - 900000),
  },
  {
    id: "notif-3",
    type: "order",
    message: "Pesanan ORD-9982 telah disetujui dan siap diproses",
    severity: "info",
    read: false,
    userId: "system",
    createdAt: new Date(Date.now() - 1800000),
  },
  {
    id: "notif-4",
    type: "system",
    message: "Pemeliharaan sistem terjadwal pada 28 Okt 02:00 WIB",
    severity: "info",
    read: true,
    userId: "system",
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: "notif-5",
    type: "approval",
    message: "Menunggu persetujuan: Purchase Order PO-NEW-001 dari MetaCorp",
    severity: "warning",
    read: false,
    userId: "usr-5",
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: "notif-6",
    type: "inventory",
    message: "Segmen Sabuk Konveyor telah habis di Gudang B",
    severity: "critical",
    read: true,
    userId: "system",
    createdAt: new Date(Date.now() - 14400000),
  },
];

// ===== Data Pengadaan (Procurement) =====
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: "draft" | "pending" | "approved" | "in_progress" | "received" | "cancelled";
  items: { name: string; quantity: number; unitCost: number }[];
  totalCost: number;
  expectedDelivery: string;
  createdAt: Date;
  priority: "low" | "medium" | "high" | "urgent";
}

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "po-1",
    poNumber: "PO-2026-001",
    supplierId: "sup-1",
    supplierName: "Apex Global",
    status: "in_progress",
    items: [
      { name: "Motor Servo Alpha", quantity: 200, unitCost: 185.50 },
      { name: "Set Roda Gigi Presisi", quantity: 500, unitCost: 25.80 },
    ],
    totalCost: 50000,
    expectedDelivery: "5 Agu 2026",
    createdAt: new Date(Date.now() - 604800000),
    priority: "high",
  },
  {
    id: "po-2",
    poNumber: "PO-2026-002",
    supplierId: "sup-2",
    supplierName: "NovaTech Solutions",
    status: "approved",
    items: [
      { name: "Logic Board V2", quantity: 300, unitCost: 410.00 },
    ],
    totalCost: 123000,
    expectedDelivery: "12 Agu 2026",
    createdAt: new Date(Date.now() - 259200000),
    priority: "urgent",
  },
  {
    id: "po-3",
    poNumber: "PO-2026-003",
    supplierId: "sup-3",
    supplierName: "MetaCorp Industries",
    status: "pending",
    items: [
      { name: "Segmen Sabuk Konveyor", quantity: 100, unitCost: 640.00 },
      { name: "Unit Pompa Hidrolik", quantity: 20, unitCost: 1500.00 },
    ],
    totalCost: 94000,
    expectedDelivery: "20 Agu 2026",
    createdAt: new Date(Date.now() - 86400000),
    priority: "medium",
  },
  {
    id: "po-4",
    poNumber: "PO-2026-004",
    supplierId: "sup-5",
    supplierName: "PrimeParts Co.",
    status: "received",
    items: [
      { name: "Sel Baterai Industri", quantity: 1000, unitCost: 65.00 },
    ],
    totalCost: 65000,
    expectedDelivery: "22 Jul 2026",
    createdAt: new Date(Date.now() - 1209600000),
    priority: "low",
  },
  {
    id: "po-5",
    poNumber: "PO-2026-005",
    supplierId: "sup-4",
    supplierName: "QuickShip Logistics",
    status: "draft",
    items: [
      { name: "Komponen Sensor IoT", quantity: 150, unitCost: 88.50 },
    ],
    totalCost: 13275,
    expectedDelivery: "TBD",
    createdAt: new Date(Date.now() - 3600000),
    priority: "low",
  },
];

export const procurementMetrics = [
  { label: "Total Pemasok", translationKey: "procurement.totalSuppliers", value: 24, trend: "+3", trendColor: "text-emerald-400" },
  { label: "PO Tertunda", translationKey: "procurement.pendingPOs", value: 8, trend: "-2", trendColor: "text-emerald-400" },
  { label: "Lead Time Rata-rata", translationKey: "procurement.avgLeadTime", value: "12.4 hari", trend: "-1.2", trendColor: "text-emerald-400" },
  { label: "Penghematan Biaya", translationKey: "procurement.costSavings", value: "$42.3k", trend: "+8.5%", trendColor: "text-emerald-400" },
];

