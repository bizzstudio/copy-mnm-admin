import { useState } from 'react';
import {
  Card, CardBody, CardHeader, Button, Field, Input, Select, Toggle, Badge,
} from '@bizzexpo/shared/ui';

/**
 * Who the customer IS: identity, lifecycle status, contact, locale, sign-in policy.
 *
 * These fields had no screen at all — not a read-only one — so the only way to
 * correct a company number or move a tenant off `trial` was the database. The
 * counters stay read-only because a nightly job owns them; showing them next to
 * the editable fields is what makes it obvious which is which.
 */
export default function OverviewTab({ tenant, domains, modules, onSave, busy }) {
  const [form, setForm] = useState(() => ({
    nameHe: tenant.nameHe || '',
    nameEn: tenant.nameEn || '',
    legalName: tenant.legalName || '',
    companyNumber: tenant.companyNumber || '',
    vatNumber: tenant.vatNumber || '',
    status: tenant.status || 'trial',
    contact: { ...(tenant.contact || {}) },
    locale: { ...(tenant.locale || {}) },
    security: { ...(tenant.security || {}) },
  }));

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setIn = (group, patch) => setForm((f) => ({ ...f, [group]: { ...f[group], ...patch } }));

  const enabled = modules.filter((m) => m.isEnabled);

  /**
   * The number input is held as a STRING so it can be emptied while typing.
   * `Number('')` is `0`, which the schema rejects as below its `min: 1` — so
   * binding straight to a number turned a half-typed value into a validation
   * failure the operator did not cause.
   */
  const days = String(form.security.trustedDeviceDays ?? '').trim();
  const daysError =
    days !== '' && (!Number.isInteger(Number(days)) || Number(days) < 1 || Number(days) > 90)
      ? 'ערך בין 1 ל-90'
      : null;

  const invalid = !form.nameHe.trim() || !form.nameEn.trim() || daysError;

  const submit = () => onSave({
    ...form,
    // An emptied field means "leave it alone", not "set it to zero".
    security: { ...form.security, trustedDeviceDays: days === '' ? undefined : Number(days) },
  });

  return (
    <div className="space-y-4">
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
          <p className="text-xs text-text-muted">משתמשי ניהול</p>
          <p className="mt-1 text-2xl font-semibold">{tenant.counters?.adminUsers ?? '—'}</p>
        </CardBody></Card>
      </div>

      <Card>
        <CardHeader
          title="זהות"
          description="המזהה (slug) אינו ניתן לשינוי — הוא הצירוף שכל כתובת אוטומטית בנויה עליו."
        />
        <CardBody className="space-y-3">
          <Field label="מזהה" htmlFor="slug" lockedReason="קבוע — שינויו מנתק כל דומיין וכל שורת מודול">
            <Input id="slug" value={tenant.slug} dir="ltr" disabled />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="שם בעברית" htmlFor="nameHe" required>
              <Input id="nameHe" value={form.nameHe} onChange={(e) => set({ nameHe: e.target.value })} />
            </Field>
            <Field label="שם באנגלית" htmlFor="nameEn" required>
              <Input id="nameEn" value={form.nameEn} onChange={(e) => set({ nameEn: e.target.value })} dir="ltr" />
            </Field>
            <Field label="שם משפטי" htmlFor="legalName">
              <Input id="legalName" value={form.legalName} onChange={(e) => set({ legalName: e.target.value })} />
            </Field>
            <Field label="ח.פ." htmlFor="companyNumber">
              <Input id="companyNumber" value={form.companyNumber} onChange={(e) => set({ companyNumber: e.target.value })} dir="ltr" />
            </Field>
            <Field label="עוסק מורשה" htmlFor="vatNumber">
              <Input id="vatNumber" value={form.vatNumber} onChange={(e) => set({ vatNumber: e.target.value })} dir="ltr" />
            </Field>
            <Field
              label="סטטוס"
              htmlFor="status"
              hint="השבתה חוסמת כניסה לכל האפליקציות של הלקוח, מיידית."
            >
              <Select id="status" value={form.status} onChange={(e) => set({ status: e.target.value })}>
                <option value="trial">ניסיון</option>
                <option value="active">פעיל</option>
                <option value="suspended">מושהה</option>
                <option value="archived">בארכיון</option>
              </Select>
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="איש קשר" description="למי פונים אצל הלקוח. אינו משתמש במערכת." />
        <CardBody>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="שם" htmlFor="c-name">
              <Input id="c-name" value={form.contact.name || ''} onChange={(e) => setIn('contact', { name: e.target.value })} />
            </Field>
            <Field label="דוא״ל" htmlFor="c-email">
              <Input id="c-email" type="email" value={form.contact.email || ''} onChange={(e) => setIn('contact', { email: e.target.value })} dir="ltr" />
            </Field>
            <Field label="טלפון" htmlFor="c-phone">
              <Input id="c-phone" value={form.contact.phone || ''} onChange={(e) => setIn('contact', { phone: e.target.value })} dir="ltr" />
            </Field>
            <Field label="כתובת" htmlFor="c-address">
              <Input id="c-address" value={form.contact.address || ''} onChange={(e) => setIn('contact', { address: e.target.value })} />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="אזור ושפה" />
        <CardBody>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="שפת ברירת מחדל" htmlFor="l-locale">
              <Select id="l-locale" value={form.locale.defaultLocale || 'he'} onChange={(e) => setIn('locale', { defaultLocale: e.target.value })}>
                <option value="he">עברית</option>
                <option value="en">English</option>
              </Select>
            </Field>
            <Field label="כיוון" htmlFor="l-dir">
              <Select id="l-dir" value={form.locale.dir || 'rtl'} onChange={(e) => setIn('locale', { dir: e.target.value })}>
                <option value="rtl">ימין לשמאל</option>
                <option value="ltr">שמאל לימין</option>
              </Select>
            </Field>
            <Field label="מטבע" htmlFor="l-currency">
              <Input id="l-currency" value={form.locale.currency || ''} onChange={(e) => setIn('locale', { currency: e.target.value })} dir="ltr" />
            </Field>
            <Field label="אזור זמן" htmlFor="l-tz">
              <Input id="l-tz" value={form.locale.timezone || ''} onChange={(e) => setIn('locale', { timezone: e.target.value })} dir="ltr" />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="אבטחת כניסה" description="חל על הבק-אופיס בלבד. מלקטים וסוכנים אינם מושפעים." />
        <CardBody className="space-y-4">
          <Toggle
            id="adminMfa"
            checked={Boolean(form.security.adminMfa)}
            onChange={(v) => setIn('security', { adminMfa: v })}
            label="אימות דו-שלבי למנהלים"
            description={
              <>
                קוד בן שש ספרות בדוא״ל בכל כניסה.
                {' '}
                <Badge tone="warning">דורש דוא״ל תקין אצל הלקוח</Badge>
                {' '}
                הקוד נשלח דרך ה-SMTP הכלל-מערכתי; לקוח שהדוא״ל שלו אינו מוגדר לא יוכל להיכנס כלל.
              </>
            }
          />
          <Field label="תוקף «זכור מכשיר» בימים" htmlFor="tdd" hint="בין 1 ל-90." error={daysError}>
            <Input
              id="tdd" type="number" min={1} max={90} dir="ltr"
              value={form.security.trustedDeviceDays ?? ''}
              onChange={(e) => setIn('security', { trustedDeviceDays: e.target.value })}
            />
          </Field>
        </CardBody>
      </Card>

      <div className="flex justify-start">
        <Button onClick={submit} loading={busy} disabled={Boolean(invalid)}>שמירה</Button>
      </div>
    </div>
  );
}
