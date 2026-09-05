import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { AiController } from './pages/AiController';
import { CashFlow } from './pages/CashFlow';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { Invoices } from './pages/Invoices';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { Reconciliation } from './pages/Reconciliation';
import { RiskCenter } from './pages/RiskCenter';
import { Settings } from './pages/Settings';
import { Transactions } from './pages/Transactions';
import { Vendors } from './pages/Vendors';

/**
 * Every route in the application.
 *
 * Two shells: AuthLayout for the signed-out screens, AppLayout for everything
 * behind the sidebar. There is no route guard yet — auth arrives in a later
 * step, and adding a fake one now would only have to be torn out.
 *
 * The paths here must stay in step with src/data/navigation.ts, which drives
 * the sidebar.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cash-flow" element={<CashFlow />} />

          <Route path="/transactions" element={<Transactions />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/vendors" element={<Vendors />} />

          <Route path="/reconciliation" element={<Reconciliation />} />
          <Route path="/risk-center" element={<RiskCenter />} />

          <Route path="/ai-controller" element={<AiController />} />

          <Route path="/settings" element={<Settings />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
