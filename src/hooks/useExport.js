// src/hooks/useExport.js
import { useCallback, useContext } from 'react';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import 'dayjs/locale/he';
import { t } from "i18next";
import { SidebarContext } from "@/context/SidebarContext";
import ProductServices from "@/services/ProductServices";
import { notifyError, notifySuccess } from "@/utils/toast";

dayjs.locale('he');

/**
 * Hook for exporting products to Excel in the format the server expects for import
 */
const useExport = () => {
    const { lang, priceLists } = useContext(SidebarContext) || {};

    /**
     * Export products to Excel - format matches server import expectations
     * @param {Array} selectedProductIds - Array of product IDs to export (empty = export all)
     */
    const exportProductsToExcel = useCallback(async (selectedProductIds = []) => {
        try {
            let products = [];

            // Fetch products from server
            if (selectedProductIds.length > 0) {
                const res = await ProductServices.getAllProducts({});
                products = res.products.filter(p => selectedProductIds.includes(p._id));
            } else {
                // Fetch all products without pagination
                const res = await ProductServices.getAllProducts({});
                products = res.products || [];
            }

            if (!products || products.length === 0) {
                notifyError(t('NoProductsToExport'));
                return;
            }

            // פורמט זהה לייבוא: כותרות עברית ואותו סדר עמודות כמו בתבנית הייבוא
            const headers = ['מס\' פריט', 'שם פריט', 'ברקוד', 'מחיר קנייה לפני מע"מ', 'מחיר מכירה לפני מע"מ', 'מחיר מבצע', 'משקל', 'שם ספק', 'כשרות', 'שם קבוצה'];
            const defaultPriceListId = priceLists?.[0]?._id;

            const excelData = products.map(product => {
                const firstPrice = product.prices && Array.isArray(product.prices) && product.prices.length > 0
                    ? (defaultPriceListId
                        ? product.prices.find(p => (p.priceList?._id || p.priceList) === defaultPriceListId) || product.prices[0]
                        : product.prices[0])
                    : null;

                const row = {};
                row['מס\' פריט'] = product.itemNumber || '';
                row['שם פריט'] = (product.title && typeof product.title === 'object' ? product.title.he : product.title) || '';
                row['ברקוד'] = product.barcode || '';
                row['מחיר קנייה לפני מע"מ'] = firstPrice?.warehousePrice ?? '';
                row['מחיר מכירה לפני מע"מ'] = firstPrice?.price ?? '';
                row['מחיר מבצע'] = firstPrice?.salePrice ?? '';
                row['משקל'] = product.weight ?? '';
                row['שם ספק'] = product.supplier || '';
                row['כשרות'] = Array.isArray(product.kashrut) ? product.kashrut.join(',') : (product.kashrut || '');
                if (product.categories && Array.isArray(product.categories)) {
                    row['שם קבוצה'] = product.categories
                        .map(cat => (typeof cat === 'object' && cat !== null && cat.slug) ? cat.slug : (typeof cat === 'string' ? cat : ''))
                        .filter(Boolean)
                        .join(',');
                } else {
                    row['שם קבוצה'] = '';
                }
                return row;
            });

            const data = [headers, ...excelData.map(row => headers.map(h => row[h] ?? ''))];
            const workbook = XLSX.utils.book_new();
            workbook.Workbook = workbook.Workbook || {};
            workbook.Workbook.Views = [{ RTL: lang === 'he' }];
            const worksheet = XLSX.utils.aoa_to_sheet(data);

            const columnWidths = headers.map((_, i) => ({ wch: Math.max(String(headers[i]).length + 2, 12) }));
            worksheet['!cols'] = columnWidths;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, t('Products'));

            // Generate filename with timestamp
            const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
            const prefix = selectedProductIds.length > 0
                ? `${t('Products')}_${t('Selected')}`
                : t('Products');
            const fullFilename = `${prefix}_${timestamp}.xlsx`;

            // Save file
            XLSX.writeFile(workbook, fullFilename);

            notifySuccess(t('ExportedSuccessfully'));
            console.log(`Excel file exported successfully: ${fullFilename}`);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            notifyError(t('ExportError') + ': ' + error.message);
        }
    }, [lang, priceLists]);

    /**
     * Download a sample Excel template for product import (Hebrew headers: מס' פריט, שם פריט, ברקוד, מחיר קנייה לפני מע"מ, מחיר מכירה לפני מע"מ, מחיר מבצע, משקל, שם ספק, כשרות, שם קבוצה)
     */
    const downloadProductImportTemplate = useCallback(() => {
        const headers = ['מס\' פריט', 'שם פריט', 'ברקוד', 'מחיר קנייה לפני מע"מ', 'מחיר מכירה לפני מע"מ', 'מחיר מבצע', 'משקל', 'שם ספק', 'כשרות', 'שם קבוצה'];
        const exampleRows = [
            {
                'מס\' פריט': '10001',
                'שם פריט': 'דוגמה מוצר 1',
                'ברקוד': '7290012345678',
                'מחיר קנייה לפני מע"מ': 18,
                'מחיר מכירה לפני מע"מ': 25.5,
                'מחיר מבצע': 22,
                'משקל': 500,
                'שם ספק': 'ספק לדוגמה',
                'כשרות': 'כשר',
                'שם קבוצה': 'פירות'
            },
            {
                'מס\' פריט': '10002',
                'שם פריט': 'דוגמה מוצר 2',
                'ברקוד': '7290012345679',
                'מחיר קנייה לפני מע"מ': 21.5,
                'מחיר מכירה לפני מע"מ': 30,
                'מחיר מבצע': '',
                'משקל': 1000,
                'שם ספק': '',
                'כשרות': 'כשרות מהדרין',
                'שם קבוצה': 'ירקות,מצרכים'
            }
        ];
        const data = [headers, ...exampleRows.map(row => headers.map(h => row[h] ?? ''))];
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
        XLSX.writeFile(workbook, 'product-import-template.xlsx');
        notifySuccess(t('SampleTemplateDownloaded'));
    }, []);

    return {
        exportProductsToExcel,
        downloadProductImportTemplate
    };
};

export default useExport;
