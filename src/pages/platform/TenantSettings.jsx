import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, CardBody, CardHeader, Tabs, Badge, Toggle, Button,
  PageHeading, ContextBanner, Spinner, Alert, Table, Th, Td,
  Pagination, Field, Select, Checkbox, ToastStack,
} from '@bizzexpo/shared/ui';
import { sectionsForKind } from '@bizzexpo/shared';
import PlatformServices from '@/services/PlatformServices';
import SensitiveActionPasswordModal from '@/components/common/SensitiveActionPasswordModal';
import { useToasts } from '@/hooks/useToasts';
import { useUser } from '@/hooks/usePlatformRole';
import { formatDateTime } from '@/utils/tenantFormat';

/**
 * `/tenants/:id/settings` — the Eden David `/admins/:id/settings` pattern.
 *
 * WHY A SEPARATE PAGE, not `/settings?tenantId=`:
 * the ordinary settings screens are wired end-to-end to the SIGNED-IN operator.
 * Reusing them for another account means passing an explicit `tenant` prop through
 * every tab, and a page of its own is also the only honest place to put a
 * permanent context banner — without it a super-admin will eventually save the
 * wrong account's data. That banner is the whole reason for the separate route.
 *
 * Every tab component takes `tenant` as a PROP and never reads it from context.
 */

const TABS = [
  { id: 'overview', label: 'סקירה' },
  { id: 'modules', label: 'מודולים' },
  { id: 'branding', label: 'מיתוג' },
  { id: 'domains', label: 'דומיינים' },
  { id: 'users', label: 'משתמשים' },
  { id: 'plan', label: 'חבילה' },
  { id: 'audit', label: 'יומן' },
];

const KIND_TITLE = { app: 'אפליקציות', feature: 'יכולות', integration: 'אינטגרציות' };

export default function TenantSettings() {
  const { id } = useParams();
  const { isSuperAdmin } = useUser();
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { if (!isSuperAdmin) navigate('/', { replace: true }); }, [isSuperAdmin, navigate]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    PlatformServices.getTenant(id)
      .then(setData)
      .catch((err) => setError(err.displayMessage));
  }, [id, isSuperAdmin]);

  if (!isSuperAdmin) return null;
  if (error) return <Alert tone="danger" title="שגיאה">{error}</Alert>;
  if (!data) return <div className="flex justify-center p-10"><Spinner size="lg" /></div>;

  const { tenant, domains, modules } = data;

  return (
    <div>
      {/* Permanent, visually distinct. The super-admin is not in their own account. */}
      <div className="mb-4">
        <ContextBanner
          title={`הגדרות הלקוח: ${tenant.nameHe}`}
          subtitle={`מזהה: ${tenant.slug} · אתם עורכים חשבון של לקוח אחר`}
          action={<Button variant="secondary" size="sm" onClick={() => navigate('/platform/tenants')}>חזרה לרשימה</Button>}
        />
      </div>

      <PageHeading title={tenant.nameHe} description={tenant.nameEn} />

      <Tabs items={TABS} active={tab} onChange={setTab} />

      <div className="mt-4">
        {tab === 'overview' && <OverviewTab tenant={tenant} domains={domains} modules={modules} />}
        {tab === 'modules' && <ModulesTab tenant={tenant} modules={modules} />}
        {tab === 'branding' && <BrandingTab tenant={tenant} />}
        {tab === 'domains' && <DomainsTab tenant={tenant} domains={domains} />}
        {tab === 'users' && <UsersTab tenant={tenant} />}
        {tab === 'plan' && <PlanTab tenant={tenant} />}
        {tab === 'audit' && <AuditTab tenant={tenant} />}
      </div>
    </div>
  );
}

/* Every tab takes `tenant` as a prop — never from context. */

