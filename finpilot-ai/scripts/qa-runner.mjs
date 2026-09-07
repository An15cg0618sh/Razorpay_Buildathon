import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');

console.log('--- STARTING FINPILOT AI QA AUDIT ---');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log('  [PASS] ' + message);
    passedTests++;
  } else {
    console.error('  [FAIL] ' + message);
    failedTests++;
  }
}

// 1. Check Routes and Navigation
console.log('\n[1] Route and Navigation Coverage:');
const navSource = readFileSync(join(srcDir, 'data', 'navigation.ts'), 'utf8');
const appSource = readFileSync(join(srcDir, 'App.tsx'), 'utf8');

const navPaths = [...navSource.matchAll(/to:\s*'([^']+)'/g)].map((m) => m[1]);
const routePaths = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);

assert(navPaths.length === 10, 'Expected 10 sidebar destinations, found ' + navPaths.length);
navPaths.forEach((path) => {
  assert(routePaths.includes(path), 'Route for sidebar path ' + path + ' exists in App.tsx');
});
assert(routePaths.includes('/login'), 'Route /login exists');
assert(routePaths.includes('/invoices/:id'), 'Route /invoices/:id exists');
assert(routePaths.includes('*'), 'Catch-all route * exists');

// 2. Data Consistency Checks
console.log('\n[2] Data Consistency & Source of Truth:');
const mockDataSource = readFileSync(join(srcDir, 'data', 'mockData.ts'), 'utf8');
const risksSource = readFileSync(join(srcDir, 'data', 'risks.ts'), 'utf8');

// Invoices summary cards in Invoices.tsx
const invoicesPageSource = readFileSync(join(srcDir, 'pages', 'Invoices.tsx'), 'utf8');
assert(invoicesPageSource.includes("rows.filter((inv) => inv.status === 'pending').length"), 'Invoices summary derives Pending count dynamically');
assert(invoicesPageSource.includes("rows.filter((inv) => inv.status === 'paid').length"), 'Invoices summary derives Paid count dynamically');
assert(invoicesPageSource.includes("rows.filter((inv) => inv.status === 'overdue').length"), 'Invoices summary derives Overdue count dynamically');

// 3. Centralized Risks
console.log('\n[3] Risk Center Dataset Consistency:');
const riskMatches = [...risksSource.matchAll(/id:\s*'(risk-[a-z0-9]+)'/g)];
console.log('  Found ' + riskMatches.length + ' centralized risk anomalies');
assert(riskMatches.length === 30, 'Risk Center contains exactly 30 anomalies');

const criticalMatches = [...risksSource.matchAll(/severity:\s*'Critical'/g)];
const highMatches = [...risksSource.matchAll(/severity:\s*'High'/g)];
const mediumMatches = [...risksSource.matchAll(/severity:\s*'Medium'/g)];
const lowMatches = [...risksSource.matchAll(/severity:\s*'Low'/g)];

assert(criticalMatches.length === 3, 'Expected 3 Critical risks, found ' + criticalMatches.length);
assert(highMatches.length === 7, 'Expected 7 High risks, found ' + highMatches.length);
assert(mediumMatches.length === 12, 'Expected 12 Medium risks, found ' + mediumMatches.length);
assert(lowMatches.length === 8, 'Expected 8 Low risks, found ' + lowMatches.length);

// 4. Invoices State and Data Store API
console.log('\n[4] Invoice Store & KPI Calculation:');
const financeApiSource = readFileSync(join(srcDir, 'services', 'financeApi.ts'), 'utf8');
assert(financeApiSource.includes('export function updateInvoice'), 'financeApi exports updateInvoice mutation');
assert(financeApiSource.includes('export function getDashboardKpis'), 'financeApi exports getDashboardKpis');
assert(financeApiSource.includes('export function getOutstandingReceivables'), 'financeApi exports getOutstandingReceivables');

// 5. CSS & Layout Spacing
console.log('\n[5] Layout and CSS Tokens:');
const indexCss = readFileSync(join(srcDir, 'index.css'), 'utf8');
assert(!indexCss.includes('bg-ink') && !indexCss.includes('text-ink'), 'No retired dark theme tokens');
assert(indexCss.includes('display: flex') && indexCss.includes('flex-direction: column'), 'Dashboard page layout has flex column structure');

