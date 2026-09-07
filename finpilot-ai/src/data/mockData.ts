import type {
  CashPoint,
  Company,
  Customer,
  DailyCashFlow,
  Exception,
  Expense,
  Invoice,
  Notification,
  PurchaseOrder,
  ReconciliationResult,
  RiskEvent,
  Transaction,
  UserProfile,
  Vendor,
} from '../types';
import type { DashboardCashPoint, DashboardHealth, DashboardKpi, DashboardRisk } from './dashboardTypes';
import { classifyReconciliationResult } from '../services/reconciliation';

export type { CashFlowRange, DashboardCashPoint, DashboardHealth, DashboardKpi, DashboardRisk } from './dashboardTypes';

export const company: Company = {
  name: 'Apex Technologies Pvt Ltd', initials: 'AT',
  financialYear: '1 April 2026 to 31 March 2027', openPeriod: 'August 2026',
  bankAccounts: ['HDFC ••4821', 'ICICI ••7305'],
};

export const users: UserProfile[] = [
  { name: 'John Smith', role: 'CFO', initials: 'JS', email: 'john.smith@apextech.in' },
  { name: 'Riya Banerjee', role: 'Finance Controller', initials: 'RB', email: 'riya.banerjee@apextech.in' },
  { name: 'Arjun Rao', role: 'Finance Manager', initials: 'AR', email: 'arjun.rao@apextech.in' },
  { name: 'Priya Menon', role: 'Accounts Payable Lead', initials: 'PM', email: 'priya.menon@apextech.in' },
];

export const currentUser = users[0];

export const vendors: Vendor[] = [
  { id: 'ven-31', name: 'ABC Suppliers', category: 'Components', owner: 'P. Menon', spendYtd: 2_864_000, paymentTermsDays: 30, risk: 'high', onboardedOn: '2023-04-11' },
  { id: 'ven-32', name: 'XYZ Technologies', category: 'Software', owner: 'D. Kulkarni', spendYtd: 1_972_000, paymentTermsDays: 45, risk: 'medium', onboardedOn: '2024-01-09' },
  { id: 'ven-33', name: 'PQR Logistics', category: 'Logistics', owner: 'P. Iyer', spendYtd: 1_512_800, paymentTermsDays: 45, risk: 'medium', onboardedOn: '2025-02-20' },
  { id: 'ven-34', name: 'Global Office Solutions', category: 'Facilities', owner: 'A. Rao', spendYtd: 906_800, paymentTermsDays: 30, risk: 'low', onboardedOn: '2022-11-02' },
  { id: 'ven-35', name: 'Shree Enterprises', category: 'Packaging', owner: 'R. Banerjee', spendYtd: 1_206_000, paymentTermsDays: 30, risk: 'low', onboardedOn: '2024-07-15' },
  { id: 'ven-36', name: 'Kalyani Cloud Services', category: 'Infrastructure', owner: 'D. Kulkarni', spendYtd: 1_874_300, paymentTermsDays: 30, risk: 'low', onboardedOn: '2024-04-11' },
  { id: 'ven-37', name: 'Anvaya Staffing', category: 'Payroll services', owner: 'S. Menon', spendYtd: 10_272_000, paymentTermsDays: 15, risk: 'medium', onboardedOn: '2023-01-09' },
  { id: 'ven-38', name: 'Meridian Legal LLP', category: 'Professional fees', owner: 'R. Banerjee', spendYtd: 760_000, paymentTermsDays: 30, risk: 'low', onboardedOn: '2022-11-02' },
];

export const customers: Customer[] = [
  { id: 'cus-01', name: 'Vertex Retail', industry: 'Retail', owner: 'A. Rao', creditLimit: 1_500_000, paymentTermsDays: 30, city: 'Mumbai' },
  { id: 'cus-02', name: 'Bluepeak Media', industry: 'Media', owner: 'R. Banerjee', creditLimit: 750_000, paymentTermsDays: 30, city: 'Bengaluru' },
  { id: 'cus-03', name: 'Sundar Textiles', industry: 'Manufacturing', owner: 'P. Iyer', creditLimit: 1_000_000, paymentTermsDays: 30, city: 'Coimbatore' },
  { id: 'cus-04', name: 'Nimbus Logistics', industry: 'Logistics', owner: 'D. Kulkarni', creditLimit: 1_250_000, paymentTermsDays: 45, city: 'Pune' },
  { id: 'cus-05', name: 'Orchid Health', industry: 'Healthcare', owner: 'A. Rao', creditLimit: 2_000_000, paymentTermsDays: 30, city: 'Hyderabad' },
  { id: 'cus-06', name: 'MangoTree Foods', industry: 'FMCG', owner: 'S. Menon', creditLimit: 900_000, paymentTermsDays: 30, city: 'Delhi' },
];

