// src/utils/localized.test.js
import { describe, it, expect } from "vitest";
import { localizedText } from "@/utils/localized";

/**
 * The shapes `PriceList.name` actually arrives in. The object case is the one
 * that used to reach JSX untouched and take the screen down with React error
 * #31; the string case is the one `showingTranslateValue` used to blank out.
 */
describe("localizedText", () => {
  it("returns a bilingual value in the requested language", () => {
    expect(localizedText({ he: "מחירון רגיל", en: "Standard" }, "he")).toBe("מחירון רגיל");
    expect(localizedText({ he: "מחירון רגיל", en: "Standard" }, "en")).toBe("Standard");
  });

  it("falls back to the other language rather than to a blank label", () => {
    expect(localizedText({ he: "מחירון רגיל" }, "en")).toBe("מחירון רגיל");
    expect(localizedText({ en: "Standard" }, "he")).toBe("Standard");
  });

  it("passes a plain string through — the seeds and legacy rows write one", () => {
    expect(localizedText("מחירון רגיל", "he")).toBe("מחירון רגיל");
  });

  it("never returns an object or undefined, so it is safe as a React child", () => {
    for (const input of [undefined, null, "", {}, { he: "" }, 7]) {
      const out = localizedText(input, "he");
      expect(typeof out).toBe("string");
    }
  });

  it("treats he-IL as he", () => {
    expect(localizedText({ he: "עברית", en: "English" }, "he-IL")).toBe("עברית");
  });
});
