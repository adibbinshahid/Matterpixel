import type Lenis from "lenis";

// Shared handle to the single site-wide Lenis instance (created in
// SmoothScrollProvider) so other components can trigger a smooth,
// eased scrollTo using the same engine driving the rest of the site,
// instead of fighting it with native browser scroll APIs.
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis() {
  return instance;
}
