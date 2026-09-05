export type CashFlowRange = '7D' | '30D' | '90D';

export interface DashboardKpi {
  label: string;
  value: string;
  trend: string;
  comparison: string;
  tone: 'teal' | 'blue' | 'amber' | 'coral';
}

export interface DashboardCashPoint {
  date: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface DashboardRisk {
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  vendor: string;
  amount: string;
  tone: 'critical' | 'high' | 'medium';
}

export interface DashboardHealthItem {
  label: string;
  value: number;
  color: string;
}

export type DashboardHealth = DashboardHealthItem[];
