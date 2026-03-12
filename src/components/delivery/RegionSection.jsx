import React, { useContext } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { SidebarContext } from "@/context/SidebarContext";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import CollapsibleSection from "@/components/common/CollapsibleSection";

const RegionSection = ({ region, onUpdate, onEditRegion, onDeleteRegion }) => {
  const { t } = useTranslation();
  const { toggleDrawer, setServiceId, setDeliveryRegionId, setDeliveryDrawerContent, setDeleteTargetType } = useContext(SidebarContext);
  const { handleUpdate, handleModalOpen, serviceId } = useToggleDrawer();

  const deliveries = region.deliveries || [];
  /** אזור וירטואלי (fallback) – לא עריכה/מחיקה */
  const isFakeRegion = region._id === "all-country";

  const handleAddDestination = () => {
    setDeliveryDrawerContent("delivery");
    setDeliveryRegionId(region._id);
    setServiceId(null);
    toggleDrawer();
  };

  const handleEditDestination = (id) => {
    setDeliveryDrawerContent("delivery");
    setDeliveryRegionId(region._id);
    handleUpdate(id);
  };

  const handleDeleteDestination = (deliveryId, deliveryTitle) => {
    setDeleteTargetType("delivery");
    setDeliveryDrawerContent("delivery");
    setDeliveryRegionId(region._id);
    handleModalOpen(deliveryId, deliveryTitle);
  };

  return (
    <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
      <CardBody>
        <CollapsibleSection title={region.name || t("Region")} defaultOpen={false}>
          {/* כפתורי עריכה/מחיקה בתוך הסקשן –סקשן סגור לא נראים */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {!isFakeRegion && onEditRegion && (
              <Button size="small" layout="outline" onClick={onEditRegion}>
                <FiEdit className="inline me-1" />
                {t("Edit")}
              </Button>
            )}
            {!isFakeRegion && onDeleteRegion && (
              <Button size="small" layout="outline" onClick={onDeleteRegion} className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20">
                <FiTrash2 className="inline me-1" />
                {t("Delete")}
              </Button>
            )}
          </div>

          {/* יעדים */}
          <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
              {t("Destinations")}
            </h3>
            {!isFakeRegion && (
              <Button size="small" onClick={handleAddDestination}>
                <FiPlus className="inline me-1" />
                {t("AddDestination")}
              </Button>
            )}
          </div>

          {deliveries.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
              {t("NoDestinations")}
            </p>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <tr>
                    <TableCell>{t("City")}</TableCell>
                    <TableCell>{t("Days")}</TableCell>
                    <TableCell>{t("Actions")}</TableCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {deliveries.map((d) => (
                    <TableRow key={d._id}>
                      <TableCell>
                        <span className="text-sm">
                          {d.city?.city_name_he || d.city?.city_name || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {Array.isArray(d.days) && d.days.length
                            ? d.days.map((day) => day?.name).filter(Boolean).join(", ")
                            : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <EditDeleteButton
                          id={d._id}
                          isCheck={[]}
                          setIsCheck={() => {}}
                          handleUpdate={() => handleEditDestination(d._id)}
                          handleModalOpen={() => handleDeleteDestination(d._id, d.city?.city_name_he || d.city?.city_name)}
                          title={d.city?.city_name_he || d.city?.city_name}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          </div>
        </CollapsibleSection>
      </CardBody>
    </Card>
  );
};

export default RegionSection;
