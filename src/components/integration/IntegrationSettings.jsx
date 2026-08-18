import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, CardBody, Input, Label, Select } from "@windmill/react-ui";
import { FiCheckCircle, FiLock, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import SensitiveActionPasswordModal from "@/components/common/SensitiveActionPasswordModal";
import TableLoading from "@/components/preloader/TableLoading";
import IntegrationServices, { buildCredentialsPatch } from "@/services/IntegrationServices";
import { notifyError, notifySuccess } from "@/utils/toast";

/**
 * ניהול פרטי החיבור של הלקוח לשירות חיצוני — טוקן וכל מה שנלווה לו.
 *
 * ── רכיב אחד לכל האינטגרציות ────────────────────────────────────────────────
 * הטופס נבנה מ-`credentialFields` שמגיע מהשרת, ולא מרשימת שדות שכתובה כאן. לכן
 * הוספת מוביל חדש או ספק הנהלת חשבונות נוסף היא שורה ב-`moduleDefinitions` ולא
 * מסך נוסף — אותו קו בדיוק שהשרת מחזיק ב-`tenantModuleService`. שני מסכים
 * שנראים אותו דבר הם שני מקומות שבהם הטיפול בסוד יכול להיות שונה, וזה ההבדל
 * שאף אחד לא שם לב אליו עד שאחד מהם דולף.
 *
 * ── למה שדה הסוד תמיד ריק ──────────────────────────────────────────────────
 * הערך השמור לא חוזר מהשרת לעולם — רק `hasApiToken` ו-`apiTokenLast4`. השדה
 * נטען ריק, וריק פירושו "אל תשנה". כדי למחוק טוקן יש ללחוץ על כפתור המחיקה, כי
 * מחיקה חייבת להיות פעולה שנבחרה ולא תוצאה של טופס שנשמר בלי לגעת בשדה.
 *
 * @param {object} props
 * @param {string} props.category  `finance` / `shipping` — איזו קבוצה להציג
 * @param {string} [props.title]
 * @param {string} [props.description]
 */
const IntegrationSettings = ({ category, title, description }) => {
  const { t, i18n } = useTranslation();
  const isHe = i18n.language !== "en";

  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await IntegrationServices.getIntegrations({ category });
      setItems(data?.integrations ?? []);
    } catch (err) {
      setItems([]);
      setError(err?.displayMessage || err?.message);
    }
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  if (items === null) return <TableLoading />;

  return (
    <div>
      {title && (
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">{title}</h2>
      )}
      {description && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}

      {error && (
        <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </CardBody>
        </Card>
      )}

      {items.length === 0 && !error && (
        <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("NoIntegrationsInCategory")}
            </p>
          </CardBody>
        </Card>
      )}

      {items.map((integration) => (
        <IntegrationCard
          key={integration.key}
          integration={integration}
          isHe={isHe}
          onSaved={load}
        />
      ))}
    </div>
  );
};

/**
 * כרטיס אחד: מתג הפעלה, מצב בדיקה/חי, ושדות פרטי החיבור.
 */
