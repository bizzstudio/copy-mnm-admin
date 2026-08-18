import { useState } from 'react';
import { hasSensitiveChange } from '@bizzexpo/shared';
import PlatformServices from '@/services/PlatformServices';

/**
 * Saving a patch to `PATCH /platform/tenants/:id` from any of the tabs.
 *
 * FIVE TABS EDIT THE SAME DOCUMENT. Identity, branding, locale, contact, security
 * and the plan are all one `Tenant`, so without this every tab would carry its own
 * copy of "call the endpoint, decide about the password, merge the answer back,
 * toast, show the error" — five chances for them to disagree about any of it.
 *
 * THE PASSWORD IS DECIDED HERE, BEFORE THE REQUEST, by asking the SAME
 * `hasSensitiveChange` the server's `requireOperationPassword` asks. Waiting for a
 * 401 and re-sending would work too, but a 401 is also what an expired session
 * looks like, and a screen that answers both with a PIN prompt teaches the
 * operator to type their password at a session timeout.
 *
 * @param {object}   args
 * @param {string}   args.tenantId
 * @param {(tenant: object) => void} args.onSaved  hand the fresh document to the page
 * @param {object}   args.toasts  a `useToasts()` instance
 */
export function useTenantSave({ tenantId, onSaved, toasts }) {
  const [busy, setBusy] = useState(false);
  /** The patch waiting for a password. Non-null means the modal is open. */
  const [pending, setPending] = useState(null);

  async function send(patch, operationPassword) {
    setBusy(true);
    try {
      const { tenant } = await PlatformServices.updateTenant(
        tenantId,
        operationPassword ? { ...patch, operationPassword } : patch
      );
      onSaved(tenant);
      setPending(null);
      toasts.success('נשמר');
      return true;
    } catch (err) {
      /**
       * A failure while the modal is OPEN is rethrown, not toasted: the modal shows
       * it inline and keeps the typed password, so a mistyped PIN does not close
       * the dialog and lose the form behind it.
       */
      if (operationPassword) throw err;
      toasts.error(err.displayMessage || 'השמירה נכשלה');
      return false;
    } finally {
      setBusy(false);
    }
  }

  return {
    busy,
    /** True while a patch is waiting for the operator's password. */
    passwordRequired: pending !== null,
    cancelPassword: () => setPending(null),
    confirmPassword: (password) => send(pending, password),
    /**
     * `planId` and `planOverrides` are in `SENSITIVE_FIELDS`; a name or a colour is
     * not. Both live on this one document, so the question is per-SAVE.
     */
    save: (patch) => {
      if (hasSensitiveChange(patch)) {
        setPending(patch);
        return Promise.resolve(false);
      }
      return send(patch);
    },
  };
}
