import React, { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

import { AdminContext } from "@/context/AdminContext";
import PlatformServices from "@/services/PlatformServices";

/**
 * "Whose data am I looking at?" — shown only to BizzStudio.
 *
 * A platform session reads the ordinary tenant screens unfiltered, so a product
 * list holds every customer's products at once. That is the intent, and it is
 * also why this control has to exist: a list of two thousand products from six
 * businesses is not useful until you can say WHICH business, and the answer has
 * to be visible rather than inferred.
 *
 * The choice is stored as `bzFilterTenant` and sent by `httpService` as
 * `?tenantId=`. Nothing about it is trusted: `buildTenantFilter` honours a
 * requested tenant ONLY for a context the server itself marked `super-admin`
 * during authentication, and drops it on the floor without comment for anyone
 * else. So a tenant admin who sets the same cookie by hand changes nothing.
 *
 * "All tenants" is the default because it is the honest one — it is what the
 * server returns when nothing is chosen, and starting on a filter would hide
 * that.
 */
export const FILTER_COOKIE = "bzFilterTenant";

const PLATFORM_ROLES = ["superadmin", "platform-admin"];

const TenantPicker = () => {
  const { state } = useContext(AdminContext);
  const isPlatform = PLATFORM_ROLES.includes(state?.adminInfo?.role);

  const [tenants, setTenants] = useState([]);
  const [value, setValue] = useState(Cookies.get(FILTER_COOKIE) || "");

  useEffect(() => {
    if (!isPlatform) return;
    PlatformServices.listTenants()
      .then((res) => setTenants(res?.tenants || []))
      .catch(() => setTenants([]));
  }, [isPlatform]);

  if (!isPlatform) return null;

  const onChange = (e) => {
    const next = e.target.value;
    setValue(next);
    if (next) Cookies.set(FILTER_COOKIE, next, { sameSite: "Lax" });
    else Cookies.remove(FILTER_COOKIE);
    /**
     * A full reload rather than a re-render.
     *
     * Every open screen has already fetched its rows for the previous choice,
     * and they hold that data in their own state. Reloading is the one thing
     * guaranteed to leave nothing behind from the tenant you just switched away
     * from — and showing one customer's figures under another's name, even for a
     * moment, is the single worst thing this screen could do.
     */
    window.location.reload();
  };

  return (
    <select
      value={value}
      onChange={onChange}
      title="הנתונים המוצגים שייכים ללקוח"
      className="text-sm border rounded-md px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
    >
      <option value="">כל הלקוחות</option>
      {tenants.map((t) => (
        <option key={t._id} value={t._id}>
          {t.nameHe || t.nameEn || t.slug}
        </option>
      ))}
    </select>
  );
};

export default TenantPicker;
