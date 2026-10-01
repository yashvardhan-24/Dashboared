import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  RawDataset,
  CompanyBranding,
  DateFilterState,
  ActiveFilters,
  VisibilityConfig,
  AggregationPeriod,
  NotificationItem,
  SystemAuditLog
} from './types/dashboard';
import {
  filterDataset,
  generateKPIs,
  generateTimeSeriesData,
  generateCategoricalAggregation,
  generateRecentActivity,
  generateLiveTransaction
} from './utils/dataProcessor';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { generateAiExecutiveSummary } from './utils/aiProcessor';
import { AiInsightsCard } from './components/AiInsightsCard';
import { GlobalFilterPanel } from './components/GlobalFilterPanel';
import { KpiGrid } from './components/KpiGrid';
import { RevenueChartCard } from './components/RevenueChartCard';
import { CategoricalCharts } from './components/CategoricalCharts';
import { FinancialSummaryCard } from './components/FinancialSummaryCard';
import { ActivityFeed } from './components/ActivityFeed';
import { DataTable } from './components/DataTable';
import { DataQualityCard } from './components/DataQualityCard';
import { DatasetFieldsExplorer } from './components/DatasetFieldsExplorer';
import { BrandingModal } from './components/BrandingModal';
import { DataUploaderModal } from './components/DataUploaderModal';
import { CustomizerModal } from './components/CustomizerModal';
import { DrillDownModal } from './components/DrillDownModal';
import { RecordModal } from './components/RecordModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { InitialDataImportView } from './components/InitialDataImportView';

// Dedicated Views for Sidebar Navigation
import { AnalyticsView } from './views/AnalyticsView';
import { ReportsView } from './views/ReportsView';
import { SalesView } from './views/SalesView';
import { CustomersView } from './views/CustomersView';
import { ProductsView } from './views/ProductsView';
import { FinanceView } from './views/FinanceView';
import { ActivityView } from './views/ActivityView';
import { AuditLogView } from './views/AuditLogView';
import { SettingsView } from './views/SettingsView';

import { AlertCircle, Zap } from 'lucide-react';

