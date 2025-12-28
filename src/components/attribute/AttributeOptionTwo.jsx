// src/components/attribute/AttributeOptionTwo.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const AttributeOptionTwo = ({
  attributes,
  values,
  setValues,
  selectedValueClear,
}) => {
  const [attributeOptions, setAttributeOptions] = useState([]);
  const [selected, setSelected] = useState([]);
  // console.log('attributes in attribute option',attributes)

  const { showingTranslateValue } = useUtilsFunction();

  const handleSelectValue = (items) => {
    // setSelectedValueClear(false);
    setSelected(items || []);
    setValues({
      ...values,
      [attributes._id]: items?.map((el) => el.value) || [],
    });
  };

  useEffect(() => {
    const options = attributes?.variants?.map((val) => {
      return {
        label: showingTranslateValue(val?.name),
        value: val?._id,
      };
    });
    setAttributeOptions(options);
  }, [attributes?.variants, showingTranslateValue]);

  useEffect(() => {
    if (selectedValueClear) {
      setSelected([]);
    }
  }, [selectedValueClear]);

  // Sync selected with values when attributes change
  useEffect(() => {
    if (attributes?._id && values?.[attributes._id]) {
      const selectedIds = values[attributes._id];
      const selectedOptions = attributeOptions.filter(opt =>
        selectedIds.includes(opt.value)
      );
      setSelected(selectedOptions);
    }
  }, [attributes?._id, values, attributeOptions]);

  return (
    <div>
      <Select
        isMulti
        options={attributeOptions}
        value={selected}
        onChange={handleSelectValue}
        placeholder="Select"
        className="react-select-container"
        classNamePrefix="react-select"
      />
    </div>
  );
};

export default AttributeOptionTwo;