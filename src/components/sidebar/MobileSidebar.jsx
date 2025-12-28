// src/components/sidebar/MobileSidebar.jsx
import React, { useContext } from "react";

// Internal import
import SidebarContent from "@/components/sidebar/SidebarContent";
import { SidebarContext } from "@/context/SidebarContext";

function MobileSidebar() {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-40 bg-black transition-opacity duration-200 lg:hidden
          ${isSidebarOpen
            ? 'opacity-50 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
          }
        `}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col shrink-0 overflow-visible
          bg-white dark:bg-gray-800 lg:hidden
          transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
}

export default MobileSidebar;