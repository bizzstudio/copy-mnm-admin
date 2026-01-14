// src/components/menu/DropdownMenu.jsx
import { useContext, useEffect, useRef, useState } from 'react';
import styles from './DropdownMenu.module.css';
import { SidebarContext } from '@/context/SidebarContext';

const DropdownMenu = ({ title, options = [{ label: '', onClick: () => { } }], addMenu }) => {
    const menuRef = useRef(null);
    const inputRef = useRef(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 }); // מיקום התפריט על-גבי המסך
    const { lang } = useContext(SidebarContext);

    // סך כל זמן האנימציה הוא 0.5 שניות
    const totalAnimationTime = 0.5;
    const optionsCount = options.length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                inputRef.current.checked = true; // מחזיר את התפריט למצב סגור
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ===== מחשב את מיקום התפריט =====
    const updatePos = () => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            if (lang === 'he') {
                setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
            } else {
                setMenuPos({ top: rect.bottom + 4, left: rect.left });
            }
        }
    };

    // ===== סגירה ב-resize בלבד / עדכון מיקום ב-scroll =====
    useEffect(() => {
        updatePos(); // חישוב ראשוני

        const handleResize = () => {
            updatePos();                             // עדכן קואורדינטות
            if (inputRef.current && !inputRef.current.checked) {
                inputRef.current.checked = true;     // סוגר את התפריט אם פתוח
            }
        };

        const handleScroll = () => {
            updatePos();                             // רק עדכן קואורדינטות, אל תסגור
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, true); // true → מאזין גם ל-scroll פנימי
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, []);

    return (
        <label ref={menuRef} className={`${styles.main} bg-mainColor`}>
            <input
                ref={inputRef}
                className={styles.inp}
                type="checkbox"
                defaultChecked
                onChange={updatePos}        // חישוב מיקום בכל פתיחה
            />
            {addMenu ? (
                <div className={styles.plusIcon}>
                    <span className={styles.plusBar}></span>
                    <span className={styles.plusBar}></span>
                </div>
            ) : (
                <div className={styles.bar}>
                    <span className={styles.top + ' ' + styles.barList}></span>
                    <span className={styles.middle + ' ' + styles.barList}></span>
                    <span className={styles.bottom + ' ' + styles.barList}></span>
                </div>
            )}
            {title}
            <section
                style={
                    lang === 'he'
                        ? { position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999 }
                        : { position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 9999 }
                }
                className={`${styles.menuContainer} ${options.length > 7 ? styles.scrollable : ''} bg-white dark:bg-gray-800 text-mainColor dark:text-mainColor-superLight border border-gray-300 dark:border-gray-600`}
            >
                {options.map((option, index) => {
                    // אם יש יותר מאפשרות אחת, מחשבים עיכוב יחסי כך שהאופציה האחרונה תעכב בדיוק totalAnimationTime.
                    const delay = optionsCount > 1 ? (index / (optionsCount - 1)) * totalAnimationTime : 0;
                    return (
                        <div
                            key={index}
                            style={{ '--delay': `${delay}s` }}
                            className={`${styles.menuList} hover:bg-gray-200 hover:dark:bg-gray-600 ${option.disabled ? 'opacity-40! cursor-not-allowed' : ''}`}
                            onClick={option.disabled ? (e) => e.preventDefault() : option.onClick}
                        >
                            {option.label}
                        </div>
                    );
                })}
            </section>
        </label>
    );
};

export default DropdownMenu;