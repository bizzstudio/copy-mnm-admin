
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
  // תמיד נקבע את כל הימים כברירת מחדל
  const [days, setDays] = useState([
    { name: "Sunday", value: 1 },
    { name: "Monday", value: 2 },
    { name: "Tuesday", value: 3 },
    { name: "Wednesday", value: 4 },
    { name: "Thursday", value: 5 },
    { name: "Friday", value: 6 },
    { name: "Saturday", value: 7 },
  ]);

  useEffect(() => {
    if (!isDrawerOpen) {
      // איפוס הטופס כשה-drawer נסגר
      setValue("city", "");
      setValue("price", "");
      setValue("days", []);
      setCity('');
      setDays([
        { name: "Sunday", value: 1 },
        { name: "Monday", value: 2 },
        { name: "Tuesday", value: 3 },
        { name: "Wednesday", value: 4 },
        { name: "Thursday", value: 5 },
        { name: "Friday", value: 6 },
        { name: "Saturday", value: 7 },
      ]);
      clearErrors("city");
      clearErrors("price");
      clearErrors("days");
      setIsSubmitting(false);
      return;
    }
    
    if (id) {
      DeliveryServices.getDeliveryById(id)
        .then((res) => {
          const delivery = res;
          console.log('delivery', delivery)
          // setValue("name_of_region", delivery?.name_of_region);
          setValue("city", delivery?.city);
          setCity(delivery?.city)
          setValue("price", delivery?.price);
          // תמיד נקבע את כל הימים גם בעדכון
          setValue("days", [
            { name: "Sunday", value: 1 },
            { name: "Monday", value: 2 },
            { name: "Tuesday", value: 3 },
            { name: "Wednesday", value: 4 },
            { name: "Thursday", value: 5 },
            { name: "Friday", value: 6 },
            { name: "Saturday", value: 7 },
          ]);
          setDays([
            { name: "Sunday", value: 1 },
            { name: "Monday", value: 2 },
            { name: "Tuesday", value: 3 },
            { name: "Wednesday", value: 4 },
            { name: "Thursday", value: 5 },
            { name: "Friday", value: 6 },
            { name: "Saturday", value: 7 },
          ]);
        })
        .catch((err) => {
          notifyError(err?.response?.data?.message || err?.message);
        });
    }
  }, [id, setValue, isDrawerOpen, clearErrors]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    console.log('data', data)

    try {
      const verifyCity = () => {
        if (city) {
          return city;
        } else {
          throw { message: "Please select a city" };
        }
      };

      // תמיד נשלח את כל הימים
      const allDays = [
        { name: "Sunday", value: 1 },
        { name: "Monday", value: 2 },
        { name: "Tuesday", value: 3 },
        { name: "Wednesday", value: 4 },
        { name: "Thursday", value: 5 },
        { name: "Friday", value: 6 },
        { name: "Saturday", value: 7 },
      ];

      const deliveryData = {
        city: verifyCity(),
        price: data.price,
        days: allDays, // תמיד כל הימים
      };

      if (id) {
        console.log("deliveryData update: ", deliveryData);
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
