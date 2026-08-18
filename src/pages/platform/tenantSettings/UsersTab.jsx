import { useCallback, useEffect, useState } from 'react';
import {
  Card, CardBody, CardHeader, Table, Th, Td, Badge, Button, Field, Input, Select,
  Modal, Alert, Spinner,
} from '@bizzexpo/shared/ui';
import PlatformServices from '@/services/PlatformServices';
import SensitiveActionPasswordModal from '@/components/common/SensitiveActionPasswordModal';
import { formatDateTime } from '@/utils/tenantFormat';

/**
 * MNM's own role enum, in MNM's own spelling.
 *
 * The first three are what `db/actors.js` maps to `admin` — the people who can
 * actually run the back office. The rest are staff accounts with narrower reach,
 * and the distinction is why the server refuses to leave a tenant whose only
 * remaining active user is a Driver.
 */
const ROLES = [
  { value: 'Admin', label: 'מנהל', full: true },
  { value: 'Super Admin', label: 'מנהל ראשי', full: true },
  { value: 'CEO', label: 'מנכ״ל', full: true },
  { value: 'Manager', label: 'אחראי משמרת' },
  { value: 'Cashier', label: 'קופאי' },
  { value: 'Accountant', label: 'הנהלת חשבונות' },
  { value: 'Driver', label: 'נהג' },
  { value: 'Security Guard', label: 'מאבטח' },
];
const roleLabel = (v) => ROLES.find((r) => r.value === v)?.label ?? v;

const BLANK = { name: '', email: '', phone: '', role: 'Admin', password: '' };

/**
 * A tenant's staff, administered from the platform.
 *
 * IMPERSONATION AND EDITING ANSWER DIFFERENT QUESTIONS. Impersonation is "show me
 * what they see" and needs an account to borrow; this is "their only admin left
 * and nobody can get in", which impersonation cannot solve. Both are here, and the
 * riskier one is the one that writes to the tenant's journal by name.
 */
export default function UsersTab({ tenant, toasts }) {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [impersonating, setImpersonating] = useState(null);
  const [editing, setEditing] = useState(null);      // a user row, or BLANK for a new one
  const [resetting, setResetting] = useState(null);  // { user, newPassword } awaiting the PIN

  const load = useCallback(async () => {
    try {
      const d = await PlatformServices.listTenantUsers(tenant._id);
      setUsers(d.users);
    } catch (err) {
      setError(err.displayMessage);
    }
  }, [tenant._id]);

  useEffect(() => { load(); }, [load]);

  async function startImpersonation(operationPassword) {
    const { nonce } = await PlatformServices.impersonate(tenant._id, {
      targetUserId: impersonating._id,
      operationPassword,
    });
    // A NONCE in the URL, never a token. It is single-use and dies in 60 seconds.
    const host = `${window.location.protocol}//${window.location.host}`;
    window.location.assign(`${host}/impersonate?ticket=${encodeURIComponent(nonce)}`);
  }

  async function toggleActive(u) {
    setBusy(true);
    try {
      await PlatformServices.updateTenantUser(tenant._id, u._id, { isActive: !u.isActive });
      await load();
      toasts.success(u.isActive ? 'המשתמש הושבת' : 'המשתמש הופעל');
    } catch (err) {
      // The server refuses to leave a tenant with no way in, and its sentence says
      // which user it is protecting. Repeating it is more useful than "failed".
      toasts.error(err.displayMessage || 'הפעולה נכשלה');
    } finally {
      setBusy(false);
    }
  }

  /**
   * Throws on failure rather than toasting: the dialog catches it and shows the
   * message INSIDE itself, so a rejected email does not close the form and lose
   * everything already typed into it.
   */
  async function saveUser(form) {
    setBusy(true);
    try {
      if (form._id) {
        await PlatformServices.updateTenantUser(tenant._id, form._id, {
          name: form.name, email: form.email, phone: form.phone || null, role: form.role,
        });
      } else {
        await PlatformServices.createTenantUser(tenant._id, {
          name: form.name, email: form.email, phone: form.phone || undefined,
          role: form.role, password: form.password,
        });
      }
      setEditing(null);
      await load();
      toasts.success(form._id ? 'המשתמש עודכן' : 'המשתמש נוצר');
    } finally {
      setBusy(false);
    }
  }

  async function confirmReset(operationPassword) {
    await PlatformServices.resetTenantUserPassword(tenant._id, resetting.user._id, {
      newPassword: resetting.newPassword,
      operationPassword,
    });
    setResetting(null);
    toasts.success('הסיסמה הוחלפה. כל הסשנים הפעילים של המשתמש בוטלו.');
  }

  if (error) return <Alert tone="danger" title="שגיאה">{error}</Alert>;
  if (!users) return <div className="flex justify-center p-10"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="משתמשים"
          description={`${users.length} משתמשים אצל הלקוח`}
          actions={<Button size="sm" onClick={() => setEditing({ ...BLANK })}>משתמש חדש</Button>}
        />
        <CardBody className="p-0">
          <Table>
            <thead>
              <tr><Th>שם</Th><Th>תפקיד</Th><Th>זיהוי</Th><Th>כניסה אחרונה</Th><Th>סטטוס</Th><Th /></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <Td>{u.name}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <Badge tone="neutral">{roleLabel(u.role)}</Badge>
                      {/* What the role actually BUYS. `accessLevel` is the coarse
                          value every server-side gate is written against. */}
                      {u.accessLevel === 'admin' && <Badge tone="brand">גישה מלאה</Badge>}
                    </div>
                  </Td>
                  <Td dir="ltr" className="text-xs">{u.email || u.phone || '—'}</Td>
                  <Td>{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'טרם נכנס'}</Td>
                  <Td><Badge tone={u.isActive ? 'success' : 'neutral'}>{u.isActive ? 'פעיל' : 'כבוי'}</Badge></Td>
                  <Td>
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button size="sm" variant="secondary" disabled={busy} onClick={() => setEditing({ ...u })}>
                        עריכה
                      </Button>
                      <Button size="sm" variant="secondary" disabled={busy} onClick={() => toggleActive(u)}>
                        {u.isActive ? 'השבת' : 'הפעל'}
                      </Button>
                      <Button
                        size="sm" variant="secondary" disabled={busy}
                        onClick={() => setResetting({ user: u, newPassword: '' })}
                      >
                        סיסמה
                      </Button>
                      <Button
                        size="sm" variant="secondary" disabled={!u.isActive || busy}
                        onClick={() => setImpersonating(u)}
                      >
                        התחזות
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>

      {impersonating && (
        <Alert tone="warning" title={`התחזות ל-${impersonating.name}`}>
          הסשן מוגבל ל-15 דקות, וכל פעולה בו נרשמת ביומן עם שתי הזהויות.
          פעולות על החבילה, החיוב והסודות חסומות.
        </Alert>
      )}

      <UserDialog user={editing} busy={busy} onCancel={() => setEditing(null)} onSave={saveUser} />

      <PasswordDialog
        target={resetting}
        onCancel={() => setResetting(null)}
        onSubmit={(newPassword) => setResetting((r) => ({ ...r, newPassword }))}
      />

      {/* The operator's OWN operation password, for both gated actions. */}
      <SensitiveActionPasswordModal
        open={Boolean(impersonating)}
        onCancel={() => setImpersonating(null)}
        onConfirm={startImpersonation}
      />
      <SensitiveActionPasswordModal
        open={Boolean(resetting?.newPassword)}
        onCancel={() => setResetting(null)}
        onConfirm={confirmReset}
      />
    </div>
  );
}