export const transactions: Transaction[] = [
  { id: 'txn-1041', date: '2026-09-02', description: 'Subscription revenue payout', counterparty: 'Vertex Retail', account: 'HDFC ••4821', category: 'Revenue', direction: 'inflow', amount: 486_500, status: 'cleared' },
  { id: 'txn-1040', date: '2026-09-01', description: 'Cloud infrastructure — August', counterparty: 'Kalyani Cloud Services', account: 'HDFC ••4821', category: 'Infrastructure', direction: 'outflow', amount: 213_940, status: 'cleared' },
  { id: 'txn-1039', date: '2026-08-31', description: 'Payment received, reference unclear', counterparty: 'Unidentified', account: 'HDFC ••4821', category: 'Unassigned', direction: 'inflow', amount: 8_150, status: 'unmatched' },
  { id: 'txn-1038', date: '2026-08-29', description: 'Freight and last-mile delivery', counterparty: 'PQR Logistics', account: 'ICICI ••7305', category: 'Logistics', direction: 'outflow', amount: 42_300, status: 'pending' },
  { id: 'txn-1037', date: '2026-08-28', description: 'Payroll — August', counterparty: 'Anvaya Staffing', account: 'HDFC ••4821', category: 'Payroll', direction: 'outflow', amount: 1_284_000, status: 'cleared' },
  { id: 'txn-1036', date: '2026-08-26', description: 'Retainer — commercial contracts', counterparty: 'Meridian Legal LLP', account: 'ICICI ••7305', category: 'Professional fees', direction: 'outflow', amount: 95_000, status: 'cleared' },
  { id: 'txn-1035', date: '2026-08-24', description: 'Annual licence renewal', counterparty: 'Orchid Health', account: 'HDFC ••4821', category: 'Revenue', direction: 'inflow', amount: 1_150_000, status: 'cleared' },
  { id: 'txn-1034', date: '2026-08-21', description: 'Office facilities and upkeep', counterparty: 'Global Office Solutions', account: 'ICICI ••7305', category: 'Facilities', direction: 'outflow', amount: 67_800, status: 'unmatched' },
  { id: 'txn-1033', date: '2026-08-20', description: 'Component batch payment', counterparty: 'ABC Suppliers', account: 'HDFC ••4821', category: 'Inventory', direction: 'outflow', amount: 82_000, status: 'pending' },
  { id: 'txn-1032', date: '2026-08-20', description: 'Component batch payment duplicate', counterparty: 'ABC Suppliers', account: 'HDFC ••4821', category: 'Inventory', direction: 'outflow', amount: 82_000, status: 'pending' },
  { id: 'txn-1031', date: '2026-08-19', description: 'Platform implementation milestone', counterparty: 'Bluepeak Media', account: 'HDFC ••4821', category: 'Revenue', direction: 'inflow', amount: 320_000, status: 'cleared' },
  { id: 'txn-1030', date: '2026-08-18', description: 'Enterprise software renewal', counterparty: 'XYZ Technologies', account: 'ICICI ••7305', category: 'Software', direction: 'outflow', amount: 225_000, status: 'cleared' },
  { id: 'txn-1029', date: '2026-08-17', description: 'Packaging supplies', counterparty: 'Shree Enterprises', account: 'HDFC ••4821', category: 'Packaging', direction: 'outflow', amount: 118_500, status: 'cleared' },
  { id: 'txn-1028', date: '2026-08-15', description: 'Consulting retainer', counterparty: 'Nimbus Logistics', account: 'ICICI ••7305', category: 'Revenue', direction: 'inflow', amount: 628_000, status: 'cleared' },
  { id: 'txn-1027', date: '2026-08-14', description: 'Unusual vendor settlement', counterparty: 'PQR Logistics', account: 'HDFC ••4821', category: 'Logistics', direction: 'outflow', amount: 480_000, status: 'unmatched' },
  { id: 'txn-1026', date: '2026-08-13', description: 'Marketing services', counterparty: 'MangoTree Foods', account: 'HDFC ••4821', category: 'Revenue', direction: 'inflow', amount: 274_000, status: 'cleared' },
  { id: 'txn-1025', date: '2026-08-12', description: 'Office lease — August', counterparty: 'Global Office Solutions', account: 'ICICI ••7305', category: 'Facilities', direction: 'outflow', amount: 185_000, status: 'cleared' },
  { id: 'txn-1024', date: '2026-08-10', description: 'Support services', counterparty: 'XYZ Technologies', account: 'HDFC ••4821', category: 'Software', direction: 'outflow', amount: 25_000, status: 'pending' },
  { id: 'txn-1023', date: '2026-08-09', description: 'Quarterly account payment', counterparty: 'Sundar Textiles', account: 'HDFC ••4821', category: 'Revenue', direction: 'inflow', amount: 178_250, status: 'cleared' },
  { id: 'txn-1022', date: '2026-08-08', description: 'Cloud infrastructure — July', counterparty: 'Kalyani Cloud Services', account: 'HDFC ••4821', category: 'Infrastructure', direction: 'outflow', amount: 201_500, status: 'cleared' },
  { id: 'txn-1021', date: '2026-08-07', description: 'Equipment purchase', counterparty: 'ABC Suppliers', account: 'ICICI ••7305', category: 'Equipment', direction: 'outflow', amount: 144_000, status: 'cleared' },
  { id: 'txn-1020', date: '2026-08-06', description: 'Customer invoice settlement', counterparty: 'Orchid Health', account: 'HDFC ••4821', category: 'Revenue', direction: 'inflow', amount: 1_150_000, status: 'cleared' },
  { id: 'txn-1019', date: '2026-08-05', description: 'Payroll tax remittance', counterparty: 'Government of India', account: 'ICICI ••7305', category: 'Payroll', direction: 'outflow', amount: 224_000, status: 'cleared' },
  { id: 'txn-1018', date: '2026-08-04', description: 'Delivery services', counterparty: 'PQR Logistics', account: 'HDFC ••4821', category: 'Logistics', direction: 'outflow', amount: 63_400, status: 'cleared' },
  { id: 'txn-1017', date: '2026-08-03', description: 'Retail partnership payment', counterparty: 'Vertex Retail', account: 'HDFC ••4821', category: 'Revenue', direction: 'inflow', amount: 392_000, status: 'cleared' },
  { id: 'txn-1016', date: '2026-08-02', description: 'Contractor services', counterparty: 'Anvaya Staffing', account: 'ICICI ••7305', category: 'Payroll', direction: 'outflow', amount: 312_000, status: 'cleared' },
  { id: 'txn-1015', date: '2026-08-01', description: 'Software implementation', counterparty: 'XYZ Technologies', account: 'HDFC ••4821', category: 'Software', direction: 'outflow', amount: 205_000, status: 'cleared' },
  { id: 'txn-1014', date: '2026-07-30', description: 'Textile programme milestone', counterparty: 'Sundar Textiles', account: 'HDFC ••4821', category: 'Revenue', direction: 'inflow', amount: 315_000, status: 'cleared' },
  { id: 'txn-1013', date: '2026-07-29', description: 'Legal advisory', counterparty: 'Meridian Legal LLP', account: 'ICICI ••7305', category: 'Professional fees', direction: 'outflow', amount: 95_000, status: 'cleared' },
  { id: 'txn-1012', date: '2026-07-28', description: 'Warehouse materials', counterparty: 'Shree Enterprises', account: 'HDFC ••4821', category: 'Packaging', direction: 'outflow', amount: 84_500, status: 'cleared' },
  { id: 'txn-1011', date: '2026-07-27', description: 'Health network payment', counterparty: 'Orchid Health', account: 'HDFC ••4821', category: 'Revenue', direction: 'inflow', amount: 468_000, status: 'cleared' },
];

