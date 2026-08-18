import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tabs, Button, PageHeading, ContextBanner, Spinner, Alert, ToastStack,
} from '@bizzexpo/shared/ui';
import PageContainer from '@/components/common/PageContainer';
import PlatformServices from '@/services/PlatformServices';
import SensitiveActionPasswordModal from '@/components/common/SensitiveActionPasswordModal';
import { useToasts } from '@/hooks/useToasts';
import { useUser } from '@/hooks/usePlatformRole';

import { useTenantSave } from './tenantSettings/useTenantSave';
import OverviewTab from './tenantSettings/OverviewTab';
import ModulesTab from './tenantSettings/ModulesTab';
import BrandingTab from './tenantSettings/BrandingTab';
import DomainsTab from './tenantSettings/DomainsTab';
import UsersTab from './tenantSettings/UsersTab';
import PlanTab from './tenantSettings/PlanTab';
import AuditTab from './tenantSettings/AuditTab';

/**
 * `/tenants/:id/settings` — the Eden David `/admins/:id/settings` pattern.
 *
 * WHY A SEPARATE PAGE, not `/settings?tenantId=`:
 * the ordinary settings screens are wired end-to-end to the SIGNED-IN operator.
 * Reusing them for another account means passing an explicit `tenant` prop through
 * every tab, and a page of its own is also the only honest place to put a
 * permanent context banner — without it a super-admin will eventually save the
 * wrong account's data. That banner is the whole reason for the separate route.
 *
 * Every tab component takes `tenant` as a PROP and never reads it from context.
 *
 * THE DOCUMENT LIVES HERE, not in the tabs. Five of the seven tabs edit fields of
 * one `Tenant`, and a tab is unmounted the moment another is picked — so a tab
 * holding its own copy would throw away an unsaved edit on a glance at the journal
 * and come back showing stale values, which reads as the save not having happened.
 * One fetch, one document, one `setData`.
 */

const TABS = [
  { id: 'overview', label: 'סקירה' },
  { id: 'modules', label: 'מודולים' },
  { id: 'branding', label: 'מיתוג' },
  { id: 'domains', label: 'דומיינים' },
  { id: 'users', label: 'משתמשים' },
  { id: 'plan', label: 'חבילה' },
  { id: 'audit', label: 'יומן' },
];

export default function TenantSettings() {
  const { id } = useParams();
  const { isSuperAdmin } = useUser();
  const navigate = useNavigate();
  const toasts = useToasts();

  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { if (!isSuperAdmin) navigate('/', { replace: true }); }, [isSuperAdmin, navigate]);

  const reload = useCallback(
    () => PlatformServices.getTenant(id).then(setData).catch((err) => setError(err.displayMessage)),
    [id]
  );

  useEffect(() => { if (isSuperAdmin) reload(); }, [reload, isSuperAdmin]);

  /**
   * `PATCH /tenants/:id` answers with the tenant ALONE — no modules, no domains —
   * so merging it wholesale would blank both. Only the document it actually
   * returned is replaced.
   */
  const save = useTenantSave({
    tenantId: id,
    toasts,
    onSaved: (tenant) => setData((d) => ({ ...d, tenant })),
  });

  if (!isSuperAdmin) return null;
  // The gutter belongs on every branch, not only the happy one — an error or a
  // slow load is still a page, and without this it renders flush to the edge.
  if (error) {
    return <PageContainer><Alert tone="danger" title="שגיאה">{error}</Alert></PageContainer>;
  }
  if (!data) {
    return <PageContainer><div className="flex justify-center p-10"><Spinner size="lg" /></div></PageContainer>;
  }

  const { tenant, domains, modules } = data;
  const formProps = { tenant, onSave: save.save, busy: save.busy };

  return (
    <PageContainer>
      {/* Permanent, visually distinct. The super-admin is not in their own account. */}
      <div className="mb-4">
        <ContextBanner
          title={`הגדרות הלקוח: ${tenant.nameHe}`}
          subtitle={`מזהה: ${tenant.slug} · אתם עורכים חשבון של לקוח אחר`}
          action={<Button variant="secondary" size="sm" onClick={() => navigate('/platform/tenants')}>חזרה לרשימה</Button>}
        />
      </div>

      <PageHeading title={tenant.nameHe} description={tenant.nameEn} />

      <Tabs items={TABS} active={tab} onChange={setTab} />

      <div className="mt-4">
        {tab === 'overview' && <OverviewTab {...formProps} domains={domains} modules={modules} />}
        {tab === 'modules' && (
          <ModulesTab
            tenant={tenant}
            modules={modules}
            toasts={toasts}
            onModulesChange={(rows) => setData((d) => ({ ...d, modules: rows }))}
          />
        )}
        {tab === 'branding' && <BrandingTab {...formProps} />}
        {tab === 'domains' && (
          <DomainsTab tenant={tenant} domains={domains} onChanged={reload} toasts={toasts} />
        )}
        {tab === 'users' && <UsersTab tenant={tenant} toasts={toasts} />}
        {tab === 'plan' && <PlanTab {...formProps} />}
        {tab === 'audit' && <AuditTab tenant={tenant} />}
      </div>

      {/*
        ONE password modal for the whole page, driven by the save hook. The plan tab
        is the only one whose fields are in `SENSITIVE_FIELDS`, but which tab asked
        is not this component's business — `hasSensitiveChange` decides, from the
        patch, using the same predicate the server's gate uses.
      */}
      <SensitiveActionPasswordModal
        open={save.passwordRequired}
        onCancel={save.cancelPassword}
        onConfirm={save.confirmPassword}
      />

      <ToastStack toasts={toasts.toasts} onDismiss={toasts.dismiss} />
    </PageContainer>
  );
}
