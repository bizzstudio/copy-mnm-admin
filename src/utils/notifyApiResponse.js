// src/utils/notifyApiResponse.js
import { notifyError, notifySuccess } from "@/utils/toast";
import { extractMessage, genericError } from "@/services/httpService";

/**
 * Toast whatever the server said, in the operator's language.
 *
 * Accepts three things because three are passed: a success payload, an axios
 * error, and occasionally a plain object someone built by hand.
 *
 * `err.displayMessage` is preferred when present — the response interceptor has
 * already unwrapped both server envelopes there, and duplicating that logic here
 * is how the two drift until one of them stops recognising the newer shape. That
 * is precisely what had happened: this file read `response.response.data.message`
 * only, so every error from the shared handler — whose message lives one level
 * deeper, under `error` — fell through to the generic "An error occurred".
 */
const notifyApiResponse = (response, success = false) => {
  if (success) {
    const text = extractMessage(response?.data ?? response);
    // A silent success is common — a 200 with only data. Saying nothing is right;
    // "something went wrong" would be a lie and "Action succeeded" is noise.
    if (text) notifySuccess(text);
    return;
  }

  notifyError(
    response?.displayMessage ||
    extractMessage(response?.response?.data ?? response?.data ?? response, response?.response?.status) ||
    genericError()
  );
};

export default notifyApiResponse;
