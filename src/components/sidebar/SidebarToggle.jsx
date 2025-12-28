// src/components/sidebar/SidebarToggle.jsx
import React, { useContext } from "react";
import { FaBars } from "react-icons/fa6";
import { SidebarContext } from "@/context/SidebarContext";

const SidebarToggle = () => {
    const { navBar, setNavBar, toggleSidebar, isSidebarOpen } = useContext(SidebarContext);

    return (
        <>
            {/* כפתור Toggle למסכים גדולים */}
            <button
                type="button"
                onClick={() => setNavBar(!navBar)}
                className="fixed bottom-3 start-3 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 hidden lg:flex items-center justify-center focus:outline-none"
            >
                <FaBars
                    className={`w-4 h-4 text-gray-600 dark:text-gray-300 ${navBar ? '-rotate-180' : ''} transition-all duration-300`}
                />
            </button>

            {/* כפתור Toggle למסכים קטנים */}
            <button
                onClick={toggleSidebar}
                className="fixed bottom-1 end-1 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 lg:hidden flex items-center justify-center focus:outline-none"
                aria-label="Menu"
            >
                <FaBars
                    className={`w-4 h-4 text-gray-600 dark:text-gray-300 ${isSidebarOpen ? 'rotate-180' : ''} transition-all duration-300`}
                />
            </button>
        </>
    );
};

export default SidebarToggle;
