import React, { useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { WindmillContext } from "@windmill/react-ui";

// Internal import
import OrderServices from "@/services/OrderServices";
import { notifySuccess, notifyError } from "@/utils/toast";
import { SidebarContext } from "@/context/SidebarContext";
import ChangStatusModal from "@/components/modal/ChangStatusModal";

const SelectStatus = ({ id, order }) => {
  const { setIsUpdate, statusesData: data } = useContext(SidebarContext);
  const { mode } = useContext(WindmillContext);
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [tempStatus, setTempStatus] = useState(null);

  // Update the status when the data or order changes
  useEffect(() => {
    if (order && data) {
      const foundStatus = data.find((status) => status?.name === order?.status?.name);
      setCurrentStatus(foundStatus || null);
    }
  }, [order, data]);

  const handleConfirmChange = async () => {
    if (!tempStatus) return;
    try {
      await OrderServices.updateOrder(id, { status: tempStatus?.name });
      notifySuccess(t("Status updated successfully"));
      setCurrentStatus(tempStatus);
      setIsUpdate(true);
      setIsModalOpen(false);
    } catch (err) {
      notifyError(err?.response?.data?.message || t("Failed to update status"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (selectedOption) => {
    if (!selectedOption?.data) return;
    setTempStatus(selectedOption.data);
    setIsModalOpen(true);
  };

  if (!currentStatus || !data) return null;

  // Convert data to react-select format; שם המלקט מוצג רק ליד סטטוס ליקוט
  const options = data.map((status) => ({
    value: status._id,
    label: status.heName + (order?.actualMelaket?.heName && status?.name === 'Likut' ? ` (${order.actualMelaket.heName})` : ''),
    color: status.color,
    data: status,
  }));

  const selectedOption = options.find((opt) => opt.value === currentStatus._id);

  // Custom styles for react-select
  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: "fit-content",
      minWidth: "140px",
    }),
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "var(--main-color)" : provided.borderColor,
      minHeight: "32px",
      height: "32px",
      backgroundColor: mode === "dark" ? "#374151" : "#f3f4f6",
      color: mode === "dark" ? "#D1D5DB" : provided.color,
      boxShadow: state.isFocused ? `0 0 0 1px var(--main-color)` : provided.boxShadow,
      outline: "none",
      border: mode === "dark" ? "1px solid #4b5563" : "1px solid #e5e7eb",
      cursor: "pointer",
      transition: "all 0.2s",
      "&:hover": {
        borderColor: state.isFocused ? "var(--main-color)" : mode === "dark" ? "var(--main-color)" : provided.borderColor,
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "32px",
      padding: "0 8px",
    }),
    option: (provided, state) => ({
      ...provided,
      padding: "3px 10px",
      backgroundColor: mode === "dark"
        ? state.isFocused ? "#334155" : "#1F2937"
        : state.isFocused ? "var(--main-color-super-light)" : provided.backgroundColor,
      color: mode === "dark" ? "#D1D5DB" : state.isFocused ? "#000" : provided.color,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      position: "relative",
      "&:before": {
        content: '""',
        display: "inline-block",
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        backgroundColor: state.data.color || "#6B7280",
        marginLeft: "8px",
        flexShrink: 0,
      },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 100 }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: mode === "dark" ? "#1F2937" : "#fff",
      border: mode === "dark" ? "1px solid #4b5563" : "1px solid #e5e7eb",
      boxShadow: mode === "dark"
        ? "0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.3)"
        : provided.boxShadow,
      zIndex: 100,
      minWidth: "160px",
    }),
    menuList: (provided) => ({
      ...provided,
      backgroundColor: mode === "dark" ? "#1F2937" : "#fff",
      paddingTop: 0,
      paddingBottom: 0,
      maxHeight: "240px",
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      backgroundColor: mode === "dark" ? "#1F2937" : "#fff",
      color: mode === "dark" ? "#D1D5DB" : "#374151",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
      color: mode === "dark" ? "#D1D5DB" : "#374151",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: mode === "dark" ? "#D1D5DB" : "#374151",
      fontWeight: "500",
      fontSize: "0.875rem",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "4px",
      color: mode === "dark" ? "#D1D5DB" : "#374151",
    }),
  };

  return (
    <>
      {isModalOpen && (
        <ChangStatusModal
          yes={handleConfirmChange}
          cancel={() => setIsModalOpen(false)}
          status={tempStatus?.heName}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          userName={order?.user_info?.name + " " + order?.user_info?.lastName}
          requirePassword={false}
        />
      )}

      <Select
        value={selectedOption}
        onChange={handleStatusChange}
        options={options}
        styles={customStyles}
        isSearchable={false}
        isDisabled={isSubmitting}
        menuPlacement="auto"
        menuPortalTarget={document.body}
        menuPosition="fixed"
        noOptionsMessage={() => t("noOptions")}
      />
    </>
  );
};

export default SelectStatus;
