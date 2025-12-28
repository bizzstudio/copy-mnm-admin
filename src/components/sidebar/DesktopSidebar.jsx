// src/components/sidebar/DesktopSidebar.jsx
import React, { useContext } from "react";
import SidebarContent from "@/components/sidebar/SidebarContent";
import { SidebarContext } from "@/context/SidebarContext";

const DesktopSidebar = () => {
  const { navBar } = useContext(SidebarContext);
  
  return (
    <aside
      className={`fixed inset-y-0 start-0 z-30 w-64
                  bg-white dark:bg-gray-800 shadow-sm
                  transition-transform duration-300 ease-in-out
                  transform overflow-visible
                  hidden lg:flex lg:flex-col
                  ${navBar ? "translate-x-0" : "rtl:translate-x-full ltr:-translate-x-full"}`}
    >
      <SidebarContent />
    </aside>
  );
};

export default DesktopSidebar;