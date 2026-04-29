/** קודי טפסים דיגיטליים ידועים → מפתחות i18n (FormCodeName_T01 וכו') */
const FORM_CODE_I18N_KEYS = {
  T01: "FormCodeName_T01",
  T02: "FormCodeName_T02",
  T03: "FormCodeName_T03",
};

export function getFormCodeTranslationKey(code) {
  if (code == null || code === "") return null;
  const normalized = String(code).trim().toUpperCase();
  return FORM_CODE_I18N_KEYS[normalized] ?? null;
}
