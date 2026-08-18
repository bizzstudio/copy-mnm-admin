// src/pages/GoodsReceipt.jsx
import React, { useCallback, useEffect, useState } from "react";
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
} from "@windmill/react-ui";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import PageTitle from "@/components/Typography/PageTitle";
import NotFound from "@/components/table/NotFound";
import TableLoading from "@/components/preloader/TableLoading";
import SupplyServices from "@/services/SupplyServices";
import InventoryServices from "@/services/InventoryServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { notifyError, notifySuccess } from "@/utils/toast";

/**
 * קליטת סחורה — הזמנות רכש ומה שהגיע מהן.
 *
 * זה הצד ההפוך של מסך ההזמנות: שם סחורה יוצאת ללקוח, כאן היא נכנסת מהספק. עד
 * עכשיו לא היה לזה ייצוג בכלל — מלאי נכנס דרך עדכון ידני של כמות, בלי מסמך, בלי
 * מחיר קנייה ובלי מי הזמין.
 *
 * ── שתי כמויות בכל שורה, וזו הנקודה ─────────────────────────────────────────
 * הוזמן מול התקבל. משלוח חלקי הוא המקרה הרגיל; הכמות שנקלטת היא תוספת ולא ערך
 * מוחלט, ולכן משלוח שני מצטבר לראשון במקום לתקן אותו בשקט.
 */
const STATUS_LABEL = {
  draft: "PoDraft",
  ordered: "PoOrdered",
  partial: "PoPartial",
  received: "PoReceived",
  cancelled: "PoCancelled",
};

const STATUS_STYLE = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  ordered: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  partial: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  received: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const emptyLine = () => ({ title: "", barcode: "", quantityOrdered: 1, unitCost: 0 });

