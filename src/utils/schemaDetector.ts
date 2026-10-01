import type { ColumnType, DetectedColumn, FieldMapping, DataQualityReport } from '../types/dashboard';

export function detectColumnType(values: any[]): ColumnType {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNullValues.length === 0) return 'text';

  let dateCount = 0;
  let numberCount = 0;
  let currencyCount = 0;
  let percentageCount = 0;
  let idCount = 0;

  const sampleSize = Math.min(nonNullValues.length, 200);
  const sample = nonNullValues.slice(0, sampleSize);

  for (const val of sample) {
    const strVal = String(val).trim();

    // ID check
    if (/^(id|_id|uuid|guid|[0-9a-f]{8}-[0-9a-f]{4})/i.test(strVal)) {
      idCount++;
    }

    // Currency check ($100, €50, 100USD, £20, etc.)
    if (/^[\$\€\£\₹\¥]\s?\d+([.,]\d+)?$/i.test(strVal) || /^\d+([.,]\d+)?\s?(USD|EUR|GBP|INR|JPY|CAD|AUD)$/i.test(strVal)) {
      currencyCount++;
      continue;
    }

    // Percentage check (15.5%, %20)
    if (/^\d+([.,]\d+)?\s?%$/.test(strVal) || /^%\s?\d+([.,]\d+)?$/.test(strVal)) {
      percentageCount++;
      continue;
    }

    // Date check (YYYY-MM-DD, MM/DD/YYYY, ISO strings, etc.)
    if (!isNaN(Date.parse(strVal)) && (strVal.includes('-') || strVal.includes('/') || strVal.includes('T') || strVal.length === 4)) {
      // Avoid pure small numbers being parsed as dates
      if (!/^\d{1,3}$/.test(strVal)) {
        dateCount++;
        continue;
      }
    }

    // Pure Number check
    const cleanNumStr = strVal.replace(/[\$,%]/g, '');
    if (!isNaN(Number(cleanNumStr))) {
      numberCount++;
    }
  }

  const threshold = sampleSize * 0.6;
  if (currencyCount >= threshold) return 'currency';
  if (percentageCount >= threshold) return 'percentage';
  if (dateCount >= threshold) return 'date';
  if (numberCount >= threshold) return 'number';
  if (idCount >= threshold) return 'id';

  // Category vs Text check based on unique ratio
  const uniqueCount = new Set(sample).size;
  if (uniqueCount / sampleSize <= 0.4 || uniqueCount <= 25) {
    return 'category';
  }

  return 'text';
}

