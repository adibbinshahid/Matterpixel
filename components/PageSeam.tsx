/**
 * The brand light edge along the top or bottom of a section, marking where
 * an inner page changes ground (light or blue against the dark grid). The
 * parent must be `relative`. See .page-seam in globals.css.
 */
export function PageSeam({ edge }: { edge: "top" | "bottom" }) {
  return <span aria-hidden="true" className={`page-seam page-seam-${edge}`} />;
}
