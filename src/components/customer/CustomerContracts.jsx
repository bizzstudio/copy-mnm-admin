// src/components/customer/CustomerContracts.jsx
//
// טאב "הסכמים" בכרטיס לקוח באדמין. רק תצוגה (read-only):
//   - רשימת הסכמים של הלקוח עם סטטוס, תאריכים והסוכן ששלח.
//   - כפתור "הורד PDF" — נחשף רק כשסטטוס=Signed ו-signedPdfS3Url קיים.
// אין כפתור "שלח הסכם" באדמין — לפי הדרישה, השליחה נעשית רק מתוך mnm-agents.

import React, { useEffect, useState } from "react";
import { Card, CardBody, Badge } from "@windmill/react-ui";
import { FiDownload, FiFileText } from "react-icons/fi";
import dayjs from "dayjs";
import ContractServices from "@/services/ContractServices";

const STATUS_LABELS = {
    Pending: { text: "ממתין לחתימת לקוח", type: "warning" },
    AwaitingAgent: { text: "ממתין לחתימת סוכן", type: "warning" },
    Signed: { text: "חתום", type: "success" },
    Expired: { text: "פג תוקף", type: "neutral" },
    Cancelled: { text: "בוטל", type: "danger" },
};

const formatDateTime = (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "—");
const formatDate = (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "—");

const CustomerContracts = ({ customerId }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!customerId) return;
        let cancelled = false;
        setLoading(true);
        ContractServices.listByCustomer(customerId)
            .then((data) => {
                if (!cancelled) setItems(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err?.response?.data?.message || "שגיאה בטעינת הסכמים");
                    setItems([]);
                }
            })
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [customerId]);

    return (
        <div className="my-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardBody>
                    <div className="flex items-center gap-2 mb-4">
                        <FiFileText size={20} className="text-emerald-600" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            הסכמים דיגיטליים
                        </h3>
                    </div>

                    {loading && (
                        <div className="text-center text-gray-500 py-6">טוען...</div>
                    )}

                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">
                            {error}
                        </div>
                    )}

                    {!loading && !error && items.length === 0 && (
                        <div className="text-center text-gray-500 py-6">
                            לא נשלח עדיין הסכם ללקוח זה.
                            <div className="text-xs text-gray-400 mt-1">
                                שליחת הסכם נעשית ממערכת הסוכנים.
                            </div>
                        </div>
                    )}

                    {!loading && items.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                    <tr>
                                        <th className="text-start p-3">סטטוס</th>
                                        <th className="text-start p-3">נשלח</th>
                                        <th className="text-start p-3">נשלח ע"י</th>
                                        <th className="text-start p-3">נחתם ע"י לקוח</th>
                                        <th className="text-start p-3">נחתם ע"י סוכן</th>
                                        <th className="text-start p-3">תוקף הלינק</th>
                                        <th className="text-start p-3">פעולות</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((c) => {
                                        const s = STATUS_LABELS[c.status] || {
                                            text: c.status,
                                            type: "neutral",
                                        };
                                        return (
                                            <tr
                                                key={c._id}
                                                className="border-t border-gray-100 dark:border-gray-700"
                                            >
                                                <td className="p-3">
                                                    <Badge type={s.type}>{s.text}</Badge>
                                                </td>
                                                <td className="p-3 text-gray-700 dark:text-gray-300">
                                                    {formatDateTime(c.createdAt)}
                                                </td>
                                                <td className="p-3 text-gray-700 dark:text-gray-300">
                                                    {c.sentByAgent?.name || "—"}
                                                </td>
                                                <td className="p-3 text-gray-700 dark:text-gray-300">
                                                    {formatDateTime(c.customerSignedAt)}
                                                </td>
                                                <td className="p-3 text-gray-700 dark:text-gray-300">
                                                    {formatDateTime(c.agentSignedAt)}
                                                </td>
                                                <td className="p-3 text-gray-700 dark:text-gray-300">
                                                    {formatDate(c.expiresAt)}
                                                </td>
                                                <td className="p-3">
                                                    {c.signedPdfS3Url ? (
                                                        <a
                                                            href={c.signedPdfS3Url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-medium"
                                                        >
                                                            <FiDownload />
                                                            הורד PDF
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">
                                                            לא זמין
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default CustomerContracts;
