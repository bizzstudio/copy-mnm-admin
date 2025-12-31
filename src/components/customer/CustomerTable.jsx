// src/components/customer/CustomerTable.jsx
import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import dayjs from "dayjs";
import { t } from "i18next";
import React from "react";
import { FiZoomIn, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";

// Internal import
import Tooltip from "@/components/tooltip/Tooltip";
import CashierToggleButton from "@/components/table/CashierToggleButton";

const CustomerTable = ({ customers, handleModalOpen }) => {

  return (
    <TableBody>
      {customers?.map((user) => (
        <TableRow key={user._id}>
          <TableCell className="text-center">
            <span className="font-semibold uppercase text-xs">
              {" "}
              {user?._id?.substring(20, 24)}
            </span>
          </TableCell>

          <TableCell className="text-center">
            <span className="text-sm">
              {dayjs(user.createdAt).format("MMM D, YYYY")}
            </span>
          </TableCell>

          <TableCell className="text-center">
            <span className="text-sm">{user.name} {user.lastName}</span>
          </TableCell>

          <TableCell className="text-center">
            <span className="text-sm">{user.email}</span>{" "}
          </TableCell>

          <TableCell className="text-center">
            <span className="text-sm font-medium">{user.phone}</span>
          </TableCell>

          <TableCell className="text-center">
            <CashierToggleButton
              id={user._id}
              isCashier={user.isCashier || false}
            />
          </TableCell>

          <TableCell className="text-center">
            <div className="flex justify-center text-center gap-2">
              <div className="p-2 cursor-pointer text-gray-400 hover:text-customGreen-dark">
                <Link to={`/customer/${user._id}`}>
                  <Tooltip
                    id="view"
                    Icon={FiZoomIn}
                    title={t("View")}
                    bgColor="#10B981"
                  />
                </Link>
              </div>
              <button
                onClick={() => handleModalOpen(user._id, `${user.name} ${user.lastName}`)}
                className="p-2 cursor-pointer text-gray-400 hover:text-red-600 focus:outline-none"
              >
                <Tooltip
                  id="delete"
                  Icon={FiTrash2}
                  title={t("Delete")}
                  bgColor="#EF4444"
                />
              </button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

export default CustomerTable;