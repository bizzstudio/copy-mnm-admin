// src/components/table/EditDeleteButton.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FiEdit, FiTrash2, FiZoomIn } from "react-icons/fi";

import Tooltip from "@/components/tooltip/Tooltip";

const EditDeleteButton = ({
  id,
  title,
  handleUpdate,
  handleModalOpen,
  isCheck,
  product,
  parent,
  children,
  disabled,
}) => {
  const { t } = useTranslation();
  // console.log('edite delet button')

  return (
    <>
      <div className="flex justify-center text-center">
        {children?.length > 0 ? (
          <>
            <Link
              to={`/categories/${parent?._id}`}
              className="p-2 cursor-pointer text-gray-400 hover:text-customGreen-dark focus:outline-none"
            >
              <Tooltip
                id="view"
                Icon={FiZoomIn}
                title={t("View")}
                bgColor="#10B981"
              />
            </Link>

            <button
              disabled={isCheck?.length > 0}
              onClick={() => handleUpdate(id)}
              className="p-2 cursor-pointer text-gray-400 hover:text-customGreen-dark focus:outline-none"
            >
              <Tooltip
                id="edit"
                Icon={FiEdit}
                title={t("Edit")}
                bgColor="#10B981"
              />
            </button>
          </>
        ) : (
          <>
            <div
              className="opacity-0 p-2 text-gray-400 hover:text-customGreen-dark focus:outline-none"
            >
              <Tooltip
                id="view"
                Icon={FiZoomIn}
                title={t("View")}
                bgColor="#10B981"
              />
            </div>

            <button
              disabled={isCheck?.length > 0}
              onClick={() => handleUpdate(id)}
              className="p-2 cursor-pointer text-gray-400 hover:text-customGreen-dark focus:outline-none"
            >
              <Tooltip
                id="edit"
                Icon={FiEdit}
                title={t("Edit")}
                bgColor="#10B981"
              />
            </button>
          </>
        )}

        <button
          disabled={isCheck?.length > 0 || disabled}
          onClick={() => !disabled && handleModalOpen(id, title, product)}
          className={`p-2 cursor-pointer text-gray-400 hover:text-red-600 focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Tooltip
            id="delete"
            Icon={FiTrash2}
            title={t("Delete")}
            bgColor="#EF4444"
          />
        </button>
      </div>
    </>
  );
};

export default EditDeleteButton;