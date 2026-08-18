import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Card, CardBody, CardHeader, Input, Field, Select, Checkbox,
  PageHeading, Alert, Badge, Spinner,
} from '@bizzexpo/shared/ui';
import { buildThemeVars, DEFAULT_THEME } from '@bizzexpo/shared';
import PageContainer from '@/components/common/PageContainer';
import PlatformServices from '@/services/PlatformServices';
import { useUser } from '@/hooks/usePlatformRole';

/**
 * `/tenants/new` — identity → plan → modules → branding (live preview) → domain →
 * first admin.
 *
 * The branding step previews with the SAME `buildThemeVars` the server uses to
 * render the real thing, so what the operator sees here is exactly what the tenant
 * gets. Sharing that function is the only reason the preview can be trusted.
 */

const STEPS = [
  { id: 'identity', label: 'זהות' },
  { id: 'plan', label: 'חבילה' },
  { id: 'modules', label: 'מודולים' },
  { id: 'branding', label: 'מיתוג' },
  { id: 'domain', label: 'דומיין' },
  { id: 'admin', label: 'מנהל ראשון' },
];

const PRESET_BRANDS = ['#3b6fd4', '#c2410c', '#16a34a', '#7c3aed', '#0d9488', '#db2777'];

export default function TenantWizard() {
  const { isSuperAdmin } = useUser();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [slugState, setSlugState] = useState({ checking: false, available: null, reason: null });
  const [modules, setModules] = useState(null);

  const [form, setForm] = useState({
    slug: '', nameHe: '', nameEn: '', legalName: '', companyNumber: '',
    planKey: 'growth',
    moduleKeys: ['store'],
    theme: { ...DEFAULT_THEME },
    customDomain: '',
    firstAdmin: { name: '', email: '', phone: '', password: '', operationPassword: '1234' },
  });

  useEffect(() => { if (!isSuperAdmin) navigate('/', { replace: true }); }, [isSuperAdmin, navigate]);

  useEffect(() => {
    PlatformServices.listModules().then((d) => setModules(d.modules)).catch(() => setModules([]));
  }, []);

  /** Debounced slug availability. The slug is IMMUTABLE, so getting it right up
   *  front matters more than for an ordinary field. */
  useEffect(() => {
    const slug = form.slug.trim();
    if (slug.length < 3) { setSlugState({ checking: false, available: null, reason: null }); return; }
    setSlugState((s) => ({ ...s, checking: true }));
    const t = setTimeout(() => {
      PlatformServices.checkSlug(slug)
        .then((r) => setSlugState({ checking: false, available: r.available, reason: r.reason }))
        .catch(() => setSlugState({ checking: false, available: null, reason: null }));
    }, 350);
    return () => clearTimeout(t);
  }, [form.slug]);

  // The exact variables the tenant's apps will receive. Same function, same output.
  const previewVars = useMemo(() => buildThemeVars(form.theme), [form.theme]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setTheme = (patch) => setForm((f) => ({ ...f, theme: { ...f.theme, ...patch } }));
  const setAdmin = (patch) => setForm((f) => ({ ...f, firstAdmin: { ...f.firstAdmin, ...patch } }));

  const toggleModule = (key) =>
    setForm((f) => ({
      ...f,
      moduleKeys: f.moduleKeys.includes(key)
        ? f.moduleKeys.filter((k) => k !== key)
        : [...f.moduleKeys, key],
    }));

  const canAdvance = () => {
    switch (STEPS[step].id) {
      case 'identity':
        return form.slug.length >= 3 && slugState.available === true && form.nameHe && form.nameEn;
      case 'admin':
        return form.firstAdmin.email && form.firstAdmin.password.length >= 8;
      default:
        return true;
    }
  };

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const created = await PlatformServices.createTenant({
        slug: form.slug.trim(),
        nameHe: form.nameHe,
        nameEn: form.nameEn,
        legalName: form.legalName,
        companyNumber: form.companyNumber,
        branding: { theme: form.theme },
        moduleKeys: form.moduleKeys,
        firstAdmin: form.firstAdmin,
      });
      navigate(`/platform/tenants/${created.tenant._id}`);
    } catch (err) {
      setError(err.displayMessage);
      setSaving(false);
    }
  }

  if (!isSuperAdmin) return null;

  const grouped = {
    app: modules?.filter((m) => m.kind === 'app' && !m.isCore) ?? [],
    feature: modules?.filter((m) => m.kind === 'feature') ?? [],
    integration: modules?.filter((m) => m.kind === 'integration') ?? [],
  };

  return (
    // A one-column form reads badly at 1280px; it wants a narrower measure.
    <PageContainer maxWidth="max-w-4xl">
      <PageHeading title="לקוח חדש" description="הלקוח יקבל ארבע כתובות שעובדות מיד — אפשר להדגים אותו ביום הראשון." />

      {/* progress */}
      <ol className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <Badge tone={i === step ? 'brand' : i < step ? 'success' : 'neutral'}>
              {i + 1}. {s.label}
            </Badge>
          </li>
        ))}
      </ol>

      {error && <div className="mb-4"><Alert tone="danger" title="לא ניתן ליצור את הלקוח">{error}</Alert></div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader title={STEPS[step].label} />
          <CardBody className="space-y-4">
            {STEPS[step].id === 'identity' && (
              <>
                <Field
                  label="מזהה (slug)"
                  required
                  htmlFor="slug"
                  hint="נכנס לכתובת, לעגלת הקניות ולקבצים — ולכן לא ניתן לשינוי לעולם."
                  error={
                    slugState.available === false
                      ? slugState.reason || 'המזהה תפוס'
                      : undefined
                  }
                >
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="alpha"
                    invalid={slugState.available === false}
                    dir="ltr"
                  />
                </Field>
                {slugState.checking && <p className="text-xs text-text-muted">בודק זמינות…</p>}
                {slugState.available === true && (
                  <p className="text-xs text-success-500">
                    ✓ פנוי — הלקוח יקבל את {form.slug}.bizzexpo.co.il ועוד שלוש כתובות
                  </p>
                )}
                <Field label="שם בעברית" required htmlFor="nameHe">
                  <Input id="nameHe" value={form.nameHe} onChange={(e) => set({ nameHe: e.target.value })} />
                </Field>
                <Field label="שם באנגלית" required htmlFor="nameEn">
                  <Input id="nameEn" value={form.nameEn} onChange={(e) => set({ nameEn: e.target.value })} dir="ltr" />
                </Field>
                <Field label="שם משפטי" htmlFor="legalName">
                  <Input id="legalName" value={form.legalName} onChange={(e) => set({ legalName: e.target.value })} />
                </Field>
                <Field label="ח.פ / ע.מ" htmlFor="companyNumber">
                  <Input id="companyNumber" value={form.companyNumber} onChange={(e) => set({ companyNumber: e.target.value })} dir="ltr" />
                </Field>
              </>
            )}

            {STEPS[step].id === 'plan' && (
              <Field label="חבילה" htmlFor="plan" hint="החבילה קובעת אילו מודולים זמינים בכלל, דרך minPlanTier.">
                <Select id="plan" value={form.planKey} onChange={(e) => set({ planKey: e.target.value })}>
                  <option value="starter">בסיסי</option>
                  <option value="growth">צמיחה</option>
                  <option value="scale">ארגוני</option>
                </Select>
              </Field>
            )}

            {STEPS[step].id === 'modules' && (
              modules === null ? <Spinner /> : (
                <div className="space-y-5">
                  {[
                    ['app', 'אפליקציות'],
                    ['feature', 'יכולות'],
                    ['integration', 'אינטגרציות'],
                  ].map(([kind, title]) => (
                    <section key={kind}>
                      <h4 className="mb-2 text-sm font-semibold">{title}</h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {grouped[kind].map((m) => (
                          <Checkbox
                            key={m.key}
                            checked={form.moduleKeys.includes(m.key)}
                            onChange={() => toggleModule(m.key)}
                            // platformManaged is bizzstudio's responsibility, so the
                            // operator cannot hand it to a tenant from here.
                            disabled={m.platformManaged}
                            label={
                              <span>
                                {m.displayNameHe}
                                {m.requires?.length > 0 && (
                                  <span className="ms-1 text-xs text-text-muted">
                                    (דורש: {m.requires.join(', ')})
                                  </span>
                                )}
                              </span>
                            }
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                  <Alert tone="info">
                    תלויות מודלקות אוטומטית. סימון מודול שדורש אחר ידליק גם אותו — לא ידחה את הבקשה.
                  </Alert>
                </div>
              )
            )}

            {STEPS[step].id === 'branding' && (
              <>
                <Field label="צבע מותג" htmlFor="brand" hint="ממנו נגזרת סקאלה של 11 מדרגות וניגודיות תקנית.">
                  <div className="flex items-center gap-3">
                    <input
                      id="brand"
                      type="color"
                      value={form.theme.brand}
                      onChange={(e) => setTheme({ brand: e.target.value })}
                      className="h-10 w-16 cursor-pointer rounded-input border border-border"
                    />
                    <Input value={form.theme.brand} onChange={(e) => setTheme({ brand: e.target.value })} dir="ltr" />
                  </div>
                </Field>
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
                <Field label="צבע משני" htmlFor="accent">
                  <div className="flex items-center gap-3">
                    <input
                      id="accent"
                      type="color"
                      value={form.theme.accent}
                      onChange={(e) => setTheme({ accent: e.target.value })}
                      className="h-10 w-16 cursor-pointer rounded-input border border-border"
                    />
                    <Input value={form.theme.accent} onChange={(e) => setTheme({ accent: e.target.value })} dir="ltr" />
                  </div>
                </Field>
                <Field label="מצב" htmlFor="mode">
                  <Select id="mode" value={form.theme.mode} onChange={(e) => setTheme({ mode: e.target.value })}>
                    <option value="light">בהיר</option>
                    <option value="dark">כהה</option>
                  </Select>
                </Field>
              </>
            )}

            {STEPS[step].id === 'domain' && (
              <>
                <Alert tone="success" title="ארבע כתובות נוצרות אוטומטית">
                  <ul className="mt-1 space-y-0.5 text-xs" dir="ltr">
                    <li>{form.slug || 'slug'}.bizzexpo.co.il — חנות</li>
                    <li>{form.slug || 'slug'}-admin.bizzexpo.co.il — ניהול</li>
                    <li>{form.slug || 'slug'}-picking.bizzexpo.co.il — ליקוט</li>
                    <li>{form.slug || 'slug'}-agents.bizzexpo.co.il — סוכנים</li>
                  </ul>
                </Alert>
                <Field
                  label="דומיין מותאם (אופציונלי)"
                  htmlFor="customDomain"
                  hint="ניתן להוסיף גם מאוחר יותר. הכתובת האוטומטית תמשיך לעבוד תמיד."
                >
                  <Input
                    id="customDomain"
                    value={form.customDomain}
                    onChange={(e) => set({ customDomain: e.target.value })}
                    placeholder="shop.example.co.il"
                    dir="ltr"
                  />
                </Field>
              </>
            )}

            {STEPS[step].id === 'admin' && (
              <>
                <Field label="שם" htmlFor="adminName">
                  <Input id="adminName" value={form.firstAdmin.name} onChange={(e) => setAdmin({ name: e.target.value })} />
                </Field>
                <Field label="מייל" required htmlFor="adminEmail">
                  <Input id="adminEmail" type="email" value={form.firstAdmin.email} onChange={(e) => setAdmin({ email: e.target.value })} dir="ltr" />
                </Field>
                <Field label="טלפון" htmlFor="adminPhone">
                  <Input id="adminPhone" value={form.firstAdmin.phone} onChange={(e) => setAdmin({ phone: e.target.value })} dir="ltr" />
                </Field>
                <Field
                  label="סיסמה ראשונית"
                  required
                  htmlFor="adminPassword"
                  hint="לפחות 8 תווים. המשתמש יידרש להחליף אותה בכניסה הראשונה."
                >
                  {/* A plain input, not SecretInput: this value is TYPED by the
                      operator, so we want the password manager's help, not its
                      interference. SecretInput is for API keys, where autofill
                      overwrites the field and breaks the integration. */}
                  <Input
                    id="adminPassword"
                    type="password"
                    autoComplete="new-password"
                    value={form.firstAdmin.password}
                    onChange={(e) => setAdmin({ password: e.target.value })}
                    dir="ltr"
                  />
                </Field>
              </>
            )}
          </CardBody>
        </Card>

        {/* live preview — same buildThemeVars the server uses */}
        <Card className="h-fit">
          <CardHeader title="תצוגה מקדימה" description="בדיוק מה שהלקוח יקבל" />
          <CardBody>
            <div
              style={previewVars}
              className="space-y-3 rounded-card border border-border p-4"
            >
              <div className="text-sm font-semibold" style={{ color: 'var(--bz-text)' }}>
                {form.nameHe || 'שם הלקוח'}
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
                  <div
                    key={s}
                    className="h-6 flex-1 rounded"
                    style={{ background: `var(--bz-brand-${s})` }}
                    title={`brand-${s}`}
                  />
                ))}
              </div>
              <p className="text-xs" style={{ color: 'var(--bz-text-muted)' }}>
                ניגודיות הטקסט נבחרת אוטומטית לפי הצבע שנבחר.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="secondary" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          חזרה
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
            המשך
          </Button>
        ) : (
          <Button onClick={submit} loading={saving} disabled={!canAdvance()}>
            צור לקוח
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
