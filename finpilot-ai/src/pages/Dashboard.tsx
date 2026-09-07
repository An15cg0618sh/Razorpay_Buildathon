import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BadgeIndianRupee, ReceiptText, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeading } from '../components/PageHeading';
import { dashboardCashFlow, dashboardHealth, dashboardRisks } from '../data/mockData';
import { getDashboardKpis } from '../services/financeApi';
import type { CashFlowRange } from '../data/dashboardTypes';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function Dashboard() {
  useDocumentTitle('Financial Overview');
  const [range, setRange] = useState<CashFlowRange>('30D');
  const cashFlow = dashboardCashFlow[range];
  const kpis = getDashboardKpis();
  const icons = [Wallet, BadgeIndianRupee, ArrowDownRight, ReceiptText];

  return (
    <div className="dashboard-page">
      <PageHeading title="Financial Overview" lede="AI-powered view of your company's financial health" />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key financial metrics">
        {kpis.map((kpi, index) => {
          const Icon = icons[index];
          return <article key={kpi.label} className={`dashboard-kpi kpi-${kpi.tone}`}>
            <div className="flex items-start justify-between"><span className="kpi-icon"><Icon size={18} strokeWidth={2.2} /></span><span className="text-xs font-semibold text-positive">{kpi.trend}</span></div>
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.12em] text-steel">{kpi.label}</p><p className="figure mt-1 text-2xl font-semibold tracking-tight text-navy">{kpi.value}</p><p className="mt-1 text-xs text-mist">{kpi.comparison}</p>
          </article>;
        })}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_1.95fr]">
        <article className="dashboard-card health-card">
          <div className="flex items-start justify-between"><div><p className="section-kicker">Financial Health</p><h2 className="mt-1 text-lg font-semibold text-navy">Your business is in good shape</h2></div><ShieldCheck className="text-positive" size={22} /></div>
          <div className="mt-6 flex items-center gap-6"><div className="health-ring" aria-label="Financial health score 82 out of 100"><div><strong>82</strong><span>/ 100</span></div></div><div><p className="text-xl font-semibold text-navy">Healthy</p><p className="mt-1 text-sm text-steel">Strong financial position</p></div></div>
          <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-4">{dashboardHealth.map((item) => <div key={item.label}><div className="mb-1.5 flex justify-between text-xs"><span className="text-steel">{item.label}</span><strong className="figure text-navy">{item.value}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-subtle"><span className="block h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} /></div></div>)}</div>
        </article>

        <article className="dashboard-card cash-flow-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="section-kicker">Cash Flow</p>
                <Link
                  to={`/cash-flow?period=${range.toLowerCase()}`}
                  className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1"
                >
                  View Details <ArrowUpRight size={13} />
                </Link>
              </div>
              <h2 className="mt-1 text-lg font-semibold text-navy">Movement across your accounts</h2>
            </div>
            <div className="range-tabs" role="group" aria-label="Cash flow range">
              {(['7D', '30D', '90D'] as CashFlowRange[]).map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setRange(option)}
                  className={range === option ? 'active' : ''}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-steel"><span><i className="legend-dot bg-[#0f9f94]" />Inflow</span><span><i className="legend-dot bg-[#e36b5d]" />Outflow</span><span><i className="legend-dot bg-[#4d78e8]" />Net cash</span></div>
          <div className="mt-2 h-64 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={cashFlow} margin={{ top: 16, right: 4, left: -22, bottom: 0 }}><defs><linearGradient id="inflowFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f9f94" stopOpacity={0.2} /><stop offset="100%" stopColor="#0f9f94" stopOpacity={0} /></linearGradient><linearGradient id="outflowFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e36b5d" stopOpacity={0.15} /><stop offset="100%" stopColor="#e36b5d" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#edf0f3" vertical={false} /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 11 }} tickFormatter={(value: number) => `₹${Math.round(value / 1000)}k`} /><Tooltip contentStyle={{ border: '1px solid #e4e7ec', borderRadius: 8, boxShadow: '0 4px 12px rgb(16 24 40 / 0.08)', fontSize: 12 }} /><Area type="monotone" dataKey="inflow" stroke="#0f9f94" strokeWidth={2} fill="url(#inflowFill)" /><Area type="monotone" dataKey="outflow" stroke="#e36b5d" strokeWidth={2} fill="url(#outflowFill)" /><Area type="monotone" dataKey="net" stroke="#4d78e8" strokeWidth={2} fill="none" /></AreaChart></ResponsiveContainer></div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="dashboard-card warning-card"><div className="flex gap-4"><span className="warning-icon"><AlertTriangle size={21} /></span><div className="min-w-0"><p className="section-kicker text-warning">AI Cash Warning</p><h2 className="mt-1 text-lg font-semibold text-navy">Potential cash pressure detected.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-steel">Based on current receivables and upcoming obligations, available cash may fall below the company's safety buffer in 27 days.</p><Link to="/cash-flow" className="mt-4 inline-flex items-center gap-2 rounded-md bg-navy px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-steel">View Forecast <ArrowUpRight size={15} /></Link></div></div></article>
        <article className="dashboard-card recommendation-card"><div className="flex items-center gap-3"><span className="ai-icon"><Sparkles size={18} /></span><div><p className="section-kicker">AI Recommendation</p><h2 className="mt-1 text-base font-semibold text-navy">AI Finance Controller</h2></div></div><p className="mt-5 text-sm font-medium leading-6 text-navy">“Delay Vendor X's payment by 10 days and follow up with Customers A &amp; B.”</p><p className="mt-4 text-xs text-mist">AI recommendations require human review.</p></article>
      </section>

      <article className="dashboard-card risk-card"><div className="flex items-start justify-between"><div><p className="section-kicker">Financial Risks</p><h2 className="mt-1 text-lg font-semibold text-navy">Items requiring attention</h2></div><Link to="/risk-center" className="text-xs font-semibold text-primary hover:text-primary-dark">View all risks</Link></div><div className="mt-5 grid grid-cols-1 divide-y divide-line/70 md:grid-cols-3 md:divide-x md:divide-y-0">{dashboardRisks.map((risk) => <div key={risk.title} className="py-4 first:pt-0 last:pb-0 md:px-5 md:py-1 md:first:pl-0 md:last:pr-0"><div className="flex items-center gap-2"><span className={`risk-dot risk-${risk.tone}`} /><span className={`text-[11px] font-bold tracking-[0.14em] risk-label-${risk.tone}`}>{risk.level}</span></div><p className="mt-3 text-sm font-semibold text-navy">{risk.title}</p><div className="mt-1 flex items-center justify-between gap-3 text-xs text-steel"><span>{risk.vendor}</span><strong className="figure text-navy">{risk.amount}</strong></div></div>)}</div></article>
    </div>
  );
}
