import requests from "./httpService";

/** נתיב יחסי — זהה ל־GET שהשרת מגדיר (יחד עם baseURL של axios) */
export const getFormSubmissionPdfRequestPath = (id) =>
  `/admin/forms/submissions/${encodeURIComponent(String(id))}/pdf`;

/** URL מלא לאותו endpoint (ל־href בכפתור / העתקת קישור) */
export const getFormSubmissionPdfAbsoluteUrl = (id) => {
  const base = (import.meta.env.VITE_APP_API_BASE_URL || "").replace(/\/+$/, "");
  return `${base}${getFormSubmissionPdfRequestPath(id)}`;
};

const unwrapList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.submissions)) return res.submissions;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.items)) return res.items;
  return [];
};

const FormServices = {
  getSubmissions: async () => {
    const res = await requests.get("/admin/forms/submissions");
    return unwrapList(res);
  },

  /**
   * Triggers a browser download of the PDF. Uses the same JWT as other admin calls.
   * @param {string} id submission id
   */
  deleteSubmission: async (id) => {
    return requests.delete(`/admin/forms/submissions/${encodeURIComponent(String(id))}`);
  },

  deleteManySubmissions: async (body) => {
    return requests.post("/admin/forms/submissions/delete-many", body);
  },

  downloadSubmissionPdf: async (id) => {
    const response = await requests.getBlob(getFormSubmissionPdfRequestPath(id));
    const blob = response.data;
    if (blob.type && blob.type !== "application/pdf") {
      const text = await blob.text();
      try {
        const err = JSON.parse(text);
        throw new Error(err.message || err.error || "PDF download failed");
      } catch (e) {
        if (e.message && e.message !== "PDF download failed") throw e;
        throw new Error("PDF download failed");
      }
    }
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `form-submission-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(href);
  },
};

export default FormServices;
