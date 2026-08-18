import { useState } from 'react';
import { Card, CardBody, CardHeader, Badge, Toggle } from '@bizzexpo/shared/ui';
import { sectionsForKind } from '@bizzexpo/shared';
import PlatformServices from '@/services/PlatformServices';

const KIND_TITLE = { app: 'אפליקציות', feature: 'יכולות', integration: 'אינטגרציות' };

/**
 * Three groups by `kind`, one `ModuleCard` each.
 *
 * The card renders from `sectionsForKind(kind)` — the shared capability matrix —
 * so there is no `if (kind === 'integration')` in this component. Adding a fourth
 * kind would mean a row in the matrix, not a branch here.
 *
 * ONE TOGGLE CAN MOVE SEVERAL ROWS. The server applies `requires` by switching
 * prerequisites ON and `conflictsWith` / `exclusiveGroup` by switching competitors
 * OFF, and returns both lists. A card holding its own `isEnabled` would show the
 * click it made and miss every cascade, so the operator would see a stale screen
 * until they reloaded — which is exactly when they would conclude it is broken.
 */
export default function ModulesTab({ tenant, modules, onModulesChange, toasts }) {
  const [busyKey, setBusyKey] = useState(null);

  async function setEnabled(mod, next) {
    setBusyKey(mod.moduleKey);
    try {
      const { module: saved, alsoEnabled, alsoDisabled } = await PlatformServices.updateTenantModule(
        tenant._id,
        mod.moduleKey,
        { isEnabled: next }
      );

      const on = new Set(alsoEnabled || []);
      const off = new Set(alsoDisabled || []);
      onModulesChange(modules.map((r) => {
        if (r.moduleKey === mod.moduleKey) return { ...r, ...saved };
        if (on.has(r.moduleKey)) return { ...r, isEnabled: true };
        if (off.has(r.moduleKey)) return { ...r, isEnabled: false };
        return r;
      }));

      // Name the cascade. A prerequisite that switched itself on without saying so
      // is indistinguishable from a bug.
      const label = (keys) => keys.map((k) => nameOf(modules, k)).join(', ');
      if (on.size) toasts.info(`הופעלו גם מודולים נדרשים: ${label([...on])}`);
      if (off.size) toasts.info(`כובו מודולים מתנגשים: ${label([...off])}`);
      if (!on.size && !off.size) {
        toasts.success(saved.isEnabled ? 'המודול הופעל' : 'המודול כובה');
      }
    } catch (err) {
      // The server refuses for reasons only it knows (an unverified domain, a
      // missing required credential, a core module) and says so bilingually —
      // show ITS sentence rather than inventing a vaguer one.
      toasts.error(err.displayMessage || 'השינוי נכשל');
    } finally {
      setBusyKey(null);
    }
  }

  const grouped = ['app', 'feature', 'integration'].map((kind) => ({
    kind,
    rows: modules.filter((m) => m.kind === kind),
  }));

  return (
    <div className="space-y-4">
      {grouped.map(({ kind, rows }) => (
        <Card key={kind}>
          <CardHeader
            title={KIND_TITLE[kind]}
            description={`${rows.filter((r) => r.isEnabled).length} / ${rows.length} פעילים`}
          />
          <CardBody className="space-y-3">
            {rows.length === 0 && <p className="text-sm text-text-muted">אין מודולים מסוג זה.</p>}
            {rows.map((m) => (
              <ModuleCard
                key={m.moduleKey}
                module={m}
                tenant={tenant}
                busy={busyKey === m.moduleKey}
                disabled={busyKey !== null}
                onToggle={(next) => setEnabled(m, next)}
              />
            ))}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

const nameOf = (rows, key) => rows.find((r) => r.moduleKey === key)?.displayNameHe || key;

/**
 * Why a toggle may be refused BEFORE the request, and what to say about it.
 *
 * Two states lock the control, and both are locks the server also enforces —
 * `isCore`, which is permanent, and `isRetired`, where only the off direction is
 * still accepted. Everything else that could fail — an app with no verified
 * domain, an integration missing a required credential, a prerequisite that cannot
 * itself be switched on — is conditional and fixable, and the server's own message
 * explains it far better than a greyed-out switch does. Those are NOTES, shown
 * next to a working toggle.
 */
function moduleNotes(mod, tenant) {
  const notes = [];
  if (mod.isCore) notes.push({ tone: 'brand', text: 'ליבה · לא ניתן לכיבוי' });
  if (mod.isRetired) notes.push({ tone: 'danger', text: 'הוצא מהקטלוג · ניתן לכיבוי בלבד' });
  if (mod.platformManaged) notes.push({ tone: 'warning', text: 'מנוהל פלטפורמה' });
  if (mod.isImplemented === false) notes.push({ tone: 'warning', text: 'טרם ממומש בקוד' });
  if ((mod.minPlanTier ?? 0) > (tenant.planTier ?? 0)) {
    notes.push({ tone: 'danger', text: `דורש חבילה בדרגה ${mod.minPlanTier}` });
  }
  return notes;
}

/**
 * Rendered THROUGH `Toggle`'s own `label`/`description` slots rather than beside a
 * bare switch.
 *
 * Two reasons, and the first is not cosmetic: `Toggle` associates its label with
 * the control, so the switch has an accessible name. A name rendered next to it
 * announces as "switch, unlabelled", which for thirty near-identical rows is a
 * screen reader reading out thirty anonymous switches. The second is that the
 * hand-rolled version was re-implementing the primitive's own
 * `flex items-start justify-between` row directly on top of it.
 */
function ModuleCard({ module: mod, tenant, busy, disabled, onToggle }) {
  // `kind` is a required enum on the stored row, so a retired entry still has a
  // real one and the matrix lookup holds.
  const sections = sectionsForKind(mod.kind);
  const notes = moduleNotes(mod, tenant);

  /**
   * `isRetired` allows the off direction only — the same asymmetry the server
   * applies, mirrored here so the click that would 404 is never offered.
   */
  const locked = mod.isCore || (mod.isRetired && !mod.isEnabled);

  return (
    <div className="rounded-input border border-border p-3">
      <Toggle
        id={`module-${mod.moduleKey}`}
        checked={mod.isEnabled}
        onChange={onToggle}
        disabled={locked || disabled}
        label={
          <>
            {mod.displayNameHe || mod.moduleKey}
            <code className="ms-2 text-xs font-normal text-text-muted" dir="ltr">{mod.moduleKey}</code>
          </>
        }
        description={
          <>
            {mod.descriptionHe}
            <span className="mt-1 flex flex-wrap gap-1">
              {/* The sections THIS kind exposes, straight from the shared matrix. */}
              {sections.map((s) => <Badge key={s} tone="neutral">{s}</Badge>)}
              {notes.map((n) => <Badge key={n.text} tone={n.tone}>{n.text}</Badge>)}
            </span>
            {busy && <span className="mt-1 block text-brand-700">שומר…</span>}
          </>
        }
      />
    </div>
  );
}
