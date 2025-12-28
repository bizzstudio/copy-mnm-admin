// src/components/attribute/AttributeOption.jsx
import Select from "react-select";
import { useEffect, useState } from "react";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const AttributeOption = ({ id, attributes, values, setValues, resetRef }) => {
  const [attributeOptions, setAttributeOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectionLimit, setSelectionLimit] = useState(null);

  const { showingTranslateValue } = useUtilsFunction();

  useEffect(() => {
    const dd = attributes?.variants?.map((val) => {
      return {
        ...val,
        label: showingTranslateValue(val?.name),
        value: val._id,
      };
    });
    setAttributeOptions(dd);
  }, [attributes?.variants, showingTranslateValue]);

  useEffect(() => {
    if (values[attributes._id]) {
      const selected = attributeOptions.filter((opt) =>
        values[attributes._id].includes(opt.value)
      );
      setSelectedOptions(selected);
    } else {
      setSelectedOptions([]);
    }
  }, [values, attributes._id, attributeOptions]);

  const handleChange = (selected) => {
    if (!selected || selected.length === 0) {
      setSelectedOptions([]);
      setValues({
        ...values,
        [attributes._id]: [],
      });
      setSelectionLimit(null);
      return;
    }

    // Check if "All" was selected
    const allOption = selected.find((opt) => opt.value === "1");
    if (allOption) {
      const result = attributes?.variants.filter((att) => att._id !== "1");
      const allExceptAll = result.map((el) => el._id);

      setValues({
        ...values,
        [attributes._id]: allExceptAll,
      });
      setSelectionLimit(1);

      // Select all options except "All"
      const allOptionsExceptAll = attributeOptions.filter((opt) => opt.value !== "1");
      setSelectedOptions(allOptionsExceptAll);
    } else {
      setSelectionLimit(null);
      const exceptAllData = selected.filter((el) => el.value !== "1");
      setValues({
        ...values,
        [attributes._id]: exceptAllData.map((el) => el.value),
      });
      setSelectedOptions(selected);
    }
  };

  return (
    <>
      <Select
        key={id}
        isMulti
        options={attributeOptions}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={showingTranslateValue(attributes.title)}
        isClearable
        ref={(e) => {
          if (resetRef?.current) {
            resetRef.current[id] = e;
          }
        }}
        maxMenuHeight={200}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "42px",
          }),
        }}
      />
    </>
  );
};

export default AttributeOption;