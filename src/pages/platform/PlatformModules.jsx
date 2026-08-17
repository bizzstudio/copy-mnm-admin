import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardBody, CardHeader, Tabs, Badge, Table, Th, Td,
  PageHeading, Alert, Spinner,
} from '@bizzexpo/shared/ui';
import { MODULE_CREATION_POLICY } from '@bizzexpo/shared';
import PlatformServices from '@/services/PlatformServices';
import { useUser } from '@/hooks/usePlatformRole';

/**
 * `/platform/modules` — the product's capability catalogue.
 *
 * ONE screen filtered by `kind`, not three. The asymmetry between kinds shows up
 * as data, not as a different page: `app` and `feature` are seed-only and the
 * "add" button is simply absent for them, while `integration` is open — the same
 * arrangement that lets an Eden David admin create an email platform at runtime
 * while `shipping` and `accounting` stay closed.
 */

const KINDS = [
  { id: 'app', label: 'אפליקציות' },
  { id: 'feature', label: 'יכולות' },
  { id: 'integration', label: 'אינטגרציות' },
];

export default function PlatformModules() {
  const { isSuperAdmin } = useUser();
  const navigate = useNavigate();
  const [kind, setKind] = useState('app');
  const [modules, setModules] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { if (!isSuperAdmin) navigate('/', { replace: true }); }, [isSuperAdmin, navigate]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    PlatformServices.listModules(kind)
      .then((d) => setModules(d.modules))
      .catch((err) => setError(err.displayMessage));
  }, [kind, isSuperAdmin]);

  if (!isSuperAdmin) return null;

  const canCreate = MODULE_CREATION_POLICY[kind] === 'runtime-allowed';

  return (
    <div>
      <PageHeading
        title="מודולים"
        description="מה קיים במוצר. מה פתוח ללקוח מסוים נקבע במסך ההגדרות שלו."
      />

      <Tabs items={KINDS} active={kind} onChange={setKind} />

      <div className="mt-4">
        {!canCreate && (
          <div className="mb-4">
            <Alert tone="info">
              {kind === 'app'
                ? 'אפליקציה היא פריסה, לא שורה במסד נתונים — לכן הרשימה סגורה ונקבעת ב-seed.'
                : 'פיצ׳ר הוא קוד — הוא נוסף ב-seed כשהמפתח בונה אותו.'}
            </Alert>
          </div>
        )}

        {error && <Alert tone="danger" title="שגיאה">{error}</Alert>}
        {modules === null && !error && <div className="flex justify-center p-10"><Spinner size="lg" /></div>}

        {modules && (
          <Card>
            <CardHeader
              title={KINDS.find((k) => k.id === kind).label}
              description={`${modules.length} מודולים`}
            />
            <CardBody>
              <Table>
                <thead>
                  <tr>
                    <Th>מפתח</Th><Th>שם</Th><Th>קטגוריה</Th><Th>תלויות</Th><Th>מאפיינים</Th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((m) => (
                    <tr key={m.key}>
                      <Td><code className="text-xs">{m.key}</code></Td>
                      <Td>
                        <div>{m.displayNameHe}</div>
                        <div className="text-xs text-text-muted">{m.descriptionHe}</div>
                      </Td>
                      <Td>{m.category || '—'}</Td>
                      <Td className="text-xs">{m.requires?.join(', ') || '—'}</Td>
                      <Td>
                        <div className="flex flex-wrap gap-1">
                          {m.isCore && <Badge tone="brand">ליבה</Badge>}
                          {m.platformManaged && <Badge tone="warning">מנוהל פלטפורמה</Badge>}
                          {m.defaultEnabled && <Badge tone="success">ברירת מחדל</Badge>}
                          {m.exclusiveGroup && <Badge tone="info">בלעדי: {m.exclusiveGroup}</Badge>}
                          {m.oauthProvider && <Badge tone="neutral">OAuth</Badge>}
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