export const invoices: Invoice[] = [
  { id: 'inv-2201', number: 'FP-2026-0182', customer: 'Vertex Retail', issuedOn: '2026-08-05', dueOn: '2026-09-04', amount: 486_500, amountPaid: 486_500, status: 'paid', risk: 'low' },
  { id: 'inv-2202', number: 'FP-2026-0183', customer: 'Bluepeak Media', issuedOn: '2026-07-18', dueOn: '2026-08-17', amount: 320_000, amountPaid: 0, status: 'overdue', risk: 'high' },
  { id: 'inv-2203', number: 'FP-2026-0184', customer: 'Sundar Textiles', issuedOn: '2026-08-12', dueOn: '2026-09-11', amount: 178_250, amountPaid: 0, status: 'pending', risk: 'medium' },
  { id: 'inv-2204', number: 'FP-2026-0185', customer: 'Nimbus Logistics', issuedOn: '2026-06-30', dueOn: '2026-07-30', amount: 628_000, amountPaid: 200_000, status: 'disputed', risk: 'critical' },
  { id: 'inv-2205', number: 'FP-2026-0186', customer: 'Orchid Health', issuedOn: '2026-08-24', dueOn: '2026-09-23', amount: 1_150_000, amountPaid: 1_150_000, status: 'paid', risk: 'medium' },
  { id: 'inv-2206', number: 'FP-2026-0187', customer: 'Vertex Retail', issuedOn: '2026-09-03', dueOn: '2026-10-03', amount: 94_600, amountPaid: 0, status: 'draft', risk: 'low' },
  { id: 'inv-2207', number: 'FP-2026-0188', customer: 'MangoTree Foods', issuedOn: '2026-08-28', dueOn: '2026-09-27', amount: 274_000, amountPaid: 0, status: 'sent', risk: 'medium' },
  { id: 'inv-2208', number: 'FP-2026-0189', customer: 'Bluepeak Media', issuedOn: '2026-08-22', dueOn: '2026-09-21', amount: 214_000, amountPaid: 100_000, status: 'flagged', risk: 'high' },
  { id: 'inv-2209', number: 'FP-2026-0190', customer: 'Sundar Textiles', issuedOn: '2026-08-19', dueOn: '2026-09-18', amount: 315_000, amountPaid: 0, status: 'pending', risk: 'medium' },
  { id: 'inv-2210', number: 'FP-2026-0191', customer: 'Nimbus Logistics', issuedOn: '2026-08-15', dueOn: '2026-09-29', amount: 408_000, amountPaid: 0, status: 'sent', risk: 'high' },
  { id: 'inv-2211', number: 'FP-2026-0192', customer: 'Orchid Health', issuedOn: '2026-08-10', dueOn: '2026-09-09', amount: 468_000, amountPaid: 0, status: 'pending', risk: 'medium' },
  { id: 'inv-2212', number: 'FP-2026-0193', customer: 'MangoTree Foods', issuedOn: '2026-08-05', dueOn: '2026-09-04', amount: 195_000, amountPaid: 195_000, status: 'paid', risk: 'low' },
  { id: 'inv-2213', number: 'FP-2026-0194', customer: 'Vertex Retail', issuedOn: '2026-07-28', dueOn: '2026-08-27', amount: 392_000, amountPaid: 392_000, status: 'paid', risk: 'low' },
  { id: 'inv-2214', number: 'FP-2026-0195', customer: 'Bluepeak Media', issuedOn: '2026-07-21', dueOn: '2026-08-20', amount: 286_000, amountPaid: 286_000, status: 'paid', risk: 'medium' },
  { id: 'inv-2215', number: 'FP-2026-0196', customer: 'Sundar Textiles', issuedOn: '2026-07-12', dueOn: '2026-08-11', amount: 240_000, amountPaid: 0, status: 'overdue', risk: 'critical' },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: 'po-501', number: 'PO-2026-0441', vendor: 'ABC Suppliers', issuedOn: '2026-08-18', expectedOn: '2026-09-10', amount: 82_000, invoicedAmount: 82_000, status: 'open' },
  { id: 'po-502', number: 'PO-2026-0442', vendor: 'XYZ Technologies', issuedOn: '2026-08-08', expectedOn: '2026-08-30', amount: 200_000, invoicedAmount: 225_000, status: 'partially-received' },
  { id: 'po-503', number: 'PO-2026-0443', vendor: 'PQR Logistics', issuedOn: '2026-08-01', expectedOn: '2026-08-31', amount: 480_000, invoicedAmount: 480_000, status: 'open' },
  { id: 'po-504', number: 'PO-2026-0444', vendor: 'Global Office Solutions', issuedOn: '2026-07-25', expectedOn: '2026-08-01', amount: 185_000, invoicedAmount: 185_000, status: 'closed' },
  { id: 'po-505', number: 'PO-2026-0445', vendor: 'Shree Enterprises', issuedOn: '2026-08-12', expectedOn: '2026-09-02', amount: 118_500, invoicedAmount: 118_500, status: 'open' },
  { id: 'po-506', number: 'PO-2026-0446', vendor: 'Kalyani Cloud Services', issuedOn: '2026-08-01', expectedOn: '2026-08-31', amount: 213_940, invoicedAmount: 213_940, status: 'closed' },
];

