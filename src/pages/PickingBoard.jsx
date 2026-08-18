// src/pages/PickingBoard.jsx
import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Label,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FiZoomIn } from "react-icons/fi";

import PageTitle from "@/components/Typography/PageTitle";
import NotFound from "@/components/table/NotFound";
import TableLoading from "@/components/preloader/TableLoading";
import Tooltip from "@/components/tooltip/Tooltip";
import PickingServices from "@/services/PickingServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { notifyError, notifySuccess } from "@/utils/toast";

/**
 * ניהול ליקוט — הצד של המנהל.
 *
 * אפליקציית המחסן כבר עובדת, אבל מהבק-אופיס היא הייתה קופסה שחורה: אין מסך שאומר
 * מה בתור, מי מלקט מה ומי פנוי. השיוך נעשה בפועל לפי "מי לקח ראשון".
 *
 * המסך משנה `assignedPickerId` בלבד. מעבר סטטוס נשאר במכונת המצבים ובאפליקציה —
 * שני מסלולים למכונה הם הדרך שבה הזמנה מגיעה למצב שהמכונה אוסרת.
 */
const STATUS_LABEL = {
  processing: "PickingQueue",
  picking: "PickingInProgress",
  ready: "PickingReady",
};

const PickingBoard = () => {
  const { t } = useTranslation();
  const { showDateTimeFormat, currency, getNumberTwo } = useUtilsFunction();

  const [board, setBoard] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [picker, setPicker] = useState("");
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setBoard(await PickingServices.getBoard({ status, picker }));
    } catch (err) {
      setBoard({ orders: [], pickers: [], unassigned: 0 });
      setError(err?.displayMessage || err?.message);
    }
  }, [status, picker]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAssign = async (orderId, pickerId) => {
    setSavingId(orderId);
    try {
      await PickingServices.assignPicker(orderId, pickerId || null);
      notifySuccess(t("PickerAssigned"));
      await load();
    } catch (err) {
      notifyError(err?.displayMessage || err?.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("PickingManagement")}</PageTitle>

      {/* עומס לכל מלקט — נספר על כל הלוח ולא על מה שהפילטר הנוכחי מציג, כי זה
          המספר שלפיו מחליטים למי לתת את ההזמנה הבאה. */}
      {board?.pickers && (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4 mb-5">
          <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800">
            <CardBody>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("Unassigned")}</p>
              <p className="mt-1 text-2xl font-semibold dark:text-gray-200">
                {board.unassigned ?? 0}
              </p>
            </CardBody>
          </Card>

          {board.pickers.map((p) => (
            <Card key={p._id} className="min-w-0 shadow-xs bg-white dark:bg-gray-800">
              <CardBody>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {p.name}
                  {p.isActive === false && ` · ${t("Inactive")}`}
                </p>
                <p className="mt-1 text-2xl font-semibold dark:text-gray-200">{p.total ?? 0}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {Object.entries(p.byStatus || {})
                    .map(([key, count]) => `${t(STATUS_LABEL[key] || key)}: ${count}`)
                    .join(" · ") || "—"}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>{t("Stage")}</Label>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">{t("AllStages")}</option>
                {(board?.statuses || []).map((key) => (
                  <option key={key} value={key}>
                    {t(STATUS_LABEL[key] || key)}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>{t("Picker")}</Label>
              <Select value={picker} onChange={(e) => setPicker(e.target.value)}>
                <option value="">{t("AllPickers")}</option>
                <option value="none">{t("Unassigned")}</option>
                {(board?.pickers || []).map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {error && <p className="mb-4 text-center text-red-500">{error}</p>}

      {board === null ? (
        <TableLoading row={10} col={7} width={163} height={20} />
      ) : !board.orders?.length ? (
        <NotFound title={t("NoOrdersInPicking")} />
      ) : (
        <TableContainer className="mb-8 dark:bg-gray-900">
          <Table>
            <TableHeader>
              <tr>
                <TableCell className="text-center">{t("InvoiceNo")}</TableCell>
                <TableCell className="text-center">{t("orderCreation")}</TableCell>
                <TableCell className="text-center">{t("CustomerName")}</TableCell>
                <TableCell className="text-center">{t("ProductCount")}</TableCell>
                <TableCell className="text-center">{t("AmountTbl")}</TableCell>
                <TableCell className="text-center">{t("Stage")}</TableCell>
                <TableCell className="text-center">{t("Picker")}</TableCell>
                <TableCell className="text-center">{t("ActionTbl")}</TableCell>
              </tr>
            </TableHeader>

            <TableBody className="dark:bg-gray-900">
              {board.orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="text-center">
                    <span className="text-xs font-semibold">{order.orderNumber || "—"}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">{showDateTimeFormat(order.createdAt)}</span>
                  </TableCell>
                  <TableCell className="text-center max-w-[10vw] truncate" title={order.customerName}>
                    <span className="text-sm">{order.customerName || "—"}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">{order.itemsCount}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">
                      {currency}
                      {getNumberTwo(order.total)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">{t(STATUS_LABEL[order.status] || order.status)}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Select
                      className="text-sm"
                      disabled={savingId === order._id}
                      value={order.assignedPickerId || ""}
                      onChange={(e) => handleAssign(order._id, e.target.value)}
                    >
                      <option value="">{t("Unassigned")}</option>
                      {(board.pickers || []).map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link to={`/order/${order._id}`}>
                      <Tooltip id="view" Icon={FiZoomIn} title={t("ViewInvoice")} bgColor="#059669" />
                    </Link>
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

export default PickingBoard;
