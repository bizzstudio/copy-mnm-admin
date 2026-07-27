// src/components/common/Logo.jsx
// לוגו BizzExpo. מוטמע כ-SVG בתוך ה-DOM כדי שהטיפוגרפיה תשתמש בגופן של המערכת
// ותתאים אוטומטית למצב כהה — בשונה מקובץ תמונה חיצוני.

const Mark = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    aria-hidden="true"
    className="shrink-0"
  >
    <defs>
      <linearGradient id="bizzexpoLogoMark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5b8def" />
        <stop offset="1" stopColor="#2f4bb5" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#bizzexpoLogoMark)" />
    <rect x="16" y="36" width="8" height="14" rx="4" fill="#fff" opacity="0.75" />
    <rect x="28" y="27" width="8" height="23" rx="4" fill="#fff" opacity="0.9" />
    <rect x="40" y="16" width="8" height="34" rx="4" fill="#fff" />
  </svg>
);

/**
 * @param {"sm"|"md"|"lg"} size  גודל הלוגו
 * @param {boolean} showMark     האם להציג את הסמל לצד השם
 */
const Logo = ({ size = "md", showMark = true, className = "" }) => {
  const sizes = {
    sm: { mark: 28, text: "text-xl", gap: "gap-2" },
    md: { mark: 38, text: "text-3xl", gap: "gap-2.5" },
    lg: { mark: 52, text: "text-4xl", gap: "gap-3" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <span
      dir="ltr"
      className={`inline-flex items-center ${s.gap} ${className}`}
      aria-label="BizzExpo"
    >
      {showMark && <Mark size={s.mark} />}
      <span className={`font-bold leading-none tracking-tight ${s.text}`}>
        <span className="text-[#16204a] dark:text-white">Bizz</span>
        <span className="text-[#3b6fd4] dark:text-[#7fb3e8]">Expo</span>
      </span>
    </span>
  );
};

export default Logo;
