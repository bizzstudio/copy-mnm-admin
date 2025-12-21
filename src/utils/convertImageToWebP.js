// convertImageToWebP.js
import Pica from 'pica';

const pica = new Pica(); // יצירת מופע של pica

/**
 * ממיר תמונה לפורמט WebP ודוחס אותה.
 * @param {File} file - קובץ התמונה להמרה
 * @returns {Promise<File>} - קובץ WebP מומר ודחוס
 */
const convertImageToWebP = async (file) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    await img.decode(); // ממתינים לטעינת התמונה

    // יצירת Canvas לשינוי גודל ודחיסה
    const canvas = document.createElement('canvas');
    canvas.width = img.width > 1920 ? 1920 : img.width; // שינוי גודל לרוחב מקסימלי של 1920
    canvas.height = img.height * (canvas.width / img.width);

    // המרת התמונה ב-Canvas לפורמט WebP
    await pica.resize(img, canvas);
    const blob = await pica.toBlob(canvas, 'image/webp', 0.8); // דחיסה לרמת איכות של 80%

    return new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), { type: 'image/webp' });
};

/**
 * מבצע המרה של קבצים לפורמט WebP אם הם תמונות.
 * @param {File[]} acceptedFiles - רשימת הקבצים להמרה
 * @returns {Promise<File[]>} - רשימת הקבצים לאחר המרה ודחיסה
 */
const handleFileUpload = async (acceptedFiles) => {
    const webPFiles = await Promise.all(
        acceptedFiles.map(async (file) => {
            if (file.type.startsWith('image/')) {
                return await convertImageToWebP(file); // המרה ל-WebP
            }
            return file;
        })
    );
    return webPFiles; // מחזיר את הקבצים לאחר עיבוד
};

export default handleFileUpload;