/** Create or edit. The password field exists only on create — a change is a reset. */
function UserDialog({ user, busy, onCancel, onSave }) {
  const [form, setForm] = useState(user || {});
  const [error, setError] = useState(null);
  useEffect(() => { setForm(user || {}); setError(null); }, [user]);

  if (!user) return null;
  const isNew = !form._id;
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  async function submit() {
    setError(null);
    try { await onSave(form); } catch (err) { setError(err.displayMessage || 'השמירה נכשלה'); }
  }

  return (
    <Modal
      open
      onClose={onCancel}
      title={isNew ? 'משתמש חדש' : `עריכת ${form.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>ביטול</Button>
          <Button
            onClick={submit}
            loading={busy}
            disabled={!form.name?.trim() || !form.email?.trim() || (isNew && !form.password)}
          >
            שמירה
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {error && <Alert tone="danger">{error}</Alert>}
        <Field label="שם" htmlFor="u-name" required>
          <Input id="u-name" value={form.name || ''} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="דוא״ל" htmlFor="u-email" required hint="ייחודי אצל הלקוח הזה בלבד.">
          <Input id="u-email" type="email" dir="ltr" value={form.email || ''} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field label="טלפון" htmlFor="u-phone">
          <Input id="u-phone" dir="ltr" value={form.phone || ''} onChange={(e) => set({ phone: e.target.value })} />
        </Field>
        <Field label="תפקיד" htmlFor="u-role" hint="שלושת הראשונים בלבד מקנים גישה מלאה לבק-אופיס.">
          <Select id="u-role" value={form.role || 'Admin'} onChange={(e) => set({ role: e.target.value })}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}{r.full ? ' — גישה מלאה' : ''}</option>
            ))}
          </Select>
        </Field>
        {isNew && (
          <Field label="סיסמה" htmlFor="u-pass" required hint="8 תווים לפחות. מסרו אותה ללקוח בערוץ נפרד.">
            <Input id="u-pass" type="password" autoComplete="new-password" dir="ltr" value={form.password || ''} onChange={(e) => set({ password: e.target.value })} />
          </Field>
        )}
      </div>
    </Modal>
  );
}

/**
 * Step one of a reset: the NEW password. Step two is the operator's own PIN, in
 * the shared modal — two dialogs because they ask for two different secrets, and
 * one form asking for both invites typing the wrong one into the wrong box.
 */
function PasswordDialog({ target, onCancel, onSubmit }) {
  const [value, setValue] = useState('');
  useEffect(() => { setValue(''); }, [target?.user?._id]);

  if (!target || target.newPassword) return null;

  return (
    <Modal
      open
      onClose={onCancel}
      size="sm"
      title={`סיסמה חדשה ל-${target.user.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>ביטול</Button>
          <Button onClick={() => onSubmit(value)} disabled={value.length < 8}>המשך</Button>
        </>
      }
    >
      <div className="space-y-3">
        <Alert tone="warning">
          הסיסמה הקודמת תפסיק לעבוד מייד, וכל הסשנים הפעילים של המשתמש יבוטלו.
          הפעולה נרשמת ביומן הלקוח.
        </Alert>
        <Field label="סיסמה חדשה" htmlFor="np" hint="8 תווים לפחות.">
          <Input id="np" type="password" autoComplete="new-password" dir="ltr" value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
