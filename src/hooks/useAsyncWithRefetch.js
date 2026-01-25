// src/hooks/useAsyncWithRefetch.js
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

/**
 * Hook גנרי לטעינת נתונים עם אפשרות ל-refetch ידני
 * מתאים למקרים שדורשים שליטה מלאה על מתי לטעון נתונים
 * 
 * @param {Function} asyncFunction - פונקציה אסינכרונית שמחזירה Promise
 * @param {Array} dependencies - רשימת dependencies שכאשר משתנות, הנתונים נטענים מחדש (אופציונלי)
 * @param {Object} options - אפשרויות נוספות
 * @param {boolean} options.autoFetch - האם לטעון אוטומטית בעת mount (ברירת מחדל: true)
 * @param {boolean} options.enableCancelToken - האם לאפשר ביטול בקשות (ברירת מחדל: true)
 * 
 * @returns {Object} { data, loading, error, refetch, reset }
 */
const useAsyncWithRefetch = (asyncFunction, dependencies = [], options = {}) => {
    const {
        autoFetch = true,
        enableCancelToken = true
    } = options;

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(autoFetch);

    // שימוש ב-ref כדי למנוע טעינות כפולות
    const isMountedRef = useRef(true);
    const cancelTokenSourceRef = useRef(null);

    // פונקציה לטעינת נתונים
    const fetchData = useCallback(async (signal) => {
        if (!asyncFunction) {
            setData(null);
            setError(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // יצירת cancel token אם נדרש
            let cancelToken = null;
            if (enableCancelToken && axios.CancelToken) {
                if (cancelTokenSourceRef.current) {
                    cancelTokenSourceRef.current.cancel('New request initiated');
                }
                cancelTokenSourceRef.current = axios.CancelToken.source();
                cancelToken = cancelTokenSourceRef.current.token;
            }

            // קריאה לפונקציה האסינכרונית
            const result = await asyncFunction({ cancelToken, signal });

            // בדיקה שהקומפוננטה עדיין mounted
            if (isMountedRef.current) {
                setData(result);
                setError(null);
                setLoading(false);
            }
        } catch (err) {
            // התעלמות משגיאות ביטול
            if (axios.isCancel && axios.isCancel(err)) {
                return;
            }
            if (err.name === 'AbortError') {
                return;
            }

            // עדכון שגיאה רק אם הקומפוננטה עדיין mounted
            if (isMountedRef.current) {
                setError(err.message || 'שגיאה בטעינת נתונים');
                setData(null);
                setLoading(false);
            }
        }
    }, [asyncFunction, enableCancelToken]);

    // פונקציה ל-refetch ידני
    const refetch = useCallback((params = {}) => {
        const { signal } = params;
        return fetchData(signal);
    }, [fetchData]);

    // פונקציה לאיפוס הסטייט
    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    // טעינה אוטומטית כאשר dependencies משתנות
    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }

        // Cleanup function
        return () => {
            if (cancelTokenSourceRef.current) {
                cancelTokenSourceRef.current.cancel('Component unmounted or dependencies changed');
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    // Cleanup בעת unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            if (cancelTokenSourceRef.current) {
                cancelTokenSourceRef.current.cancel('Component unmounted');
            }
        };
    }, []);

    return {
        data,
        loading,
        error,
        refetch,
        reset
    };
};

export default useAsyncWithRefetch;