export const expenses: Expense[] = [
  { id: 'exp-771', submittedBy: 'A. Rao', date: '2026-08-30', merchant: 'Blue Tokai Coffee', category: 'Client meetings', amount: 980, status: 'flagged', hasReceipt: false },
  { id: 'exp-770', submittedBy: 'P. Iyer', date: '2026-08-28', merchant: 'IndiGo', category: 'Travel', amount: 18_460, status: 'approved', hasReceipt: true },
  { id: 'exp-769', submittedBy: 'S. Menon', date: '2026-08-26', merchant: 'Trellis Analytics', category: 'Software', amount: 24_000, status: 'reimbursed', hasReceipt: true },
  { id: 'exp-768', submittedBy: 'D. Kulkarni', date: '2026-08-22', merchant: 'Taj Bengaluru', category: 'Travel', amount: 41_200, status: 'submitted', hasReceipt: true },
  { id: 'exp-767', submittedBy: 'R. Banerjee', date: '2026-08-19', merchant: 'Uber for Business', category: 'Local transport', amount: 2_340, status: 'reimbursed', hasReceipt: true },
  { id: 'exp-766', submittedBy: 'A. Rao', date: '2026-08-16', merchant: 'Amazon Business', category: 'Office supplies', amount: 7_615, status: 'flagged', hasReceipt: false },
  { id: 'exp-765', submittedBy: 'P. Iyer', date: '2026-08-14', merchant: 'The Leela Palace', category: 'Travel', amount: 32_800, status: 'approved', hasReceipt: true },
  { id: 'exp-764', submittedBy: 'S. Menon', date: '2026-08-11', merchant: 'Notion Labs', category: 'Software', amount: 6_800, status: 'reimbursed', hasReceipt: true },
  { id: 'exp-763', submittedBy: 'D. Kulkarni', date: '2026-08-08', merchant: 'Bengaluru Airport Taxi', category: 'Travel', amount: 3_250, status: 'submitted', hasReceipt: true },
  { id: 'exp-762', submittedBy: 'R. Banerjee', date: '2026-08-03', merchant: 'Office Depot India', category: 'Office supplies', amount: 12_400, status: 'approved', hasReceipt: true },
];

