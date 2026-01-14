// src/hooks/useProductFilter.js
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";

/**
 * Hook for managing product filters
 * Works with SidebarContext to maintain app conventions
 */
const useProductFilter = () => {
  const {
    searchText,
    setSearchText,
    category,
    setCategory,
    sortedField,
    setSortedField,
    searchRef,
    handleSubmitForAll,
  } = useContext(SidebarContext);

  // Reset filters - maintains app conventions
  const resetFilters = () => {
    setCategory("");
    setSortedField("");
    setSearchText(null);
    if (searchRef.current) {
      searchRef.current.value = "";
    }
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return !!(searchText || category || sortedField);
  };

  return {
    // State from context
    searchText,
    setSearchText,
    category,
    setCategory,
    sortedField,
    setSortedField,
    searchRef,
    handleSubmitForAll,

    // Helper functions
    resetFilters,
    hasActiveFilters,
  };
};

export default useProductFilter;