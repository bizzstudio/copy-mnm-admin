// src/pages/SalesChannels.jsx
import React, { useEffect, useState } from "react";
import { Card, CardBody } from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import PageTitle from "@/components/Typography/PageTitle";
import TableLoading from "@/components/preloader/TableLoading";
import ReportServices from "@/services/ReportServices";
import useUtilsFunction from "@/hooks/useUtilsFunction";

/**
 * פלטפורמות מכירה — מאיפה מגיעות ההזמנות.
 *
 * שלושה מצבים, ולא שניים. ההפרדה בין "זמין" ל"בקרוב" היא כל העניין: בלעדיה,
 * לקוח שמדליק WooCommerce רואה מתג ירוק ומחכה להזמנות שלא יגיעו — וזה לא נראה
 * כמו תקלה שמדווחים עליה, זה נראה כמו "אין הזמנות".
 */
const STATE_STYLE = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  available: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  comingSoon: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

const STATE_LABEL = {
  active: "ChannelActive",
  available: "ChannelAvailable",
  comingSoon: "ChannelComingSoon",
};

const SalesChannels = () => {
  const { t } = useTranslation();
  const { showDateTimeFormat, getNumber } = useUtilsFunction();

  const [channels, setChannels] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    ReportServices.getSalesChannels()
      .then((data) => alive && setChannels(data?.channels ?? []))
      .catch((err) => alive && setError(err?.displayMessage || err?.message));
    return () => {
      alive = false;
    };
  }, []);

  const groups = [
    { kind: "internal", title: t("InternalChannels"), hint: t("InternalChannelsHint") },
    { kind: "external", title: t("ExternalChannels"), hint: t("ExternalChannelsHint") },
  ];

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("SalesChannels")}</PageTitle>

      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {t("SalesChannelsDescription")}
      </p>

      {error && <p className="mb-4 text-center text-red-500">{error}</p>}

      {channels === null ? (
        <TableLoading row={6} col={4} width={163} height={20} />
      ) : (
        groups.map((group) => {
          const rows = channels.filter((c) => c.kind === group.kind);
          if (!rows.length) return null;

          return (
            <section key={group.kind} className="mb-8">
              <h2 className="mb-1 text-lg font-semibold text-gray-700 dark:text-gray-200">
                {group.title}
              </h2>
              <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{group.hint}</p>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {rows.map((channel) => (
                  <Card
                    key={channel.source}
                    className="min-w-0 shadow-xs bg-white dark:bg-gray-800"
                  >
                    <CardBody>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                          {channel.nameHe}
                        </h3>
                        <span
                          className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${
                            STATE_STYLE[channel.state]
                          }`}
                        >
                          {t(STATE_LABEL[channel.state])}
                        </span>
                      </div>

                      {channel.descriptionHe && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {channel.descriptionHe}
                        </p>
                      )}

                      <dl className="mt-4 flex gap-6 text-sm">
                        <div>
                          <dt className="text-xs text-gray-500 dark:text-gray-400">
                            {t("OrdersFromChannel")}
                          </dt>
                          <dd className="font-semibold dark:text-gray-200">
                            {getNumber(channel.orderCount)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500 dark:text-gray-400">
                            {t("LastOrder")}
                          </dt>
                          <dd className="font-semibold dark:text-gray-200">
                            {channel.lastOrderAt ? showDateTimeFormat(channel.lastOrderAt) : "—"}
                          </dd>
                        </div>
                      </dl>

                      {channel.orderCount > 0 && (
                        <Link
                          to={`/orders?source=${channel.source}`}
                          className="mt-4 inline-flex items-center gap-1 text-sm text-mainColor hover:underline"
                        >
                          {t("ViewChannelOrders")}
                          <FiArrowLeft />
                        </Link>
                      )}

                      {channel.state === "comingSoon" && (
                        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                          {t("ChannelComingSoonHint")}
                        </p>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
};

export default SalesChannels;