export const risks: RiskEvent[] = [
  { id: 'risk-01', level: 'critical', title: 'Possible duplicate payment', entity: 'ABC Suppliers', amount: 82_000, detectedOn: '2026-09-03', description: 'Two payments share the same amount, vendor and reference.', status: 'open' },
  { id: 'risk-02', level: 'high', title: 'PO/invoice mismatch', entity: 'XYZ Technologies', amount: 25_000, detectedOn: '2026-09-02', description: 'Invoice exceeds approved purchase order by ₹25,000.', status: 'open' },
  { id: 'risk-03', level: 'high', title: 'Unusual vendor payment', entity: 'PQR Logistics', amount: 480_000, detectedOn: '2026-08-29', description: 'Payment is 3.2x the vendor’s trailing average.', status: 'reviewing' },
  { id: 'risk-04', level: 'high', title: 'Overdue customer invoice', entity: 'Bluepeak Media', amount: 320_000, detectedOn: '2026-09-01', description: 'Invoice is 19 days past its due date.', status: 'open' },
  { id: 'risk-05', level: 'medium', title: 'Unusual vendor transaction', entity: 'PQR Logistics', amount: 140_000, detectedOn: '2026-08-27', description: 'New transaction pattern needs controller review.', status: 'reviewing' },
  { id: 'risk-06', level: 'medium', title: 'Missing expense receipt', entity: 'A. Rao', amount: 7_615, detectedOn: '2026-08-26', description: 'Corporate card expense has no supporting receipt.', status: 'open' },
  { id: 'risk-07', level: 'medium', title: 'Cash-flow safety buffer', entity: 'September obligations', amount: 270_000, detectedOn: '2026-08-25', description: 'Projected cash may cross the safety buffer in 27 days.', status: 'open' },
  { id: 'risk-08', level: 'low', title: 'Unmatched bank line', entity: 'HDFC ••4821', amount: 8_150, detectedOn: '2026-08-31', description: 'Credit has no matching invoice or reference.', status: 'open' },
];