function OverviewTab({ tenant, domains, modules }) {
  const enabled = modules.filter((m) => m.isEnabled);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card><CardBody>
        <p className="text-xs text-text-muted">מודולים פעילים</p>
        <p className="mt-1 text-2xl font-semibold">{enabled.length}</p>
      </CardBody></Card>
      <Card><CardBody>
        <p className="text-xs text-text-muted">כתובות</p>
        <p className="mt-1 text-2xl font-semibold">{domains.length}</p>
      </CardBody></Card>
      <Card><CardBody>
        <p className="text-xs text-text-muted">צבע מותג</p>
        <span className="mt-1 inline-flex items-center gap-2">
          <span className="inline-block size-6 rounded-full border border-border"
                style={{ background: tenant.branding?.theme?.brand }} />
          <code className="text-sm">{tenant.branding?.theme?.brand}</code>
        </span>
      </CardBody></Card>
    </div>
  );
}

/**
 * Three collapsible groups by `kind`, one `ModuleCard` each.
 *
 * The card renders from `sectionsForKind(kind)` — the shared capability matrix —
 * so there is no `if (kind === 'integration')` in this component. Adding a fourth
 * kind would mean a row in the matrix, not a branch here.
 */
function ModulesTab({ tenant, modules }) {
  const grouped = ['app', 'feature', 'integration'].map((kind) => ({
    kind,
    rows: modules.filter((m) => m.kind === kind),
  }));

  return (
    <div className="space-y-4">
      {grouped.map(({ kind, rows }) => (
        <Card key={kind}>
          <CardHeader
            title={KIND_TITLE[kind]}
            description={`${rows.filter((r) => r.isEnabled).length} / ${rows.length} פעילים`}
          />
          <CardBody className="space-y-3">
            {rows.length === 0 && <p className="text-sm text-text-muted">אין מודולים מסוג זה.</p>}
            {rows.map((m) => (
              <ModuleCard key={m.moduleKey} module={m} tenant={tenant} />
            ))}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function ModuleCard({ module: mod, tenant }) {
  const sections = sectionsForKind(mod.kind);
  return (
    <div className="rounded-input border border-border p-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{mod.moduleKey}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {/* The sections THIS kind exposes, straight from the shared matrix. */}
            {sections.map((s) => <Badge key={s} tone="neutral">{s}</Badge>)}
          </div>
        </div>
        {/* The enable toggle is always LAST — for all three kinds. */}
        <Toggle checked={mod.isEnabled} onChange={() => {}} disabled />
      </div>
    </div>
  );
}

function BrandingTab({ tenant }) {
  const theme = tenant.branding?.theme || {};
  return (
    <Card>
      <CardHeader title="מיתוג" description="חמישה ערכים. כל השאר נגזר מהם." />
      <CardBody>
        <Table>
          <tbody>
            {Object.entries(theme).map(([k, v]) => (
              <tr key={k}>
                <Td className="w-32 font-medium">{k}</Td>
                <Td><code className="text-xs">{String(v)}</code></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
}

function DomainsTab({ tenant, domains }) {
  return (
    <Card>
      <CardHeader
        title="דומיינים"
        description="הכתובות האוטומטיות עובדות מיד. דומיין מותאם דורש אימות DNS TXT — ושתיהן ממשיכות לעבוד."
      />
      <CardBody>
        <Table>
          <thead>
            <tr><Th>כתובת</Th><Th>אפליקציה</Th><Th>סוג</Th><Th>ראשי</Th><Th>אימות</Th></tr>
          </thead>
          <tbody>
            {domains.map((d) => (
              <tr key={d.host}>
                <Td><code className="text-xs" dir="ltr">{d.host}</code></Td>
                <Td>{d.moduleKey}</Td>
                <Td><Badge tone={d.domainType === 'custom' ? 'brand' : 'neutral'}>{d.domainType}</Badge></Td>
                <Td>{d.isPrimary ? '✓' : ''}</Td>
                <Td>
                  {d.verification?.verifiedAt
                    ? <Badge tone="success">מאומת</Badge>
                    : <Badge tone="warning">ממתין</Badge>}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
}


/**
 * The tenant's own staff, and the impersonation entry point.
 *
 * Impersonation starts HERE rather than from a global menu, because it is always
 * "see it as THIS user" — there is no meaningful way to impersonate a tenant in
 * the abstract, and a picker's view differs from an admin's.
 */
function UsersTab({ tenant }) {
  const toasts = useToasts();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [target, setTarget] = useState(null);

  useEffect(() => {
    PlatformServices.listTenantUsers(tenant._id)
      .then((d) => setUsers(d.users))
      .catch((err) => setError(err.displayMessage));
  }, [tenant._id]);

  async function startImpersonation(operationPassword) {
    const { nonce } = await PlatformServices.impersonate(tenant._id, {
      targetUserId: target._id,
      operationPassword,
    });
    // A NONCE in the URL, never a token. It is single-use and dies in 60 seconds.
    const host = `${window.location.protocol}//${window.location.host}`;
    window.location.assign(`${host}/impersonate?ticket=${encodeURIComponent(nonce)}`);
  }

  if (error) return <Alert tone="danger" title="שגיאה">{error}</Alert>;
  if (!users) return <div className="flex justify-center p-10"><Spinner /></div>;

  return (
    <>
      <Card>
        <CardHeader title="משתמשים" description={`${users.length} משתמשים אצל הלקוח`} />
        <CardBody className="p-0">
          <Table>
            <thead>
              <tr><Th>שם</Th><Th>תפקיד</Th><Th>זיהוי</Th><Th>כניסה אחרונה</Th><Th>סטטוס</Th><Th /></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <Td>{u.name}</Td>
                  <Td><Badge tone="neutral">{ROLE_LABEL[u.role] ?? u.role}</Badge></Td>
                  <Td dir="ltr" className="text-xs">{u.email || u.phone || '—'}</Td>
                  <Td>{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'טרם נכנס'}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <Badge tone={u.isActive ? 'success' : 'neutral'}>{u.isActive ? 'פעיל' : 'כבוי'}</Badge>
                      {u.mustChangePassword && <Badge tone="warning">סיסמה ראשונית</Badge>}
                    </div>
                  </Td>
                  <Td>
                    <Button
                      variant="secondary" size="sm"
                      disabled={!u.isActive}
                      onClick={() => setTarget(u)}
                    >
                      התחזות
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {target && (
        <div className="mt-4">
          <Alert tone="warning" title={`התחזות ל-${target.name}`}>
            הסשן מוגבל ל-15 דקות, וכל פעולה בו נרשמת ביומן עם שתי הזהויות.
            פעולות על החבילה, החיוב והסודות חסומות.
          </Alert>
        </div>
      )}

      <SensitiveActionPasswordModal
        open={Boolean(target)}
        onCancel={() => setTarget(null)}
        onConfirm={startImpersonation}
      />

      <ToastStack toasts={toasts.toasts} onDismiss={toasts.dismiss} />
    </>
  );
}

const ROLE_LABEL = {
  admin: 'מנהל', employee: 'עובד', picker: 'מלקט', agent: 'סוכן', 'super-admin': 'מנהל־על',
};

function PlanTab({ tenant }) {
  const [plans, setPlans] = useState(null);

  useEffect(() => { PlatformServices.listPlans().then((d) => setPlans(d.plans)).catch(() => setPlans([])); }, []);
  if (!plans) return <div className="flex justify-center p-10"><Spinner /></div>;

  const current = plans.find((p) => String(p._id) === String(tenant.planId));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="חבילה נוכחית" description="קובעת אילו מודולים זמינים בכלל, דרך minPlanTier." />
        <CardBody>
          {current ? (
            <div className="flex items-center gap-3">
              <Badge tone="brand">{current.nameHe}</Badge>
              <span className="text-sm text-text-muted">
                דרגה {current.tier} · {current.monthlyPriceIls} ₪ לחודש
              </span>
            </div>
          ) : (
            <p className="text-sm text-text-muted">לא הוגדרה חבילה.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="מגבלות" description="ערך בעמודת «חריגה» גובר על מגבלת החבילה." />
        <CardBody className="p-0">
          <Table>
            <thead>
              <tr><Th>מגבלה</Th><Th>בחבילה</Th><Th>חריגה ללקוח</Th><Th>בשימוש</Th></tr>
            </thead>
            <tbody>
              {LIMITS.map(({ key, label, counter }) => (
                <tr key={key}>
                  <Td>{label}</Td>
                  <Td dir="ltr">{fmtLimit(current?.limits?.[key])}</Td>
                  <Td dir="ltr">{fmtLimit(tenant.planOverrides?.[key])}</Td>
                  <Td dir="ltr">{tenant.counters?.[counter] ?? '—'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Alert tone="info">
        שינוי חבילה חסום במצב התחזות, ודורש את סיסמת הפעולות של המבצע.
      </Alert>
    </div>
  );
}

const LIMITS = [
  { key: 'maxProducts', label: 'מוצרים', counter: 'products' },
  { key: 'maxOrdersPerMonth', label: 'הזמנות ל-30 יום', counter: 'orders30d' },
  { key: 'maxAdminUsers', label: 'משתמשי ניהול', counter: 'adminUsers' },
  { key: 'maxAgents', label: 'סוכנים', counter: 'agents' },
  { key: 'maxStorageMb', label: 'אחסון (MB)', counter: 'storageMb' },
];

const fmtLimit = (v) => (v == null ? 'ללא הגבלה' : v);

/**
 * The journal.
 *
 * The "impersonated only" filter is the most useful control here: it answers
 * "what did bizzstudio do inside this account?" in one click, which is the
 * question a customer asks when something changed that they did not change.
 */
function AuditTab({ tenant }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [impersonatedOnly, setImpersonatedOnly] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    PlatformServices.listTenantAudit(tenant._id, { page, impersonatedOnly: impersonatedOnly || undefined })
      .then(setData)
      .catch((err) => setError(err.displayMessage));
  }, [tenant._id, page, impersonatedOnly]);

  useEffect(() => { setPage(1); }, [impersonatedOnly]);

  if (error) return <Alert tone="danger" title="שגיאה">{error}</Alert>;
  if (!data) return <div className="flex justify-center p-10"><Spinner /></div>;

  return (
    <Card>
      <CardHeader
        title="יומן פעולות"
        description={`${data.total} רשומות`}
        actions={
          <Checkbox
            checked={impersonatedOnly}
            onChange={(e) => setImpersonatedOnly(e.target.checked)}
            label="רק פעולות בהתחזות"
          />
        }
      />
      <CardBody className="p-0">
        <Table>
          <thead>
            <tr><Th>מתי</Th><Th>פעולה</Th><Th>מי</Th><Th>בשם</Th><Th>פרטים</Th></tr>
          </thead>
          <tbody>
            {data.items.map((e) => (
              <tr key={e._id}>
                <Td className="whitespace-nowrap text-xs">{formatDateTime(e.createdAt)}</Td>
                <Td><code className="text-xs">{e.action}</code></Td>
                <Td className="text-xs">{e.actor?.email || e.actor?.role || '—'}</Td>
                <Td>
                  {/* Populated only while impersonating — the real operator. */}
                  {e.onBehalfOf?.email
                    ? <Badge tone="danger">{e.onBehalfOf.email}</Badge>
                    : <span className="text-text-muted">—</span>}
                </Td>
                <Td className="text-xs text-text-muted">{e.message?.he ?? ''}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="px-4 pb-3">
          <Pagination page={data.page} pages={data.pages} total={data.total} onChange={setPage} />
        </div>
      </CardBody>
    </Card>
  );
}
