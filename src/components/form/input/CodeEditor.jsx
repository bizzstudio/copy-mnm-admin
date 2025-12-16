// CodeEditor.jsx
import React, { useState, useEffect, useContext } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import { WindmillContext } from "@windmill/react-ui";

import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";

const CodeEditor = ({
  value = "",
  onChange,
  placeholder = "Enter your code here...",
  height = "200px",
  language = "markup",
  noWrapper = false
}) => {
  const { mode } = useContext(WindmillContext);
  const [code, setCode] = useState(value);

  useEffect(() => {
    if (mode === "dark") {
      import("prismjs/themes/prism-tomorrow.css");
    } else {
      import("prismjs/themes/prism.css");
    }
  }, [mode]);

  useEffect(() => {
    setCode(value);
  }, [value]);

  const handleValueChange = (newCode) => {
    setCode(newCode);
    onChange?.(newCode);
  };

  const highlight = (code) => {
    try {
      switch (language) {
        case "javascript":
          return Prism.highlight(code, Prism.languages.javascript, "javascript");
        case "css":
          return Prism.highlight(code, Prism.languages.css, "css");
        default:
          return Prism.highlight(code, Prism.languages.markup, "markup");
      }
    } catch {
      return code;
    }
  };

  // גוף הקומפוננטה ללא עטיפה
  const content = (
    <>
      <pre
        aria-hidden="true"
        className="absolute -left-[5px] top-0 px-3 py-2 text-gray-400 dark:text-gray-500 text-right select-none pointer-events-none z-10"
        style={{ lineHeight: "1.5em", height, position: "relative" }}
      >
        {Array.from({ length: code.split("\n").length }, (_, i) => i + 1).join("\n")}
      </pre>

      <Editor
        value={code}
         noWrapper={true} 
        onValueChange={handleValueChange}
        highlight={highlight}
        padding={10}
        placeholder={placeholder}
        style={{
          fontFamily: '"Fira Code", monospace',
          lineHeight: "1.5em",
          fontSize: "14px",
          backgroundColor: "transparent",
          color: mode === "dark" ? "#e5e7eb" : "#374151",
          minHeight: "100%",
          height,
          marginLeft: "2.5em"
        }}
        textareaStyle={{
          outline: "none",
          border: "none",
          resize: "none",
        }}
      />
    </>
  );

  // אם אין עטיפה – מחזיר רק את התוכן
  if (noWrapper) return content;

  // עטיפה רגילה
  return (
    <div className="relative" dir="ltr">
      <div
        className="relative font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg overflow-auto bg-white dark:bg-gray-800"
        style={{ height }}
      >
        {content}
      </div>
    </div>
  );
};

export default CodeEditor;
