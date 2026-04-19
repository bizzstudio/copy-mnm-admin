// src/components/invoice/Invoice.jsx
import React from "react";
import { TableCell, TableBody, TableRow } from "@windmill/react-ui";
import { getOrderLineVatBreakdown } from "@/utils/orderLineVat";

const Invoice = ({ data, currency, getNumberTwo, vatRatePercent }) => {
  return (
    <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 text-serif text-sm ">
      {data?.cart?.map((item, i) => {
        const { beforeVat, vat, incl } = getOrderLineVatBreakdown(
          item,
          vatRatePercent
        );
        return (
          <TableRow key={i} className="dark:border-gray-700 dark:text-gray-400">
            <TableCell className="px-6 py-1 whitespace-nowrap font-normal text-gray-500 text-right">
              {i + 1}{" "}
            </TableCell>
            <TableCell className="px-6 py-1 whitespace-nowrap font-normal text-gray-500">
              <span
                className={`text-gray-700 font-semibold  dark:text-gray-300 text-xs`}
              >
                {item.title.he}
              </span>
            </TableCell>
            <TableCell className="px-6 py-1 whitespace-nowrap font-bold text-center">
              {item.quantity}{" "}
            </TableCell>
            <TableCell className="px-6 py-1 whitespace-nowrap font-bold text-center">
              {currency}
              {getNumberTwo(beforeVat)}
            </TableCell>
            <TableCell className="px-6 py-1 whitespace-nowrap font-bold text-center">
              {currency}
              {getNumberTwo(vat)}
            </TableCell>
            <TableCell className="px-6 py-1 whitespace-nowrap text-right font-bold text-red-500 dark:text-customGreen">
              {currency}
              {getNumberTwo(incl)}
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export default Invoice;
