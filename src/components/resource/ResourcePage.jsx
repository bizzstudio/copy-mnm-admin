// src/components/resource/ResourcePage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Label,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
  Textarea,
} from "@windmill/react-ui";
import { FiEdit, FiPlus, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import TableLoading from "@/components/preloader/TableLoading";
import { notifyError, notifySuccess } from "@/utils/toast";

/**
 * מסך ניהול של משאב פשוט: רשימה, טופס, מחיקה.
 *
 * ספקים, חברות משלוח ומיקומי מחסן הם אותו מסך עם שדות אחרים. שלושה קבצים כמעט
 * זהים הם שלושה מקומות שבהם טיפול בשגיאה או במצב ריק יכול להיות שונה — וזה
 * בדיוק ההבדל שאף אחד לא שם לב אליו עד שמסך אחד נשבר לבד.
 *
 * הגבול: משאב עם אינווריאנט משלו (קליטת סחורה מזיזה מלאי) לא נכנס לכאן. ברגע
 * שהטופס צריך לדעת משהו על המשמעות של הערכים, הוא כבר לא "קבע את השדות האלה".
 *
 * @param {object} props
 * @param {string} props.title
 * @param {Array<{key: string, label: string, render?: (row: object) => React.ReactNode}>} props.columns
 * @param {Array<{name: string, label: string, type?: string, options?: Array, required?: boolean, help?: string, span?: number}>} props.fields
 * @param {{list: Function, create: Function, update: Function, remove: Function}} props.service
 * @param {string} [props.description] משפט שמסביר למה המסך קיים — מוצג מעל הטבלה
 * @param {(row: object) => object} [props.toForm] המרת שורה לערכי טופס
 */
const ResourcePage = ({
  title,
  description,
  columns,
  fields,
  service,
  toForm,
  emptyTitle,
  idKey = "_id",
}) => {
  const { t } = useTranslation();

  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null = הטופס סגור
  const [saving, setSaving] = useState(false);

  const emptyForm = useMemo(
    () =>
      Object.fromEntries(
        fields.map((f) => [f.name, f.type === "checkbox" ? true : f.type === "number" ? 0 : ""])
      ),
    [fields]
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await service.list({ search: search || undefined, limit: 200 });
      setRows(data?.items ?? []);
    } catch (err) {
      setRows([]);
      setError(err?.displayMessage || err?.message);
    }
  }, [service, search]);

  useEffect(() => {
    // השהיה קצרה כדי שהקלדה בחיפוש לא תשלח בקשה לכל תו
    const timer = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const openNew = () => setEditing({ ...emptyForm });

  const openEdit = (row) => {
    const base = toForm ? toForm(row) : row;
    // רק השדות שהטופס מכיר — כדי ש-PATCH לא ישלח חזרה `_id`, `tenantId` וחותמות זמן
    setEditing({
      [idKey]: row[idKey],
      ...Object.fromEntries(
        fields.map((f) => [f.name, base?.[f.name] ?? emptyForm[f.name]])
      ),
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { [idKey]: id, ...body } = editing;
      if (id) await service.update(id, body);
      else await service.create(body);
      notifySuccess(t("Saved successfully"));
      setEditing(null);
      await load();
    } catch (err) {
      notifyError(err?.displayMessage || err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(t("ConfirmDelete"))) return;
    try {
      await service.remove(row[idKey]);
      notifySuccess(t("Deleted successfully"));
      await load();
    } catch (err) {
      // כאן נוחת גם ה-409 של "ספק שמשויכים אליו מוצרים" — ההודעה מהשרת מסבירה
      // מה לעשות במקום זה, ולכן היא מוצגת כמות שהיא.
      notifyError(err?.displayMessage || err?.message);
    }
  };

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{title}</PageTitle>

      {description && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1">
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Search")}
              />
            </div>
            <Button onClick={openNew} className="rounded-md h-12" type="button">
              <span className="ml-2">
                <FiPlus />
              </span>
              {t("AddNew")}
            </Button>
          </div>
        </CardBody>
      </Card>

      {editing && (
        <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <form onSubmit={handleSave}>
              <div className="grid gap-4 md:grid-cols-3">
                {fields.map((field) => (
                  <div key={field.name} className={field.span === 3 ? "md:col-span-3" : ""}>
                    <Label>{field.label}</Label>

                    {field.type === "select" ? (
                      <Select
                        value={editing[field.name] ?? ""}
                        onChange={(e) =>
                          setEditing({ ...editing, [field.name]: e.target.value })
                        }
                      >
                        <option value="">—</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
                    ) : field.type === "checkbox" ? (
                      <div className="h-12 flex items-center">
                        <Input
                          type="checkbox"
                          checked={Boolean(editing[field.name])}
                          onChange={(e) =>
                            setEditing({ ...editing, [field.name]: e.target.checked })
                          }
                        />
                      </div>
                    ) : field.type === "textarea" ? (
                      <Textarea
                        rows="3"
                        value={editing[field.name] ?? ""}
                        onChange={(e) =>
                          setEditing({ ...editing, [field.name]: e.target.value })
                        }
                      />
                    ) : (
                      <Input
                        type={field.type || "text"}
                        required={field.required}
                        value={editing[field.name] ?? ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            [field.name]:
                              field.type === "number"
                                ? e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                                : e.target.value,
                          })
                        }
                      />
                    )}

                    {field.help && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{field.help}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button type="submit" disabled={saving} className="h-11">
                  {t("Save")}
                </Button>
                <Button
                  layout="outline"
                  type="button"
                  className="h-11"
                  onClick={() => setEditing(null)}
                >
                  <span className="text-black dark:text-gray-200">{t("Cancel")}</span>
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {error && <p className="mb-4 text-center text-red-500">{error}</p>}

      {rows === null ? (
        <TableLoading row={8} col={columns.length + 1} width={163} height={20} />
      ) : rows.length === 0 ? (
        <NotFound title={emptyTitle || t("NoData")} />
      ) : (
        <TableContainer className="mb-8 dark:bg-gray-900">
          <Table>
            <TableHeader>
              <tr>
                {columns.map((col) => (
                  <TableCell key={col.key} className="text-center">
                    {col.label}
                  </TableCell>
                ))}
                <TableCell className="text-center">{t("ActionTbl")}</TableCell>
              </tr>
            </TableHeader>

            <TableBody className="dark:bg-gray-900">
              {rows.map((row) => (
                <TableRow key={row[idKey]}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className="text-center">
                      <span className="text-sm">
                        {col.render ? col.render(row) : (row[col.key] ?? "—")}
                      </span>
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="text-gray-400 hover:text-mainColor"
                        title={t("Edit")}
                      >
                        <FiEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        className="text-gray-400 hover:text-red-500"
                        title={t("Delete")}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default ResourcePage;
