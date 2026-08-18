import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button, Card, Badge, Table, Th, Td, Input, Field, Select,
  PageHeading, EmptyState, Spinner, Alert,
} from '@bizzexpo/shared/ui';
import PageContainer from '@/components/common/PageContainer';
import PlatformServices from '@/services/PlatformServices';
import { useUser } from '@/hooks/usePlatformRole';

const STATUS_TONE = {
  trial: 'info',
  active: 'success',
  suspended: 'warning',
  archived: 'neutral',
};

const STATUS_LABEL = {
  trial: 'ניסיון',
  active: 'פעיל',
  suspended: 'מושהה',
  archived: 'בארכיון',
};

/** Which app a hostname serves — the same wording the wizard shows. */
const APP_LABEL = {
  admin: 'ניהול',
  store: 'חנות',
  picking: 'ליקוט',
  agents: 'סוכנים',
};

/**
 * `/platform/tenants` — every customer of bizzstudio.
 *
 * A super-admin-only screen, so it hard-redirects a non-super-admin before any
 * fetch. That is UX only: `/api/platform/*` refuses a tenant token outright, so
 * the redirect exists to avoid a confusing 401, not to protect anything.
 */
export default function Tenants() {
  const { isSuperAdmin } = useUser();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const isFiltered = Boolean(search || status);

  useEffect(() => {
    if (!isSuperAdmin) navigate('/', { replace: true });
  }, [isSuperAdmin, navigate]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    setError(null);
    PlatformServices.listTenants({ search: search || undefined, status: status || undefined })
      .then((data) => { if (!cancelled) setTenants(data.tenants); })
      .catch((err) => { if (!cancelled) setError(err.displayMessage); });
    return () => { cancelled = true; };
  }, [isSuperAdmin, search, status]);

  if (!isSuperAdmin) return null;

  return (
    <PageContainer>
      <PageHeading
        title="לקוחות"
        description="כל הלקוחות של bizzstudio. פריסה אחת, בסיס נתונים אחד."
        actions={
          <Button onClick={() => navigate('/platform/tenants/new')} iconStart="＋">
            הוסף לקוח
          </Button>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert tone="danger" title="שגיאה בטעינת הלקוחות">{error}</Alert>
        </div>
      )}

      {/* Filters and results share one card: the toolbar stays put while the
          body swaps between spinner, empty state and table, so a search that
          returns nothing does not also take the search box away with it. */}
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border p-4">
          <div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
            <div className="w-full sm:w-64">
              <Field label="חיפוש" htmlFor="tenant-search">
                <Input
                  id="tenant-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="שם או מזהה"
                />
              </Field>
            </div>
            <div className="w-full sm:w-44">
              <Field label="סטטוס" htmlFor="tenant-status">
                <Select id="tenant-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">הכל</option>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>

          {tenants?.length > 0 && (
            <p className="text-sm text-text-muted">
              {tenants.length} {tenants.length === 1 ? 'לקוח' : 'לקוחות'}
            </p>
          )}
        </div>

        {tenants === null && !error && (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        )}

        {tenants?.length === 0 && (
          <div className="p-4">
            <EmptyState
              title={isFiltered ? 'אין לקוחות שתואמים לסינון' : 'עדיין אין לקוחות'}
              description={
                isFiltered
                  ? 'נסו שם או מזהה אחר, או אפסו את הסינון.'
                  : 'צרו את הלקוח הראשון. הוא יקבל ארבע כתובות שעובדות מיד, בלי להמתין ל-DNS.'
              }
              action={
                isFiltered ? (
                  <Button variant="secondary" onClick={() => { setSearch(''); setStatus(''); }}>
                    נקה סינון
                  </Button>
                ) : (
                  <Button onClick={() => navigate('/platform/tenants/new')}>הוסף לקוח</Button>
                )
              }
            />
          </div>
        )}

        {tenants?.length > 0 && (
          <Table className="[&_th]:px-4 [&_td]:px-4 [&_td]:py-3 [&_tbody_tr:last-child_td]:border-b-0">
            <thead>
              <tr>
                <Th className="whitespace-nowrap">לקוח</Th>
                <Th className="whitespace-nowrap">מזהה</Th>
                <Th className="whitespace-nowrap">מותג</Th>
                <Th className="whitespace-nowrap">סטטוס</Th>
                {/* Absorbs the slack, so the identifying columns stay packed
                    together at the start instead of drifting apart. */}
                <Th className="w-full">כתובות</Th>
                <Th className="w-px"><span className="sr-only">פעולות</span></Th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-surface-muted">
                  <Td className="whitespace-nowrap">
                    <div className="font-medium text-text">{t.nameHe}</div>
                    <div className="text-xs text-text-muted">{t.nameEn}</div>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <code dir="ltr" className="rounded bg-surface-muted px-1.5 py-0.5 text-xs text-text-muted">
                      {t.slug}
                    </code>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {/* The tenant's actual brand colour, straight from the record —
                        the same value that drives every token in their apps.
                        `dir="ltr"` or the leading `#` of the hex jumps to the end. */}
                    {t.branding?.theme?.brand ? (
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block size-4 shrink-0 rounded-full border border-border"
                          style={{ background: t.branding.theme.brand }}
                          aria-hidden="true"
                        />
                        <code dir="ltr" className="text-xs text-text-muted">
                          {t.branding.theme.brand}
                        </code>
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <Badge tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status] ?? t.status}</Badge>
                  </Td>
                  <Td>
                    {/* Chips that wrap, not a stacked list — four to eight hosts
                        per tenant turn a column of links into a very tall row. */}
                    {!t.domains?.length ? (
                      <span className="text-xs text-text-muted">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {t.domains.map((d) => (
                          <a
                            key={d.host}
                            href={`https://${d.host}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-text-muted transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                          >
                            {APP_LABEL[d.moduleKey] && (
                              <span className="font-medium text-text">{APP_LABEL[d.moduleKey]}</span>
                            )}
                            <span dir="ltr">{d.host}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap text-end">
                    <Link to={`/platform/tenants/${t.id}`}>
                      <Button variant="secondary" size="sm">הגדרות</Button>
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </PageContainer>
  );
}