const GoodsReceipt = () => {
  const { t } = useTranslation();
  const { showDateTimeFormat, currency, getNumberTwo } = useUtilsFunction();

  const [orders, setOrders] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const [draft, setDraft] = useState(null); // מסמך חדש
  const [receiving, setReceiving] = useState(null); // { po, quantities: {index: qty} }
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await SupplyServices.getPurchaseOrders({
        limit: 200,
        status: statusFilter || undefined,
      });
      setOrders(data?.items ?? []);
    } catch (err) {
      setOrders([]);
      setError(err?.displayMessage || err?.message);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // רשימות העזר נטענות פעם אחת — הן משנות רק את מה שאפשר לבחור, לא את הרשימה
    SupplyServices.getSuppliers({ limit: 500 })
      .then((data) => setSuppliers(data?.items ?? []))
      .catch(() => setSuppliers([]));
    InventoryServices.getLocations()
      .then((data) => setLocations(Array.isArray(data) ? data : []))
      .catch(() => setLocations([]));
  }, []);

  const supplierName = (po) =>
    suppliers.find((s) => s._id === (po.supplier?._id || po.supplier))?.name || "—";

  /* ── מסמך חדש ──────────────────────────────────────────────────────────── */

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await SupplyServices.addPurchaseOrder({
        supplier: draft.supplier,
        location: draft.location || undefined,
        expectedAt: draft.expectedAt || undefined,
        supplierDocNumber: draft.supplierDocNumber || undefined,
        status: "ordered",
        lines: draft.lines
          .filter((l) => l.title && Number(l.quantityOrdered) > 0)
          .map((l) => ({
            title: l.title,
            barcode: l.barcode || undefined,
            quantityOrdered: Number(l.quantityOrdered),
            unitCost: Number(l.unitCost) || 0,
          })),
      });
      notifySuccess(t("Saved successfully"));
      setDraft(null);
      await load();
    } catch (err) {
      notifyError(err?.displayMessage || err?.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── קליטה ─────────────────────────────────────────────────────────────── */

  const handleReceive = async (e) => {
    e.preventDefault();
    const lines = Object.entries(receiving.quantities)
      .map(([index, quantity]) => ({ index: Number(index), quantity: Number(quantity) }))
      .filter((l) => l.quantity > 0);

    if (!lines.length) {
      notifyError(t("NothingToReceive"));
      return;
    }

    setSaving(true);
    try {
      await SupplyServices.receivePurchaseOrder(receiving.po._id, {
        lines,
        location: receiving.location || undefined,
        supplierDocNumber: receiving.supplierDocNumber || undefined,
      });
      notifySuccess(t("GoodsReceived"));
      setReceiving(null);
      await load();
    } catch (err) {
      notifyError(err?.displayMessage || err?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("GoodsReceipt")}</PageTitle>

      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {t("GoodsReceiptDescription")}
      </p>

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>{t("Status")}</Label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">{t("AllStatuses")}</option>
                {Object.keys(STATUS_LABEL).map((key) => (
                  <option key={key} value={key}>
                    {t(STATUS_LABEL[key])}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-end md:col-span-2">
              <Button
                type="button"
                className="h-12"
                disabled={!suppliers.length}
                onClick={() =>
                  setDraft({
                    supplier: suppliers[0]?._id || "",
                    location: "",
                    expectedAt: "",
                    supplierDocNumber: "",
                    lines: [emptyLine()],
                  })
                }
              >
                <span className="ml-2">
                  <FiPlus />
                </span>
                {t("NewPurchaseOrder")}
              </Button>

              {!suppliers.length && (
                <span className="ms-3 text-xs text-amber-600 dark:text-amber-400">
                  {t("AddSupplierFirst")}
                </span>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── טופס מסמך רכש חדש ────────────────────────────────────────────── */}
      {draft && (
        <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <form onSubmit={handleCreate}>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label>{t("Supplier")}</Label>
                  <Select
                    required
                    value={draft.supplier}
                    onChange={(e) => setDraft({ ...draft, supplier: e.target.value })}
                  >
                    {suppliers.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>{t("ReceiveIntoLocation")}</Label>
                  <Select
                    value={draft.location}
                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  >
                    <option value="">{t("DefaultLocation")}</option>
                    {locations.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>{t("ExpectedAt")}</Label>
                  <Input
                    type="date"
                    value={draft.expectedAt}
                    onChange={(e) => setDraft({ ...draft, expectedAt: e.target.value })}
                  />
                </div>

                <div>
                  <Label>{t("SupplierDocNumber")}</Label>
                  <Input
                    value={draft.supplierDocNumber}
                    onChange={(e) => setDraft({ ...draft, supplierDocNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-5">
                <Label>{t("Lines")}</Label>
                {draft.lines.map((line, i) => (
                  <div key={i} className="mt-2 grid gap-2 md:grid-cols-12 items-center">
                    <div className="md:col-span-5">
                      <Input
                        placeholder={t("ProductName")}
                        value={line.title}
                        onChange={(e) => {
                          const lines = [...draft.lines];
                          lines[i] = { ...line, title: e.target.value };
                          setDraft({ ...draft, lines });
                        }}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        placeholder={t("Barcode")}
                        value={line.barcode}
                        onChange={(e) => {
                          const lines = [...draft.lines];
                          lines[i] = { ...line, barcode: e.target.value };
                          setDraft({ ...draft, lines });
                        }}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        min="0"
                        placeholder={t("QuantityOrdered")}
                        value={line.quantityOrdered}
                        onChange={(e) => {
                          const lines = [...draft.lines];
                          lines[i] = { ...line, quantityOrdered: e.target.value };
                          setDraft({ ...draft, lines });
                        }}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={t("UnitCost")}
                        value={line.unitCost}
                        onChange={(e) => {
                          const lines = [...draft.lines];
                          lines[i] = { ...line, unitCost: e.target.value };
                          setDraft({ ...draft, lines });
                        }}
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-red-500"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            lines: draft.lines.filter((_, idx) => idx !== i),
                          })
                        }
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  layout="link"
                  className="mt-2"
                  onClick={() => setDraft({ ...draft, lines: [...draft.lines, emptyLine()] })}
                >
                  + {t("AddLine")}
                </Button>
              </div>

              <div className="mt-4 flex gap-2">
                <Button type="submit" disabled={saving} className="h-11">
                  {t("Save")}
                </Button>
                <Button
                  type="button"
                  layout="outline"
                  className="h-11"
                  onClick={() => setDraft(null)}
                >
                  <span className="text-black dark:text-gray-200">{t("Cancel")}</span>
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* ── טופס קליטה ───────────────────────────────────────────────────── */}
      {receiving && (
        <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <h3 className="mb-3 font-semibold dark:text-gray-200">
              {t("ReceiveGoodsFor", { number: receiving.po.orderNumber })}
            </h3>

            <form onSubmit={handleReceive}>
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div>
                  <Label>{t("ReceiveIntoLocation")}</Label>
                  <Select
                    value={receiving.location}
                    onChange={(e) => setReceiving({ ...receiving, location: e.target.value })}
                  >
                    <option value="">{t("DefaultLocation")}</option>
                    {locations.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>{t("SupplierDocNumber")}</Label>
                  <Input
                    value={receiving.supplierDocNumber}
                    onChange={(e) =>
                      setReceiving({ ...receiving, supplierDocNumber: e.target.value })
                    }
                  />
                </div>
              </div>

              <TableContainer className="mb-4 dark:bg-gray-900">
                <Table>
                  <TableHeader>
                    <tr>
                      <TableCell>{t("ProductName")}</TableCell>
                      <TableCell className="text-center">{t("QuantityOrdered")}</TableCell>
                      <TableCell className="text-center">{t("QuantityReceived")}</TableCell>
                      <TableCell className="text-center">{t("ReceiveNow")}</TableCell>
                    </tr>
                  </TableHeader>
                  <TableBody className="dark:bg-gray-900">
                    {receiving.po.lines.map((line, i) => {
                      const outstanding =
                        (line.quantityOrdered || 0) - (line.quantityReceived || 0);
                      return (
                        <TableRow key={i}>
                          <TableCell>
                            <span className="text-sm">{line.title || line.barcode || "—"}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm">{line.quantityOrdered}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm">{line.quantityReceived || 0}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min="0"
                              // ברירת המחדל היא היתרה הפתוחה: המקרה השכיח הוא
                              // שהכול הגיע, והקלדה חוזרת של אותו מספר היא בזבוז
                              // וגם מקור לטעות.
                              value={receiving.quantities[i] ?? Math.max(0, outstanding)}
                              onChange={(e) =>
                                setReceiving({
                                  ...receiving,
                                  quantities: {
                                    ...receiving.quantities,
                                    [i]: e.target.value,
                                  },
                                })
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="h-11">
                  {t("ConfirmReceipt")}
                </Button>
                <Button
                  type="button"
                  layout="outline"
                  className="h-11"
                  onClick={() => setReceiving(null)}
                >
                  <span className="text-black dark:text-gray-200">{t("Cancel")}</span>
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {error && <p className="mb-4 text-center text-red-500">{error}</p>}

      {orders === null ? (
        <TableLoading row={8} col={7} width={163} height={20} />
      ) : !orders.length ? (
        <NotFound title={t("NoPurchaseOrders")} />
      ) : (
        <TableContainer className="mb-8 dark:bg-gray-900">
          <Table>
            <TableHeader>
              <tr>
                <TableCell className="text-center">{t("PoNumber")}</TableCell>
                <TableCell className="text-center">{t("Supplier")}</TableCell>
                <TableCell className="text-center">{t("orderCreation")}</TableCell>
                <TableCell className="text-center">{t("Lines")}</TableCell>
                <TableCell className="text-center">{t("TotalCost")}</TableCell>
                <TableCell className="text-center">{t("Status")}</TableCell>
                <TableCell className="text-center">{t("ActionTbl")}</TableCell>
              </tr>
            </TableHeader>

            <TableBody className="dark:bg-gray-900">
              {orders.map((po) => (
                <TableRow key={po._id}>
                  <TableCell className="text-center">
                    <span className="text-xs font-semibold">{po.orderNumber || "—"}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">{supplierName(po)}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">{showDateTimeFormat(po.createdAt)}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">{po.lines?.length || 0}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">
                      {currency}
                      {getNumberTwo(po.totalCost)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        STATUS_STYLE[po.status] || STATUS_STYLE.draft
                      }`}
                    >
                      {t(STATUS_LABEL[po.status] || po.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {["received", "cancelled"].includes(po.status) ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      <Button
                        size="small"
                        onClick={() =>
                          setReceiving({
                            po,
                            quantities: {},
                            location: po.location || "",
                            supplierDocNumber: po.supplierDocNumber || "",
                          })
                        }
                      >
                        {t("Receive")}
                      </Button>
                    )}
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

export default GoodsReceipt;
