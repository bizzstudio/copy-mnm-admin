import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button, Card, Badge, Table, Th, Td, Input, Field, Select,
  PageHeading, EmptyState, Spinner, Alert,
} from '@bizzexpo/shared/ui';
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

/**
 * `/tenants` — every customer of bizzstudio.
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
    <div>
      <PageHeading
        title="לקוחות"
        description="כל הלקוחות של bizzstudio. פריסה אחת, בסיס נתונים אחד."
        actions={
          <Button onClick={() => navigate('/platform/tenants/new')} iconStart="＋">
            הוסף לקוח
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="חיפוש" htmlFor="tenant-search">
          <Input
            id="tenant-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="שם או מזהה"
          />
        </Field>
        <Field label="סטטוס" htmlFor="tenant-status">
          <Select id="tenant-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">הכל</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </Field>
      </div>

      {error && <Alert tone="danger" title="שגיאה בטעינת הלקוחות">{error}</Alert>}

      {tenants === null && !error && (
        <div className="flex justify-center p-10"><Spinner size="lg" /></div>
      )}

      {tenants?.length === 0 && (
        <EmptyState
          title="עדיין אין לקוחות"
          description="צרו את הלקוח הראשון. הוא יקבל ארבע כתובות שעובדות מיד, בלי להמתין ל-DNS."
          action={<Button onClick={() => navigate('/platform/tenants/new')}>הוסף לקוח</Button>}
        />
      )}

      {tenants?.length > 0 && (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>לקוח</Th>
                <Th>מזהה</Th>
                <Th>מותג</Th>
                <Th>סטטוס</Th>
                <Th>כתובות</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <Td>
                    <div className="font-medium">{t.nameHe}</div>
                    <div className="text-xs text-text-muted">{t.nameEn}</div>
                  </Td>
                  <Td><code className="text-xs">{t.slug}</code></Td>
                  <Td>
                    {/* The tenant's actual brand colour, straight from the record —
                        the same value that drives every token in their apps. */}
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block size-4 rounded-full border border-border"
                        style={{ background: t.branding?.theme?.brand }}
                        aria-hidden="true"
                      />
                      <code className="text-xs">{t.branding?.theme?.brand}</code>
                    </span>
                  </Td>
                  <Td><Badge tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Badge></Td>
                  <Td>
                    <div className="flex flex-col gap-0.5">
                      {t.domains.map((d) => (
                        <a
                          key={d.host}
                          href={`https://${d.host}`}
                          className="text-xs text-brand-600 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {d.host}
                        </a>
                      ))}
                    </div>
                  </Td>
                  <Td>
                    <Link to={`/platform/tenants/${t.id}`}>
                      <Button variant="secondary" size="sm">הגדרות</Button>
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
