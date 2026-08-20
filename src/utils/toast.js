import { toast } from "react-toastify";
import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { localizedText } from "@/utils/localized";

/**
 * A TOAST MUST NEVER BE ABLE TO TAKE THE APP DOWN.
 *
 * A toast body is rendered as a React child, so passing an object — and the
 * bilingual `{ he, en }` envelope the server speaks is an object — throws
 * "Objects are not valid as a React child" during reconciliation. That is an
 * uncaught error inside the render, so the WHOLE SCREEN goes blank because a
 * message failed to display. Callers already write
 * `err?.response?.data?.message?.he || err?.response?.data?.message`, and the
 * second half of that chain is an object whenever the server answered in a
 * language the first half did not name.
 *
 * Elements are passed through untouched — a few call sites toast real JSX.
 */
const toastBody = (message) =>
  React.isValidElement(message) ? message : localizedText(message);

const notifySuccess = (message) =>
  toast.success(toastBody(message), {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    rtl: true,
  });

const notifyError = (message) =>
  toast.error(toastBody(message), {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    rtl: true,
  });

export { notifySuccess, notifyError };
