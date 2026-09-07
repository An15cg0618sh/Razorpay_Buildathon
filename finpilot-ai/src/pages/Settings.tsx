import { Settings as SettingsIcon } from 'lucide-react';
import { NotYetBuilt } from '../components/NotYetBuilt';
import { PageHeading } from '../components/PageHeading';
import { Panel } from '../components/Panel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePeriod } from '../hooks/usePeriod';
import { getCompany, getCurrentUser } from '../services/financeApi';
import { CURRENCY, LOCALE } from '../utils/format';

/** The colleagues beyond the signed-in user. The user is prepended below. */
const colleagues: Array<{ name: string; role: string }> = [
  { name: 'D. Kulkarni', role: 'Finance operations' },
  { name: 'S. Menon', role: 'Payroll' },
  { name: 'R. Banerjee', role: 'Approver, above ₹5 L' },
];

export function Settings() {
  useDocumentTitle('Settings');

  // Same source as the sidebar and header, so the three never disagree.
  const [period] = usePeriod();
  const company = getCompany();
  const user = getCurrentUser();

  const companyDetails: Array<{ label: string; value: string }> = [
    { label: 'Company', value: company.name },
    { label: 'Reporting currency', value: `${CURRENCY} · formatted for ${LOCALE}` },
    { label: 'Financial year', value: company.financialYear },
    { label: 'Current open period', value: `${period} (Active)` },
    { label: 'Connected bank accounts', value: company.bankAccounts.join(', ') },
  ];

  const teamMembers: Array<{ name: string; role: string; isYou?: boolean }> = [
    { name: user.name, role: user.role, isYou: true },
    ...colleagues,
  ];

  return (
    <>
      <PageHeading
        title="Settings"
        lede="Company details, the open period, and who can approve what. Read-only in this build."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Company" description="Used across every report and export" flush>
          <dl>
            {companyDetails.map((detail) => (
              <div
                key={detail.label}
                className="flex flex-col gap-0.5 border-b border-line/70 px-4 py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4 sm:px-5"
              >
                <dt className="text-xs text-steel sm:w-48 sm:shrink-0">{detail.label}</dt>
                <dd className="text-sm text-navy">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="Team" description="Everyone with access to the controller" flush>
          <ul>
            {teamMembers.map((member) => (
              <li
                key={member.name}
                className="flex items-center justify-between gap-4 border-b border-line/70 px-4 py-3 last:border-b-0 sm:px-5"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm text-navy">{member.name}</span>
                  {member.isYou === true && (
                    <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-[0.6875rem] font-medium text-primary">
                      You
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-steel">{member.role}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <NotYetBuilt
        icon={SettingsIcon}
        summary="Everything above is fixed sample configuration. Nothing here saves."
        blockedOn="Editing needs the database and a signed-in user, both of which come in a later step."
        planned={[
          'Change company details, currency and financial year, with the change reflected everywhere',
          'Open and close reporting periods, and see who closed each one',
          'Invite a colleague and set what they can approve',
          'Connect a bank account or an accounting system as a data source',
        ]}
      />
    </>
  );
}
