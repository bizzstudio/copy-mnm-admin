
// hooks/useDeliverySubmit.js
import { useState, useEffect, useContext } from "react";
import DeliveryServices from "@/services/DeliveryServices";
import { useForm } from "react-hook-form";
import { notifyError, notifySuccess } from "@/utils/toast";
import { SidebarContext } from "@/context/SidebarContext";

const useDeliverySubmit = (id) => {
  const { closeDrawer, setIsUpdate, isDrawerOpen } = useContext(SidebarContext);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm();

  const [openModal, setOpenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [city, setCity] = useState('');
  const [days, setDays] = useState([]);

  useEffect(() => {
    if (!isDrawerOpen) {
      setValue("city", "");
      setValue("price", "");
      setValue("days", []);
      setCity('');
      setDays([]);
      clearErrors("city");
      clearErrors("price");
      clearErrors("days");
      setIsSubmitting(false);
      return;
    }

    // הוספת משלוח חדש – ללא ימים מסומנים, המשתמש בוחר
    if (!id) {
      setValue("days", []);
      setDays([]);
      return;
    }
    
    if (id) {
      DeliveryServices.getDeliveryById(id)
        .then((res) => {
          const delivery = res;
          setValue("city", delivery?.city);
          setCity(delivery?.city);
          setValue("price", delivery?.price);
          const deliveryDays = Array.isArray(delivery?.days) ? delivery.days : [];
          setValue("days", deliveryDays);
          setDays(deliveryDays);
        })
        .catch((err) => {
          notifyError(err?.response?.data?.message || err?.message);
        });
    }
  }, [id, setValue, isDrawerOpen, clearErrors]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const verifyCity = () => {
        if (city) {
          return city;
        } else {
          throw { message: "Please select a city" };
        }
      };

      if (!days?.length) {
        notifyError("יש לבחור לפחות יום משלוח אחד");
        setIsSubmitting(false);
        return;
      }

      const deliveryData = {
        city: verifyCity(),
        price: data.price,
        days,
      };

      if (id) {
        await DeliveryServices.updateDelivery(id, deliveryData);
        notifySuccess("Delivery updated successfully!");
      } else {
        await DeliveryServices.addDelivery(deliveryData);
        notifySuccess("Delivery created successfully!");
      }
      
      setIsUpdate(true);
      closeDrawer();
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    openModal,
    isSubmitting,
    city,
    setCity,
    days,
    setDays
  };
};

export default useDeliverySubmit;
