import { useEffect, useState } from 'react';
import { Modal, Button, Field, Input, Alert } from '@bizzexpo/shared/ui';

/**
 * The second gate on a sensitive field.
 *
 * It asks for the ACTING operator's own operation password — never the password
 * of whoever owns the record being edited. A super-admin editing tenant A's
 * credentials types THEIRS. That is consistent with every call site in Eden David
 * (§4.2), and it is what makes the audit trail meaningful: the password proves
 * who is at the keyboard, not who owns the data.
 *
 * A failure is shown INSIDE this modal rather than behind it, so the form the
 * operator spent time filling in is never lost to a mistyped PIN.
 */
export default function SensitiveActionPasswordModal({ open, onCancel, onConfirm, error: externalError }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) { setPassword(''); setError(null); setBusy(false); }
  }, [open]);

  useEffect(() => { if (externalError) { setError(externalError); setBusy(false); } }, [externalError]);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm(password);
    } catch (err) {
      setError(err.displayMessage || err.message);
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      title="אישור פעולה רגישה"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onCancel}>ביטול</Button>
          <Button type="button" onClick={confirm} loading={busy} disabled={!password}>אישור</Button>
        </>
      }
    >
      <div className="space-y-3">
        {error && <Alert tone="danger">{error}</Alert>}
        <p className="text-sm text-text-muted">
          הפעולה נוגעת בשדה רגיש. הזינו את <strong>סיסמת הפעולות שלכם</strong> כדי לאשר.
        </p>
        <Field label="סיסמת פעולות" htmlFor="op-password">
          <Input
            id="op-password"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && password && confirm()}
            dir="ltr"
          />
        </Field>
      </div>
    </Modal>
  );
}
