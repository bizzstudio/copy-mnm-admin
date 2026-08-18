import { useState } from 'react';
import {
  Card, CardBody, CardHeader, Table, Th, Td, Badge, Button, Field, Input, Select,
  Alert, ConfirmDialog,
} from '@bizzexpo/shared/ui';
import { APP_MODULE_KEYS } from '@bizzexpo/shared';
import PlatformServices from '@/services/PlatformServices';

const APP_LABEL = { admin: 'ניהול', store: 'חנות', picking: 'ליקוט', agents: 'סוכנים' };

/**
 * Hostnames: add a custom one, assert it verified, promote it, retire it.
 *
 * THE VERIFY BUTTON DOES NOT CHECK DNS, and says so. Nothing in the product mints
 * or reads `verification.token`, and `tls.status` is a stub — an automatic check
 * that proved a TXT record while no certificate existed would mark a domain ready
 * when it serves nothing. The operator pointing the DNS is bizzstudio, so the
 * assertion is theirs, made explicitly and written to the tenant's journal.
 */
export default function DomainsTab({ tenant, domains, onChanged, toasts }) {
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [draft, setDraft] = useState({ host: '', moduleKey: 'store' });
  const [adding, setAdding] = useState(false);

  /** One in flight at a time: promoting demotes a sibling, so two at once race. */
  const locked = busyId !== null || adding;

  async function run(id, work, okText) {
    setBusyId(id);
    try {
      await work();
      await onChanged();
      if (okText) toasts.success(okText);
    } catch (err) {
      toasts.error(err.displayMessage || 'הפעולה נכשלה');
    } finally {
      setBusyId(null);
    }
  }

  async function addDomain() {
    setAdding(true);
    try {
      await PlatformServices.createTenantDomain(tenant._id, {
        host: draft.host.trim(),
        moduleKey: draft.moduleKey,
      });
      setDraft({ host: '', moduleKey: draft.moduleKey });
      await onChanged();
      toasts.success('הדומיין נוסף. יש לאמת אותו לפני שהוא נקבע כראשי.');
    } catch (err) {
      toasts.error(err.displayMessage || 'ההוספה נכשלה');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="דומיינים"
          description="הכתובות האוטומטיות עובדות מיד. דומיין מותאם דורש אימות — ושתיהן ממשיכות לעבוד."
        />
        <CardBody className="p-0">
          <Table>
            <thead>
              <tr><Th>כתובת</Th><Th>אפליקציה</Th><Th>סוג</Th><Th>ראשי</Th><Th>אימות</Th><Th /></tr>
            </thead>
            <tbody>
              {domains.map((d) => {
                const isSub = d.domainType === 'subdomain';
                const verified = Boolean(d.verification?.verifiedAt);
                return (
                  <tr key={d._id}>
                    <Td>
                      <code className="text-xs" dir="ltr">{d.host}</code>
                      {!d.isActive && <Badge tone="neutral" className="ms-2">מושבת</Badge>}
                    </Td>
                    <Td>{APP_LABEL[d.moduleKey] ?? d.moduleKey}</Td>
                    <Td><Badge tone={isSub ? 'neutral' : 'brand'}>{isSub ? 'אוטומטי' : 'מותאם'}</Badge></Td>
                    <Td>{d.isPrimary ? <Badge tone="success">ראשי</Badge> : ''}</Td>
                    <Td>{verified ? <Badge tone="success">מאומת</Badge> : <Badge tone="warning">ממתין</Badge>}</Td>
                    <Td>
                      <div className="flex flex-wrap justify-end gap-1">
                        {!verified && (
                          <Button
                            size="sm" variant="secondary" disabled={locked}
                            loading={busyId === d._id}
                            onClick={() => run(
                              d._id,
                              () => PlatformServices.updateTenantDomain(tenant._id, d._id, { markVerified: true }),
                              'הדומיין סומן כמאומת'
                            )}
                          >
                            סמן כמאומת
                          </Button>
                        )}
                        {!d.isPrimary && verified && d.isActive && (
                          <Button
                            size="sm" variant="secondary" disabled={locked}
                            onClick={() => run(
                              d._id,
                              () => PlatformServices.updateTenantDomain(tenant._id, d._id, { isPrimary: true }),
                              'הדומיין נקבע כראשי'
                            )}
                          >
                            קבע כראשי
                          </Button>
                        )}
                        {!isSub && (
                          <Button
                            size="sm" variant="secondary" disabled={locked}
                            onClick={() => run(
                              d._id,
                              () => PlatformServices.updateTenantDomain(tenant._id, d._id, { isActive: !d.isActive }),
                              d.isActive ? 'הדומיין הושבת' : 'הדומיין הופעל'
                            )}
                          >
                            {d.isActive ? 'השבת' : 'הפעל'}
                          </Button>
                        )}
                        {!isSub && (
                          <Button size="sm" variant="danger" disabled={locked} onClick={() => setConfirm(d)}>
                            מחיקה
                          </Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="הוספת דומיין מותאם" />
        <CardBody className="space-y-3">
          <Alert tone="info">
            כוונו רשומת A או CNAME אצל רשם הדומיינים של הלקוח, ורק אז סמנו כמאומת.
            הסימון כאן הוא הצהרה של מפעיל — אין בדיקת DNS אוטומטית.
          </Alert>
          <div className="grid gap-3 md:grid-cols-[2fr_1fr_auto] md:items-end">
            <Field label="שם מארח" htmlFor="new-host" hint="ללא http:// וללא נתיב.">
              <Input
                id="new-host" dir="ltr" placeholder="shop.example.co.il"
                value={draft.host}
                onChange={(e) => setDraft((d) => ({ ...d, host: e.target.value }))}
              />
            </Field>
            <Field label="אפליקציה" htmlFor="new-module">
              <Select
                id="new-module" value={draft.moduleKey}
                onChange={(e) => setDraft((d) => ({ ...d, moduleKey: e.target.value }))}
              >
                {Object.values(APP_MODULE_KEYS).map((k) => (
                  <option key={k} value={k}>{APP_LABEL[k] ?? k}</option>
                ))}
              </Select>
            </Field>
            <Button onClick={addDomain} loading={adding} disabled={!draft.host.trim() || locked}>
              הוספה
            </Button>
          </div>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={Boolean(confirm)}
        tone="danger"
        title="מחיקת דומיין"
        confirmLabel="מחיקה"
        busy={busyId === confirm?._id}
        body={`הכתובת ${confirm?.host ?? ''} תפסיק לפתור. אם היא מופיעה בקישורים שנשלחו ללקוחות קצה, הם ישברו.`}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const d = confirm;
          setConfirm(null);
          return run(
            d._id,
            () => PlatformServices.deleteTenantDomain(tenant._id, d._id),
            'הדומיין נמחק'
          );
        }}
      />
    </div>
  );
}
