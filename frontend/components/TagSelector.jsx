import React from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import axios from "axios";
import API from "../src/api/axios.js";

const TagSelector = ({ value, onChange }) => {
  const loadOptions = async (inputValue) => {
    if (!inputValue) return [];

    try {
      const res = await API.get(
        // removed axios for API
        `/tags?search=${inputValue}`
        // `https://forms-app-vff5.onrender.com/tags?search=${inputValue}`
      );

      return res.data.map((tag) => ({
        label: tag,
        value: tag,
      }));
    } catch (err) {
      console.error("Failed to load tags", err);
      return [];
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tags (add or select)
      </label>
      <AsyncCreatableSelect
        isMulti
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        value={value.map((tag) => ({ label: tag, value: tag }))}
        onChange={(selected) => onChange(selected.map((opt) => opt.value))}
        placeholder="Type to search or create new tags..."
      />
    </div>
  );
};

export default TagSelector;
