import type { RawDataset } from '../types/dashboard';
import { detectSchema } from './schemaDetector';

// Generate E-Commerce Dataset
function getEcommerceDataset(): RawDataset {
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
  const products = [
    { name: 'Apex Pro Laptop 16"', category: 'Hardware', price: 1899 },
    { name: 'CyberRun VR Headset', category: 'Gaming', price: 699 },
    { name: 'Quantum Noise-Cancel Pods', category: 'Audio', price: 249 },
    { name: 'Ultradock 12-in-1 Hub', category: 'Accessories', price: 129 },
    { name: 'VisionMax 4K Monitor', category: 'Displays', price: 799 },
    { name: 'CloudCam Pro Security', category: 'Smart Home', price: 179 }
  ];
  const statuses = ['Completed', 'Processing', 'Shipped', 'Refunded'];
  const customers = ['Nexus Tech LLC', 'Starlight Media', 'Omega Logistics', 'Hyperion Dynamics', 'Vanguard Partners', 'AeroSpace Global', 'BioGenix Labs', 'Solaris Energy'];

  const rows: Record<string, any>[] = [];
  const startDate = new Date(2025, 0, 1);
  const now = new Date(2026, 7, 31);

  let current = new Date(startDate);
  let orderId = 10400;

  while (current <= now) {
    const dailyOrders = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < dailyOrders; i++) {
      const prod = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const revenue = prod.price * qty;
      const marginRatio = 0.4 + Math.random() * 0.25;
      const profit = Math.round(revenue * marginRatio * 100) / 100;
      const expenses = Math.round((revenue - profit) * 100) / 100;
      const region = regions[Math.floor(Math.random() * regions.length)];
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      rows.push({
        order_id: `ORD-${orderId++}`,
        order_date: current.toISOString().split('T')[0],
        customer_name: customer,
        product: prod.name,
        category: prod.category,
        region: region,
        units_sold: qty,
        revenue: revenue,
        expenses: expenses,
        profit: profit,
        status: status
      });
    }
    current.setDate(current.getDate() + 1);
  }

  const { columns, suggestedMapping, quality } = detectSchema(rows);

  return {
    name: 'ACME Corp - Global E-Commerce Sales',
    data: rows,
    columns,
    mapping: suggestedMapping,
    quality
  };
}

// Generate SaaS Dataset
function getSaaSMedicalDataset(): RawDataset {
  const plans = ['Enterprise ARR', 'Professional Monthly', 'Growth Tier', 'Custom SLA'];
  const regions = ['US East', 'US West', 'EU Central', 'APEC Singapore'];

  const rows: Record<string, any>[] = [];
  const startDate = new Date(2025, 0, 1);
  const now = new Date(2026, 7, 31);

  let current = new Date(startDate);

  while (current <= now) {
    const baseMRR = 120000 + (current.getFullYear() - 2025) * 40000 + current.getMonth() * 3500;
    const mrr = Math.round(baseMRR + (Math.random() - 0.3) * 15000);
    const expenses = Math.round(mrr * (0.35 + Math.random() * 0.1));
    const profit = mrr - expenses;
    const newSubscribers = Math.floor(Math.random() * 40) + 20;
    const activeAccounts = Math.floor(mrr / 350);
    const region = regions[Math.floor(Math.random() * regions.length)];
    const plan = plans[Math.floor(Math.random() * plans.length)];

    rows.push({
      metric_date: current.toISOString().split('T')[0],
      subscription_plan: plan,
      region: region,
      monthly_recurring_revenue: mrr,
      operating_expenses: expenses,
      net_profit: profit,
      new_subscribers: newSubscribers,
      active_accounts: activeAccounts
    });

    current.setDate(current.getDate() + 7); // Weekly granularity
  }

  const { columns, suggestedMapping, quality } = detectSchema(rows);

  return {
    name: 'NovaCloud Systems - SaaS Subscription & Financials',
    data: rows,
    columns,
    mapping: suggestedMapping,
    quality
  };
}

// Generate Healthcare Dataset
function getHealthcareDataset(): RawDataset {
  const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Emergency'];
  const treatments = ['Diagnostic MRI', 'Surgical Consult', 'Outpatient Therapy', 'ICU Admission', 'Routine Checkup'];

  const rows: Record<string, any>[] = [];
  const startDate = new Date(2025, 0, 1);
  const now = new Date(2026, 7, 31);

  let current = new Date(startDate);
  let patientId = 5000;

  while (current <= now) {
    const dailyCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < dailyCount; i++) {
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const treat = treatments[Math.floor(Math.random() * treatments.length)];
      const billing = Math.round(500 + Math.random() * 4500);
      const cost = Math.round(billing * 0.6);
      const margin = billing - cost;

      rows.push({
        admission_date: current.toISOString().split('T')[0],
        patient_id: `PAT-${patientId++}`,
        department: dept,
        treatment: treat,
        billing_amount: billing,
        operational_cost: cost,
        profit_margin: margin,
        satisfaction_score: Math.round((3.8 + Math.random() * 1.2) * 10) / 10
      });
    }
    current.setDate(current.getDate() + 2);
  }

  const { columns, suggestedMapping, quality } = detectSchema(rows);

  return {
    name: 'Apex Health Clinic - Healthcare Operations',
    data: rows,
    columns,
    mapping: suggestedMapping,
    quality
  };
}

export const SAMPLE_DATASETS: Record<string, () => RawDataset> = {
  ecommerce: getEcommerceDataset,
  saas: getSaaSMedicalDataset,
  healthcare: getHealthcareDataset
};
