/**
 * The page gutter. `Main` deliberately has no padding — the legacy pages each
 * carry their own — so a page that returns a bare `<div>` renders flush against
 * the viewport edge, with its heading action pinned to the far corner and a
 * table stretched across the full width of a wide monitor.
 *
 * The max-width is the point, not the padding: a six-column table on a 1900px
 * screen reads as scattered fragments without one.
 *
 * `maxWidth` is a whole class rather than a suffix, so no caller has to guess
 * which of two competing `max-w-*` utilities Tailwind happens to emit last.
 */
export default function PageContainer({ maxWidth = 'max-w-7xl', children }) {
  return (
    <div className={`mx-auto w-full ${maxWidth} px-4 py-6 sm:px-6 lg:px-8`}>
      {children}
    </div>
  );
}
