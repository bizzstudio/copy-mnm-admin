// src/components/drawer/MainDrawer.jsx
import Drawer from "rc-drawer";
import React, { useContext, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { SidebarContext } from "@/context/SidebarContext";

const MainDrawer = ({ children, width }) => {
  const { toggleDrawer, isDrawerOpen, closeDrawer, windowDimension, lang } = useContext(SidebarContext);
  const placement = lang === 'he' ? 'left' : 'right';
  const invertedDir = lang === 'he' ? 'ltr' : 'rtl';
  const dir = lang === 'he' ? 'rtl' : 'ltr';

  const [drawerWidth, setDrawerWidth] = useState(null);

  useEffect(() => {
    if (width) {
      setDrawerWidth(width);
    }
  }, [width]);

  return (
    <Drawer
      dir={invertedDir}
      open={isDrawerOpen}
      onClose={closeDrawer}
      parent={null}
      level={null}
      placement={placement}
      width={`${windowDimension <= 800 ? "100%" : drawerWidth ? drawerWidth : "100%"}`}
      animation="slide"
    // width="100%"
    >
      <div dir={dir}>
        <button
          onClick={toggleDrawer}
          className="absolute focus:outline-none z-10 text-red-500 hover:bg-red-100 hover:text-gray-700 transition-colors duration-150 bg-white shadow-md ml-6 mt-6 left-0 right-auto w-10 h-10 rounded-full block text-center"
        >
          <FiX className="mx-auto" />
        </button>

        <div className="flex flex-col w-full h-full justify-between">
          {children}
        </div>
      </div>
    </Drawer>
  );
};

export default React.memo(MainDrawer);