export function detectSchema(data: Record<string, any>[]): {
  columns: DetectedColumn[];
  suggestedMapping: FieldMapping;
  quality: DataQualityReport;
} {
  if (!data || data.length === 0) {
    return {
      columns: [],
      suggestedMapping: {},
      quality: { totalRows: 0, validRows: 0, nullValuesCount: 0, duplicateRowsCount: 0 }
    };
  }

  const colNames = Object.keys(data[0]);
  const columns: DetectedColumn[] = [];
  const mapping: FieldMapping = {};

  let totalNulls = 0;
  let minDate: string | undefined;
  let maxDate: string | undefined;

  colNames.forEach(colName => {
    const rawValues = data.map(r => r[colName]);
    const nulls = rawValues.filter(v => v === null || v === undefined || String(v).trim() === '').length;
    totalNulls += nulls;

    const uniqueSet = new Set(rawValues.filter(v => v !== null && v !== undefined && String(v).trim() !== ''));
    const colType = detectColumnType(rawValues);

    const detectedCol: DetectedColumn = {
      name: colName,
      type: colType,
      sampleValues: Array.from(uniqueSet).slice(0, 5),
      nullCount: nulls,
      uniqueValuesCount: uniqueSet.size,
      suggestedRole: 'none'
    };

    const lowerName = colName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Role heuristics based on column name & type
    if (!mapping.dateField && (colType === 'date' || lowerName.includes('date') || lowerName.includes('time') || lowerName.includes('created') || lowerName.includes('timestamp') || lowerName === 'month' || lowerName === 'year')) {
      detectedCol.suggestedRole = 'date';
      mapping.dateField = colName;
    } else if (!mapping.revenueField && (lowerName.includes('revenue') || lowerName.includes('sales') || lowerName.includes('amount') || lowerName.includes('total') || lowerName.includes('income') || lowerName.includes('grm') || lowerName.includes('mrr') || lowerName.includes('arr'))) {
      detectedCol.suggestedRole = 'revenue';
      mapping.revenueField = colName;
    } else if (!mapping.profitField && (lowerName.includes('profit') || lowerName.includes('margin') || lowerName.includes('net') || lowerName.includes('gain'))) {
      detectedCol.suggestedRole = 'profit';
      mapping.profitField = colName;
    } else if (!mapping.expenseField && (lowerName.includes('expense') || lowerName.includes('cost') || lowerName.includes('spend') || lowerName.includes('outflow'))) {
      detectedCol.suggestedRole = 'expenses';
      mapping.expenseField = colName;
    } else if (!mapping.ordersField && (lowerName.includes('order') || lowerName.includes('transaction') || lowerName.includes('units') || lowerName.includes('quantity') || lowerName.includes('volume') || lowerName.includes('count'))) {
      detectedCol.suggestedRole = 'orders';
      mapping.ordersField = colName;
    } else if (!mapping.customerField && (lowerName.includes('customer') || lowerName.includes('client') || lowerName.includes('user') || lowerName.includes('patient') || lowerName.includes('buyer') || lowerName.includes('subscriber'))) {
      detectedCol.suggestedRole = 'customer';
      mapping.customerField = colName;
    } else if (!mapping.productField && (lowerName.includes('product') || lowerName.includes('item') || lowerName.includes('service') || lowerName.includes('sku') || lowerName.includes('game') || lowerName.includes('treatment'))) {
      detectedCol.suggestedRole = 'product';
      mapping.productField = colName;
    } else if (!mapping.regionField && (lowerName.includes('region') || lowerName.includes('country') || lowerName.includes('state') || lowerName.includes('city') || lowerName.includes('location') || lowerName.includes('zone'))) {
      detectedCol.suggestedRole = 'region';
      mapping.regionField = colName;
    } else if (!mapping.categoryField && (lowerName.includes('category') || lowerName.includes('department') || lowerName.includes('type') || lowerName.includes('segment') || lowerName.includes('plan') || lowerName.includes('genre'))) {
      detectedCol.suggestedRole = 'category';
      mapping.categoryField = colName;
    } else if (!mapping.statusField && (lowerName.includes('status') || lowerName.includes('stage') || lowerName.includes('state') || lowerName.includes('condition'))) {
      detectedCol.suggestedRole = 'status';
      mapping.statusField = colName;
    }

    columns.push(detectedCol);
  });

  // Calculate Date Range & Duplicate rows
  if (mapping.dateField) {
    const dates = data
      .map(r => Date.parse(r[mapping.dateField!]))
      .filter(d => !isNaN(d))
      .sort((a, b) => a - b);

    if (dates.length > 0) {
      minDate = new Date(dates[0]).toISOString().split('T')[0];
      maxDate = new Date(dates[dates.length - 1]).toISOString().split('T')[0];
    }
  }

  // Row deduplication check
  const jsonStrings = data.slice(0, 1000).map(r => JSON.stringify(r));
  const uniqueRows = new Set(jsonStrings).size;
  const sampleDuplicates = Math.max(0, jsonStrings.length - uniqueRows);
  const estimatedTotalDuplicates = Math.round((sampleDuplicates / jsonStrings.length) * data.length);

  const quality: DataQualityReport = {
    totalRows: data.length,
    validRows: Math.max(0, data.length - Math.round(totalNulls / Math.max(colNames.length, 1))),
    nullValuesCount: totalNulls,
    duplicateRowsCount: estimatedTotalDuplicates,
    dateRangeStart: minDate,
    dateRangeEnd: maxDate
  };

  return { columns, suggestedMapping: mapping, quality };
}
