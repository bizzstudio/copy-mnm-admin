import { useMemo, useState } from 'react';
import { Card, CardBody, CardHeader, Button, Field, Input, Select } from '@bizzexpo/shared/ui';
import { buildThemeVars, DEFAULT_THEME } from '@bizzexpo/shared';

/** The same swatches the creation wizard offers, so a rebrand starts where a build did. */
const PRESET_BRANDS = ['#3b6fd4', '#c2410c', '#0d9488', '#7c3aed', '#be123c', '#15803d'];

/**
 * The five theme values, the four images and the two mail-from fields.
 *
 * PREVIEWED WITH `buildThemeVars` — the SAME function the server runs to emit the
 * theme before any JS loads. That is the whole reason it is pure: what this panel
 * shows and what the customer's storefront renders come from one implementation,
 * so a preview cannot drift from the thing it previews.
 *
 * A partial save is safe here because the server flattens the patch to dot
 * notation; the fields this form does not send keep their values rather than being
 * replaced along with the subdocument they live in.
 */
export default function BrandingTab({ tenant, onSave, busy }) {
  const [form, setForm] = useState(() => ({
    theme: { ...DEFAULT_THEME, ...(tenant.branding?.theme || {}) },
    logoUrl: tenant.branding?.logoUrl || '',
    logoDarkUrl: tenant.branding?.logoDarkUrl || '',
    faviconUrl: tenant.branding?.faviconUrl || '',
    ogImageUrl: tenant.branding?.ogImageUrl || '',
    emailFromName: tenant.branding?.emailFromName || '',
    emailFromAddress: tenant.branding?.emailFromAddress || '',
  }));

  const setTheme = (patch) => setForm((f) => ({ ...f, theme: { ...f.theme, ...patch } }));
  const previewVars = useMemo(() => buildThemeVars(form.theme), [form.theme]);

  /**
   * An empty image field means "no image", and the API clears with `null` — an
   * empty STRING would store the empty string and every `logoUrl ? …` check in the
   * storefront would then answer false while the field is still, technically, set.
   */
  const submit = () => onSave({
    branding: {
      theme: form.theme,
      logoUrl: form.logoUrl.trim() || null,
      logoDarkUrl: form.logoDarkUrl.trim() || null,
      faviconUrl: form.faviconUrl.trim() || null,
      ogImageUrl: form.ogImageUrl.trim() || null,
      emailFromName: form.emailFromName.trim() || null,
      emailFromAddress: form.emailFromAddress.trim() || null,
    },
  });

  const colourRow = (key, label, hint) => (
    <Field label={label} htmlFor={key} hint={hint}>
      <div className="flex items-center gap-3">
        <input
          id={key}
          type="color"
          value={form.theme[key]}
          onChange={(e) => setTheme({ [key]: e.target.value })}
          className="h-10 w-16 cursor-pointer rounded-input border border-border"
        />
        <Input value={form.theme[key]} onChange={(e) => setTheme({ [key]: e.target.value })} dir="ltr" />
      </div>
    </Field>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="ערכת נושא" description="חמישה ערכים. כל השאר נגזר מהם." />
            <CardBody className="space-y-3">
              {colourRow('brand', 'צבע מותג', 'ממנו נגזרת סקאלה של 11 מדרגות וניגודיות תקנית.')}
              <div className="flex flex-wrap gap-2">
                {PRESET_BRANDS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTheme({ brand: c })}
                    style={{ background: c }}
                    className="size-8 rounded-full border border-border"
                    aria-label={c}
                  />
                ))}
              </div>
              {colourRow('accent', 'צבע משני')}
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="מצב" htmlFor="mode">
                  <Select id="mode" value={form.theme.mode} onChange={(e) => setTheme({ mode: e.target.value })}>
                    <option value="light">בהיר</option>
                    <option value="dark">כהה</option>
                  </Select>
                </Field>
                <Field label="עיגול פינות" htmlFor="radius" hint="יחידת CSS, למשל 0.75rem.">
                  <Input id="radius" value={form.theme.radius} onChange={(e) => setTheme({ radius: e.target.value })} dir="ltr" />
                </Field>
                <Field label="גופן" htmlFor="font" hint="ערך font-family מלא.">
                  <Input id="font" value={form.theme.font} onChange={(e) => setTheme({ font: e.target.value })} dir="ltr" />
                </Field>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="תמונות" description="כתובות URL. השדות הריקים נשמרים כ«ללא תמונה»." />
            <CardBody>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['logoUrl', 'לוגו'],
                  ['logoDarkUrl', 'לוגו למצב כהה'],
                  ['faviconUrl', 'Favicon'],
                  ['ogImageUrl', 'תמונת שיתוף (OG)'],
                ].map(([key, label]) => (
                  <Field key={key} label={label} htmlFor={key}>
                    <Input
                      id={key} dir="ltr" placeholder="https://…"
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    />
                  </Field>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="שולח הדוא״ל" description="מופיע כשולח בהודעות ללקוחות הקצה." />
            <CardBody>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="שם השולח" htmlFor="efn">
                  <Input id="efn" value={form.emailFromName} onChange={(e) => setForm((f) => ({ ...f, emailFromName: e.target.value }))} />
                </Field>
                <Field label="כתובת השולח" htmlFor="efa">
                  <Input id="efa" type="email" dir="ltr" value={form.emailFromAddress} onChange={(e) => setForm((f) => ({ ...f, emailFromAddress: e.target.value }))} />
                </Field>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="תצוגה מקדימה" description="נבנית באותה פונקציה שהשרת מריץ." />
          <CardBody>
            <div style={previewVars} className="space-y-3 rounded-card border border-border p-4">
              <div className="text-sm font-semibold" style={{ color: 'var(--bz-text)' }}>
                {tenant.nameHe}
              </div>
              <button
                type="button"
                className="w-full rounded-input px-4 py-2 text-sm font-medium"
                style={{ background: 'var(--bz-brand-500)', color: 'var(--bz-brand-contrast)' }}
              >
                כפתור ראשי
              </button>
              <button
                type="button"
                className="w-full rounded-input px-4 py-2 text-sm font-medium"
                style={{ background: 'var(--bz-accent-500)', color: 'var(--bz-accent-contrast)' }}
              >
                כפתור משני
              </button>
              <div className="flex gap-1">
                {[100, 300, 500, 700, 900].map((s) => (
                  <div key={s} className="h-6 flex-1 rounded" style={{ background: `var(--bz-brand-${s})` }} title={`brand-${s}`} />
                ))}
              </div>
              <p className="text-xs" style={{ color: 'var(--bz-text-muted)' }}>
                ניגודיות הטקסט נבחרת אוטומטית לפי הצבע שנבחר.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-start">
        <Button onClick={submit} loading={busy}>שמירה</Button>
      </div>
    </div>
  );
}
