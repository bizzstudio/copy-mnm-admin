// Uploader.jsx
import React, { useEffect, useState } from "react";
import { t } from "i18next";
import { useDropzone } from "react-dropzone";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FiUploadCloud, FiXCircle } from "react-icons/fi";
import { TbFileUpload } from "react-icons/tb";

// internal imports
import { notifyError, notifySuccess } from "@/utils/toast";
import Container from "@/components/image-uploader/Container";
import requests from "@/services/httpService";
import notifyApiResponse from "@/utils/notifyApiResponse";
import handleFileUpload from "@/utils/convertImageToWebP";

const Uploader = ({
  setImageUrl,
  imageUrl,
  multiple = false, // האם ניתן להעלות מספר תמונות
  onlyImages = true, // האם לקבל רק תמונות (ברירת מחדל)
  folder,
  isSmall = false, // האם להציג את האינפוט בקטן או לא
  maxFiles = 20,
  hideAfterUpload = false, // האם להסתיר את התצוגה המקדימה אחרי העלאה מוצלחת
  onUploadComplete, // callback שקורא אחרי העלאה מוצלחת
}) => {
  // פונקציה לבדיקת אם הקישור הוא מ-Imgur (עבור תצוגת גבול לפי הצלבה)
  const isUploaded = (url) => {
    return typeof url === "string" && url.startsWith("https://");
  };

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState("");

  // הגדרת סוגי הקבצים המותרים: רק תמונות או כל קובץ
  const acceptedFileTypes = onlyImages
    ? {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    }
    : undefined; // undefined מאפשר כל סוג קובץ

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    accept: acceptedFileTypes,
    multiple: multiple,
    maxFiles: multiple ? maxFiles : 1,  // שימוש בפרופס במקום 20
    maxSize: 5 * 1024 * 1024, // הגבלה של 5MB
    onDrop: async (acceptedFiles) => {
      // אם לא ניתן העלאת מספר קבצים – בוחרים רק את הראשון
      if (!multiple) acceptedFiles = acceptedFiles.slice(0, 1);
      if (acceptedFiles.length > 0) {
        // הוספת preview לכל קובץ
        const filesWithPreview = acceptedFiles.map((file) => {
          file.preview = URL.createObjectURL(file);
          return file;
        });
        setFiles(filesWithPreview);

        try {
          setLoading(true);
          setError("Uploading....");

          // המרת הקבצים לפורמט WebP (אם מדובר בתמונות)
          let convertedFiles = [];
          if (onlyImages) {
            convertedFiles = await handleFileUpload(filesWithPreview);
          } else {
            convertedFiles = filesWithPreview;
          }

          // העלאה של כל קובץ בנפרד
          const uploadPromises = convertedFiles.map((convertedFile) => {
            const formData = new FormData();
            formData.append("file", convertedFile);
            formData.append("folder", folder);
            return requests.post(`/upload`, formData).then((res) => res.link);
          });

          const links = await Promise.all(uploadPromises);
          setLoading(false);

          if (multiple) {
            notifySuccess(onlyImages ? t("Images Uploaded successfully!") : t("Files Uploaded successfully!"));
            const fileObjects = onlyImages ? links : links.map((link) => ({ link, name: link.split('/').pop() }));

            // אם hideAfterUpload=true, לא מעדכנים את imageUrl כדי שלא יופיעו בתצוגה המקדימה
            if (!hideAfterUpload) {
              if (onlyImages) {
                setImageUrl((prev) => [...(prev || []), ...links]);
              } else {
                setImageUrl((prev) => [...(prev || []), ...fileObjects]);
              }
            }

            // מנקים את files כדי שלא יופיעו בתצוגה המקדימה
            setFiles([]);

            // קריאה ל-callback אם קיים
            if (onUploadComplete) {
              onUploadComplete(fileObjects);
            }
          } else {
            notifySuccess(onlyImages ? t("Image Uploaded successfully!") : t("File Uploaded successfully!"));
            const uploadedData = onlyImages ? links[0] : { link: links[0], name: links[0].split('/').pop() };

            // אם hideAfterUpload=true, לא מעדכנים את imageUrl כדי שלא יופיעו בתצוגה המקדימה
            if (!hideAfterUpload) {
              setImageUrl(uploadedData);
            }

            // מנקים את files כדי שלא יופיעו בתצוגה המקדימה
            setFiles([]);

            // קריאה ל-callback אם קיים
            if (onUploadComplete) {
              onUploadComplete(uploadedData);
            }
          }
        } catch (error) {
          console.error("Error during image conversion/upload", error);
          notifyError("Image conversion/upload failed!");
          setLoading(false);
        }
      }
    },
  });

  // טיפול בשגיאות מה-dropzone (למשל, קובץ גדול מדי)
  useEffect(() => {
    if (fileRejections && fileRejections.length > 0) {
      fileRejections.forEach(({ file, errors }) => {
        errors.forEach((e) => {
          notifyError(e.message);
        });
      });
    }
  }, [fileRejections]);

  // ניקוי קישורי preview למניעת דליפות זיכרון
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  // תצוגה מקדימה של הקבצים שהועלו (עד שהעלאה מסתיימת)
  const thumbs = files.map((file) => (
    <div key={file.name}>
      <div>
        <img
          className={`inline-flex border rounded-md w-24 max-h-24 p-2 ${isUploaded(imageUrl) ? "border-gray-100 dark:border-gray-600" : "border-red-500"
            }`}
          src={file.preview}
          alt={file.name}
        />
      </div>
    </div>
  ));

  // פונקציה להסרת תמונה
  const handleRemoveImage = async (img) => {
    // TODO: ניתן להוסיף כאן קריאה למחיקת הקובץ מהשרת
    try {
      if (multiple) {
        let updated;
        if (!onlyImages) {
          // עבור קבצים – השוואה לפי link
          updated = imageUrl?.filter((i) => i.link !== img);
        } else {
          updated = imageUrl?.filter((i) => i !== img);
        }
        setImageUrl(updated);
        notifyError(onlyImages ? t("Image deleted successfully!") : t("File deleted successfully!"));
      } else {
        setImageUrl("");
        notifyError(onlyImages ? t("Images deleted successfully!") : t("Files deleted successfully!"));
      }
    } catch (err) {
      console.error("Remove error", err);
      notifyApiResponse(err, false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!imageUrl || (Array.isArray(imageUrl) && imageUrl.length === 0)) {
      setFiles([]);
    }
  }, [imageUrl]);

  return (
    <div className={`w-full text-center`}>
      <div
        className={`${isSmall ? 'h-12 py-2 items-start' : 'py-5 items-center'} flex flex-col flex-wrap justify-center gap-1 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer px-6`}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <span className="flex justify-center">
          {onlyImages ?
            <FiUploadCloud className="text-3xl text-mainColor" /> :
            <TbFileUpload className="text-3xl text-mainColor" />
          }
        </span>
        <div className={isSmall ? 'text-start' : ''}>
          <p className="text-sm dark:text-white">{onlyImages ? t("DragYourImage") : t("DragYourFile")}</p>
          {!isSmall &&
            <em className="text-xs text-gray-400">{onlyImages ? t("imageFormat") : t("fileFormat")}</em>
          }
        </div>
      </div>

      <div className="text-mainColor">{loading && err}</div>
      {!hideAfterUpload && (
        <aside className="flex flex-row flex-wrap mt-4">
          {multiple ? (
            <DndProvider backend={HTML5Backend}>
              <Container
                onlyImages={onlyImages}
                setImageUrl={setImageUrl}
                imageUrl={imageUrl}
                handleRemoveImage={handleRemoveImage}
              />
            </DndProvider>
          ) : imageUrl ? (
            <div className="relative">
              <img
                className="inline-flex border rounded-md w-24 max-h-24 p-2 border-gray-100 dark:border-gray-600"
                src={imageUrl}
                alt="Image"
              />
              <button
                type="button"
                className="absolute top-0 right-0 text-red-500 focus:outline-none"
                onClick={() => handleRemoveImage(imageUrl)}
              >
                <FiXCircle />
              </button>
            </div>
          ) : (
            thumbs
          )}
        </aside>
      )}
    </div>
  );
};

export default Uploader;