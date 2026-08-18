import { useEffect, useState } from 'react';
import {
  Card, CardBody, CardHeader, Table, Th, Td, Badge, Checkbox, Pagination, Alert, Spinner,
} from '@bizzexpo/shared/ui';
import PlatformServices from '@/services/PlatformServices';
import { formatDateTime } from '@/utils/tenantFormat';

/**
 * The journal, and the one tab that is read-only on purpose rather than by
 * omission: an audit trail a super-admin can edit is not an audit trail.
 *
 * Paginated and capped server-side, because this is the collection most likely to
 * be the largest in the database.
 */
export default function AuditTab({ tenant }) {
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
