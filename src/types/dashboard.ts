export type ColumnType = 
  | 'date'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'category'
  | 'id'
  | 'text';

export interface DetectedColumn {
  name: string;
  type: ColumnType;
  sampleValues: any[];
  nullCount: number;
  uniqueValuesCount: number;
  suggestedRole?: 'date' | 'revenue' | 'profit' | 'expenses' | 'orders' | 'customer' | 'product' | 'region' | 'category' | 'status' | 'none';
}

export interface FieldMapping {
  dateField?: string;
  revenueField?: string;
  profitField?: string;
  expenseField?: string;
  ordersField?: string;
  customerField?: string;
  productField?: string;
  regionField?: string;
  categoryField?: string;
  statusField?: string;
}

export interface DataQualityReport {
  totalRows: number;
  validRows: number;
  nullValuesCount: number;
  duplicateRowsCount: number;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

export interface CompanyBranding {
  companyName: string;
  logoUrl?: string;
  initials: string;
  dashboardTitle: string;
  subtitle: string;
  industry: string;
  currency: string; // e.g. '$', '€', '£', '₹', '¥'
  currencyCode: string; // USD, EUR, etc.
  timezone: string;
}

export type DatePreset =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'last90days'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear'
  | 'ytd'
  | 'custom';

export interface DateFilterState {
  preset: DatePreset;
  startDate?: string;
  endDate?: string;
  selectedYear?: string;
  selectedMonth?: string;
  selectedQuarter?: string;
}

export interface ActiveFilters {
  searchQuery: string;
  dateFilter: DateFilterState;
  categoricalFilters: Record<string, string[]>; // columnName -> selectedValues
}

export interface CalculatedKPI {
  id: string;
  label: string;
  field: string;
  currentValue: number;
  previousValue: number;
  growthPercentage: number | null;
  format: 'currency' | 'number' | 'percentage';
  icon: string;
  isPositiveGood?: boolean;
  historySparkline: number[];
}

export interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'order' | 'customer' | 'payment' | 'project' | 'support' | 'system';
  value?: string;
}

export interface AggregationTimeSeriesPoint {
  dateLabel: string;
  fullDate: string;
  revenue: number;
  expenses: number;
  profit: number;
  orders: number;
  [key: string]: any;
}

export type AggregationPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface CategoricalAggregation {
  name: string;
  value: number;
  formattedValue: string;
  percentage: number;
  count: number;
}

export interface RawDataset {
  name: string;
  data: Record<string, any>[];
  columns: DetectedColumn[];
  mapping: FieldMapping;
  quality: DataQualityReport;
}

export interface VisibilityConfig {
  kpis: boolean;
  revenueOverview: boolean;
  regionalCategory: boolean;
  topProducts: boolean;
  financialSummary: boolean;
  activityFeed: boolean;
  dataTable: boolean;
  dataQuality: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

export interface SystemAuditLog {
  id: string;
  action: string;
  userRole: string;
  details: string;
  timestamp: string;
}