export const exceptions: Exception[] = [
  { id: 'exc-91', kind: 'duplicate-invoice', title: 'Possible duplicate payment', subject: 'ABC Suppliers', reason: 'Same amount and reference as another payment on 20 Aug.', amount: 82_000, raisedOn: '2026-09-03', severity: 'high', href: '/reconciliation' },
  { id: 'exc-90', kind: 'terms-breach', title: 'Invoice exceeds PO', subject: 'XYZ Technologies', reason: 'Invoice is ₹25,000 over the approved purchase order.', amount: 25_000, raisedOn: '2026-09-02', severity: 'high', href: '/invoices' },
  { id: 'exc-89', kind: 'unmatched-payment', title: 'Unusual vendor payment', subject: 'PQR Logistics', reason: '₹4.8 L payment is above the vendor’s normal range.', amount: 480_000, raisedOn: '2026-08-29', severity: 'high', href: '/vendors' },
  { id: 'exc-88', kind: 'cash-shortfall', title: 'Potential cash pressure', subject: 'September obligations', reason: 'Projected available cash may fall below the safety buffer in 27 days.', amount: 270_000, raisedOn: '2026-08-25', severity: 'high', href: '/cash-flow' },
  { id: 'exc-87', kind: 'terms-breach', title: 'Overdue customer invoice', subject: 'Bluepeak Media', reason: '₹3.2 L invoice is 19 days past its due date.', amount: 320_000, raisedOn: '2026-09-01', severity: 'high', href: '/invoices' },
  { id: 'exc-86', kind: 'missing-receipt', title: 'Claim without a receipt', subject: 'A. Rao', reason: 'Corporate card expense needs supporting documents.', amount: 7_615, raisedOn: '2026-08-30', severity: 'low', href: '/expenses' },
  { id: 'exc-85', kind: 'unmatched-payment', title: 'Payment with no matching invoice', subject: 'HDFC ••4821', reason: 'Credit received with no reference the matcher recognises.', amount: 8_150, raisedOn: '2026-08-31', severity: 'medium', href: '/reconciliation' },
  { id: 'exc-84', kind: 'terms-breach', title: 'Paid ahead of agreed terms', subject: 'PQR Logistics', reason: 'Settlement was made ahead of agreed 45-day terms.', amount: 140_000, raisedOn: '2026-08-27', severity: 'medium', href: '/vendors' },
];

export const purchaseOrderList = purchaseOrders;

export const cashHistory: CashPoint[] = [
  { month: 'Apr', inflow: 3_840_000, outflow: 3_120_000 }, { month: 'May', inflow: 4_210_000, outflow: 3_460_000 },
  { month: 'Jun', inflow: 3_960_000, outflow: 4_080_000 }, { month: 'Jul', inflow: 4_680_000, outflow: 3_740_000 },
  { month: 'Aug', inflow: 5_120_000, outflow: 4_390_000 }, { month: 'Sep', inflow: 1_636_500, outflow: 2_130_000 },
];

export const dailyCashFlow: DailyCashFlow[] = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1;
  const inflow = 48_000 + (day % 5) * 12_000 + (day === 12 ? 320_000 : 0) + (day === 24 ? 185_000 : 0);
  const outflow = 39_000 + (day % 4) * 9_000 + (day === 14 ? 480_000 : 0) + (day === 28 ? 1_284_000 : 0);
  return { date: `2026-08-${String(day).padStart(2, '0')}`, inflow, outflow, closingBalance: 10_200_000 + index * 22_000 + (day > 24 ? -220_000 : 0) };
});

export const notifications: Notification[] = [
  { id: 'note-01', title: 'Possible duplicate payment', message: 'ABC Suppliers has two matching ₹82,000 payments.', severity: 'critical', createdOn: '2026-09-03', href: '/risk-center', read: false },
  { id: 'note-02', title: 'Cash buffer warning', message: 'Available cash may fall below the safety buffer in 27 days.', severity: 'warning', createdOn: '2026-09-02', href: '/cash-flow', read: false },
  { id: 'note-03', title: 'Invoice overdue', message: 'Bluepeak Media has an overdue invoice of ₹3,20,000.', severity: 'warning', createdOn: '2026-09-01', href: '/invoices', read: false },
  { id: 'note-04', title: 'Purchase order mismatch', message: 'XYZ Technologies invoice exceeds its PO by ₹25,000.', severity: 'warning', createdOn: '2026-09-02', href: '/risk-center', read: true },
  { id: 'note-05', title: 'Unmatched bank line', message: 'A credit of ₹8,150 needs reconciliation.', severity: 'info', createdOn: '2026-08-31', href: '/reconciliation', read: true },
];

