// src/utils/dateUtils.js
import dayjs from "dayjs";

/**
 * חישוב טווח תאריכים לפי עמוד פג'יניישן של 6 חודשים
 * עמוד 0: מהיום עד לפני 6 חודשים
 * עמוד 1: מלפני 6 חודשים עד לפני 12 חודשים
 * וכן הלאה
 * 
 * @param {number} page - מספר העמוד (0 = העמוד הראשון)
 * @param {Object} options - אפשרויות נוספות
 * @param {boolean} options.includeLabel - האם לכלול label לעיצוב (ברירת מחדל: false)
 * @returns {Object} { from: string, to: string, label?: string }
 */
export const getDateRangeByPage = (page, options = {}) => {
    const { includeLabel = false } = options;
    const today = dayjs();
    const endDate = page === 0 ? today : today.subtract(page * 6, 'month');
    const startDate = today.subtract((page + 1) * 6, 'month');

    const result = {
        from: startDate.format('YYYY-MM-DD'),
        to: endDate.format('YYYY-MM-DD')
    };

    // הוספת label אם נדרש
    if (includeLabel) {
        result.label = `${startDate.format('DD/MM/YYYY')} - ${endDate.format('DD/MM/YYYY')}`;
    }

    return result;
};

/**
 * עיצוב תאריך מפורמטים שונים לפורמט אחיד
 * תומך בפורמטים: ISO (YYYY-MM-DDTHH:mm:ss), DD/MM/YYYY, ומחרוזות אחרות
 * 
 * @param {string} dateString - מחרוזת תאריך בפורמט כלשהו
 * @returns {string} תאריך מעוצב בפורמט DD/MM/YYYY HH:mm או המחרוזת המקורית
 */
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        // אם התאריך בפורמט ISO
        if (dateString.includes('T')) {
            return dayjs(dateString).format('DD/MM/YYYY HH:mm');
        }
        // אם התאריך בפורמט DD/MM/YYYY
        if (dateString.includes('/')) {
            return dateString;
        }
        return dateString;
    } catch (err) {
        return dateString;
    }
};