// ProfileImageUploader.jsx
import React, { useRef, useState } from "react";
import { t } from "i18next";
import { FiUser, FiX } from "react-icons/fi";
import { BiLoader } from "react-icons/bi";

// internal imports
import { notifyError, notifySuccess } from "@/utils/toast";
import requests from "@/services/httpService";
import handleFileUpload from "@/utils/convertImageToWebP";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const ProfileImageUploader = ({
  setImageUrl,
  imageUrl,
  folder,
  size = "large", // "small" | "medium" | "large"
}) => {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const sizeClasses = {
    small: "w-20 h-20",
    smallMedium: "w-28 h-28",
    medium: "w-32 h-32",
    large: "w-40 h-40",
  };

  const iconSizes = {
    small: 32,
    smallMedium: 40,
    medium: 48,
    large: 64,
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      notifyError(t("FileTooLarge"));
      e.target.value = "";
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      notifyError(t("InvalidFileType"));
      e.target.value = "";
      return;
    }

    try {
      setLoading(true);

      const convertedFiles = await handleFileUpload([file]);
      const formData = new FormData();
      formData.append("file", convertedFiles[0]);
      formData.append("folder", folder);

      const res = await requests.post(`/upload`, formData);
      const uploadedUrl = res.link;

      setImageUrl(uploadedUrl);
      notifySuccess(t("Image Uploaded successfully!"));
    } catch (error) {
      console.error("Error during image conversion/upload", error);
      notifyError("Image conversion/upload failed!");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleClick = () => {
    if (loading) return;
    inputRef.current?.click();
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setImageUrl("");
  };

  return (
    <div className="flex flex-col items-center justify-center group/avatar">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="relative">
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-mainColor focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${!loading ? "hover:border-mainColor" : "cursor-not-allowed"
            }`}
        >
          {loading ? (
            <BiLoader className="animate-spin text-mainColor" size={iconSizes[size]} />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={t("ProfileImageLabel")}
              className="w-full h-full object-cover"
            />
          ) : (
            <FiUser
              className="text-gray-400 dark:text-gray-500"
              size={iconSizes[size]}
            />
          )}
        </button>
        {/* כפתור הסרת תמונה – מופיע בריחוף */}
        {imageUrl && !loading && (
          <button
            type="button"
            onClick={handleRemoveImage}
            aria-label={t("RemoveImage") || "Remove image"}
            className="absolute -top-[5px] -right-[5px] w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover/avatar:opacity-50 hover:opacity-100 transition-opacity shadow-md cursor-pointer z-10"
          >
            <FiX size={14} />
          </button>
        )}
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mt-2">
        {t("ProfileImageLabel")}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 whitespace-nowrap">
        {t("ProfileImageFormat")}
      </p>
    </div>
  );
};

export default ProfileImageUploader;