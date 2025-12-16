
import React, { useContext, useEffect, useState } from "react";
import { Select } from "@windmill/react-ui";

const City = ({ setValue, placeholder }) => {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await fetch(
        "https://data.gov.il/api/3/action/datastore_search?resource_id=8f714b6f-c35c-4b40-a0e7-547b675eee0e&limit=100000"
      );
      const data = await response.json();
      let tempCities = []
      data.result.records.forEach(record => {
        tempCities.push(record)
      })
      setCities(tempCities.sort((a, b) => a.city_name_he.localeCompare(b.city_name_he, 'he')))
    })();
  }, [])
  return (
    <>
      <Select
        onChange={(e) => setValue(JSON.parse(e.target.value))}
        className="py-[13px] custom-select"
      >
        {placeholder && <option className="option" value={placeholder}>{JSON.parse(placeholder).city_name_he}</option>}
        {cities && cities.map((city) => (
          <option className="option" key={city._id} value={JSON.stringify(city)}>
            {city.city_name_he}
          </option>
        ))}
      </Select>
    </>
  );
};

export default City;
