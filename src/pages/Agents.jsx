import {
  Button,
  Card,
  CardBody,
  Input,
  Table,
  TableContainer,
  TableCell,
  TableHeader,
} from "@windmill/react-ui";
import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { FiPlus, FiRefreshCw, FiUpload } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";

import { SidebarContext } from "@/context/SidebarContext";
import AgentServices from "@/services/AgentServices";
import PageTitle from "@/components/Typography/PageTitle";
import MainDrawer from "@/components/drawer/MainDrawer";
import AgentDrawer from "@/components/drawer/AgentDrawer";
import AgentTable from "@/components/agents/AgentTable";
import NotFound from "@/components/table/NotFound";
import TableLoading from "@/components/preloader/TableLoading";
import { notifyError, notifySuccess } from "@/utils/toast";

const Agents = () => {
  const { t } = useTranslation();
  const {
    toggleDrawer,
    isDrawerOpen,
    setServiceId,
    serviceId,
    isUpdate,
    setIsUpdate,
  } = useContext(SidebarContext);

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AgentServices.getAllAgents(search ? { q: search } : {});
      setAgents(Array.isArray(data) ? data : []);
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (isUpdate) {
      fetchAgents();
      setIsUpdate(false);
    }
  }, [isUpdate, fetchAgents, setIsUpdate]);

  // איפוס serviceId כאשר Drawer נסגר
  useEffect(() => {
    if (!isDrawerOpen) setServiceId("");
  }, [isDrawerOpen, setServiceId]);

  const handleAdd = () => {
    setServiceId("");
    toggleDrawer();
  };

  const handleEdit = (id) => {
    setServiceId(id);
    toggleDrawer();
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `${t("ConfirmDeleteAgent")}: ${name}?`
    );
    if (!confirmed) return;
    try {
      const res = await AgentServices.deleteAgent(id);
      if (res?.soft) {
        notifySuccess(
          typeof res.message === "object" ? res.message.he : res.message
        );
      } else {
        notifySuccess(t("AgentDeleted"));
      }
      fetchAgents();
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  // ====================== ייבוא אקסל מחירי סוכן ======================
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handlePricingFile = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    if (
      !file.name.endsWith(".xls") &&
      !file.name.endsWith(".xlsx") &&
      !file.type?.includes("spreadsheetml")
    ) {
      notifyError("נא לבחור קובץ Excel (.xlsx)");
      return;
    }

    setImporting(true);
    try {
      // קריאת האקסל בדפדפן והמרה ל-JSON (אותו דפוס כמו PriceList import)
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      if (!rows || rows.length === 0) {
        notifyError("הקובץ ריק");
        return;
      }

      const res = await AgentServices.importAgentPricing({ rows });
      const msg = res?.message?.he || res?.message?.en || "ייבוא הסתיים";
      const summary = res?.summary || {};
      notifySuccess(
        `${msg} (תקינים: ${summary.succeeded || 0}, שגויים: ${summary.failed || 0})`
      );

      if (res?.errors?.length) {
        console.warn("Import errors:", res.errors);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message?.he ||
        err?.response?.data?.message?.en ||
        err?.response?.data?.message ||
        err?.message ||
        "שגיאה בייבוא";
      notifyError(msg);
      console.error("Pricing import error:", err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("AgentsPageTitle")}</PageTitle>

      <MainDrawer maxWidth="560px">
        <AgentDrawer id={serviceId} />
      </MainDrawer>

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <form
            onSubmit={handleSearch}
            className="py-3 grid gap-4 md:gap-6 md:flex"
          >
            <div className="grow">
              <Input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("SearchAgent")}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="h-12 px-6 bg-customGreen-dark">
                {t("Filter")}
              </Button>
              <Button
                layout="outline"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                }}
                type="button"
                className="h-12 px-4"
              >
                {t("Reset")}
              </Button>
              <Button
                onClick={fetchAgents}
                layout="outline"
                type="button"
                className="h-12 px-3"
                aria-label="Refresh"
              >
                <FiRefreshCw />
              </Button>
              <Button
                onClick={openFilePicker}
                disabled={importing}
                layout="outline"
                type="button"
                className="h-12 px-4"
              >
                <FiUpload className="ml-1" />
                {importing ? "מעלה..." : t("ImportAgentPricing")}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handlePricingFile}
                className="hidden"
              />
              <Button onClick={handleAdd} className="h-12 px-6">
                <FiPlus className="ml-1" />
                {t("AddAgent")}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {loading ? (
        <TableLoading row={8} col={8} width={120} height={20} />
      ) : agents.length === 0 ? (
        <NotFound title={t("NoAgentsFound")} />
      ) : (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>{t("AgentName")}</TableCell>
                <TableCell>{t("Phone")}</TableCell>
                <TableCell>{t("Email")}</TableCell>
                <TableCell>{t("MaxDiscount")}</TableCell>
                <TableCell>{t("MonthlyTarget")}</TableCell>
                <TableCell>{t("Status")}</TableCell>
                <TableCell>{t("Actions")}</TableCell>
              </tr>
            </TableHeader>
            <AgentTable
              agents={agents}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default Agents;
