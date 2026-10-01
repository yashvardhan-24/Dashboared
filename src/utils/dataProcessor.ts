import type {
  RawDataset,
  ActiveFilters,
  CalculatedKPI,
  AggregationTimeSeriesPoint,
  CategoricalAggregation,
  ActivityEvent,
  AggregationPeriod,
  FieldMapping
} from '../types/dashboard';

// Format Helpers
export function formatCompactNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1_000_000_000) {
    return sign + (absNum / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (absNum >= 1_000_000) {
    return sign + (absNum / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (absNum >= 1_000) {
    return sign + (absNum / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return sign + (Number.isInteger(num) ? num.toLocaleString() : num.toFixed(2));
}

export function formatCurrency(num: number, currencySymbol: string = '$'): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return `${currencySymbol}${formatCompactNumber(num)}`;
}

export function formatPercentage(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  const formatted = num.toFixed(1).replace(/\.0$/, '');
  return `${num > 0 ? '+' : ''}${formatted}%`;
}

// Calculate Period-over-Period Growth
export function calculateGrowth(current: number, previous: number): number | null {
  if (previous === 0 || previous === null || previous === undefined || isNaN(previous)) {
    return current > 0 ? 100 : 0;
  }
  if (current === null || current === undefined || isNaN(current)) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// Filter dataset based on search, date presets, and categorical filters
export function filterDataset(dataset: RawDataset, filters: ActiveFilters): {
  filteredData: Record<string, any>[];
  previousPeriodData: Record<string, any>[];
  dateSpanDays: number;
} {
  const { data, mapping } = dataset;
  let result = [...data];

  // 1. Search Query Filter
  if (filters.searchQuery.trim()) {
    const rawQ = filters.searchQuery.toLowerCase().trim();
    const cleanQ = rawQ.replace(/[^a-z0-9]/g, '');

    // List of common metric queries that shouldn't wipe out row data
    const metricKeywords = [
      'revenue', 'totalrevenue', 'profit', 'netprofit', 'margin', 'profitmargin',
      'order', 'orders', 'totalorders', 'customer', 'customers', 'totalcustomers',
      'user', 'users', 'aov', 'averageordervalue', 'expense', 'expenses', 'sales',
      'kpi', 'analytics', 'growth'
    ];

    const isMetricSearch = metricKeywords.some(kw => cleanQ === kw || cleanQ.includes(kw));

    // Only filter rows by cell content if query is not purely a metric keyword
    if (!isMetricSearch) {
      result = result.filter(row => {
        return Object.values(row).some(val =>
          val !== null && val !== undefined && String(val).toLowerCase().includes(rawQ)
        );
      });
    }
  }

  // 2. Categorical Column Filters
  if (filters.categoricalFilters) {
    Object.entries(filters.categoricalFilters).forEach(([colName, selectedVals]) => {
      if (selectedVals && selectedVals.length > 0) {
        result = result.filter(row => selectedVals.includes(String(row[colName])));
      }
    });
  }

  // 3. Date Range Filter & Previous Period Comparison Split
  if (!mapping.dateField) {
    return { filteredData: result, previousPeriodData: [], dateSpanDays: 30 };
  }

  const dateCol = mapping.dateField;
  const validDatedRows = result.filter(r => r[dateCol] && !isNaN(Date.parse(r[dateCol])));

  if (validDatedRows.length === 0) {
    return { filteredData: result, previousPeriodData: [], dateSpanDays: 30 };
  }

  // Find overall min & max dates in valid dataset
  const dateTimes = validDatedRows.map(r => Date.parse(r[dateCol])).sort((a, b) => a - b);
  const maxDatasetDate = new Date(dateTimes[dateTimes.length - 1]);

  let startDate: Date;
  let endDate: Date = new Date(maxDatasetDate);

  const preset = filters.dateFilter.preset;

  if (preset === 'all') {
    startDate = new Date(dateTimes[0]);
  } else if (preset === 'today') {
    startDate = new Date(endDate);
    startDate.setHours(0, 0, 0, 0);
  } else if (preset === 'yesterday') {
    endDate = new Date(maxDatasetDate);
    endDate.setDate(endDate.getDate() - 1);
    startDate = new Date(endDate);
    startDate.setHours(0, 0, 0, 0);
  } else if (preset === 'last7days') {
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);
  } else if (preset === 'last30days') {
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
  } else if (preset === 'last90days') {
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 90);
  } else if (preset === 'thisMonth') {
    startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  } else if (preset === 'lastMonth') {
    startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
    endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
  } else if (preset === 'thisQuarter') {
    const qMonth = Math.floor(endDate.getMonth() / 3) * 3;
    startDate = new Date(endDate.getFullYear(), qMonth, 1);
  } else if (preset === 'thisYear') {
    startDate = new Date(endDate.getFullYear(), 0, 1);
  } else if (preset === 'ytd') {
    startDate = new Date(endDate.getFullYear(), 0, 1);
  } else if (preset === 'custom' && filters.dateFilter.startDate && filters.dateFilter.endDate) {
    startDate = new Date(filters.dateFilter.startDate);
    endDate = new Date(filters.dateFilter.endDate);
  } else if (filters.dateFilter.selectedYear) {
    const y = parseInt(filters.dateFilter.selectedYear);
    startDate = new Date(y, 0, 1);
    endDate = new Date(y, 11, 31, 23, 59, 59);

    if (filters.dateFilter.selectedMonth !== undefined && filters.dateFilter.selectedMonth !== 'all') {
      const m = parseInt(filters.dateFilter.selectedMonth);
      startDate = new Date(y, m, 1);
      endDate = new Date(y, m + 1, 0, 23, 59, 59);
    } else if (filters.dateFilter.selectedQuarter !== undefined && filters.dateFilter.selectedQuarter !== 'all') {
      const q = parseInt(filters.dateFilter.selectedQuarter); // 1, 2, 3, 4
      startDate = new Date(y, (q - 1) * 3, 1);
      endDate = new Date(y, q * 3, 0, 23, 59, 59);
    }
  } else {
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
  }

  const startMs = startDate.getTime();
  const endMs = endDate.getTime();
  const durationMs = Math.max(86400000, endMs - startMs);
  const prevStartMs = startMs - durationMs;

  const currentPeriodData = validDatedRows.filter(r => {
    const t = Date.parse(r[dateCol]);
    return t >= startMs && t <= endMs;
  });

  const previousPeriodData = validDatedRows.filter(r => {
    const t = Date.parse(r[dateCol]);
    return t >= prevStartMs && t < startMs;
  });

  const dateSpanDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

  return {
    filteredData: currentPeriodData.length > 0 ? currentPeriodData : validDatedRows,
    previousPeriodData,
    dateSpanDays
  };
}

// Automatically calculate KPIs
export function generateKPIs(
  currentData: Record<string, any>[],
  previousData: Record<string, any>[],
  mapping: FieldMapping
): CalculatedKPI[] {
  const kpis: CalculatedKPI[] = [];

  const sumField = (data: Record<string, any>[], field?: string): number => {
    if (!field) return 0;
    return data.reduce((acc, r) => {
      const val = parseFloat(String(r[field]).replace(/[\$,%]/g, ''));
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  };

  const countUnique = (data: Record<string, any>[], field?: string): number => {
    if (!field) return 0;
    return new Set(data.map(r => r[field]).filter(Boolean)).size;
  };

  // 1. REVENUE KPI
  if (mapping.revenueField) {
    const currentRev = sumField(currentData, mapping.revenueField);
    const prevRev = sumField(previousData, mapping.revenueField);
    kpis.push({
      id: 'total_revenue',
      label: 'TOTAL REVENUE',
      field: mapping.revenueField,
      currentValue: currentRev,
      previousValue: prevRev,
      growthPercentage: calculateGrowth(currentRev, prevRev),
      format: 'currency',
      icon: 'DollarSign',
      isPositiveGood: true,
      historySparkline: generateSparkline(currentData, mapping.revenueField, mapping.dateField)
    });
  }

  // 2. PROFIT KPI
  if (mapping.profitField) {
    const currentProfit = sumField(currentData, mapping.profitField);
    const prevProfit = sumField(previousData, mapping.profitField);
    kpis.push({
      id: 'total_profit',
      label: 'NET PROFIT',
      field: mapping.profitField,
      currentValue: currentProfit,
      previousValue: prevProfit,
      growthPercentage: calculateGrowth(currentProfit, prevProfit),
      format: 'currency',
      icon: 'TrendingUp',
      isPositiveGood: true,
      historySparkline: generateSparkline(currentData, mapping.profitField, mapping.dateField)
    });
  }

  // 3. ORDERS / TRANSACTIONS KPI
  if (mapping.ordersField || currentData.length > 0) {
    const currentOrders = mapping.ordersField ? sumField(currentData, mapping.ordersField) : currentData.length;
    const prevOrders = mapping.ordersField ? sumField(previousData, mapping.ordersField) : previousData.length;
    kpis.push({
      id: 'total_orders',
      label: 'TOTAL ORDERS',
      field: mapping.ordersField || 'count',
      currentValue: currentOrders,
      previousValue: prevOrders,
      growthPercentage: calculateGrowth(currentOrders, prevOrders),
      format: 'number',
      icon: 'ShoppingBag',
      isPositiveGood: true,
      historySparkline: generateSparkline(currentData, mapping.ordersField, mapping.dateField)
    });
  }

  // 4. CUSTOMERS / USERS KPI
  if (mapping.customerField) {
    const currentCust = countUnique(currentData, mapping.customerField);
    const prevCust = countUnique(previousData, mapping.customerField);
    kpis.push({
      id: 'total_customers',
      label: 'TOTAL CUSTOMERS',
      field: mapping.customerField,
      currentValue: currentCust,
      previousValue: prevCust,
      growthPercentage: calculateGrowth(currentCust, prevCust),
      format: 'number',
      icon: 'Users',
      isPositiveGood: true,
      historySparkline: []
    });
  }

  // 5. AVERAGE ORDER VALUE (AOV)
  if (mapping.revenueField) {
    const totalRev = sumField(currentData, mapping.revenueField);
    const totalOrders = mapping.ordersField ? sumField(currentData, mapping.ordersField) : currentData.length;
    const currentAOV = totalOrders > 0 ? totalRev / totalOrders : 0;

    const prevRev = sumField(previousData, mapping.revenueField);
    const prevOrders = mapping.ordersField ? sumField(previousData, mapping.ordersField) : previousData.length;
    const prevAOV = prevOrders > 0 ? prevRev / prevOrders : 0;

    kpis.push({
      id: 'avg_order_value',
      label: 'AVERAGE ORDER VALUE',
      field: 'aov',
      currentValue: currentAOV,
      previousValue: prevAOV,
      growthPercentage: calculateGrowth(currentAOV, prevAOV),
      format: 'currency',
      icon: 'CreditCard',
      isPositiveGood: true,
      historySparkline: []
    });
  }

  // 6. PROFIT MARGIN %
  if (mapping.revenueField && mapping.profitField) {
    const totalRev = sumField(currentData, mapping.revenueField);
    const totalProfit = sumField(currentData, mapping.profitField);
    const currentMargin = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;

    const prevRev = sumField(previousData, mapping.revenueField);
    const prevProfit = sumField(previousData, mapping.profitField);
    const prevMargin = prevRev > 0 ? (prevProfit / prevRev) * 100 : 0;

    kpis.push({
      id: 'profit_margin',
      label: 'PROFIT MARGIN',
      field: 'margin',
      currentValue: currentMargin,
      previousValue: prevMargin,
      growthPercentage: calculateGrowth(currentMargin, prevMargin),
      format: 'percentage',
      icon: 'PieChart',
      isPositiveGood: true,
      historySparkline: []
    });
  }

  return kpis;
}

function generateSparkline(data: Record<string, any>[], valField?: string, dateField?: string): number[] {
  if (!valField || !dateField || data.length === 0) return [10, 25, 18, 30, 45, 40, 55];
  const points = data.slice(0, 30).map(r => {
    const v = parseFloat(String(r[valField]).replace(/[\$,%]/g, ''));
    return isNaN(v) ? 0 : v;
  });
  return points.length > 3 ? points : [10, 25, 18, 30, 45, 40, 55];
}

// Generate Primary Time Series Chart Data
export function generateTimeSeriesData(
  data: Record<string, any>[],
  mapping: FieldMapping,
  period: AggregationPeriod = 'monthly'
): AggregationTimeSeriesPoint[] {
  if (!mapping.dateField || data.length === 0) return [];

  const dateCol = mapping.dateField;
  const revCol = mapping.revenueField;
  const expCol = mapping.expenseField;
  const profitCol = mapping.profitField;
  const orderCol = mapping.ordersField;

  const grouped: Record<string, {
    revenue: number;
    expenses: number;
    profit: number;
    orders: number;
    count: number;
    fullDate: string;
  }> = {};

  data.forEach(row => {
    const rawDate = row[dateCol];
    if (!rawDate) return;
    const dateObj = new Date(rawDate);
    if (isNaN(dateObj.getTime())) return;

    let key = '';
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');

    if (period === 'daily') {
      key = `${y}-${m}-${d}`;
    } else if (period === 'weekly') {
      const weekNum = Math.ceil(dateObj.getDate() / 7);
      key = `${y}-W${weekNum} (${dateObj.toLocaleString('default', { month: 'short' })})`;
    } else if (period === 'monthly') {
      key = `${y}-${dateObj.toLocaleString('default', { month: 'short' })}`;
    } else if (period === 'quarterly') {
      const q = Math.floor(dateObj.getMonth() / 3) + 1;
      key = `${y}-Q${q}`;
    } else {
      key = `${y}`;
    }

    if (!grouped[key]) {
      grouped[key] = {
        revenue: 0,
        expenses: 0,
        profit: 0,
        orders: 0,
        count: 0,
        fullDate: dateObj.toISOString().split('T')[0]
      };
    }

    const revVal = revCol ? parseFloat(String(row[revCol]).replace(/[\$,%]/g, '')) || 0 : 0;
    const expVal = expCol ? parseFloat(String(row[expCol]).replace(/[\$,%]/g, '')) || 0 : 0;
    let profitVal = profitCol ? parseFloat(String(row[profitCol]).replace(/[\$,%]/g, '')) || 0 : 0;

    // If profit not explicitly present but revenue + expenses exist, calculate it
    if (!profitCol && revCol && expCol) {
      profitVal = revVal - expVal;
    }

    const orderVal = orderCol ? parseFloat(String(row[orderCol]).replace(/[\$,%]/g, '')) || 1 : 1;

    grouped[key].revenue += revVal;
    grouped[key].expenses += expVal;
    grouped[key].profit += profitVal;
    grouped[key].orders += orderVal;
    grouped[key].count += 1;
  });

  return Object.entries(grouped).map(([dateLabel, metrics]) => ({
    dateLabel,
    fullDate: metrics.fullDate,
    revenue: Math.round(metrics.revenue * 100) / 100,
    expenses: Math.round(metrics.expenses * 100) / 100,
    profit: Math.round(metrics.profit * 100) / 100,
    orders: Math.round(metrics.orders)
  }));
}

// Generate Categorical Breakdown Data (e.g. Sales by Region, Top Products)
export function generateCategoricalAggregation(
  data: Record<string, any>[],
  categoryField?: string,
  metricField?: string,
  currencySymbol: string = '$',
  topN: number = 10
): CategoricalAggregation[] {
  if (!categoryField || data.length === 0) return [];

  const map: Record<string, { value: number; count: number }> = {};
  let totalValue = 0;

  data.forEach(row => {
    const cat = String(row[categoryField] || 'Unspecified').trim();
    const val = metricField ? parseFloat(String(row[metricField]).replace(/[\$,%]/g, '')) || 0 : 1;

    if (!map[cat]) map[cat] = { value: 0, count: 0 };
    map[cat].value += val;
    map[cat].count += 1;
    totalValue += val;
  });

  const sorted = Object.entries(map)
    .map(([name, stat]) => ({
      name,
      value: Math.round(stat.value * 100) / 100,
      formattedValue: metricField ? `${currencySymbol}${formatCompactNumber(stat.value)}` : stat.value.toLocaleString(),
      percentage: totalValue > 0 ? Math.round((stat.value / totalValue) * 1000) / 10 : 0,
      count: stat.count
    }))
    .sort((a, b) => b.value - a.value);

  return sorted.slice(0, topN);
}

// Generate Activity Events from Dataset
export function generateRecentActivity(
  data: Record<string, any>[],
  mapping: FieldMapping,
  currencySymbol: string = '$'
): ActivityEvent[] {
  if (data.length === 0) return [];
  const sample = data.slice(0, 8);

  return sample.map((row, idx) => {
    const cust = mapping.customerField ? row[mapping.customerField] : `Customer #${1000 + idx}`;
    const prod = mapping.productField ? row[mapping.productField] : `Product SKU-${idx + 1}`;
    const rev = mapping.revenueField ? parseFloat(String(row[mapping.revenueField]).replace(/[\$,%]/g, '')) : undefined;
    const dateStr = mapping.dateField && row[mapping.dateField] ? String(row[mapping.dateField]) : `${idx * 12 + 2}m ago`;

    const types: ('order' | 'customer' | 'payment' | 'project' | 'system')[] = ['order', 'payment', 'customer', 'system'];
    const selectedType = types[idx % types.length];

    let title = 'Transaction Processed';
    let desc = `${cust} purchased ${prod}`;

    if (selectedType === 'order') {
      title = 'New Order Placed';
      desc = `Order #${8800 + idx} by ${cust}`;
    } else if (selectedType === 'payment') {
      title = 'Payment Received';
      desc = rev ? `${currencySymbol}${rev.toLocaleString()} paid by ${cust}` : `Payment settled for ${cust}`;
    } else if (selectedType === 'customer') {
      title = 'New Account Created';
      desc = `${cust} registered new account`;
    }

    return {
      id: `act-${idx}`,
      title,
      description: desc,
      timestamp: dateStr,
      type: selectedType,
      value: rev ? `${currencySymbol}${formatCompactNumber(rev)}` : undefined
    };
  });
}

// Generate a realistic live transaction row based on dataset's actual schema
export function generateLiveTransaction(dataset: RawDataset, currencySymbol: string = '$'): {
  newRow: Record<string, any>;
  eventDescription: string;
} {
  const { data, mapping } = dataset;
  if (!data || data.length === 0) {
    return { newRow: {}, eventDescription: 'New event received' };
  }

  // Clone a random row as schema template
  const templateRow = data[Math.floor(Math.random() * data.length)];
  const newRow: Record<string, any> = { ...templateRow };

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // Set date field to today
  if (mapping.dateField) {
    newRow[mapping.dateField] = dateStr;
  }

  // Generate realistic numeric fluctuations
  let genRev = 100;
  if (mapping.revenueField && templateRow[mapping.revenueField]) {
    const baseRev = parseFloat(String(templateRow[mapping.revenueField]).replace(/[\$,%]/g, '')) || 250;
    genRev = Math.round((baseRev * (0.8 + Math.random() * 0.4)) * 100) / 100;
    newRow[mapping.revenueField] = genRev;
  }

  if (mapping.profitField) {
    const profitRatio = 0.35 + Math.random() * 0.2;
    newRow[mapping.profitField] = Math.round(genRev * profitRatio * 100) / 100;
  }

  if (mapping.expenseField) {
    const expRatio = 0.5 + Math.random() * 0.15;
    newRow[mapping.expenseField] = Math.round(genRev * expRatio * 100) / 100;
  }

  if (mapping.ordersField) {
    newRow[mapping.ordersField] = Math.floor(Math.random() * 3) + 1;
  }

  // Unique ID
  const idKey = Object.keys(newRow).find(k => /id|order|trans/i.test(k));
  if (idKey) {
    newRow[idKey] = `LIVE-${Math.floor(10000 + Math.random() * 90000)}`;
  }

  const custName = mapping.customerField ? String(newRow[mapping.customerField]) : 'Customer';
  const prodName = mapping.productField ? String(newRow[mapping.productField]) : 'Item';
  const eventDescription = `${custName} purchased ${prodName} (${currencySymbol}${genRev.toLocaleString()})`;

  return { newRow, eventDescription };
}

