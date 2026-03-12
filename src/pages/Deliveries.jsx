import React, { useContext } from "react";
import { Button, Card, CardBody } from "@windmill/react-ui";
import { FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";

// Internal import
import useAsync from "@/hooks/useAsync";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import TableLoading from "@/components/preloader/TableLoading";
import RegionServices from "@/services/RegionServices";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import DeleteModal from "@/components/modal/DeleteModal";
import MainDrawer from "@/components/drawer/MainDrawer";
import DeliveryDrawer from "@/components/drawer/DeliveryDrawer";
import RegionDrawer from "@/components/drawer/RegionDrawer";
import { SidebarContext } from "@/context/SidebarContext";
import RegionSection from "@/components/delivery/RegionSection";

const Deliveries = () => {
  const {
    toggleDrawer,
    setServiceId,
    setDeliveryDrawerContent,
    deliveryDrawerContent,
    deliveryRegionId,
    setIsUpdate,
    deleteTargetType,
    setDeleteTargetType,
  } = useContext(SidebarContext);

  const { serviceId, handleModalOpen, title } = useToggleDrawer();
  const { t } = useTranslation();

  /** טעינת אזורים בלבד. כל יעד חייב להיות בתוך אזור – אין fallback לרשימת משלוחים שטוחה. */
  const { data, loading, error } = useAsync(async () => {
    const res = await RegionServices.getAllRegions();
    const list = Array.isArray(res) ? res : (res?.regions ?? []);
    return { regions: list };
  });

  const regions = Array.isArray(data) ? data : (data?.regions ?? []);

  const handleAddRegion = () => {
    setDeliveryDrawerContent("region");
    setServiceId(null);
    toggleDrawer();
  };

  return (
    <div className="w-full h-fit flex flex-col lg:px-20 sm:px-4 px-5 mx-auto overflow-x-hidden">
      <PageTitle>{t("Deliveries")}</PageTitle>
      <DeleteModal
        id={serviceId}
        title={deleteTargetType === "region" ? (title || t("Region")) : (title || t("Delivery"))}
      />

      <MainDrawer>
        {deliveryDrawerContent === "region" ? (
          <RegionDrawer id={serviceId} />
        ) : (
          <DeliveryDrawer id={serviceId} regionId={deliveryRegionId} />
        )}
      </MainDrawer>

      <Card className="min-w-0 shadow-xs bg-white dark:bg-gray-800 mb-5">
        <CardBody>
          <Button onClick={handleAddRegion} className="rounded-md h-12" type="button">
            <span className="ml-2">
              <FiPlus />
            </span>
            {t("AddRegion")}
          </Button>
        </CardBody>
      </Card>

      {loading ? (
        <TableLoading row={12} col={5} width={163} height={20} />
      ) : error ? (
        <div className="space-y-2">
          <span className="text-center mx-auto text-amber-600 dark:text-amber-400 block">{error}</span>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t("NoRegions")}</p>
          <div className="flex justify-center">
            <Button onClick={handleAddRegion} className="rounded-md">{t("AddRegion")}</Button>
          </div>
        </div>
      ) : regions.length === 0 ? (
        <>
          <NotFound title={t("NoRegions")} />
          <div className="flex justify-center mt-2">
            <Button onClick={handleAddRegion} className="rounded-md">{t("AddRegion")}</Button>
          </div>
        </>
      ) : (
        regions.map((region) => (
          <RegionSection
            key={region._id}
            region={region}
            onUpdate={() => setIsUpdate(true)}
            onEditRegion={() => {
              setDeliveryDrawerContent("region");
              setServiceId(region._id);
              toggleDrawer();
            }}
            onDeleteRegion={() => {
              setDeleteTargetType("region");
              handleModalOpen(region._id, region.name);
            }}
          />
        ))
      )}
    </div>
  );
};

export default Deliveries;