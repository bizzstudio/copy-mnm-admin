/**
 * ברירת מחדל לפטור ממע״מ: פירות/ירקות → פטור (isVatFree: true), אחרת חייב במע״מ (false).
 * תומך בשדה ייבוא «שם קבוצה» (סלאגים מופרדים בפסיק) ובשמות/סלאגים של אובייקט קטגוריה.
 */

function normalizeExplicitVatFree(value) {
  if (value === true || value === false) return value;
  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    if (["true", "1", "yes", "כן", "y"].includes(s)) return true;
    if (["false", "0", "no", "לא", "n"].includes(s)) return false;
  }
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return null;
}

/**
 * טקסט מעמודת קבוצה בייבוא (סלאגים / שמות), או שרשור שדות קטגוריה במוצר חדש.
 */
export function isFruitsVegetablesFromImportGroupText(raw) {
  if (raw == null) return false;
  const text = String(raw).toLowerCase();
  if (!text.trim()) return false;

  const segments = text
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const pool = segments.length ? segments : [text];

  return pool.some((segment) => {
    const s = segment.toLowerCase();
    if (/fruit|fruits|veget|vegetable|ירקות|פירות/.test(s)) return true;
    if (/fresh-fruits|fresh-veget|fruits-vegetable/.test(s)) return true;
    return false;
  });
}

export function categorySuggestsFruitsVegetablesVatFree(category) {
  if (!category || typeof category !== "object") return false;
  const bits = [];
  if (category.slug) bits.push(category.slug);
  const n = category.name;
  if (typeof n === "string") bits.push(n);
  if (n && typeof n === "object") {
    ["he", "en", "ar"].forEach((k) => {
      if (n[k]) bits.push(String(n[k]));
    });
  }
  return isFruitsVegetablesFromImportGroupText(bits.join(" "));
}

function getImportGroupColumnText(row) {
  const preferred = ["שם קבוצה", "שם קבוצת", "group", "category", "categories", "slug"];
  for (const key of preferred) {
    if (row[key] != null && String(row[key]).trim() !== "") {
      return String(row[key]);
    }
  }
  for (const key of Object.keys(row)) {
    if (String(key).includes("קבוצה") && row[key] != null && String(row[key]).trim() !== "") {
      return String(row[key]);
    }
  }
  return "";
}

/**
 * מוסיף isVatFree לשורת ייבוא: מכבד עמודה מפורשת אם קיימת, אחרת לפי שם קבוצה, אחרת false.
 */
export function applyDefaultIsVatFreeForProductImportRow(row) {
  if (!row || typeof row !== "object") return row;
  const explicit = row.isVatFree ?? row.is_vat_free ?? row["פטור ממע״מ"] ?? row["פטור ממעמ"];
  const normalized = normalizeExplicitVatFree(explicit);
  if (normalized !== null) {
    return { ...row, isVatFree: normalized };
  }
  const groupText = getImportGroupColumnText(row);
  const isFv = isFruitsVegetablesFromImportGroupText(groupText);
  return { ...row, isVatFree: isFv };
}
