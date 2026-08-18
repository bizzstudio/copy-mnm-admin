import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardBody, CardHeader, Tabs, Badge, Table, Th, Td,
  PageHeading, Alert, Spinner, Input, EmptyState,
} from '@bizzexpo/shared/ui';
import { MODULE_CREATION_POLICY } from '@bizzexpo/shared';
import PageContainer from '@/components/common/PageContainer';
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
 *
 * The whole catalogue is fetched ONCE and filtered in memory. It is ~35 rows
 * that change only on a deploy, so a request per tab spent a round trip and a
 * repaint on data the browser already had — and one fetch is what lets each tab
 * carry its own count, which needs all three kinds at the same time.
 */

const KINDS = [
  { id: 'app', label: 'אפליקציות' },
  { id: 'feature', label: 'יכולות' },
  { id: 'integration', label: 'אינטגרציות' },
];

/** Seed categories, in Hebrew. An unknown category renders as its raw key. */
const CATEGORY_LABELS = {
  sales: 'מכירות',
  customers: 'לקוחות',
  catalog: 'קטלוג',
  inventory: 'מלאי',
  ops: 'תפעול',
  content: 'תוכן',
  finance: 'כספים',
  store: 'חנות',
  payment: 'תשלומים',
  messaging: 'הודעות',
  marketing: 'שיווק',
  auth: 'הזדהות',
  infra: 'תשתית',
};

/** Why this kind has no "add" button. An integration has one, so it has no note. */
const KIND_NOTE = {
  app: 'אפליקציה היא פריסה, לא שורה במסד נתונים — לכן הרשימה סגורה ונקבעת ב-seed.',
  feature: 'פיצ׳ר הוא קוד — הוא נוסף ב-seed כשהמפתח בונה אותו.',
};

/** The same table chrome as `/platform/tenants`, so the two read as one product. */
const TABLE_CHROME = '[&_th]:px-4 [&_td]:px-4 [&_td]:py-3 [&_tbody_tr:last-child_td]:border-b-0';

/** A module key is written in code — it stays LTR on an RTL page. */
function KeyChip({ children }) {
  return (
    <code dir="ltr" className="rounded bg-surface-muted px-1.5 py-0.5 text-xs text-text-muted">
      {children}
    </code>
  );
}

/**
 * The flags worth seeing at a glance, read off the row — so an integration added
 * at runtime describes itself without an edit here.
 */
function attributesOf(m) {
  const out = [];
  if (m.isActive === false) out.push({ tone: 'danger', label: 'מושבת' });
  if (m.isCore) out.push({ tone: 'brand', label: 'ליבה' });
  if (m.platformManaged) out.push({ tone: 'warning', label: 'מנוהל פלטפורמה' });
  if (m.defaultEnabled) out.push({ tone: 'success', label: 'ברירת מחדל' });
  if (m.minPlanTier > 0) out.push({ tone: 'info', label: `חבילה ${m.minPlanTier}+` });
  if (m.exclusiveGroup) out.push({ tone: 'info', label: `בלעדי: ${m.exclusiveGroup}` });
  if (m.oauthProvider) out.push({ tone: 'neutral', label: 'OAuth' });
  if (m.supportsWebhook) out.push({ tone: 'neutral', label: 'Webhook' });
  if (m.supportsTestMode) out.push({ tone: 'neutral', label: 'מצב בדיקה' });
  if (m.supportsRefund) out.push({ tone: 'neutral', label: 'זיכויים' });
  if (m.supportsInvoice) out.push({ tone: 'neutral', label: 'חשבוניות' });
  if (m.supportsCustomDomain) out.push({ tone: 'neutral', label: 'דומיין מותאם' });
  return out;
}

