// src/components/preloader/TableLoading.jsx
import {
  TableContainer,
  TableFooter,
  WindmillContext,
} from "@windmill/react-ui";
import React, { useContext } from "react";
import Skeleton from "react-loading-skeleton";

const GenericCardSkeleton = ({ mode }) => {
  const baseColor = mode === "dark" ? "#111827" : "#f3f4f6";
  const highlightColor = mode === "dark" ? "#1f2937" : "#ffffff";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-4">
      {/* Header with checkbox and actions */}
      <div className="flex justify-between items-start mb-4">
        <Skeleton
          height={18}
          width={18}
          className="rounded"
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
        <Skeleton
          height={32}
          width={90}
          className="rounded-lg"
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </div>

      {/* Main content area */}
      <div className="flex items-center gap-4 mb-4">
        <Skeleton
          circle={true}
          height={48}
          width={48}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
        <div className="flex-1 space-y-2">
          <Skeleton
            height={22}
            width="75%"
            className="rounded-md"
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
          <Skeleton
            height={16}
            width="55%"
            className="rounded-md"
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
        </div>
      </div>

      {/* Details area */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton
            height={16}
            width={70}
            className="rounded-md"
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
          <Skeleton
            height={16}
            width={120}
            className="rounded-md"
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton
            height={16}
            width={85}
            className="rounded-md"
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
          <Skeleton
            height={16}
            width={95}
            className="rounded-md"
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton
            height={16}
            width={65}
            className="rounded-md"
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
          <Skeleton
            height={16}
            width={110}
            className="rounded-md"
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
        </div>
      </div>
    </div>
  );
};

const TableLoading = ({ row = 5, col = 4, width = 290, height = 25 }) => {
  const { mode } = useContext(WindmillContext);
  const newArray = [];

  for (let i = 1; i <= row; i++) {
    newArray.push(i);
  }

  const baseColor = mode === "dark" ? "#1f2937" : "#f3f4f6";
  const highlightColor = mode === "dark" ? "#374151" : "#ffffff";

  return (
    <>
      {/* Desktop table loading - hidden on lg and below */}
      <TableContainer className="mb-8 hidden lg:block">
        <div className="text-center p-4">
          {/* Table header skeleton */}
          <div
            className="mb-4 grid gap-2"
            style={{ gridTemplateColumns: `repeat(${col}, 1fr)` }}
          >
            {Array.from({ length: col }).map((_, index) => (
              <Skeleton
                key={`header-${index}`}
                height={45}
                className="rounded-lg"
                baseColor={baseColor}
                highlightColor={highlightColor}
              />
            ))}
          </div>

          {/* Table rows skeleton */}
          {newArray.map((item) => (
            <div
              key={item}
              className="mb-2 grid gap-2"
              style={{ gridTemplateColumns: `repeat(${col}, 1fr)` }}
            >
              {Array.from({ length: col }).map((_, index) => (
                <Skeleton
                  key={`row-${item}-col-${index}`}
                  height={height + 5}
                  className="rounded-md"
                  baseColor={baseColor}
                  highlightColor={highlightColor}
                />
              ))}
            </div>
          ))}
        </div>

        <TableFooter className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <Skeleton
              height={28}
              width={200}
              className="rounded-lg"
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton
              height={32}
              width={32}
              className="rounded-lg"
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
            <Skeleton
              height={32}
              width={32}
              className="rounded-lg"
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
            <Skeleton
              height={32}
              width={32}
              className="rounded-lg"
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
            <Skeleton
              height={32}
              width={32}
              className="rounded-lg"
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
          </div>
        </TableFooter>
      </TableContainer>

      {/* Mobile cards loading - visible on lg and below */}
      <div className="mb-8 block lg:hidden">
        {newArray.map((item) => (
          <GenericCardSkeleton key={item} mode={mode} />
        ))}

        {/* Mobile pagination skeleton */}
        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <Skeleton
              height={28}
              width={150}
              className="rounded-lg"
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
            <div className="flex items-center gap-2">
              <Skeleton
                height={32}
                width={32}
                className="rounded-lg"
                baseColor={baseColor}
                highlightColor={highlightColor}
              />
              <Skeleton
                height={32}
                width={32}
                className="rounded-lg"
                baseColor={baseColor}
                highlightColor={highlightColor}
              />
              <Skeleton
                height={32}
                width={32}
                className="rounded-lg"
                baseColor={baseColor}
                highlightColor={highlightColor}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableLoading;
