import { useEffect, useState } from 'react';
import {
  Card, CardBody, CardHeader, Table, Th, Td, Badge, Button, Field, Input, Select, Alert, Spinner,
} from '@bizzexpo/shared/ui';
import PlatformServices from '@/services/PlatformServices';

const LIMITS = [
  { key: 'maxProducts', label: 'מוצרים', counter: 'products' },
  { key: 'maxOrdersPerMonth', label: 'הזמנות ל-30 יום', counter: 'orders30d' },
  { key: 'maxAdminUsers', label: 'משתמשי ניהול', counter: 'adminUsers' },
  { key: 'maxAgents', label: 'סוכנים', counter: 'agents' },
  { key: 'maxStorageMb', label: 'אחסון (MB)', counter: 'storageMb' },
];

const fmtLimit = (v) => (v === null || v === undefined ? 'ללא הגבלה' : String(v));

/**
 * The plan and the per-tenant escapes from it.
 *
 * BOTH FIELDS ARE IN `SENSITIVE_FIELDS`, so saving here always costs the operator
 * their own operation password — `useTenantSave` decides that from the patch, with
 * the same `hasSensitiveChange` the server's gate uses. That is deliberate: the
 * plan is what the customer is billed against, and an override is the one way to
 * hand out capacity nobody agreed to pay for.
 *
 * AN EMPTY OVERRIDE IS `null`, NOT ZERO. `null` means "fall back to the plan";
 * `0` is a real limit meaning "none allowed", and the server reads it with `??`
 * precisely so the two stay distinguishable.
 */
export default function PlanTab({ tenant, onSave, busy }) {
  const [plans, setPlans] = useState(null);
  const [planId, setPlanId] = useState(tenant.planId ? String(tenant.planId) : '');
  const [overrides, setOverrides] = useState(() => {
    const o = tenant.planOverrides || {};
    return Object.fromEntries(
      LIMITS.map(({ key }) => [key, o[key] === null || o[key] === undefined ? '' : String(o[key])])
    );
  });

  useEffect(() => {
    PlatformServices.listPlans().then((d) => setPlans(d.plans)).catch(() => setPlans([]));
  }, []);

  if (!plans) return <div className="flex justify-center p-10"><Spinner /></div>;

  const current = plans.find((p) => String(p._id) === planId);

  const invalid = LIMITS.some(({ key }) => {
    const raw = String(overrides[key] ?? '').trim();
    return raw !== '' && (!Number.isFinite(Number(raw)) || Number(raw) < 0);
  });

  function submit() {
    // Every override is sent, including the blanks — that is how one is REMOVED.
    // Omitting an emptied field would leave the old value in place and read as the
    // save having silently ignored the clear.
    const cleaned = Object.fromEntries(
      LIMITS.map(({ key }) => {
        const raw = String(overrides[key] ?? '').trim();
        return [key, raw === '' ? null : Number(raw)];
      })
    );
    onSave({ planId: planId || null, planOverrides: cleaned });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="חבילה" description="קובעת אילו מודולים זמינים בכלל, דרך minPlanTier." />
        <CardBody className="space-y-3">
          <Field label="חבילה נוכחית" htmlFor="planId">
            <Select id="planId" value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">ללא חבילה</option>
              {plans.map((p) => (
                <option key={p._id} value={String(p._id)}>
                  {p.nameHe} — דרגה {p.tier} · {p.monthlyPriceIls} ₪ לחודש
                </option>
              ))}
            </Select>
          </Field>
          {current && (
            <div className="flex items-center gap-3">
              <Badge tone="brand">{current.nameHe}</Badge>
              <span className="text-sm text-text-muted">
                דרגה {current.tier} · {current.monthlyPriceIls} ₪ לחודש
              </span>
            </div>
          )}
          {planId !== String(tenant.planId ?? '') && (
            <Alert tone="warning">
              הורדת דרגה משביתה מודולים שדורשים דרגה גבוהה יותר — הם ייקראו ככבויים
              גם אם המתג שלהם דלוק.
            </Alert>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="מגבלות"
          description="ערך בעמודת «חריגה» גובר על מגבלת החבילה. שדה ריק = ללא חריגה."
        />
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
                  <Td>
                    <Input
                      type="number" min={0} dir="ltr" placeholder="—"
                      aria-label={`חריגה — ${label}`}
                      value={overrides[key]}
                      onChange={(e) => setOverrides((o) => ({ ...o, [key]: e.target.value }))}
                    />
                  </Td>
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

      <div className="flex justify-start">
        <Button onClick={submit} loading={busy} disabled={invalid}>שמירה</Button>
      </div>
    </div>
  );
}