export default function PlatformModules() {
  const { isSuperAdmin } = useUser();
  const navigate = useNavigate();
  const [kind, setKind] = useState('app');
  const [search, setSearch] = useState('');
  const [modules, setModules] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { if (!isSuperAdmin) navigate('/', { replace: true }); }, [isSuperAdmin, navigate]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    PlatformServices.listModules()
      // A body that is not an array has to land as "no modules" — not as a crash
      // inside `.filter`, and not as a spinner that never stops.
      .then((d) => { if (!cancelled) setModules(Array.isArray(d?.modules) ? d.modules : []); })
      .catch((err) => { if (!cancelled) setError(err.displayMessage); });
    return () => { cancelled = true; };
  }, [isSuperAdmin]);

  /** Names across ALL kinds, so a feature can name the integration it requires. */
  const nameByKey = useMemo(
    () => new Map((modules || []).map((m) => [m.key, m.displayNameHe || m.key])),
    [modules]
  );

  const counts = useMemo(() => {
    const c = { app: 0, feature: 0, integration: 0 };
    for (const m of modules || []) if (c[m.kind] !== undefined) c[m.kind] += 1;
    return c;
  }, [modules]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (modules || [])
      .filter((m) => m.kind === kind)
      .filter((m) => !q || [m.key, m.displayNameHe, m.displayNameEn, m.descriptionHe, m.category]
        .some((v) => String(v || '').toLowerCase().includes(q)))
      // The API answers in insertion order; the catalogue only reads as a
      // product when related capabilities sit next to each other.
      .sort((a, b) =>
        String(a.category || '').localeCompare(String(b.category || '')) ||
        (a.sortOrder ?? 100) - (b.sortOrder ?? 100) ||
        String(a.displayNameHe || '').localeCompare(String(b.displayNameHe || ''), 'he'));
  }, [modules, kind, search]);

  if (!isSuperAdmin) return null;

  const canCreate = MODULE_CREATION_POLICY[kind] === 'runtime-allowed';
  const total = counts[kind];

  return (
    <PageContainer>
      <PageHeading
        title="מודולים"
        description="מה קיים במוצר. מה פתוח ללקוח מסוים נקבע במסך ההגדרות שלו."
      />

      {/* Tabs, toolbar and results share one card: the chrome stays put while the
          body swaps between spinner, error, empty state and table.
          `overflow-hidden` so the last row's hover fill cannot paint a square
          corner over the card's rounded one. */}
      <Card className="overflow-hidden">
        <Tabs
          items={KINDS.map((k) => ({
            ...k,
            label: (
              <span className="flex items-center gap-2">
                {k.label}
                {modules && (
                  <span className="rounded-full bg-surface-muted px-1.5 text-xs tabular-nums text-text-muted">
                    {counts[k.id]}
                  </span>
                )}
              </span>
            ),
          }))}
          active={kind}
          onChange={setKind}
        />

        <CardHeader
          title={KINDS.find((k) => k.id === kind).label}
          description={
            modules
              ? (search ? `${rows.length} מתוך ${total} מודולים` : `${total} מודולים`)
              : 'טוען…'
          }
          actions={
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש לפי שם, מפתח או קטגוריה"
              aria-label="חיפוש מודולים"
              className="w-56 sm:w-64"
            />
          }
        />

        {!canCreate && KIND_NOTE[kind] && (
          <div className="border-b border-border p-4">
            <Alert tone="info">{KIND_NOTE[kind]}</Alert>
          </div>
        )}

        {error && (
          <CardBody>
            <Alert tone="danger" title="שגיאה בטעינת המודולים">{error}</Alert>
          </CardBody>
        )}

        {!modules && !error && (
          <div className="flex justify-center p-12"><Spinner size="lg" /></div>
        )}

        {modules && rows.length === 0 && (
          <div className="p-4">
            <EmptyState
              title={search ? 'אין מודול שתואם את החיפוש' : 'אין מודולים מסוג זה'}
              description={search ? 'נסו שם, מפתח או קטגוריה אחרים.' : undefined}
            />
          </div>
        )}

        {modules && rows.length > 0 && (
          <Table className={TABLE_CHROME}>
            <thead>
              <tr>
                <Th className="w-2/5">מודול</Th>
                <Th className="whitespace-nowrap">מפתח</Th>
                <Th className="whitespace-nowrap">קטגוריה</Th>
                <Th className="whitespace-nowrap">תלויות</Th>
                <Th>מאפיינים</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const attrs = attributesOf(m);
                return (
                  <tr key={m.key} className="align-top transition-colors hover:bg-surface-muted">
                    <Td>
                      <div className="font-medium text-text">{m.displayNameHe || m.key}</div>
                      {m.descriptionHe && (
                        <div className="mt-0.5 text-xs leading-relaxed text-text-muted">
                          {m.descriptionHe}
                        </div>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap"><KeyChip>{m.key}</KeyChip></Td>
                    <Td className="whitespace-nowrap">
                      {m.category
                        ? <Badge>{CATEGORY_LABELS[m.category] || m.category}</Badge>
                        : <span className="text-xs text-text-muted">—</span>}
                    </Td>
                    <Td>
                      {m.requires?.length ? (
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-text-muted">
                          {m.requires.map((r) => (
                            <span key={r}>{nameByKey.get(r) || r}</span>
                          ))}
                        </div>
                      ) : <span className="text-xs text-text-muted">—</span>}
                    </Td>
                    <Td>
                      {attrs.length ? (
                        <div className="flex flex-wrap gap-1">
                          {attrs.map((a) => (
                            <Badge key={a.label} tone={a.tone}>{a.label}</Badge>
                          ))}
                        </div>
                      ) : <span className="text-xs text-text-muted">—</span>}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </PageContainer>
  );
}