// 6. Palette Enforcement Check (Red strictly reserved for Critical)
console.log('\n[6] Palette Compliance:');
const statusPillSource = readFileSync(join(srcDir, 'components', 'StatusPill.tsx'), 'utf8');
const decisionQueueSource = readFileSync(join(srcDir, 'components', 'DecisionQueue.tsx'), 'utf8');
assert(!statusPillSource.includes("high: 'negative'"), 'StatusPill maps high risk to warning instead of negative (red)');
assert(!statusPillSource.includes("medium: 'negative'"), 'StatusPill maps medium risk away from negative (red)');
assert(!decisionQueueSource.includes("high: 'bg-critical'"), 'DecisionQueue does not assign red background to high risk');
assert(!decisionQueueSource.includes("medium: 'bg-critical'"), 'DecisionQueue does not assign red background to medium risk');

// 7. Usability & Keyboard Shortcuts
console.log('\n[7] Usability & Accessibility Shortcuts:');
const headerSource = readFileSync(join(srcDir, 'components', 'Header.tsx'), 'utf8');
const invoiceDetailSource = readFileSync(join(srcDir, 'pages', 'InvoiceDetail.tsx'), 'utf8');
const transactionsSource = readFileSync(join(srcDir, 'pages', 'Transactions.tsx'), 'utf8');
assert(headerSource.includes('handleKeyDown') && headerSource.includes("'k'"), 'Header registers Cmd/Ctrl+K focus handler');
assert(invoiceDetailSource.includes("key === 'Escape'"), 'InvoiceDetail modal handles Escape key to dismiss');
assert(transactionsSource.includes("key === 'Escape'"), 'Transactions modal handles Escape key to dismiss');
assert(invoicesPageSource.includes("key === 'Escape'"), 'Invoices modal handles Escape key to dismiss');

// 8. Deferred Issues QA (Prompt 9.1)
console.log('\n[8] Global Period State & 7D Cash Flow Navigation:');
const usePeriodSource = readFileSync(join(srcDir, 'hooks', 'usePeriod.ts'), 'utf8');
const dashboardSource = readFileSync(join(srcDir, 'pages', 'Dashboard.tsx'), 'utf8');
const cashFlowSource = readFileSync(join(srcDir, 'pages', 'CashFlow.tsx'), 'utf8');
const sidebarSource = readFileSync(join(srcDir, 'components', 'Sidebar.tsx'), 'utf8');
const settingsSource = readFileSync(join(srcDir, 'pages', 'Settings.tsx'), 'utf8');
const expensesSource = readFileSync(join(srcDir, 'pages', 'Expenses.tsx'), 'utf8');

assert(usePeriodSource.includes('export function usePeriod'), 'usePeriod hook exported');
assert(usePeriodSource.includes('AVAILABLE_PERIODS'), 'AVAILABLE_PERIODS defined (Aug, Jul, Jun 2026)');
assert(usePeriodSource.includes('localStorage.setItem'), 'usePeriod persists period to localStorage');

assert(headerSource.includes('usePeriod'), 'Header reads and sets global period');
assert(sidebarSource.includes('usePeriod'), 'Sidebar reads and sets global period in mobile drawer');
assert(settingsSource.includes('usePeriod'), 'Settings displays active global period');
assert(expensesSource.includes('usePeriod'), 'Expenses displays active global period in header');

assert(dashboardSource.includes('/cash-flow?period='), 'Dashboard Cash Flow card links to /cash-flow with period parameter');
assert(cashFlowSource.includes('useSearchParams'), 'CashFlow reads query parameter via useSearchParams');
assert(cashFlowSource.includes("searchParams.get('period')"), 'CashFlow extracts period parameter');
assert(cashFlowSource.includes("activePeriod === option ? 'active' : ''"), 'CashFlow activates matching tab (7D / 30D / 90D)');

console.log('\nQA Audit Summary: ' + passedTests + ' passed, ' + failedTests + ' failed.');
if (failedTests > 0) {
  process.exit(1);
}
