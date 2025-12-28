// src/components/drawer/MainDrawer.jsx
import React, { useContext, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { SidebarContext } from "@/context/SidebarContext";

const MainDrawer = ({ children, width = "700px" }) => {
  const { isDrawerOpen, closeDrawer, lang } = useContext(SidebarContext);
  // בעברית (RTL) הדרוור נפתח מימין, באנגלית (LTR) משמאל
  const placement = lang === 'he' ? 'right' : 'left';
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  // ניהול מצב הרינדור ואנימציות
  useEffect(() => {
    if (isDrawerOpen) {
      setShouldRender(true);
      setIsClosing(false);
      // מתחיל את אנימציית הפתיחה אחרי render קצר
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsOpening(true);
        });
      });
    } else if (shouldRender) {
      // מתחיל אנימציית סגירה
      setIsOpening(false);
      setIsClosing(true);
      // מסיר מהדום אחרי שהאנימציה מסתיימת
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
        setIsOpening(false);
      }, 300); // זמן האנימציה
      return () => clearTimeout(timer);
    }
  }, [isDrawerOpen, shouldRender]);

  // מניעת scroll של body כשהדרוור פתוח
  useEffect(() => {
    if (isDrawerOpen && !isClosing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // ניקוי בעת unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen, isClosing]);

  // סגירה בלחיצה על overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeDrawer();
    }
  };

  // סגירה ב-ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isDrawerOpen && !isClosing) {
        closeDrawer();
      }
    };

    if (isDrawerOpen && !isClosing) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDrawerOpen, isClosing, closeDrawer]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex ${placement === 'left' ? 'justify-start' : 'justify-end'} ${isClosing ? 'pointer-events-none' : ''
        }`}
      dir={dir}
    >
      {/* Overlay - רקע מחשיך */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity duration-300 ease-in-out ${isClosing ? 'opacity-0' : 'opacity-100'
          }`}
        onClick={handleOverlayClick}
      />

      {/* Drawer */}
      <div
        className={`relative h-full bg-white dark:bg-gray-800 shadow-xl flex flex-col transition-transform duration-300 ease-out ${isOpening
            ? 'translate-x-0'
            : isClosing
              ? placement === 'left'
                ? 'translate-x-full'
                : '-translate-x-full'
              : placement === 'left'
                ? 'translate-x-full'
                : '-translate-x-full'
          }`}
        style={{
          width: width,
          maxWidth: '90vw',
          direction: dir,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* כפתור סגירה */}
        <button
          onClick={closeDrawer}
          className="absolute top-4 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          style={{
            [placement === 'left' ? 'right' : 'left']: '1rem',
          }}
          aria-label="Close drawer"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* תוכן הדרוור */}
        <div className="flex flex-col h-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MainDrawer);
