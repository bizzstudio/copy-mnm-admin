// src/components/form/selectOption/LabelArea.jsx
import React from "react";
import { Label } from "@windmill/react-ui";

const LabelArea = ({ label, oneLine = false, className }) => {
  return (
    <Label className={`${className} col-span-6 font-semibold text-sm`}>
      {label}
    </Label>
  );
};

export default LabelArea;