function IntegrationCard({ integration, isHe, onSaved }) {
  const { t } = useTranslation();

  const [values, setValues] = useState({});
  const [cleared, setCleared] = useState(() => new Set());
  const [isEnabled, setIsEnabled] = useState(integration.isEnabled);
  const [mode, setMode] = useState(integration.mode);
  const [saving, setSaving] = useState(false);

  /** מה שנשלח בפועל — נשמר בין פתיחת חלון הסיסמה לבין האישור. */
  const [pending, setPending] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  /**
   * מסתנכרן מחדש כשהשרת מחזיר מצב אחר ממה שנשלח.
   *
   * `useState` קורא את הפרופ פעם אחת בלבד, וכאן זה לא ניואנס: הפעלת ספק הנהלת
   * חשבונות מכבה בשרת את הספק המתחרה (`exclusiveGroup`). בלי הסנכרון הזה
   * הרשימה נטענת מחדש עם `isEnabled: false` למתחרה, אבל המתג שלו נשאר דלוק על
   * המסך — והשמירה הבאה שלו הייתה מדליקה אותו בחזרה ומכבה את זה שהרגע הופעל.
   */
  useEffect(() => {
    setIsEnabled(integration.isEnabled);
    setMode(integration.mode);
  }, [integration.isEnabled, integration.mode]);

  const name = isHe ? integration.displayNameHe : integration.displayNameEn;
  const blurb = isHe ? integration.descriptionHe : integration.descriptionEn;

  const buildBody = () => {
    const credentials = buildCredentialsPatch(values, integration.credentialFields, cleared);
    const body = { isEnabled };
    if (integration.supportsTestMode) body.mode = mode;
    if (Object.keys(credentials).length) body.credentials = credentials;
    return body;
  };

  /**
   * שמירה בשני מסלולים.
   *
   * שינוי שנוגע בפרטי חיבור מבקש את סיסמת הפעולות; שמירה שרק מדליקה או מכבה את
   * האינטגרציה עוברת ישירות. השרת אוכף בדיוק את אותה הבחנה
   * (`requireOperationPassword(SENSITIVE_FIELDS)`), כך ששער שדולג כאן ייעצר שם —
   * אבל שאלת סיסמה על כל שמירה היא שער שלומדים להקליד דרכו בלי לקרוא.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = buildBody();
    if (body.credentials) {
      setPasswordError(null);
      setPending(body);
      return;
    }
    try {
      await save(body);
    } catch (err) {
      notifyError(err?.displayMessage || err?.message);
    }
  };

  /**
   * זורק במקום לתפוס — ובכוונה. במסלול הסיסמה מי שתופס הוא החלון עצמו, שמציג
   * את השגיאה בתוכו ומשאיר את הטופס שמאחוריו כפי שהוא; טיפול בשגיאה כאן היה
   * סוגר את החלון על סיסמה שהוקלדה בטעות ומחייב למלא הכל מחדש.
   */
  const save = async (body) => {
    setSaving(true);
    try {
      await IntegrationServices.updateIntegration(integration.key, body);
      notifySuccess(t("Saved successfully"));
      setValues({});
      setCleared(new Set());
      setPending(null);
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  const toggleClear = (key) => {
    setCleared((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setValues((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
      <CardBody>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">{name}</h3>
                <StatusBadge integration={integration} />
              </div>
              {blurb && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{blurb}</p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={isEnabled}
                disabled={integration.platformManaged}
                onChange={(e) => setIsEnabled(e.target.checked)}
              />
              <span>{t("IntegrationEnabled")}</span>
            </label>
          </div>

          {/**
           * אינטגרציה שהקטלוג מכיר אבל אין לה עדיין אדפטר בקוד. הטוקן נשמר
           * ומוצפן כרגיל — זה מה שמאפשר לו להיות מוכן ביום שהאדפטר נכתב — אבל
           * המסך אומר זאת במפורש במקום להציג "מחובר" שאינו נכון.
           */}
          {!integration.isImplemented && (
            <p className="mb-4 rounded-md bg-amber-50 dark:bg-amber-900/30 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
              {t("IntegrationNotWiredYet")}
            </p>
          )}

          {integration.platformManaged && (
            <p className="mb-4 rounded-md bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
              {t("IntegrationPlatformManaged")}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {integration.credentialFields.map((field) => (
              <CredentialField
                key={field.key}
                field={field}
                isHe={isHe}
                value={values[field.key] ?? ""}
                stored={integration.credentials}
                isCleared={cleared.has(field.key)}
                onChange={(v) => setValues((prev) => ({ ...prev, [field.key]: v }))}
                onToggleClear={() => toggleClear(field.key)}
              />
            ))}

            {integration.supportsTestMode && (
              <div>
                <Label>{t("IntegrationMode")}</Label>
                <Select
                  className="mt-1"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="test">{t("IntegrationModeTest")}</option>
                  <option value="live">{t("IntegrationModeLive")}</option>
                </Select>
              </div>
            )}
          </div>

          {integration.lastErrorMessage?.he && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              {isHe ? integration.lastErrorMessage.he : integration.lastErrorMessage.en}
            </p>
          )}

          <div className="mt-5 flex items-center gap-3">
            <Button type="submit" disabled={saving} className="rounded-md h-11">
              {saving ? t("Saving") : t("Save")}
            </Button>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <FiLock /> {t("IntegrationSecretsEncrypted")}
            </span>
          </div>
        </form>
      </CardBody>

      <SensitiveActionPasswordModal
        open={Boolean(pending)}
        error={passwordError}
        onCancel={() => {
          setPending(null);
          setPasswordError(null);
        }}
        onConfirm={(operationPassword) => save({ ...pending, operationPassword })}
      />
    </Card>
  );
}

/**
 * שדה אחד. שדה רגיש נטען ריק תמיד ומציג במקומו את ארבע הספרות האחרונות של מה
 * ששמור, כדי שאפשר יהיה לזהות איזה מפתח יושב שם בלי לחשוף אותו.
 */
function CredentialField({ field, isHe, value, stored, isCleared, onChange, onToggleClear }) {
  const { t } = useTranslation();

  const label = isHe ? field.labelHe : field.labelEn;
  const cap = field.key.charAt(0).toUpperCase() + field.key.slice(1);
  const hasStored = stored?.[`has${cap}`] === true;
  const last4 = stored?.[`${field.key}Last4`];

  return (
    <div>
      <Label>
        {label}
        {field.required && <span className="text-red-500"> *</span>}
      </Label>

      {field.type === "select" ? (
        <Select className="mt-1" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {isHe ? o.labelHe : o.labelEn}
            </option>
          ))}
        </Select>
      ) : (
        <Input
          className="mt-1"
          dir="ltr"
          type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
          autoComplete="off"
          value={value}
          disabled={isCleared}
          placeholder={
            hasStored && field.sensitive
              ? t("IntegrationLeaveBlankToKeep")
              : field.placeholder || ""
          }
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      <div className="mt-1 flex items-center gap-2 text-xs">
        {isCleared ? (
          <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
            <FiTrash2 /> {t("IntegrationWillBeDeleted")}
          </span>
        ) : hasStored ? (
          <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
            <FiCheckCircle />
            {last4 ? `${t("IntegrationStoredValue")} ••••${last4}` : t("IntegrationStoredValue")}
          </span>
        ) : (
          <span className="text-gray-400">{t("IntegrationNotConfigured")}</span>
        )}

        {(hasStored || isCleared) && (
          <button
            type="button"
            className="text-gray-500 hover:text-red-600 underline"
            onClick={onToggleClear}
          >
            {isCleared ? t("Cancel") : t("Delete")}
          </button>
        )}
      </div>
    </div>
  );
}

/** מוכן/לא מוכן — לפי מה שבאמת שמור, לא לפי המתג. */
function StatusBadge({ integration }) {
  const { t } = useTranslation();

  const required = integration.credentialFields.filter((f) => f.required);
  const hasAllRequired = required.every((f) => {
    const cap = f.key.charAt(0).toUpperCase() + f.key.slice(1);
    return integration.credentials?.[`has${cap}`] === true;
  });

  const tone = integration.isEnabled && hasAllRequired
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    : hasAllRequired
      ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
      : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";

  const label = integration.isEnabled && hasAllRequired
    ? t("IntegrationActive")
    : hasAllRequired
      ? t("IntegrationConfiguredButOff")
      : t("IntegrationMissingCredentials");

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
}

export default IntegrationSettings;
