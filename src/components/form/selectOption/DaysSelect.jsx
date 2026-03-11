// src/components/form/selectOption/DaysSelect.jsx
import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";

const DaysSelect = ({ setSelectedDays, selectedDaysFromUser = [] }) => {
  const [selectedDaysState, setSelectedDaysState] = useState(selectedDaysFromUser);
  const { t } = useTranslation();

  const daysOfWeek = [
    { name: "Sunday", value: 1 },
    { name: "Monday", value: 2 },
    { name: "Tuesday", value: 3 },
    { name: "Wednesday", value: 4 },
    { name: "Thursday", value: 5 },
    { name: "Friday", value: 6 },
    { name: "Saturday", value: 7 },
  ];

  useEffect(() => {
    setSelectedDaysState(selectedDaysFromUser);
  }, [selectedDaysFromUser]);

  const handleDayChange = (e) => {
    const { value, checked } = e.target;
    const dayV = JSON.parse(value);
    const next = checked
      ? [...selectedDaysState, dayV]
      : selectedDaysState.filter((day) => day.value !== dayV.value);
    setSelectedDaysState(next);
    setSelectedDays(next);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{t("Days")}</h3>
      {daysOfWeek.map((day, index) => (
        <div key={index} className="flex items-center mb-2">
          <label className="flex gap-2">
            <input
              type="checkbox"
              id={`day-${index}`}
              name={`day-${index}`}
              value={JSON.stringify(day)}
              checked={selectedDaysState.some((d) => d.value === day.value)}
              onChange={handleDayChange}
              className="ml-2"
            />
            {t(day.name)}
          </label>
        </div>
      ))}
    </div>
  );
};

export default DaysSelect;
