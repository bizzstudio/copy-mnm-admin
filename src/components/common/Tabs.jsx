// src/components/common/Tabs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Tabs = ({ tabs = [{ label: { id: '', label: <></>, content: <></> }, onClick: () => { } }], tab = 'tab' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const initialTab = query.get('tab') || tabs[0]?.id || '';
    const [activeTab, setActiveTab] = useState(initialTab);

    // עדכון הכרטיסייה ב-URL כאשר הכרטיסייה משתנה
    useEffect(() => {
        navigate(`?${tab}=${activeTab}`, { replace: true });
        if (tabs.find((tab) => tab.id === activeTab)?.onClick) {
            tabs.find((tab) => tab.id === activeTab).onClick();
        };
    }, [activeTab, navigate]);

    const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const indicatorWidth = 100 / tabs.length;

    // פדינג קבוע של 2 פיקסלים מכל צד
    const adjustedWidth = `calc(${indicatorWidth}% - 4px)`;
    const adjustedPosition = `calc(${activeTabIndex * indicatorWidth}% + 2px)`;

    return (
        <div className="w-full">
            <div className="relative flex items-start justify-around bg-gray-200 dark:bg-gray-700 dark:text-white rounded-[9px]">
                {/* אינדיקטור */}
                <div
                    className="absolute top-[2px] bg-mainColor z-9 rounded-[7px] transition-all duration-300 ease-out shadow-md"
                    style={{
                        height: 'calc(100% - 4px)',
                        border: '0.5px solid rgba(0, 0, 0, 0.04)',
                        insetInlineStart: adjustedPosition, // מיקום מותאם עם 4px פדינג
                        width: adjustedWidth, // רוחב מותאם עם 4px פדינג מכל צד
                    }}
                ></div>

                {/* כפתורי הכרטיסיות */}
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`relative py-3 z-10 flex items-center justify-center w-full text-base cursor-pointer transition-all duration-300 ${activeTab === tab.id ? 'opacity-100 text-white font-bold' : 'opacity-60'
                            }`}
                        onClick={() => {
                            setActiveTab(tab.id);
                            if (tab.onClick) {
                                tab.onClick();
                            }
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* תוכן הכרטיסיות */}
            <div className="mt-4">
                {tabs.map(
                    (tab) =>
                        activeTab === tab.id && <div key={tab.id}>{tab.content}</div>
                )}
            </div>
        </div>
    );
};

export default Tabs;