export function App() {
  // Active Role state for RBAC
  const [activeRole, setActiveRole] = useState<'Admin' | 'Manager' | 'Viewer'>(() => {
    return (localStorage.getItem('dei_active_role') as any) || 'Admin';
  });

  // Initial Flow: Start with null dataset or load from localStorage
  const [dataset, setDataset] = useState<RawDataset | null>(() => {
    const saved = localStorage.getItem('dei_saved_dataset');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return null;
  });

  // Company Branding state with localStorage restore
  const [branding, setBranding] = useState<CompanyBranding>(() => {
    const saved = localStorage.getItem('dei_company_branding');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      companyName: 'BUSINESS ANALYTICS',
      initials: 'BA',
      dashboardTitle: 'Dynamic Enterprise Intelligence',
      subtitle: 'Autonomous Analytics Engine',
      industry: 'Enterprise Data',
      currency: '$',
      currencyCode: 'USD',
      timezone: 'UTC'
    };
  });

  // Save to LocalStorage whenever critical states update
  useEffect(() => {
    localStorage.setItem('dei_active_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    if (dataset) {
      localStorage.setItem('dei_saved_dataset', JSON.stringify(dataset));
    }
  }, [dataset]);

  useEffect(() => {
    localStorage.setItem('dei_company_branding', JSON.stringify(branding));
  }, [branding]);

  // Global Filters & Date State
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterState>({ preset: 'all' });
  const [categoricalFilters, setCategoricalFilters] = useState<Record<string, string[]>>({});

  // Widget Visibility State
  const [visibility, setVisibility] = useState<VisibilityConfig>({
    kpis: true,
    revenueOverview: true,
    regionalCategory: true,
    topProducts: true,
    financialSummary: true,
    activityFeed: true,
    dataTable: true,
    dataQuality: true
  });

  // Notifications & Audit Logs State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'init-1',
      title: 'System Initialized',
      message: 'Dynamic Enterprise Intelligence Dashboard active with full telemetry.',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      read: false
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([
    {
      id: 'log-1',
      action: 'SYSTEM_STARTUP',
      userRole: activeRole,
      details: 'Analytics engine initialized successfully.',
      timestamp: new Date().toLocaleString()
    }
  ]);

  const addAuditLog = useCallback((action: string, details: string) => {
    setAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        action,
        userRole: activeRole,
        details,
        timestamp: new Date().toLocaleString()
      },
      ...prev
    ]);
  }, [activeRole]);

  const addNotification = useCallback((title: string, message: string, type: NotificationItem['type'] = 'info') => {
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title,
        message,
        timestamp: new Date().toLocaleTimeString(),
        type,
        read: false
      },
      ...prev
    ]);
  }, []);

  // Navigation & Modals State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUploader, setShowUploader] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // CRUD Record Modal State
  const [recordModal, setRecordModal] = useState<{
    isOpen: boolean;
    initialData?: Record<string, any> | null;
  }>({
    isOpen: false,
    initialData: null
  });

  // Handle CRUD Save (Add or Update)
  const handleSaveRecord = (formData: Record<string, any>, originalRecord?: Record<string, any>) => {
    if (!dataset) return;
    setDataset(prev => {
      if (!prev) return null;
      let newData = [...prev.data];
      if (originalRecord) {
        // Edit mode
        const index = newData.indexOf(originalRecord);
        if (index >= 0) newData[index] = formData;
      } else {
        // Add mode
        newData = [formData, ...newData];
      }
      return {
        ...prev,
        data: newData,
        quality: {
          ...prev.quality,
          totalRows: newData.length,
          validRows: newData.length
        }
      };
    });
    setLastUpdated(new Date());

    if (originalRecord) {
      addAuditLog('RECORD_UPDATE', `Updated record in ${dataset.name}`);
      addNotification('Record Updated', 'Data record was successfully updated.', 'info');
    } else {
      addAuditLog('RECORD_CREATE', `Inserted new record into ${dataset.name}`);
      addNotification('Record Created', 'New data record successfully added to matrix.', 'success');
    }
  };

  // Handle Single Delete Record
  const handleDeleteRecord = (record: Record<string, any>) => {
    if (!dataset) return;
    setDataset(prev => {
      if (!prev) return null;
      const newData = prev.data.filter(r => r !== record);
      return {
        ...prev,
        data: newData,
        quality: {
          ...prev.quality,
          totalRows: newData.length,
          validRows: newData.length
        }
      };
    });
    setLastUpdated(new Date());
    addAuditLog('RECORD_DELETE', `Deleted single row from ${dataset.name}`);
    addNotification('Record Deleted', 'Selected record was deleted.', 'warning');
  };

  // Handle Bulk Delete Records
  const handleBulkDeleteRecords = (recordsToDelete: Record<string, any>[]) => {
    if (!dataset) return;
    setDataset(prev => {
      if (!prev) return null;
      const newData = prev.data.filter(r => !recordsToDelete.includes(r));
      return {
        ...prev,
        data: newData,
        quality: {
          ...prev.quality,
          totalRows: newData.length,
          validRows: newData.length
        }
      };
    });
    setLastUpdated(new Date());
    addAuditLog('BULK_DELETE', `Bulk deleted ${recordsToDelete.length} rows from ${dataset.name}`);
    addNotification('Bulk Delete Executed', `${recordsToDelete.length} records permanently removed.`, 'warning');
  };

  // Drilldown modal state
  const [drillDown, setDrillDown] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    records: Record<string, any>[];
  }>({
    isOpen: false,
    title: '',
    records: []
  });

  // Time Series Granularity
  const [aggregationPeriod, setAggregationPeriod] = useState<AggregationPeriod>('monthly');

  // Live Auto Refresh Engine
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [liveToast, setLiveToast] = useState<string | null>(null);

  // Handle Dataset Ingestion
  const handleDatasetLoaded = (newDs: RawDataset) => {
    setDataset(newDs);
    setCategoricalFilters({});
    setSearchQuery('');
    setLastUpdated(new Date());

    // Automatically adapt branding to uploaded dataset name
    let industry = 'Business Intelligence';
    let companyName = newDs.name.replace(/\.[^/.]+$/, '').toUpperCase();

    if (newDs.name.toLowerCase().includes('acme') || newDs.name.toLowerCase().includes('commerce') || newDs.name.toLowerCase().includes('sales')) {
      companyName = 'ACME CORPORATION';
      industry = 'E-Commerce & Retail';
    } else if (newDs.name.toLowerCase().includes('novacloud') || newDs.name.toLowerCase().includes('saas')) {
      companyName = 'NOVACLOUD SYSTEMS';
      industry = 'B2B SaaS & Tech';
    } else if (newDs.name.toLowerCase().includes('apex') || newDs.name.toLowerCase().includes('health') || newDs.name.toLowerCase().includes('hospital')) {
      companyName = 'APEX HEALTH CLINIC';
      industry = 'Healthcare Operations';
    }

    setBranding(prev => ({
      ...prev,
      companyName,
      initials: companyName.slice(0, 2).toUpperCase(),
      industry
    }));
  };

  // Real Live Data Ingestion Handler (adds actual new transaction row)
  const ingestLiveTransaction = useCallback(() => {
    if (!dataset) return;
    const { newRow, eventDescription } = generateLiveTransaction(dataset, branding.currency);

    setDataset(prev => {
      if (!prev) return null;
      return {
        ...prev,
        data: [newRow, ...prev.data],
        quality: {
          ...prev.quality,
          totalRows: prev.quality.totalRows + 1,
          validRows: prev.quality.validRows + 1
        }
      };
    });

    setLastUpdated(new Date());
    setLiveToast(`Live Record Ingested: ${eventDescription}`);
    setTimeout(() => setLiveToast(null), 4000);
  }, [dataset, branding.currency]);

  // Auto-refresh effect timer
  useEffect(() => {
    if (autoRefreshInterval <= 0 || !dataset) return;
    const intervalId = setInterval(() => {
      ingestLiveTransaction();
    }, autoRefreshInterval * 1000);
    return () => clearInterval(intervalId);
  }, [autoRefreshInterval, dataset, ingestLiveTransaction]);

  // Combine Active Filters
  const activeFilters: ActiveFilters = useMemo(() => ({
    searchQuery,
    dateFilter,
    categoricalFilters
  }), [searchQuery, dateFilter, categoricalFilters]);

  // Filter Data Engine execution
  const { filteredData, previousPeriodData } = useMemo(() => {
    if (!dataset) return { filteredData: [], previousPeriodData: [], dateSpanDays: 30 };
    return filterDataset(dataset, activeFilters);
  }, [dataset, activeFilters]);

  // Dynamically calculate KPIs
  const kpis = useMemo(() => {
    if (!dataset) return [];
    return generateKPIs(filteredData, previousPeriodData, dataset.mapping);
  }, [filteredData, previousPeriodData, dataset]);

  // Autonomous AI Executive Insights
  const aiInsights = useMemo(() => {
    if (!dataset) return [];
    return generateAiExecutiveSummary(dataset, filteredData, kpis, branding.currency);
  }, [dataset, filteredData, kpis, branding.currency]);

  // Time Series Chart Data
  const timeSeriesData = useMemo(() => {
    if (!dataset) return [];
    return generateTimeSeriesData(filteredData, dataset.mapping, aggregationPeriod);
  }, [filteredData, dataset, aggregationPeriod]);

  // Categorical Aggregations (Region, Products, Category)
  const regionalData = useMemo(() => {
    if (!dataset) return [];
    return generateCategoricalAggregation(filteredData, dataset.mapping.regionField, dataset.mapping.revenueField, branding.currency, 10);
  }, [filteredData, dataset, branding.currency]);

  const productData = useMemo(() => {
    if (!dataset) return [];
    return generateCategoricalAggregation(filteredData, dataset.mapping.productField, dataset.mapping.revenueField, branding.currency, 20);
  }, [filteredData, dataset, branding.currency]);

  const categoryData = useMemo(() => {
    if (!dataset) return [];
    return generateCategoricalAggregation(filteredData, dataset.mapping.categoryField, dataset.mapping.revenueField, branding.currency, 10);
  }, [filteredData, dataset, branding.currency]);

  // Activity feed timeline
  const activityEvents = useMemo(() => {
    if (!dataset) return [];
    return generateRecentActivity(filteredData, dataset.mapping, branding.currency);
  }, [filteredData, dataset, branding.currency]);

  // Handle Chart Drilldown clicks
  const handleChartClick = (item: any, fieldType?: string) => {
    if (!dataset) return;
    let subset: Record<string, any>[] = [];
    let title = 'Drill-Down Inspection';

    if (fieldType === 'region' && dataset.mapping.regionField) {
      subset = filteredData.filter(r => String(r[dataset.mapping.regionField!]) === item.name);
      title = `Region: ${item.name}`;
    } else if (fieldType === 'product' && dataset.mapping.productField) {
      subset = filteredData.filter(r => String(r[dataset.mapping.productField!]) === item.name);
      title = `Product: ${item.name}`;
    } else if (fieldType === 'category' && dataset.mapping.categoryField) {
      subset = filteredData.filter(r => String(r[dataset.mapping.categoryField!]) === item.name);
      title = `Category: ${item.name}`;
    } else if (item && item.fullDate && dataset.mapping.dateField) {
      subset = filteredData.filter(r => String(r[dataset.mapping.dateField!]).includes(item.fullDate));
      title = `Date Period: ${item.dateLabel}`;
    } else {
      subset = filteredData.slice(0, 30);
    }

    setDrillDown({
      isOpen: true,
      title,
      subtitle: `${subset.length} records matching selection`,
      records: subset
    });
  };

  const handleCategoricalFilterChange = (colName: string, selectedVals: string[]) => {
    setCategoricalFilters(prev => ({
      ...prev,
      [colName]: selectedVals
    }));
  };

  // IF NO DATASET LOADED YET: Render initial data import screen!
  if (!dataset) {
    return <InitialDataImportView onDatasetLoaded={handleDatasetLoaded} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Live Toast Notification */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel px-4 py-3 rounded-2xl border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300">
          <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>{liveToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        branding={branding}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        lastUpdated={lastUpdated}
        autoRefreshInterval={autoRefreshInterval}
        onChangeAutoRefresh={setAutoRefreshInterval}
        onManualRefresh={ingestLiveTransaction}
        onOpenUploader={() => setShowUploader(true)}
        onOpenBranding={() => setShowBranding(true)}
        onOpenCustomizer={() => setShowCustomizer(true)}
        datasetData={filteredData}
        datasetName={dataset.name}
        kpis={kpis}
        columns={dataset.columns}
        currencySymbol={branding.currency}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        unreadNotificationsCount={notifications.filter(n => !n.read).length}
        onOpenNotifications={() => setShowNotifications(true)}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Collapsible Left Sidebar */}
        <Sidebar
          branding={branding}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          mapping={dataset.mapping}
        />

        {/* Dashboard Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
          
          {/* Zero Search Results Alert if user entered a search query that matched nothing */}
          {searchQuery && filteredData.length === 0 && (
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-amber-950/20 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">No records matching "{searchQuery}"</h3>
              <p className="text-xs text-gray-400">Try adjusting your search terms or clear the search to view all data</p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-all cursor-pointer"
              >
                Clear Search Filter
              </button>
            </div>
          )}

          {/* VIEW ROUTING BASED ON SIDEBAR SELECTION */}
          {activeTab === 'dashboard' && (
            <>
              {/* Global Dynamic Filter Panel */}
              <GlobalFilterPanel
                categoricalColumns={dataset.columns}
                datasetData={dataset.data}
                activeCategoricalFilters={categoricalFilters}
                onFilterChange={handleCategoricalFilterChange}
                onResetFilters={() => setCategoricalFilters({})}
              />

              {/* Data Quality Audit Banner */}
              {visibility.dataQuality && (
                <DataQualityCard quality={dataset.quality} columnCount={dataset.columns.length} />
              )}

              {/* Dataset Fields Explorer — all columns with live stats */}
              <DatasetFieldsExplorer
                columns={dataset.columns}
                data={filteredData}
                currencySymbol={branding.currency}
              />

              {/* Autonomous AI Executive Insights */}
              <AiInsightsCard insights={aiInsights} />

              {/* KPI Cards Grid */}
              {visibility.kpis && (
                <KpiGrid kpis={kpis} currencySymbol={branding.currency} />
              )}

              {/* Financial Revenue Trend Chart (Primary Chart) */}
              {visibility.revenueOverview && (
                <RevenueChartCard
                  data={timeSeriesData}
                  mapping={dataset.mapping}
                  period={aggregationPeriod}
                  onPeriodChange={setAggregationPeriod}
                  currencySymbol={branding.currency}
                  onChartClick={handleChartClick}
                />
              )}

              {/* Regional, Top Products, and Category Donut Charts */}
              {(visibility.regionalCategory || visibility.topProducts) && (
                <CategoricalCharts
                  regionalData={regionalData}
                  productData={productData}
                  categoryData={categoryData}
                  onItemClick={handleChartClick}
                />
              )}

              {/* Executive Financial Summary */}
              {visibility.financialSummary && (
                <FinancialSummaryCard
                  data={filteredData}
                  mapping={dataset.mapping}
                  currencySymbol={branding.currency}
                />
              )}

              {/* Latest Activity Feed & Data Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {visibility.activityFeed && (
                  <div className="lg:col-span-1">
                    <ActivityFeed events={activityEvents} />
                  </div>
                )}

                {visibility.dataTable && (
                  <div className={visibility.activityFeed ? 'lg:col-span-2' : 'lg:col-span-3'}>
                    <DataTable
                      data={filteredData}
                      columns={dataset.columns}
                      datasetName={dataset.name}
                      onAddRecord={() => setRecordModal({ isOpen: true, initialData: null })}
                      onEditRecord={(row) => setRecordModal({ isOpen: true, initialData: row })}
                      onDeleteRecord={handleDeleteRecord}
                      onBulkDelete={handleBulkDeleteRecords}
                      activeRole={activeRole}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Dedicated Analytics View */}
          {activeTab === 'analytics' && (
            <AnalyticsView
              timeSeriesData={timeSeriesData}
              regionalData={regionalData}
              productData={productData}
              currencySymbol={branding.currency}
            />
          )}

          {/* Dedicated Reports View */}
          {activeTab === 'reports' && (
            <ReportsView
              dataset={dataset}
              branding={branding}
              kpis={kpis}
              timeSeriesData={timeSeriesData}
              filteredData={filteredData}
            />
          )}

          {/* Dedicated Sales View */}
          {activeTab === 'sales' && (
            <SalesView
              filteredData={filteredData}
              mapping={dataset.mapping}
              currencySymbol={branding.currency}
              productData={productData}
            />
          )}

          {/* Dedicated Customers View */}
          {activeTab === 'customers' && (
            <CustomersView
              filteredData={filteredData}
              mapping={dataset.mapping}
              currencySymbol={branding.currency}
            />
          )}

          {/* Dedicated Products View */}
          {activeTab === 'products' && (
            <ProductsView
              productData={productData}
              currencySymbol={branding.currency}
            />
          )}

          {/* Dedicated Finance View */}
          {activeTab === 'finance' && (
            <FinanceView
              filteredData={filteredData}
              mapping={dataset.mapping}
              currencySymbol={branding.currency}
              timeSeriesData={timeSeriesData}
            />
          )}

          {/* Dedicated Real-time Activity View */}
          {activeTab === 'activity' && (
            <ActivityView events={activityEvents} />
          )}

          {/* Dedicated System Audit & Compliance View */}
          {activeTab === 'audit' && (
            <AuditLogView logs={auditLogs} onClearLogs={() => setAuditLogs([])} />
          )}

          {/* Dedicated System Settings View */}
          {activeTab === 'settings' && (
            <SettingsView
              mapping={dataset.mapping}
              dataset={dataset}
              autoRefreshInterval={autoRefreshInterval}
              onChangeAutoRefresh={setAutoRefreshInterval}
              onOpenUploader={() => setShowUploader(true)}
              onResetDataset={() => setDataset(null)}
            />
          )}

        </main>
      </div>

      {/* MODALS */}
      <DataUploaderModal
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        onDatasetLoaded={handleDatasetLoaded}
      />

      <BrandingModal
        isOpen={showBranding}
        onClose={() => setShowBranding(false)}
        branding={branding}
        onSave={setBranding}
      />

      <CustomizerModal
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        visibility={visibility}
        onChangeVisibility={setVisibility}
      />

      <DrillDownModal
        isOpen={drillDown.isOpen}
        onClose={() => setDrillDown(prev => ({ ...prev, isOpen: false }))}
        title={drillDown.title}
        subtitle={drillDown.subtitle}
        filteredRecords={drillDown.records}
        mapping={dataset.mapping}
        currencySymbol={branding.currency}
      />

      {dataset && (
        <RecordModal
          isOpen={recordModal.isOpen}
          onClose={() => setRecordModal({ isOpen: false, initialData: null })}
          onSave={handleSaveRecord}
          onDelete={handleDeleteRecord}
          columns={dataset.columns}
          initialData={recordModal.initialData}
        />
      )}

      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
        onClearAll={() => setNotifications([])}
        onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
      />

    </div>
  );
}

export default App;