const reconciliationSeedResults: ReconciliationResult[] = [
  {
    id: 'rec-001',
    vendor: 'ABC Suppliers',
    invoiceId: 'INV102',
    resultType: 'strong-match',
    invoiceAmount: 50_000,
    transactionAmount: 50_000,
    invoiceDate: '2026-08-28',
    transactionDate: '2026-08-29',
    explanation: 'Vendor and amount match exactly, and the transaction date is one day after the invoice date.',
  },
  {
    id: 'rec-002',
    vendor: 'XYZ Technologies',
    invoiceId: 'INV103',
    resultType: 'review',
    invoiceAmount: 50_000,
    transactionAmount: 75_000,
    invoiceDate: '2026-08-28',
    transactionDate: '2026-08-28',
    explanation: 'The bank transaction is ₹25,000 higher than the ₹50,000 invoice amount and requires review.',
  },
  {
    id: 'rec-003',
    vendor: 'PQR Logistics',
    invoiceId: 'INV104',
    resultType: 'unmatched',
    invoiceAmount: 0,
    transactionAmount: 480_000,
    invoiceDate: '2026-08-15',
    transactionDate: '2026-08-29',
    explanation: 'This payment is materially larger than the vendor’s trailing average and has no matching document.',
  },
  {
    id: 'rec-004',
    vendor: 'ABC Suppliers',
    invoiceId: 'INV105',
    resultType: 'possible-duplicate',
    invoiceAmount: 82_000,
    transactionAmount: 82_000,
    invoiceDate: '2026-08-20',
    transactionDate: '2026-08-20',
    explanation: 'The same vendor and amount appear twice in the bank feed, which suggests a duplicate payment risk.',
  },
  {
    id: 'rec-005',
    vendor: 'Global Office Solutions',
    invoiceId: 'INV106',
    resultType: 'strong-match',
    invoiceAmount: 67_800,
    transactionAmount: 67_800,
    invoiceDate: '2026-08-20',
    transactionDate: '2026-08-21',
    explanation: 'Facilities payment matches the recorded invoice and sits within the expected payment window.',
  },
  {
    id: 'rec-006',
    vendor: 'Kalyani Cloud Services',
    invoiceId: 'INV107',
    resultType: 'strong-match',
    invoiceAmount: 213_940,
    transactionAmount: 213_940,
    invoiceDate: '2026-08-31',
    transactionDate: '2026-09-01',
    explanation: 'The vendor and amount line up, and the settlement date is within the expected monthly cycle.',
  },
  {
    id: 'rec-007',
    vendor: 'Shree Enterprises',
    invoiceId: 'INV108',
    resultType: 'strong-match',
    invoiceAmount: 118_500,
    transactionAmount: 118_500,
    invoiceDate: '2026-08-12',
    transactionDate: '2026-08-17',
    explanation: 'Packaging supplies were matched against the approved purchase order with a precise ledger fit.',
  },
  {
    id: 'rec-008',
    vendor: 'HDFC ••4821',
    invoiceId: 'INV109',
    resultType: 'unmatched',
    invoiceAmount: 0,
    transactionAmount: 8_150,
    invoiceDate: '2026-08-31',
    transactionDate: '2026-08-31',
    explanation: 'This credit has no matching customer or vendor invoice and should be reviewed by the controller.',
  },
];

const generatedStrongMatches: ReconciliationResult[] = Array.from({ length: 38 }, (_, index) => {
  const amount = 60_000 + index * 2_500;
  return {
    id: `rec-strong-${String(index + 1).padStart(2, '0')}`,
    vendor: `Matched Vendor ${index + 1}`,
    invoiceId: `INV-${String(200 + index)}`,
    resultType: 'strong-match',
    invoiceAmount: amount,
    transactionAmount: amount,
    invoiceDate: '2026-08-15',
    transactionDate: '2026-08-15',
    explanation: 'Vendor and amount match exactly, with the transaction recorded on the invoice date.',
  };
});

const generatedReviews: ReconciliationResult[] = Array.from({ length: 4 }, (_, index) => ({
  id: `rec-review-${String(index + 1).padStart(2, '0')}`,
  vendor: `Review Vendor ${index + 1}`,
  invoiceId: `INV-${String(300 + index)}`,
  resultType: 'review',
  invoiceAmount: 50_000,
  transactionAmount: 75_000,
  invoiceDate: '2026-08-28',
  transactionDate: '2026-08-28',
  explanation: 'The transaction amount differs from the invoice amount and needs a review decision.',
}));

