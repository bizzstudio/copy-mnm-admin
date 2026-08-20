// src/components/customer/CustomerTable.jsx
import React, { useMemo, useState } from "react";
import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import dayjs from "dayjs";
import { t } from "i18next";
import { FiChevronDown, FiChevronUp, FiUsers, FiZoomIn, FiUser, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";

// Internal import
import Tooltip from "@/components/tooltip/Tooltip";
import CashierToggleButton from "@/components/table/CashierToggleButton";

const CustomerTable = ({ customers, handleModalOpen }) => {
  const [expanded, setExpanded] = useState(() => new Set());

  const toggleExpanded = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // שם מלא של איש הקשר; אם אין — נופלים חזרה לאיש הקשר של תת-הלקוח הראשון.
  const getContactPerson = (mainCustomer) => {
    const candidates = [
      mainCustomer?.contactPerson,
      ...(Array.isArray(mainCustomer?.subCustomers)
        ? mainCustomer.subCustomers.map((sc) => sc?.contactPerson)
        : []),
    ];
    return candidates.find((c) => c && (c.firstName || c.lastName || c.phone)) || null;
  };

  const getCustomerTypeLabel = (type) => {
    if (!type) return "-";
    const typeMap = {
      casual: t("CasualCustomer"),
      regular: t("RegularCustomer"),
      business: t("BusinessCustomer"),
      institutional: t("InstitutionalCustomer"),
    };
    return typeMap[type] || type;
  };

  const safeCustomers = useMemo(() => customers || [], [customers]);

  return (
    <TableBody>
      {safeCustomers?.map((mainCustomer) => {
        const subCustomers = Array.isArray(mainCustomer?.subCustomers)
          ? mainCustomer.subCustomers
          : [];
        const isExpanded = expanded.has(mainCustomer._id);

        return (
          <React.Fragment key={mainCustomer._id}>
            <TableRow>
          <TableCell className="text-center">
            <span className="font-semibold uppercase text-xs">
              {" "}
              {mainCustomer?._id?.substring(20, 24)}
            </span>
          </TableCell>

          <TableCell className="text-center">
            <span className="text-sm">
              {dayjs(mainCustomer.createdAt).format("MMM D, YYYY")}
            </span>
          </TableCell>

          <TableCell className="text-center">
            <span className="text-sm font-medium">{mainCustomer?.name || "-"}</span>
          </TableCell>

          <TableCell className="text-center">
            <span className="text-sm">{mainCustomer?.email || "-"}</span>{" "}
          </TableCell>

          <TableCell className="text-center">
            <span className="text-sm font-medium">{mainCustomer?.phone || "-"}</span>
          </TableCell>

          <TableCell className="text-center">
            {(() => {
              const contact = getContactPerson(mainCustomer);
              if (!contact) {
                return (
                  <span className="text-sm text-gray-400">{t("NoContactPerson")}</span>
                );
              }
              const fullName = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
              return (
                <div className="flex flex-col items-center">
                  <span className="text-sm font-medium">{fullName || "-"}</span>
                  {(contact.role || contact.phone) && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {[contact.role, contact.phone].filter(Boolean).join(" • ")}
                    </span>
                  )}
                </div>
              );
            })()}
          </TableCell>

          <TableCell className="text-center">
            <span className="text-sm">{getCustomerTypeLabel(mainCustomer?.customerType)}</span>
          </TableCell>

          <TableCell className="text-center">
            <span className="text-sm">
              {mainCustomer?.externalCustomerId ?? "-"}
            </span>
          </TableCell>

          <TableCell className="text-center">
            <button
              type="button"
              onClick={() => toggleExpanded(mainCustomer._id)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:border-mainColor dark:hover:border-mainColor transition-colors cursor-pointer"
            >
              <FiUsers size={16} className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {subCustomers.length}
              </span>
              {isExpanded ? (
                <FiChevronUp size={16} className="text-gray-500 dark:text-gray-400" />
              ) : (
                <FiChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </TableCell>

          <TableCell className="text-center">
            <div className="flex justify-center text-center gap-2">
              <div className="p-2 cursor-pointer text-gray-400 hover:text-customGreen-dark">
                <Link to={`/customer/${mainCustomer._id}`}>
                  <Tooltip
                    id="view"
                    Icon={FiZoomIn}
                    title={t("View")}
                    bgColor="#10B981"
                  />
                </Link>
              </div>
              <div className="p-2 cursor-pointer text-gray-400 hover:text-red-600">
                <button
                  type="button"
                  onClick={() => handleModalOpen(mainCustomer._id, mainCustomer?.name || t("DeleteMainCustomer"))}
                >
                  <Tooltip
                    id="delete"
                    Icon={FiTrash2}
                    title={t("Delete")}
                    bgColor="#EF4444"
                  />
                </button>
              </div>
            </div>
          </TableCell>
        </TableRow>

        {isExpanded && (
          <TableRow>
            <TableCell colSpan={10}>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {subCustomers.length === 0 ? (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t("NoSubCustomersFound")}
                    </div>
                  ) : (
                    subCustomers.map((sc) => (
                      <div
                        key={sc._id}
                        className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {sc?.image ? (
                            <img
                              src={sc.image}
                              alt={sc.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center shrink-0">
                              <FiUser className="text-gray-500 dark:text-gray-400" size={20} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {sc?.name} {sc?.lastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {sc?.email || "-"} {sc?.phone ? `• ${sc.phone}` : ""}
                            </div>
                            {sc?.contactPerson &&
                            (sc.contactPerson.firstName ||
                              sc.contactPerson.lastName ||
                              sc.contactPerson.phone) ? (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {t("ContactPerson")}:{" "}
                                {`${sc.contactPerson.firstName || ""} ${sc.contactPerson.lastName || ""}`.trim()}
                                {sc.contactPerson.phone ? ` • ${sc.contactPerson.phone}` : ""}
                              </div>
                            ) : null}
                            {sc?.accounting?.externalCustomerId ? (
                              <div className="text-xs text-mainColor truncate">
                                {t("RivhitCustomerNumber")} #{sc.accounting.externalCustomerId}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* <div className="shrink-0">
                          <CashierToggleButton
                            id={sc._id}
                            isCashier={sc.isCashier || false}
                          />
                        </div> */}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}
          </React.Fragment>
        );
      })}
    </TableBody>
  );
};

export default CustomerTable;