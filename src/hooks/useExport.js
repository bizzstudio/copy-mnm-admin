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

            // Get all supported languages from first product or default to ['he', 'en']
            const supportedLanguages = new Set();
            products.forEach(product => {
                if (product.title && typeof product.title === 'object') {
                    Object.keys(product.title).forEach(lang => supportedLanguages.add(lang));
                }
                if (product.description && typeof product.description === 'object') {
                    Object.keys(product.description).forEach(lang => supportedLanguages.add(lang));
                }
            });
            const languages = supportedLanguages.size > 0 ? Array.from(supportedLanguages) : ['he', 'en'];

            // Convert products to Excel format
            const excelData = products.map(product => {
                const row = {};

                // Basic fields
                row['_id'] = product._id || '';
                row['productId'] = product.productId || '';
                row['barcode'] = product.barcode || '';
                row['slug'] = product.slug || '';

                // Multilingual fields - each language gets its own column
                languages.forEach(lang => {
                    row[`title_${lang}`] = product.title?.[lang] || '';
                    row[`description_${lang}`] = product.description?.[lang] || '';
                });

                // Categories - export as comma-separated slugs
                if (product.categories && Array.isArray(product.categories)) {
                    row['categories'] = product.categories
                        .map(cat => {
                            // If cat is an object with slug, return the slug
                            if (typeof cat === 'object' && cat !== null && cat.slug) {
                                return cat.slug;
                            }
                            // If cat is a string, return it
                            if (typeof cat === 'string') {
                                return cat;
                            }
                            // Otherwise return empty string
                            return '';
                        })
                        .filter(slug => slug !== '') // Filter out empty strings
                        .join(',');
                } else {
                    row['categories'] = '';
                }

                // Images - comma-separated URLs
                row['image'] = Array.isArray(product.image) ? product.image.join(',') : '';

                // Stock fields
                row['stock'] = product.stock || 0;
                row['expiryDate'] = product.expiryDate ? dayjs(product.expiryDate).format('YYYY-MM-DD') : '';
                row['lastStockUpdate'] = product.lastStockUpdate ? dayjs(product.lastStockUpdate).format('YYYY-MM-DD HH:mm') : '';
                row['manageStock'] = product.manageStock ? 'true' : 'false';
                row['minStockThreshold'] = product.minStockThreshold || '';
                row['hasSentStockAlert'] = product.hasSentStockAlert ? 'true' : 'false';

                // Sales
                row['sales'] = product.sales || 0;

                // Tags - comma-separated
                row['tag'] = Array.isArray(product.tag) ? product.tag.join(',') : '';

                // Prices - JSON.stringify for complex structure
                // פורמט: [{priceList: "name", price: 100, salePrice: 90, warehousePrice: 80, purchaseLimit: 10}]
                if (product.prices && Array.isArray(product.prices)) {
                    const pricesForExport = product.prices.map(p => {
                        const priceListName = p.priceList?.name ||
                            priceLists?.find(pl => pl._id === p.priceList)?.name ||
                            p.priceList;
                        return {
                            priceList: priceListName,
                            price: p.price || 0,
                            salePrice: p.salePrice || null,
                            warehousePrice: p.warehousePrice || null,
                            purchaseLimit: p.purchaseLimit || null
                        };
                    });
                    row['prices'] = JSON.stringify(pricesForExport);
                } else {
                    row['prices'] = '[]';
                }

                // Kashrut - comma-separated
                row['kashrut'] = Array.isArray(product.kashrut) ? product.kashrut.join(',') : '';

                // Supplier
                row['supplier'] = product.supplier || '';

                // Warehouse and VAT
                row['isWarehouseProduct'] = product.isWarehouseProduct ? 'true' : 'false';
                row['isVatFree'] = product.isVatFree ? 'true' : 'false';

                // Additional fields
                row['sortCode'] = product.sortCode || '';
                row['weight'] = product.weight || '';
                row['weightUnit'] = product.weightUnit || '';
                row['managementNotes'] = product.managementNotes || '';

                // Status
                row['status'] = product.status || 'show';

                // Timestamps
                row['createdAt'] = product.createdAt ? dayjs(product.createdAt).format('YYYY-MM-DD HH:mm') : '';
                row['updatedAt'] = product.updatedAt ? dayjs(product.updatedAt).format('YYYY-MM-DD HH:mm') : '';

                return row;
            });

            // Create workbook and worksheet
            const workbook = XLSX.utils.book_new();
            workbook.Workbook = workbook.Workbook || {};
            workbook.Workbook.Views = [{ RTL: lang === 'he' }];
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Set column widths
            const columnKeys = Object.keys(excelData[0] || {});
            const columnWidths = columnKeys.map(key => ({
                wch: Math.max(key.length + 5, 15)
            }));
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

    return {
        exportProductsToExcel
    };
};

export default useExport;