const generatedUnmatched: ReconciliationResult[] = Array.from({ length: 6 }, (_, index) => ({
  id: `rec-unmatched-${String(index + 1).padStart(2, '0')}`,
  vendor: `Unidentified Counterparty ${index + 1}`,
  invoiceId: `INV-${String(400 + index)}`,
  resultType: 'unmatched',
  invoiceAmount: 0,
  transactionAmount: 8_000 + index * 1_000,
  invoiceDate: '2026-08-01',
  transactionDate: '2026-08-31',
  explanation: 'No corresponding invoice was identified for this bank transaction.',
}));

const generatedDuplicates: ReconciliationResult[] = Array.from({ length: 2 }, (_, index) => ({
  id: `rec-duplicate-${String(index + 1).padStart(2, '0')}`,
  vendor: `Duplicate Vendor ${index + 1}`,
  invoiceId: `INV-${String(500 + index)}`,
  resultType: 'possible-duplicate',
  invoiceAmount: 82_000,
  transactionAmount: 82_000,
  invoiceDate: '2026-08-20',
  transactionDate: '2026-08-20',
  explanation: 'The same vendor and amount appear more than once in the bank feed.',
}));

export const reconciliationResults: ReconciliationResult[] = [
  ...reconciliationSeedResults,
  ...generatedStrongMatches,
  ...generatedReviews,
  ...generatedUnmatched,
  ...generatedDuplicates,
];

export const reconciliationSummary = reconciliationResults.reduce(
  (summary, result) => {
    switch (classifyReconciliationResult(result)) {
      case 'Strong Match':
        summary.matched += 1;
        break;
      case 'Review':
        summary.mismatched += 1;
        break;
      case 'Unmatched':
        summary.unmatched += 1;
        break;
      case 'Possible Duplicate':
        summary.possibleDuplicates += 1;
        break;
    }
    return summary;
  },
  { matched: 0, mismatched: 0, unmatched: 0, possibleDuplicates: 0 },
);

export const cashOnHand = 10_200_000;
export const netBurn30d = 1_862_000;

export const dashboardKpis: DashboardKpi[] = [
  { label: 'Available Cash', value: '₹1.02 Cr', trend: '+8.4%', comparison: 'vs last month', tone: 'teal' },
  { label: 'Revenue', value: '₹20.4L', trend: '+12.8%', comparison: 'vs last month', tone: 'blue' },
  { label: 'Expenses', value: '₹14.1L', trend: '+4.2%', comparison: 'vs last month', tone: 'amber' },
  { label: 'Outstanding', value: '₹28.4L', trend: '10', comparison: 'unpaid invoices', tone: 'coral' },
];

export const dashboardHealth: DashboardHealth = [
  { label: 'Cash Health', value: 88, color: '#0f9f94' }, { label: 'Expense Health', value: 76, color: '#4d78e8' },
  { label: 'Receivables', value: 81, color: '#d99b35' }, { label: 'Risk Exposure', value: 79, color: '#e36b5d' },
];

export const dashboardCashFlow: Record<'7D' | '30D' | '90D', DashboardCashPoint[]> = {
  '7D': dailyCashFlow.slice(-7).map((point) => ({ date: point.date.slice(5), inflow: point.inflow, outflow: point.outflow, net: point.inflow - point.outflow })),
  '30D': dailyCashFlow.map((point) => ({ date: point.date.slice(5), inflow: point.inflow, outflow: point.outflow, net: point.inflow - point.outflow })),
  '90D': dailyCashFlow.filter((_, index) => index % 4 === 0 || index === dailyCashFlow.length - 1).map((point) => ({ date: point.date.slice(5), inflow: point.inflow * 4, outflow: point.outflow * 4, net: (point.inflow - point.outflow) * 4 })),
};

export const dashboardRisks: DashboardRisk[] = [
  { level: 'CRITICAL', title: 'Possible duplicate payment', vendor: 'ABC Suppliers', amount: '₹82,000', tone: 'critical' },
  { level: 'HIGH', title: 'Invoice exceeds PO', vendor: 'XYZ Technologies', amount: '₹25,000', tone: 'high' },
  { level: 'MEDIUM', title: 'Unusual vendor transaction', vendor: 'PQR Logistics', amount: '₹1.4L', tone: 'medium' },
];
